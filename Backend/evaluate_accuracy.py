"""Compare gemini_analyzer output against ground-truth labels in the CSV."""
import argparse
import csv
import json
from collections import Counter

# Legacy alias used only when comparing against older runs that lacked topic definitions.
TOPIC_ALIASES = {"Buffering": "Streaming"}


def norm_topic(topic: str, relaxed: bool) -> str:
    if relaxed:
        return TOPIC_ALIASES.get(topic, topic)
    return topic


def load_ground_truth(path: str) -> dict:
    with open(path, newline="", encoding="utf-8") as f:
        return {row["post_id"]: row for row in csv.DictReader(f)}


def evaluate(preds: list, ground_truth: dict, relaxed_topic: bool = False) -> dict:
    fields = ["sentiment", "topic", "emotion"]
    total = len(preds)
    correct = {f: 0 for f in fields}
    mismatches = {f: [] for f in fields}

    for pred in preds:
        gt = ground_truth[pred["post_id"]]
        for field in fields:
            predicted = (
                norm_topic(pred[field], relaxed_topic)
                if field == "topic"
                else pred[field]
            )
            expected = gt[field]
            if predicted == expected:
                correct[field] += 1
            else:
                mismatches[field].append(
                    (pred["post_id"], expected, pred[field], pred["text"][:60])
                )

    all_match = sum(
        1
        for pred in preds
        if all(
            (
                norm_topic(pred[f], relaxed_topic)
                if f == "topic"
                else pred[f]
            )
            == ground_truth[pred["post_id"]][f]
            for f in fields
        )
    )

    return {
        "total": total,
        "correct": correct,
        "mismatches": mismatches,
        "all_match": all_match,
        "fields": fields,
    }


def print_report(results: dict, label: str, relaxed_topic: bool) -> None:
    total = results["total"]
    mode = "RELAXED" if relaxed_topic else "STRICT"
    print(f"\n=== {label} — {mode} ACCURACY ({total} posts) ===")
    for field in results["fields"]:
        ok = results["correct"][field]
        print(f"{field:12s}: {ok / total * 100:5.1f}%  ({ok}/{total})")
    print(
        f"{'all 3 match':12s}: {results['all_match'] / total * 100:5.1f}%  "
        f"({results['all_match']}/{total})"
    )

    for field in results["fields"]:
        print(f"\n--- {field} mismatches ---")
        if not results["mismatches"][field]:
            print("  (none)")
            continue
        for post_id, expected, predicted, text in results["mismatches"][field]:
            print(f"  {post_id}: expected={expected!r} predicted={predicted!r} | {text}")


def print_dataset_overview(ground_truth_rows: list) -> None:
    fields = ["sentiment", "topic", "emotion"]
    print(f"\n=== DATASET OVERVIEW ({len(ground_truth_rows)} posts) ===")
    for field in fields:
        print(f"{field}: {dict(Counter(row[field] for row in ground_truth_rows))}")
    print(f"incident_phase: {dict(Counter(row['incident_phase'] for row in ground_truth_rows))}")
    print(f"negative_flag: {dict(Counter(row['negative_flag'] for row in ground_truth_rows))}")


def compare_runs(old_preds: list, new_preds: list) -> None:
    old_by_id = {p["post_id"]: p for p in old_preds}
    new_by_id = {p["post_id"]: p for p in new_preds}
    common = sorted(set(old_by_id) & set(new_by_id))
    if not common:
        return

    print(f"\n=== CHANGES BETWEEN RUNS ({len(common)} shared posts) ===")
    changed = False
    for post_id in common:
        old = old_by_id[post_id]
        new = new_by_id[post_id]
        diffs = []
        for field in ("sentiment", "topic", "emotion"):
            if old[field] != new[field]:
                diffs.append(f"{field}: {old[field]!r} -> {new[field]!r}")
        if diffs:
            changed = True
            print(f"  {post_id}: {', '.join(diffs)}")
    if not changed:
        print("  (no label changes)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default="social_crisis_monitor_dataset.csv")
    parser.add_argument("--predictions", default="analysis_results.json")
    parser.add_argument("--label", default="Current run")
    parser.add_argument(
        "--compare",
        default=None,
        help="Optional path to a previous predictions JSON for side-by-side diff",
    )
    parser.add_argument(
        "--relaxed-topic",
        action="store_true",
        help="Count Buffering as Streaming (legacy runs without topic definitions)",
    )
    args = parser.parse_args()

    ground_truth = load_ground_truth(args.csv)
    ground_truth_rows = list(ground_truth.values())
    with open(args.predictions, encoding="utf-8") as f:
        preds = json.load(f)

    missing = [p["post_id"] for p in preds if p["post_id"] not in ground_truth]
    if missing:
        raise SystemExit(f"Unknown post_ids in predictions: {missing[:5]}")

    print(f"Evaluating {len(preds)} predictions against {len(ground_truth)} ground-truth rows.")
    results = evaluate(preds, ground_truth, relaxed_topic=args.relaxed_topic)
    print_report(results, args.label, relaxed_topic=args.relaxed_topic)
    print_dataset_overview(ground_truth_rows)

    if args.compare:
        with open(args.compare, encoding="utf-8") as f:
            baseline = json.load(f)
        compare_runs(baseline, preds)


if __name__ == "__main__":
    main()
