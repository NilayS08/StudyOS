"""
retriever.py — Document ingestion pipeline + retrieval interface.

This is the public-facing module that glues together:
    parser → chunker → cleaner → embedder → vector_store

Two entry points:
    1. ingest_document(doc_id, filename, file_bytes)
       Called by /upload after parsing succeeds.
       Embeds all chunks and persists the FAISS index.

    2. retrieve(doc_id, query, k)
       Called by llm_service.py to fetch relevant context before
       sending a prompt to Gemini.

Chunk size tuning (256-512 tokens):
    - Target: ~350 words ≈ 500 tokens (safe for MiniLM's 256-token limit
      after BPE overhead, and well within Gemini's context).
    - Overlap: 50 words between adjacent chunks preserves cross-boundary
      context for questions that straddle a boundary.
    - The CHUNK_SIZE / CHUNK_OVERLAP constants below can be tuned via
      environment variables without code changes.
"""

from __future__ import annotations

import logging
import os

from app.services.cleaner import clean_text
from app.services.parser import parse_document
from app.services.vector_store import SearchResult, VectorStore

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tunable chunk parameters
# ---------------------------------------------------------------------------

# Target chunk size in words (≈350 words → ~500 BPE tokens)
CHUNK_SIZE    = int(os.getenv("CHUNK_SIZE",    "350"))

# Overlap in words between adjacent chunks
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

# Default number of chunks to retrieve per query
DEFAULT_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "5"))


# ---------------------------------------------------------------------------
# Sliding-window chunker with overlap
# ---------------------------------------------------------------------------

def _sliding_window_chunks(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int    = CHUNK_OVERLAP,
    source: str     = "",
) -> tuple[list[str], list[dict]]:
    """
    Split text into overlapping word-window chunks.

    Handles [Page N] and [Slide N] markers inserted by the parser so
    each chunk carries the correct page/slide number in its metadata.

    Args:
        text:       Full document text (may contain [Page N] markers).
        chunk_size: Target chunk size in words.
        overlap:    Number of words shared between adjacent chunks.
        source:     Filename — stored in chunk metadata.

    Returns:
        (chunks, metadata_list) where each metadata dict has keys:
            source, page (int)
    """
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be greater than overlap")

    step     = chunk_size - overlap
    chunks   = []
    metadata = []

    # Split into lines and track current page/slide
    current_page = 0
    words_with_page: list[tuple[str, int]] = []

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        # Detect page / slide markers from parser output
        if stripped.startswith("[Page ") or stripped.startswith("[Slide "):
            try:
                current_page = int(stripped.split()[-1].rstrip("]"))
            except (ValueError, IndexError):
                pass
            continue
        for word in stripped.split():
            words_with_page.append((word, current_page))

    if not words_with_page:
        return [], []

    words = [w for w, _ in words_with_page]
    pages = [p for _, p in words_with_page]

    i = 0
    while i < len(words):
        end   = min(i + chunk_size, len(words))
        chunk = " ".join(words[i:end])
        page  = pages[i]   # page of the first word in the chunk

        # Skip degenerate chunks that are too short to be meaningful
        if len(chunk.split()) >= 5:
            chunks.append(chunk)
            metadata.append({"source": source, "page": page})

        if end == len(words):
            break
        i += step

    return chunks, metadata


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def ingest_document(
    doc_id: str,
    filename: str,
    file_bytes: bytes,
    force_reindex: bool = False,
) -> int:
    """
    Parse, chunk, embed, and persist a document.

    Called by the /upload endpoint after file validation.
    Returns the number of chunks indexed.

    If a FAISS index already exists for this doc_id and force_reindex
    is False, the function returns immediately (idempotent).

    Args:
        doc_id:        Unique document identifier (UUID from /upload).
        filename:      Original filename (used for metadata + routing).
        file_bytes:    Raw file content.
        force_reindex: Rebuild the index even if one already exists.

    Returns:
        Number of chunks indexed.
    """
    # Idempotency check
    if not force_reindex and VectorStore.exists(doc_id):
        logger.info("Index already exists for doc_id=%s, skipping ingest", doc_id)
        vs = VectorStore.load(doc_id)
        return vs.size

    logger.info("Ingesting document: %s (doc_id=%s)", filename, doc_id)

    # # 1. Parse raw text
    # raw_text = parse_document(filename, file_bytes)
    # if not raw_text.strip():
    #     raise ValueError("No text extracted from document — cannot index.")

    # 1. Parse raw text
    raw_text = parse_document(filename, file_bytes)
    logger.info(f"DEBUG: raw_text length: {len(raw_text)} chars, {len(raw_text.split())} words")

    # 2. Clean
    cleaned_text = clean_text(raw_text)
    logger.info(f"DEBUG: cleaned_text length: {len(cleaned_text)} chars, {len(cleaned_text.split())} words")

    # # 3. Sliding-window chunk with overlap
    # chunks, meta = _sliding_window_chunks(
    #     cleaned_text,
    #     chunk_size=CHUNK_SIZE,
    #     overlap=CHUNK_OVERLAP,
    #     source=filename,
    # )
    
    # 3. Sliding-window chunk
    chunks, meta = _sliding_window_chunks(cleaned_text, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP, source=filename)
    logger.info(f"DEBUG: chunks produced: {len(chunks)}, first chunk: {chunks[0][:100] if chunks else 'NONE'}")

    if not chunks:
        raise ValueError("Document produced zero indexable chunks.")

    logger.info(
        "Created %d chunks (size≈%d words, overlap=%d) for %s",
        len(chunks), CHUNK_SIZE, CHUNK_OVERLAP, filename,
    )

    # 4. Embed + index
    vs = VectorStore(doc_id)
    vs.add_documents(chunks, meta)

    # 5. Persist
    vs.save()

    return len(chunks)


