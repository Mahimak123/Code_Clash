# Evaluation Guide

How to run a full-dataset evaluation and interpret the results.

## Quick start

```bash
python gemini_analyzer.py --output analysis_results_full.json --sleep 0.5
python evaluate_accuracy.py --predictions analysis_results_full.json --label "Full dataset"
```

| Command | Purpose |
|---------|---------|
| `gemini_analyzer.py` | Sends each CSV row to Gemini and writes predictions to JSON |
| `evaluate_accuracy.py` | Compares predictions to ground-truth labels in the CSV |

---

## Example run (partial — 112/769 posts)

The run below was started with `--sleep 0.5` but **crashed at post 112** before writing `analysis_results_full.json`. Results are only saved when the script finishes, so no output file was produced.

### Console output (excerpt)

```
import google.generativeai as genai
[1] P0019: Neutral / Buffering / Concern
[2] P0001: Positive / Payments / Satisfaction
[3] P0040: Positive / Food Quality / Satisfaction
[4] P0035: Positive / Delivery / Satisfaction
[5] P0007: Negative / Payments / Concern
[6] P0023: Positive / Streaming / Satisfaction
[7] P0026: Neutral / Buffering / Curiosity
[8] P0038: Neutral / Tracking / Curiosity
[9] P0011: Positive / UX / Satisfaction
[10] P0005: Positive / UX / Satisfaction
...
[16] P0034: Positive / Food Quality / Satisfaction
[17] P0009: Neutral / Other / Neutral      ← API fallback starts
[18] P0031: Neutral / Other / Neutral
...
[46] P0074: Positive / Delivery / Satisfaction   ← brief recovery
...
[53] P0062: Negative / Streaming / Frustration
...
[62] P0054: Neutral / Other / Neutral      ← fallbacks again
...
[107] P0430: Neutral / Other / Neutral     ← crisis post missed (Payment Failure)
[110] P0429: Neutral / Other / Neutral     ← crisis post missed (Payment Failure)
[112] P0113: Neutral / Other / Neutral
Traceback (most recent call last):
  ...
```

### What happened

1. **Posts 1–16** — Gemini responded normally with sensible labels.
2. **Posts 17–112 (mostly)** — Large block of `Neutral / Other / Neutral` outputs.
3. **Crash at post 112** — Unhandled exception stopped the run; no JSON file written.

---

## Understanding `Neutral / Other / Neutral`

This is **not** a real Gemini classification. It is the **error fallback** defined in `gemini_analyzer.py`:

```python
return {
    "sentiment": "Neutral",
    "confidence": 0.0,
    "topic": "Other",
    "emotion": "Neutral",
    "reasoning": f"analysis_failed: {str(e)[:100]}",
}
```

It appears when the API call fails (rate limits, quota, network errors, invalid model name, etc.). In the partial run:

| Category | Count | Share |
|----------|-------|-------|
| Total posts processed | 112 | 100% |
| **API fallbacks** (`Neutral / Other / Neutral`) | **80** | **71.4%** |
| Successful Gemini responses | 32 | 28.6% |

So most of the run did **not** reflect model quality — it reflected **API failures**.

---

## Accuracy results (112 posts from example run)

Compared against ground truth in `social_crisis_monitor_dataset.csv`.

### All 112 posts (including fallbacks)

| Metric | Accuracy | Correct |
|--------|----------|---------|
| Sentiment | **57.1%** | 64/112 |
| Topic | **24.1%** | 27/112 |
| Emotion | **20.5%** | 23/112 |
| All 3 fields | **17.9%** | 20/112 |

These numbers are **misleadingly low** because 80 posts were error fallbacks, not real predictions.

### Successful API calls only (32 posts)

| Metric | Accuracy | Correct |
|--------|----------|---------|
| Sentiment | **90.6%** | 29/32 |
| Topic | **84.4%** | 27/32 |
| Emotion | **71.9%** | 23/32 |
| All 3 fields | **62.5%** | 20/32 |

This is a better picture of **actual model performance** when the API works.

### Naive baseline (same 112 posts)

Always predict the most common label in the full dataset (`Neutral` / `Streaming` / `Concern`):

