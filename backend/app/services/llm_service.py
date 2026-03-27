"""
llm_service.py — Google Gemini integration.
v2: RAG support + full error logging so the real exception is always visible.
"""

import json
import logging
import os
import re
import traceback
from typing import Any

from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import HTTPException

from app.services.prompts import SYSTEM_PROMPT, build_prompt

load_dotenv()
logger = logging.getLogger(__name__)

_API_KEY = os.getenv("GOOGLE_API_KEY")
if not _API_KEY:
    raise RuntimeError(
        "GOOGLE_API_KEY is not set. Add it to your .env file and restart."
    )

genai.configure(api_key=_API_KEY)

# Use flash for development — much faster and cheaper than pro
# Change to gemini-1.5-pro in .env when you need higher quality output
_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

_GENERATION_CONFIG = genai.GenerationConfig(
    temperature=0.4,
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
)

_SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))


def _get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(
        model_name=_MODEL_NAME,
        generation_config=_GENERATION_CONFIG,
        safety_settings=_SAFETY_SETTINGS,
        system_instruction=SYSTEM_PROMPT,
    )


def _extract_json(raw: str) -> Any:
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"LLM returned invalid JSON: {exc}. Raw: {raw[:500]}"
        )


def _get_rag_context(doc_id: str | None, query: str) -> str | None:
    if not doc_id:
        return None
    try:
        from app.services.retriever import retrieve_context_string
        from app.services.vector_store import VectorStore
        if not VectorStore.exists(doc_id):
            return None
        return retrieve_context_string(doc_id, query, k=RAG_TOP_K)
    except Exception as exc:
        logger.warning("RAG retrieval failed (%s) — using raw text", exc)
        return None


def generate_text(prompt: str) -> str:
    """Send a prompt to Gemini and return raw text. Logs the full traceback on failure."""
    try:
        logger.info("Calling Gemini model=%s prompt_chars=%d", _MODEL_NAME, len(prompt))
        response = _get_model().generate_content(prompt)

        if not response.candidates:
            feedback = getattr(response, "prompt_feedback", "none")
            logger.error("Gemini returned no candidates. feedback=%s", feedback)
            raise HTTPException(
                status_code=422,
                detail=f"Gemini blocked the response. Feedback: {feedback}",
            )

        logger.info("Gemini OK — response_chars=%d", len(response.text))
        return response.text

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Gemini API call failed:\n%s", traceback.format_exc())
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error [{type(exc).__name__}]: {exc}"
        )


def generate_json(prompt: str) -> Any:
    return _extract_json(generate_text(prompt))


def generate_summary(text: str, difficulty: str = "Intermediate", doc_id: str | None = None) -> str:
    ctx     = _get_rag_context(doc_id, "key concepts core ideas summary")
    prompt  = build_prompt("summary", ctx or text, difficulty=difficulty)
    return generate_text(prompt)


def generate_flashcards(text: str, difficulty: str = "Intermediate", num_cards: int = 15, doc_id: str | None = None) -> dict:
    ctx    = _get_rag_context(doc_id, "key terms definitions concepts vocabulary")
    prompt = build_prompt("flashcard", ctx or text, difficulty=difficulty, num_cards=num_cards)
    return generate_json(prompt)


def generate_faqs(text: str, difficulty: str = "Intermediate", num_faqs: int = 10, doc_id: str | None = None) -> dict:
    ctx    = _get_rag_context(doc_id, "common questions student misconceptions how why")
    prompt = build_prompt("faq", ctx or text, difficulty=difficulty, num_faqs=num_faqs)
    return generate_json(prompt)


def generate_mock_quiz(text: str, difficulty: str = "Intermediate", question_type: str = "mcq", num_questions: int = 5, doc_id: str | None = None) -> dict:
    query_map = {
        "mcq":          "exam questions multiple choice test assessment",
        "short_answer": "short answer exam questions explain describe",
        "long_answer":  "essay questions analysis evaluation deep understanding",
    }
    ctx    = _get_rag_context(doc_id, query_map.get(question_type, "exam questions"))
    prompt = build_prompt("mock_quiz", ctx or text, difficulty=difficulty, question_type=question_type, num_questions=num_questions)
    return generate_json(prompt)