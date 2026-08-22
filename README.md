# Social Crisis Monitor — Gemini Analyzer

Classifies social media posts using Google's Gemini API. For each post it predicts **sentiment**, **topic**, **emotion**, and a **confidence** score, using structured JSON output so results are always valid and predictable.

## Project structure

| File | Purpose |
|------|---------|
| `gemini_analyzer.py` | Runs Gemini classification on posts from a CSV |
| `evaluate_accuracy.py` | Compares model output against ground-truth labels |
| `social_crisis_monitor_dataset.csv` | Sample dataset (769 posts) with labels |
| `analysis_results.json` | Output from the analyzer (generated) |
| `.env` | Your API key (not committed — see `.env.example`) |

## Setup

1. **Clone or download** this project.

2. **Create a virtual environment** (recommended):

   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your API key:**

   ```bash
   copy .env.example .env
   ```

   Open `.env` and set your key:

   ```
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

   Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

## Usage

### Analyze posts

```bash
# Full dataset (769 posts)
python gemini_analyzer.py

# Quick test on first 10 posts
python gemini_analyzer.py --limit 10 --output analysis_results_v2.json

# Custom input/output with rate limiting
python gemini_analyzer.py --input social_crisis_monitor_dataset.csv --output results.json --sleep 0.5
```

**CLI options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--input` | `social_crisis_monitor_dataset.csv` | Input CSV path |
| `--output` | `analysis_results.json` | Output JSON path |
| `--limit` | none | Max number of posts to analyze |
| `--sleep` | `0.0` | Seconds to wait between API calls |

### Evaluate accuracy

Compare predictions to ground-truth labels in the CSV:

```bash
python evaluate_accuracy.py --predictions analysis_results.json --label "My run"

# Compare against a previous run
python evaluate_accuracy.py --predictions analysis_results_v2.json --label "New prompt" --compare analysis_results.json
```

See **[evaluation.md](evaluation.md)** for full-dataset run instructions, example output, baseline comparisons, and troubleshooting API fallbacks (`Neutral / Other / Neutral`).

**Metrics reported:** sentiment, topic, emotion, and all-three-fields exact match.

## Output format

Each analyzed post is written as a JSON object:

```json
{
  "post_id": "P0001",
  "timestamp": "2026-08-22 09:01:00",
  "platform": "Instagram",
  "brand": "PayWave",
  "matched_keyword": "PayWave",
  "text": "Payment went through smoothly today, nice and quick.",
  "sentiment": "Positive",
  "confidence": 0.95,
  "topic": "Payments",
  "emotion": "Satisfaction",
  "reasoning": "User praises smooth, quick payment"
}
```

## Classification schema

**Sentiment:** `Positive`, `Neutral`, `Negative`

**Topics:** Streaming, Buffering, Payments, Payment Failure, Food Quality, Delivery, Late Delivery, Tracking, UX, App Crash, Outage, Customer Support, Missing Order, Other

**Emotions:** Satisfaction, Concern, Curiosity, Churn Intent, Frustration, Anger, Abandonment, Neutral

Topic and emotion definitions are embedded in the prompt inside `gemini_analyzer.py`, including disambiguation rules for question-style posts (e.g. Curiosity vs Concern).

## Dataset

`social_crisis_monitor_dataset.csv` contains 769 labeled posts across brands (StreamBox, PayWave, FoodRush) and platforms (Instagram, X, Reddit, YouTube). Labels include normal posts and crisis/incident scenarios (payment failures, outages, etc.).

**CSV columns used by the analyzer:** `post_id`, `text`, `brand`, `platform`, `matched_keyword`, `timestamp`

**Ground-truth columns used by evaluation:** `sentiment`, `topic`, `emotion`

## Notes

- The default model is `gemini-3.5-flash-lite` (fast, cost-effective for batch classification).
- Use `--sleep 0.5` (or higher) on large runs to reduce rate-limit errors.
- Never commit `.env` — it is listed in `.gitignore`.