| Metric | Naive accuracy |
|--------|----------------|
| Sentiment | 42.9% (48/112) |
| Topic | 23.2% (26/112) |
| Emotion | 31.2% (35/112) |
| All 3 fields | 16.1% (18/112) |

### Comparison summary

| | All 112 (with failures) | Successful calls only (32) | Naive baseline (112) |
|--|-------------------------|----------------------------|----------------------|
| Sentiment | 57.1% | **90.6%** | 42.9% |
| Topic | 24.1% | **84.4%** | 23.2% |
| Emotion | 20.5% | **71.9%** | 31.2% |
| All 3 fields | 17.9% | **62.5%** | 16.1% |

When Gemini responds successfully, it **clearly beats** the naive baseline. When fallbacks dominate, overall accuracy looks **worse than naive**.

---

## Common mismatches (successful calls)

| Post | Ground truth | Predicted | Issue |
|------|--------------|-----------|-------|
| P0019, P0026, P0064, P0060 | Streaming / Concern | Buffering / Curiosity | Topic + emotion disambiguation |
| P0007, P0062, P0067 | Neutral / Concern | Negative / Frustration | Sentiment/emotion harsher than labels |
| P0013, P0043, P0044, P0050 | Concern | Neutral | Emotion softened to Neutral |
| P0059 | Streaming | Buffering | Buffering vs Streaming label mismatch |

---

## Crisis posts that failed (fallback)

These important negative posts received `Neutral / Other / Neutral` instead of real analysis:

| Post | Expected (ground truth) | Got |
|------|-------------------------|-----|
| P0430 | Negative / Payment Failure / Churn Intent | Neutral / Other / Neutral |
| P0429 | Negative / Payment Failure / Frustration | Neutral / Other / Neutral |

Crisis detection cannot be evaluated until the API run completes reliably.

---

## Recommendations before re-running

1. **Increase sleep** — try `--sleep 1.0` or `--sleep 2.0` to reduce rate-limit errors.
2. **Check API quota** — verify your Gemini API key has sufficient quota at [Google AI Studio](https://aistudio.google.com/).
3. **Verify model name** — `gemini-3.5-flash-lite` in `gemini_analyzer.py` must be a valid model for your API key.
4. **Resume safely** — the script currently writes output only at the end. A crash loses all progress. Consider running in batches:

   ```bash
   python gemini_analyzer.py --limit 100 --output batch_001.json --sleep 1.0
   python evaluate_accuracy.py --predictions batch_001.json --label "Batch 1"
   ```

5. **Filter fallbacks when evaluating** — exclude rows where `confidence == 0.0` and `topic == "Other"` to measure true model accuracy.

---

## Expected `evaluate_accuracy.py` output (when run completes)

Once `analysis_results_full.json` exists:

```bash
python evaluate_accuracy.py --predictions analysis_results_full.json --label "Full dataset"
```

Example format:

```
Evaluating 769 predictions against 769 ground-truth rows.

=== Full dataset — STRICT ACCURACY (769 posts) ===
sentiment   :  XX.X%  (XXX/769)
topic       :  XX.X%  (XXX/769)
emotion     :  XX.X%  (XXX/769)
all 3 match :  XX.X%  (XXX/769)

--- sentiment mismatches ---
  ...

=== DATASET OVERVIEW (769 posts) ===
sentiment: {'Neutral': 288, 'Positive': 252, 'Negative': 229}
...
```

Compare against previous runs:

```bash
python evaluate_accuracy.py \
  --predictions analysis_results_full.json \
  --label "Full dataset" \
  --compare analysis_results_v2.json
```

---

## Smaller test runs (for comparison)

These completed successfully on 10 posts:

```bash
python gemini_analyzer.py --limit 10 --output analysis_results_v2.json
python evaluate_accuracy.py --predictions analysis_results_v2.json --label "10-post sample"
```

| Metric | 10-post sample |
|--------|----------------|
| Sentiment | 100% (10/10) |
| Topic | 70% (7/10) |
| Emotion | 70% (7/10) |
| All 3 fields | 60% (6/10) |

---

