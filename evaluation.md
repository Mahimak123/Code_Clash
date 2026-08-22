# Evaluation Guide

How to run evaluation and interpret the results.

## Quick start

From the `Backend/` folder:

```bash
python gemini_analyzer.py --output analysis_results_full.json --sleep 0.5
python evaluate_accuracy.py --predictions analysis_results_full.json --label "Full dataset"
```

| Command | Purpose |
|---------|---------|
| `gemini_analyzer.py` | Sends each CSV row to Gemini and writes predictions to JSON |
| `evaluate_accuracy.py` | Compares predictions to ground-truth labels in the CSV |

For a quick test on 10 posts first:

```bash
python gemini_analyzer.py --limit 10 --output analysis_results_v2.json
python evaluate_accuracy.py --predictions analysis_results_v2.json --label "10-post sample"
```

---

## Example console output

When the analyzer runs, each post is logged as:

```
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
```

Format: `[index] post_id: sentiment / topic / emotion`

---

## Sample results (10 posts)

Results from a completed 10-post run (`analysis_results_v2.json`):

- **Sentiment: 100%** (10/10)

Run the evaluation yourself:

```bash
python evaluate_accuracy.py --predictions analysis_results_v2.json --label "10-post sample"
```

Compare two runs:

```bash
python evaluate_accuracy.py \
  --predictions analysis_results_v2.json \
  --label "New prompt" \
  --compare analysis_results.json
```

---

## Expected `evaluate_accuracy.py` output

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
topic: {'Streaming': 142, 'Payments': 135, ...}
emotion: {'Concern': 269, 'Satisfaction': 252, ...}
```

---

## Tips for full-dataset runs

- Use `--sleep 0.5` or higher to avoid rate limits on large batches.
- Run in smaller batches if needed:

  ```bash
  python gemini_analyzer.py --limit 100 --output batch_001.json --sleep 1.0
  python evaluate_accuracy.py --predictions batch_001.json --label "Batch 1"
  ```

- Ground-truth labels live in `social_crisis_monitor_dataset.csv` — the analyzer does not use them; only `evaluate_accuracy.py` does.
