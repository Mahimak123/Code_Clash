import json
import csv
import math
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VibeWatch AI Crisis Monitor API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_FILE = "social_crisis_monitor_dataset.csv"

def load_posts():
    posts = []
    with open(DATASET_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            posts.append({
                "post_id": r.get("post_id"),
                "timestamp": r.get("timestamp"),
                "platform": r.get("platform"),
                "brand": r.get("brand"),
                "matched_keyword": r.get("matched_keyword"),
                "text": r.get("text"),
                "sentiment": r.get("sentiment"),
                "confidence": float(r.get("confidence", 0.9)),
                "topic": r.get("topic"),
                "emotion": r.get("emotion"),
                "engagement": int(r.get("engagement", 0)),
                "incident_id": r.get("incident_id"),
                "incident_phase": r.get("incident_phase"),
                "negative_flag": int(r.get("negative_flag", 0)),
                "hour_bucket": r.get("hour_bucket"),
            })
    return posts

INCIDENTS_DB = {
    "INC-PAY-01": {
        "id": "INC-PAY-01",
        "name": "Payment Failure Spike",
        "brand": "PayWave",
        "topic": "Payment Failure",
        "severity": "CRITICAL",
        "severity_score": 84,
        "status": "Active",
        "negative_posts": 79,
        "growth": "+187%",
        "platforms": ["Reddit", "X", "Instagram", "YouTube"],
        "detected": "12 min ago",
        "whats_happening": "Negative conversations around payment gateway timeouts and OTP failure rates are increasing rapidly across multiple platforms.",
        "why_its_happening": "Dominant topic 'Payment Failure' accounts for 100% of the recent negative surge following the v2.4 payment service deployment.",
        "ai_insight": "A critical cluster of payment processing errors was detected starting on Reddit at 09:12 AM and rapidly spreading to X and Instagram. High churn intent detected among affected users.",
        "recommended_actions": [
            {"category": "Engineering", "action": "Investigate payment service timeouts and failover to secondary OTP provider."},
            {"category": "Support", "action": "Prepare canned response templates for users reporting pending/failed transactions."},
            {"category": "PR", "action": "Consider publishing a public service-status alert regarding temporary payment delays."}
        ],
        "spread": [
            {"platform": "Reddit", "first_seen": "09:12 AM", "count": 26},
            {"platform": "X", "first_seen": "09:18 AM", "count": 18},
            {"platform": "Instagram", "first_seen": "09:25 AM", "count": 18},
            {"platform": "YouTube", "first_seen": "09:30 AM", "count": 17}
        ]
    },
    "INC-STR-01": {
        "id": "INC-STR-01",
        "name": "Streaming Outage & Buffering",
        "brand": "StreamBox",
        "topic": "Outage",
        "severity": "HIGH",
        "severity_score": 72,
        "status": "Active",
        "negative_posts": 75,
        "growth": "+63%",
        "platforms": ["Instagram", "Reddit", "YouTube", "X"],
        "detected": "28 min ago",
        "whats_happening": "Users reporting playback freezes, severe buffering, and app crashes during live broadcast event.",
        "why_its_happening": "CDN edge server node capacity overwhelmed in US-East region causing elevated buffering and stream aborts.",
        "ai_insight": "Early warning anomaly triggered due to elevated 'Outage' and 'App Crash' keywords on Instagram and Reddit within a 30-minute window.",
        "recommended_actions": [
            {"category": "Engineering", "action": "Reroute live video traffic away from US-East CDN clusters to backup nodes."},
            {"category": "Support", "action": "Update automated chat bot to inform users of ongoing live stream degradation."}
        ],
        "spread": [
            {"platform": "Instagram", "first_seen": "09:40 AM", "count": 23},
            {"platform": "Reddit", "first_seen": "09:45 AM", "count": 21},
            {"platform": "YouTube", "first_seen": "09:50 AM", "count": 17},
            {"platform": "X", "first_seen": "09:52 AM", "count": 14}
        ]
    },
    "INC-FOOD-01": {
        "id": "INC-FOOD-01",
        "name": "Delivery Delays & Support Surge",
        "brand": "FoodRush",
        "topic": "Late Delivery",
        "severity": "MEDIUM",
        "severity_score": 58,
        "status": "Monitoring",
        "negative_posts": 75,
        "growth": "+45%",
        "platforms": ["X", "Instagram", "Reddit", "YouTube"],
        "detected": "45 min ago",
        "whats_happening": "Increased volume of negative posts regarding inaccurate order tracking and delayed lunch deliveries.",
        "why_its_happening": "Partner courier dispatch system glitch in metro areas causing delayed status updates.",
        "ai_insight": "Negative sentiment trending upwards for FoodRush, primarily driven by late deliveries and unresponsive support queues.",
        "recommended_actions": [
            {"category": "Operations", "action": "Re-synchronize courier dispatch GPS data feeds and extend estimated delivery windows."},
            {"category": "Support", "action": "Issue proactive \$5 apology vouchers to orders delayed beyond 40 minutes."}
        ],
        "spread": [
            {"platform": "X", "first_seen": "09:20 AM", "count": 24},
            {"platform": "Instagram", "first_seen": "09:28 AM", "count": 18},
            {"platform": "Reddit", "first_seen": "09:35 AM", "count": 17},
            {"platform": "YouTube", "first_seen": "09:40 AM", "count": 16}
        ]
    }
}

@app.get("/")
def read_root():
    return {
        "service": "VibeWatch AI Crisis Monitor API",
        "status": "Operational",
        "version": "1.0.0"
    }

@app.get("/api/overview")
def get_overview(brand: Optional[str] = None):
    posts = load_posts()
    if brand and brand != "All":
        posts = [p for p in posts if p["brand"] == brand]
    
    total_mentions = len(posts)
    negative_posts = [p for p in posts if p["sentiment"] == "Negative"]
    positive_posts = [p for p in posts if p["sentiment"] == "Positive"]
    neutral_posts = [p for p in posts if p["sentiment"] == "Neutral"]
    
    neg_pct = round((len(negative_posts) / total_mentions * 100), 1) if total_mentions > 0 else 0.0
    
    active_incidents = list(INCIDENTS_DB.values())
    if brand and brand != "All":
        active_incidents = [inc for inc in active_incidents if inc["brand"] == brand]
        
    critical_count = sum(1 for inc in active_incidents if inc["severity"] in ["CRITICAL", "HIGH"])
    
    # Calculate crisis risk score
    highest_risk = max([inc["severity_score"] for inc in active_incidents], default=30)
    
    main_critical = INCIDENTS_DB["INC-PAY-01"]
    if brand and brand != "All":
        brand_incs = [inc for inc in active_incidents if inc["brand"] == brand]
        if brand_incs:
            main_critical = max(brand_incs, key=lambda x: x["severity_score"])

    return {
        "total_mentions": total_mentions,
        "total_mentions_trend": "+14.2%",
        "negative_sentiment_pct": neg_pct,
        "negative_sentiment_trend": "+18.4%",
        "positive_sentiment_pct": round((len(positive_posts) / total_mentions * 100), 1) if total_mentions > 0 else 0.0,
        "neutral_sentiment_pct": round((len(neutral_posts) / total_mentions * 100), 1) if total_mentions > 0 else 0.0,
        "active_incidents_count": len(active_incidents),
        "high_priority_incidents_count": critical_count,
        "crisis_risk_score": highest_risk,
        "crisis_risk_level": "Critical" if highest_risk >= 80 else ("High" if highest_risk >= 65 else "Moderate"),
        "main_incident": main_critical,
        "system_status": "Operational"
    }

@app.get("/api/incidents")
def get_incidents(brand: Optional[str] = None, status: Optional[str] = None):
    incidents = list(INCIDENTS_DB.values())
    if brand and brand != "All":
        incidents = [i for i in incidents if i["brand"] == brand]
    if status and status != "All":
        incidents = [i for i in incidents if i["status"].lower() == status.lower()]
    return incidents

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str):
    if incident_id in INCIDENTS_DB:
        inc = INCIDENTS_DB[incident_id].copy()
        posts = load_posts()
        related_posts = [p for p in posts if p["incident_id"] == incident_id][:10]
        
        # sentiment breakdown for this incident
        all_inc_posts = [p for p in posts if p["incident_id"] == incident_id]
        pos = sum(1 for p in all_inc_posts if p["sentiment"] == "Positive")
        neu = sum(1 for p in all_inc_posts if p["sentiment"] == "Neutral")
        neg = sum(1 for p in all_inc_posts if p["sentiment"] == "Negative")
        
        inc["sentiment_breakdown"] = {
            "positive": pos,
            "neutral": neu,
            "negative": neg or len(all_inc_posts) # fallback to negative count
        }
        inc["sample_posts"] = related_posts
        return inc
    return {"error": "Incident not found"}, 404

