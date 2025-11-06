# recommender.py
import pandas as pd
from datetime import datetime
import os
import joblib
import numpy as np

from mastery import EMAMastery, SM2Mastery

MODEL_PATH = "models/rf_study_recommender.pkl"

class Recommender:
    def __init__(self, topics, mastery_engine=None, recency_weight=0.5, data_csv="data/students.csv"):
        """
        topics: list of topic ids (e.g., ["topic_1", ...])
        mastery_engine: instance of EMAMastery or SM2Mastery
        recency_weight: how much recency (older reviews -> higher urgency)
        data_csv: path to interaction logs (used to build ML features)
        """
        self.topics = topics
        self.mastery = mastery_engine
        self.recency_weight = recency_weight
        self.data_csv = data_csv
        self.model = None
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                # model loaded
            except Exception as e:
                print("Warning: failed to load model:", e)
                self.model = None

        # preload dataset if exists
        if os.path.exists(self.data_csv):
            self.df = pd.read_csv(self.data_csv)
            if 'timestamp' in self.df.columns:
                self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        else:
            self.df = pd.DataFrame(columns=['student_id','topic_id','timestamp','correct'])

    # ---------- Feature builder used by train_ml.py; reused here ----------
    def _build_student_topic_features(self, student_id, topic_id, window=5):
        """
        Build the same features the ML model expects:
        - total_attempts_on_topic
        - accuracy_on_topic
        - recent_corrects_on_topic (last `window` attempts on that topic)
        - hours_since_last_activity (for the student overall; large number if none)
        """
        df = self.df
        student_df = df[df['student_id'] == student_id].sort_values('timestamp')
        topic_df = student_df[student_df['topic_id'] == topic_id]
        total = int(topic_df.shape[0])
        corrects = int(topic_df['correct'].sum()) if total > 0 else 0
        acc = corrects / total if total > 0 else 0.5
        # recent corrects for last `window` attempts on that topic
        last_k = topic_df.tail(window)
        rec_corrects = int(last_k['correct'].sum()) if not last_k.empty else 0
        # hours since last activity of the student
        if not student_df.empty:
            last_time = student_df['timestamp'].max()
            hours_since = (datetime.utcnow() - pd.to_datetime(last_time)).total_seconds() / 3600.0
        else:
            hours_since = 9999.0
        return {
            "total_attempts_on_topic": total,
            "accuracy_on_topic": acc,
            "recent_corrects_on_topic": rec_corrects,
            "hours_since_last_activity": hours_since
        }

    def ml_score(self, student_id, topic_id):
        """Return priority score based on ML model: higher => higher priority.
        We compute p_correct and return (1 - p_correct). If model missing, return None.
        """
        if self.model is None:
            return None
        feats = self._build_student_topic_features(student_id, topic_id)
        X = [[feats['total_attempts_on_topic'],
              feats['accuracy_on_topic'],
              feats['recent_corrects_on_topic'],
              feats['hours_since_last_activity']]]
        # model might not have predict_proba (but RF does). handle gracefully.
        try:
            p = self.model.predict_proba(X)[:,1][0]
        except Exception:
            # fallback to predict and use 1 - pred as score
            p = float(self.model.predict(X)[0])
        # priority: (1 - p)
        return float(1.0 - p)

    def score_topic(self, student_id, topic_id, now=None):
        """
        Combined scoring:
        - If ML model present, use ML score (1 - p_correct) scaled by recency factor.
        - Else fallback to mastery engine logic (EMA or SM2).
        """
        now = now or datetime.utcnow()
        ml = self.ml_score(student_id, topic_id)
        if ml is not None:
            # apply recency scaling: older last review => multiply slightly
            # get student last review time for this topic
            last = None
            if isinstance(self.mastery, EMAMastery):
                last = self.mastery.last_review.get(f"{student_id}||{topic_id}")
            elif isinstance(self.mastery, SM2Mastery):
                last = self.mastery.get_next_review(student_id, topic_id)
            else:
                # fallback: use df
                sub = self.df[(self.df['student_id']==student_id)&(self.df['topic_id']==topic_id)]
                if not sub.empty:
                    last = sub['timestamp'].max()
            if last is not None:
                days_since = (now - pd.to_datetime(last)).days if last is not None else 999
            else:
                days_since = 999
            rec_factor = 1 + self.recency_weight * min(days_since / 30.0, 2.0)
            return ml * rec_factor
        # no ML -> fallback
        if isinstance(self.mastery, EMAMastery):
            m = self.mastery.get_mastery(student_id, topic_id)
            last = self.mastery.last_review.get(f"{student_id}||{topic_id}")
            days_since = (now - last).days if last else 999
            rec_factor = 1 + self.recency_weight * min(days_since / 30.0, 2.0)
            score = (1 - m) * rec_factor
            return score
        else:
            # SM2 style
            m = self.mastery.get_mastery_score_estimate(student_id, topic_id)
            next_rev = self.mastery.get_next_review(student_id, topic_id)
            if next_rev and next_rev > now:
                days_until = (next_rev - now).days
                due_penalty = max(0.0, 1 - days_until / 30.0)
                score = (1 - m) * (1 + self.recency_weight * due_penalty)
            else:
                score = (1 - m) * (1 + self.recency_weight)
            return score

    def recommend(self, student_id, n=1, now=None):
        now = now or datetime.utcnow()
        scores = []
        for t in self.topics:
            scores.append((t, self.score_topic(student_id, t, now)))
        scores.sort(key=lambda x: x[1], reverse=True)
        return [t for t,_ in scores[:n]]

# utility to extract topics from csv if needed
def extract_topics_from_csv(csv_path="data/students.csv"):
    if not os.path.exists(csv_path):
        return []
    df = pd.read_csv(csv_path)
    return sorted(df['topic_id'].unique().tolist())