def retrieve(
    doc_id: str,
    query: str,
    k: int = DEFAULT_TOP_K,
) -> list[SearchResult]:
    """
    Retrieve the top-k most relevant chunks for a query.

    Loads the FAISS index from disk (cached by OS page cache on repeat
    calls) and returns ranked SearchResult objects.

    Args:
        doc_id: Document identifier.
        query:  Natural language query.
        k:      Number of results to return (default: DEFAULT_TOP_K).

    Returns:
        List of SearchResult sorted by descending cosine similarity.

    Raises:
        FileNotFoundError: If no index exists for this doc_id.
    """
    vs = VectorStore.load(doc_id)
    results = vs.search(query, k=k)

    logger.debug(
        "Retrieved %d chunks for query=%r (doc_id=%s)",
        len(results), query[:60], doc_id,
    )
    return results


def retrieve_context_string(
    doc_id: str,
    query: str,
    k: int = DEFAULT_TOP_K,
    max_chars: int = 6000,
) -> str:
    """
    Retrieve top-k chunks and return them as a single formatted string
    ready to inject into an LLM prompt.

    Each chunk is prefixed with its source + page for traceability.
    The output is truncated at max_chars to stay within token limits.

    Args:
        doc_id:    Document identifier.
        query:     Natural language query (used for retrieval ranking).
        k:         Number of chunks to retrieve.
        max_chars: Hard character cap on the returned string.

    Returns:
        Formatted context string.
    """
    results = retrieve(doc_id, query, k=k)

    parts = []
    total = 0
    for r in results:
        label = f"[{r.source} p.{r.page}]" if r.page >= 0 else f"[{r.source}]"
        chunk = f"{label}\n{r.text}\n"
        if total + len(chunk) > max_chars:
            remaining = max_chars - total
            if remaining > 100:
                parts.append(chunk[:remaining])
            break
        parts.append(chunk)
        total += len(chunk)

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# Smoke test  (python -m app.services.retriever)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json
    import tempfile
    import uuid

    logging.basicConfig(level=logging.INFO)

    SAMPLE_TEXT = """
[Page 1]
Machine learning is a subset of artificial intelligence.
It enables computers to learn from data without being explicitly programmed.

[Page 2]
Supervised learning uses labelled training data.
The model learns a mapping from inputs to outputs.
Common algorithms include linear regression, decision trees, and neural networks.

[Page 3]
Unsupervised learning discovers hidden patterns without labels.
Clustering algorithms group similar data points together.
Dimensionality reduction techniques like PCA reduce feature space.

[Page 4]
Neural networks are inspired by the human brain.
They consist of layers of interconnected nodes called neurons.
Deep learning uses many hidden layers to learn complex representations.
Backpropagation is the algorithm used to train neural networks.
"""

    doc_id  = str(uuid.uuid4())
    tmpfile = tempfile.NamedTemporaryFile(suffix=".txt", delete=False)
    tmpfile.write(SAMPLE_TEXT.encode())
    tmpfile.close()

    print("=== Chunking test ===")
    chunks, meta = _sliding_window_chunks(SAMPLE_TEXT, chunk_size=30, overlap=5)
    print(f"Produced {len(chunks)} chunks")
    for i, (c, m) in enumerate(zip(chunks, meta)):
        print(f"  Chunk {i} [page={m['page']}]: {c[:60]}...")

    print("\n=== Ingest test ===")
    with open(tmpfile.name, "rb") as f:
        n = ingest_document(doc_id, "sample.txt", f.read())
    print(f"Indexed {n} chunks for doc_id={doc_id}")

    print("\n=== Retrieval test ===")
    queries = [
        "What is backpropagation?",
        "How does unsupervised learning work?",
        "What are neural networks?",
    ]
    for q in queries:
        results = retrieve(doc_id, q, k=2)
        print(f"\nQuery: {q!r}")
        for r in results:
            print(f"  score={r.score:.4f}  text={r.text[:80]}...")

    print("\n=== Context string test ===")
    ctx = retrieve_context_string(doc_id, "explain deep learning")
    print(ctx[:300])

    print("\nAll smoke tests passed.")