@app.get("/api/posts")
def get_posts(
    brand: Optional[str] = None,
    platform: Optional[str] = None,
    sentiment: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    posts = load_posts()
    if brand and brand != "All":
        posts = [p for p in posts if p["brand"] == brand]
    if platform and platform != "All":
        posts = [p for p in posts if p["platform"].lower() == platform.lower()]
    if sentiment and sentiment != "All":
        posts = [p for p in posts if p["sentiment"].lower() == sentiment.lower()]
    if topic and topic != "All":
        posts = [p for p in posts if p["topic"].lower() == topic.lower()]
    if search:
        s = search.lower()
        posts = [p for p in posts if s in p["text"].lower() or s in p["topic"].lower() or s in p["brand"].lower()]
    
    total = len(posts)
    paginated = posts[offset: offset + limit]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "posts": paginated
    }

@app.get("/api/anomalies")
def get_anomalies(brand: Optional[str] = None):
    anomalies = [
        {
            "id": "anom-1",
            "incident_id": "INC-PAY-01",
            "type": "🚨 Negative Spike",
            "title": "Payment complaints surge",
            "brand": "PayWave",
            "growth": "+187%",
            "detected": "12 min ago",
            "status": "Critical",
            "severity": "CRITICAL",
            "description": "Unusually high concentration of failed transaction reports on Reddit & X."
        },
        {
            "id": "anom-2",
            "incident_id": "INC-STR-01",
            "type": "⚠️ Growing Issue",
            "title": "Stream freeze & login failures",
            "brand": "StreamBox",
            "growth": "+63%",
            "detected": "28 min ago",
            "status": "Early signal",
            "severity": "HIGH",
            "description": "Gradual increase in buffering and stream drop complaints."
        },
        {
            "id": "anom-3",
            "incident_id": "INC-FOOD-01",
            "type": "⚠️ Delivery Delay",
            "title": "Order tracking desync",
            "brand": "FoodRush",
            "growth": "+45%",
            "detected": "45 min ago",
            "status": "Monitoring",
            "severity": "MEDIUM",
            "description": "Couriers reporting delayed arrival timestamps in metro hubs."
        }
    ]
    if brand and brand != "All":
        anomalies = [a for a in anomalies if a["brand"] == brand]
    return anomalies

