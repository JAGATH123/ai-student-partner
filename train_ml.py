# train_ml.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "rf_study_recommender.pkl")
os.makedirs(MODEL_DIR, exist_ok=True)

def build_features(df, window=5):
    rows = []
    for sid, g in df.groupby('student_id'):
        g = g.sort_values('timestamp').reset_index(drop=True)
        topic_total = {}
        topic_correct = {}
        for idx, r in g.iterrows():
            topic = r['topic_id']
            correct = r['correct']
            total = topic_total.get(topic, 0)
            corrects = topic_correct.get(topic, 0)
            acc = corrects / total if total > 0 else 0.5
            prevs = g.loc[:idx-1]
            last_topic_attempts = prevs[prevs['topic_id'] == topic].tail(window)
            rec_corrects = int(last_topic_attempts['correct'].sum()) if not last_topic_attempts.empty else 0
            last_time = None
            if not prevs.empty:
                last_time = (pd.to_datetime(r['timestamp']) - pd.to_datetime(prevs.iloc[-1]['timestamp'])).total_seconds() / 3600.0
            else:
                last_time = 9999.0
            rows.append({
                "student_id": sid,
                "topic_id": topic,
                "total_attempts_on_topic": total,
                "accuracy_on_topic": acc,
                "recent_corrects_on_topic": rec_corrects,
                "hours_since_last_activity": last_time,
                "label": correct
            })
            topic_total[topic] = total + 1
            topic_correct[topic] = corrects + int(correct)
    return pd.DataFrame(rows)

def train_and_save(csv_path="data/students.csv"):
    df = pd.read_csv(csv_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    features_df = build_features(df)
    X = features_df[["total_attempts_on_topic", "accuracy_on_topic", "recent_corrects_on_topic", "hours_since_last_activity"]].fillna(0)
    y = features_df['label']
    if len(y.unique()) == 1:
        print("Warning: only one class present in data. Need balanced labels to train.")
        return
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)
    pred = clf.predict(X_test)
    prob = clf.predict_proba(X_test)[:,1]
    print(classification_report(y_test, pred))
    try:
        print("AUC:", roc_auc_score(y_test, prob))
    except Exception:
        pass
    joblib.dump(clf, MODEL_PATH)
    print("Saved model to", MODEL_PATH)

if __name__ == "__main__":
    train_and_save()
