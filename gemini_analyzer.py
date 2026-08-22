"""
gemini_analyzer.py — AI-based post analysis using the Gemini API.

Classifies each post's sentiment, topic, emotion, and confidence using
Gemini's structured JSON output mode (response_schema), so you always get
back valid, predictable JSON — no manual parsing/regex needed.

Setup:
    pip install google-generativeai
    export GEMINI_API_KEY="your-key-here"

Usage:
    python gemini_analyzer.py                          # analyze full CSV
    python gemini_analyzer.py --limit 50                # just first 50 rows
    python gemini_analyzer.py --input posts.csv --output results.json
"""
import os
import json
import time
import argparse
import csv
import google.generativeai as genai

# --- Config ---
MODEL_NAME = "gemini-3.5-flash-lite"  # fast + cheap, good for high-volume classification

# Fixed category lists pulled from your dataset, so Gemini's output stays
# consistent with your existing schema instead of inventing new labels.
TOPICS = [
    "Streaming", "Payments", "Food Quality", "Delivery", "Tracking", "UX",
    "Payment Failure", "App Crash", "Outage", "Buffering", "Late Delivery",
    "Customer Support", "Missing Order", "Other",
]
EMOTIONS = [
    "Satisfaction", "Concern", "Curiosity", "Churn Intent",
    "Frustration", "Anger", "Abandonment", "Neutral",
]

# Gemini structured output schema — guarantees the shape of the JSON response
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["Positive", "Neutral", "Negative"]},
        "confidence": {"type": "number"},
        "topic": {"type": "string", "enum": TOPICS},
        "emotion": {"type": "string", "enum": EMOTIONS},
        "reasoning": {"type": "string"},
    },
    "required": ["sentiment", "confidence", "topic", "emotion", "reasoning"],
}

PROMPT_TEMPLATE = """You are a social media sentiment analyst for a brand monitoring system.

Analyze this post and classify it.

Post text: "{text}"
Brand/keyword mentioned: {brand}
Platform: {platform}

Rules:
- sentiment: Positive, Neutral, or Negative — based on overall tone toward the brand.
- confidence: your confidence in the sentiment label, from 0.0 to 1.0.
- topic: pick the single best-fitting topic from this exact list: {topics}
- emotion: pick the single best-fitting emotion from this exact list: {emotions}
- reasoning: one short phrase (under 12 words) explaining why you chose this sentiment.

Return ONLY the JSON object, nothing else."""


def get_model():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Set the GEMINI_API_KEY environment variable first.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": RESPONSE_SCHEMA,
        },
    )


def analyze_post(model, text: str, brand: str = "", platform: str = "") -> dict:
    """Sends one post to Gemini and returns the parsed analysis as a dict."""
    prompt = PROMPT_TEMPLATE.format(
        text=text, brand=brand or "unknown", platform=platform or "unknown",
        topics=", ".join(TOPICS), emotions=", ".join(EMOTIONS),
    )
    try:
        response = model.generate_content(prompt)
        result = json.loads(response.text)
        return result
    except Exception as e:
        # Never let one bad post kill a batch run — return a clearly-flagged fallback
        return {
            "sentiment": "Neutral",
            "confidence": 0.0,
            "topic": "Other",
            "emotion": "Neutral",
            "reasoning": f"analysis_failed: {str(e)[:100]}",
        }


def analyze_csv(input_path: str, output_path: str, limit: int = None, sleep_seconds: float = 0.0):
    """Reads posts from CSV, runs Gemini analysis on each, writes results as a JSON array."""
    model = get_model()
    results = []

    with open(input_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if limit and i >= limit:
                break

            analysis = analyze_post(
                model,
                text=row["text"],
                brand=row.get("brand", ""),
                platform=row.get("platform", ""),
            )

            results.append({
                "post_id": row.get("post_id", f"row_{i}"),
                "timestamp": row.get("timestamp", ""),
                "platform": row.get("platform", ""),
                "brand": row.get("brand", ""),
                "matched_keyword": row.get("matched_keyword", ""),
                "text": row["text"],
                "sentiment": analysis["sentiment"],
                "confidence": analysis["confidence"],
                "topic": analysis["topic"],
                "emotion": analysis["emotion"],
                "reasoning": analysis["reasoning"],
            })

            print(f"[{i+1}] {row.get('post_id')}: {analysis['sentiment']} / {analysis['topic']} / {analysis['emotion']}")

            if sleep_seconds:
                time.sleep(sleep_seconds)  # basic rate-limit protection on the free tier

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nDone. Analyzed {len(results)} posts -> {output_path}")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="social_crisis_monitor_dataset.csv")
    parser.add_argument("--output", default="analysis_results.json")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of posts (useful for testing)")
    parser.add_argument("--sleep", type=float, default=0.0, help="Seconds to sleep between API calls")
    args = parser.parse_args()

    analyze_csv(args.input, args.output, limit=args.limit, sleep_seconds=args.sleep)