@app.get("/api/analytics")
def get_analytics(brand: Optional[str] = None):
    posts = load_posts()
    if brand and brand != "All":
        posts = [p for p in posts if p["brand"] == brand]

    # Time series hourly
    buckets = {}
    for p in posts:
        b = p.get("timestamp", "")[:13] + ":00" # e.g. "2026-08-22 09:00"
        if not b:
            continue
        if b not in buckets:
            buckets[b] = {"timestamp": b, "positive": 0, "neutral": 0, "negative": 0, "total": 0}
        s = p["sentiment"].lower()
        if s in buckets[b]:
            buckets[b][s] += 1
        buckets[b]["total"] += 1
        
    sorted_buckets = sorted(buckets.values(), key=lambda x: x["timestamp"])

    # Platform breakdown
    platform_map = {}
    for p in posts:
        plat = p["platform"]
        if plat not in platform_map:
            platform_map[plat] = {"platform": plat, "positive": 0, "neutral": 0, "negative": 0, "total": 0, "engagement": 0}
        s = p["sentiment"].lower()
        if s in platform_map[plat]:
            platform_map[plat][s] += 1
        platform_map[plat]["total"] += 1
        platform_map[plat]["engagement"] += p["engagement"]
        
    # Topic breakdown
    topic_map = {}
    for p in posts:
        top = p["topic"]
        if top not in topic_map:
            topic_map[top] = {"topic": top, "positive": 0, "neutral": 0, "negative": 0, "total": 0}
        s = p["sentiment"].lower()
        if s in topic_map[top]:
            topic_map[top][s] += 1
        topic_map[top]["total"] += 1

    topic_list = sorted(topic_map.values(), key=lambda x: x["total"], reverse=True)

    # Engagement by sentiment
    engagement_by_sentiment = {"Positive": 0, "Neutral": 0, "Negative": 0}
    for p in posts:
        s = p["sentiment"]
        if s in engagement_by_sentiment:
            engagement_by_sentiment[s] += p["engagement"]

    return {
        "sentiment_trend": sorted_buckets,
        "sentiment_by_platform": list(platform_map.values()),
        "sentiment_by_topic": topic_list,
        "engagement_by_sentiment": engagement_by_sentiment,
        "total_posts_analyzed": len(posts)
    }

@app.get("/api/topics")
def get_topics(brand: Optional[str] = None):
    posts = load_posts()
    if brand and brand != "All":
        posts = [p for p in posts if p["brand"] == brand]
    
    total = len(posts)
    topic_counts = {}
    for p in posts:
        t = p["topic"]
        if t not in topic_counts:
            topic_counts[t] = {
                "name": t,
                "count": 0,
                "negative_count": 0,
                "positive_count": 0,
                "neutral_count": 0,
                "platforms": set(),
                "sample_posts": []
            }
        topic_counts[t]["count"] += 1
        topic_counts[t]["platforms"].add(p["platform"])
        if p["sentiment"] == "Negative":
            topic_counts[t]["negative_count"] += 1
        elif p["sentiment"] == "Positive":
            topic_counts[t]["positive_count"] += 1
        else:
            topic_counts[t]["neutral_count"] += 1
            
        if len(topic_counts[t]["sample_posts"]) < 3:
            topic_counts[t]["sample_posts"].append(p)

    res = []
    for t_name, data in topic_counts.items():
        pct = round((data["count"] / total * 100), 1) if total > 0 else 0
        neg_pct = round((data["negative_count"] / data["count"] * 100), 1) if data["count"] > 0 else 0
        res.append({
            "name": t_name,
            "count": data["count"],
            "percentage": pct,
            "negative_count": data["negative_count"],
            "negative_pct": neg_pct,
            "platforms": list(data["platforms"]),
            "sample_posts": data["sample_posts"],
            "related_incident": "INC-PAY-01" if t_name == "Payment Failure" else ("INC-STR-01" if t_name in ["Outage", "Buffering", "App Crash"] else ("INC-FOOD-01" if t_name in ["Late Delivery", "Missing Order"] else None))
        })

    res = sorted(res, key=lambda x: x["count"], reverse=True)
    return res
