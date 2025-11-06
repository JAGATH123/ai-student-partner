# app.py
import streamlit as st
import pandas as pd
import json
import os
from datetime import datetime
from mastery import EMAMastery
from recommender import Recommender

DATA_DIR = "data"
SUBJECTS_FILE = os.path.join(DATA_DIR, "subjects.json")
PROGRESS_FILE = os.path.join(DATA_DIR, "progress.json")
LOG_CSV = os.path.join(DATA_DIR, "students.csv")

os.makedirs(DATA_DIR, exist_ok=True)

# Load subjects (question bank)
if not os.path.exists(SUBJECTS_FILE):
    st.error("subjects.json not found in data/. Please add data/subjects.json")
    st.stop()

with open(SUBJECTS_FILE, "r", encoding="utf-8") as f:
    subjects_data = json.load(f)["subjects"]

# Load or init progress
if not os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump({}, f)

with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
    progress = json.load(f)

# Ensure students.csv exists (header) so logging append works
if not os.path.exists(LOG_CSV):
    pd.DataFrame(columns=["student_id", "topic_id", "timestamp", "correct"]).to_csv(LOG_CSV, index=False)

# Pastel theme injection (minimal)
st.markdown(
    """
    <style>
    .reportview-container { background: linear-gradient(180deg, #f8fafc 0%, #fff 100%); }
    .sidebar .sidebar-content { background: #f6f5ff; border-radius: 10px; padding: 12px; }
    .card { background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 6px 18px rgba(99,102,241,0.06); }
    .question { background: linear-gradient(90deg, #fffaf0, #f0fff4); padding: 14px; border-radius: 10px; }
    .option { padding: 8px 12px; border-radius: 8px; margin: 6px 0; border: 1px solid #eef2ff; }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("🌸 Personal Study Buddy")
st.markdown("A small adaptive study buddy — one-question-at-a-time, progress tracking, and adaptive recommendations.")

# Simple student selector
student_id = st.sidebar.text_input("Your name (or ID)", value="me")
if not student_id:
    st.sidebar.warning("Enter a name to proceed")
    st.stop()

# Build a mapping structures
subject_names = [s["subject_name"] for s in subjects_data]
subject_map = {s["subject_name"]: s for s in subjects_data}

# Flatten topics list and make topics list for recommender
topics_flat = []
topic_meta = {}  # topic_id -> metadata
for s in subjects_data:
    for t in s["topics"]:
        topics_flat.append(t["topic_id"])
        topic_meta[t["topic_id"]] = {
            "subject": s["subject_name"],
            "title": t["title"],
            "questions": t["questions"]
        }

# Initialize mastery engine and preload from progress (EMA)
if 'ema_engine' not in st.session_state:
    st.session_state['ema_engine'] = EMAMastery(alpha=0.3)
    # preload any existing progress entries into the mastery engine
    for sid, v in progress.items():
        for topic_id, stats in v.items():
            # stats expected: {attempts, corrects, mastery (optional), last_review_iso}
            last = stats.get("last_review")
            last_dt = None
            if last:
                try:
                    last_dt = datetime.fromisoformat(last)
                except:
                    last_dt = None
            # If a saved mastery present use it, else compute ratio
            saved_mastery = stats.get("mastery")
            if saved_mastery is not None:
                st.session_state['ema_engine'].mastery[f"{sid}||{topic_id}"] = saved_mastery
                if last_dt:
                    st.session_state['ema_engine'].last_review[f"{sid}||{topic_id}"] = last_dt
            else:
                attempts = stats.get("attempts", 0)
                corrects = stats.get("corrects", 0)
                ratio = corrects / attempts if attempts > 0 else 0.2
                st.session_state['ema_engine'].mastery[f"{sid}||{topic_id}"] = ratio
                if last_dt:
                    st.session_state['ema_engine'].last_review[f"{sid}||{topic_id}"] = last_dt

# Build recommender (it will try to load ML model if present)
rec = Recommender(topics_flat, mastery_engine=st.session_state['ema_engine'], data_csv=LOG_CSV)

# Sidebar controls
st.sidebar.header("Controls")
st.sidebar.markdown("Get adaptive recommendations or take a quiz.")
if st.sidebar.button("Get 3 topic recommendations"):
    recs = rec.recommend(student_id, n=3)
    st.sidebar.success("Study these next: " + ", ".join(recs))

st.sidebar.markdown("---")
if st.sidebar.button("Train ML model (train_ml.py)"):
    st.sidebar.info("Run `python train_ml.py` in terminal; Streamlit cannot run long CPU tasks reliably here.")

# Main UI: choose subject -> topic
col1, col2 = st.columns([3, 1])
with col1:
    st.subheader("Subjects")
    chosen_subject = st.selectbox("Pick a subject", subject_names)
    st.markdown(f"**{chosen_subject}** — pick a topic to begin")
    subject_obj = subject_map[chosen_subject]
    topics = subject_obj["topics"]
    topic_titles = [f'{t["topic_id"]} — {t["title"]}' for t in topics]
    chosen_topic_label = st.selectbox("Topic", topic_titles)
    # extract topic_id
    chosen_topic_id = chosen_topic_label.split(" — ")[0]
    meta = topic_meta[chosen_topic_id]
    st.markdown(f"**Topic:** {meta['title']}")

with col2:
    st.subheader("Progress")
    # show progress for this student
    student_progress = progress.get(student_id, {})
    # create a small table of mastery across current subject's topics
    rows = []
    for t in topics:
        tid = t["topic_id"]
        m = st.session_state['ema_engine'].get_mastery(student_id, tid)
        rows.append({"topic_id": tid, "title": t["title"], "mastery": f"{m:.2f}"})
    st.table(pd.DataFrame(rows))

st.markdown("---")

# One-question-at-a-time quiz flow
# We'll track which question index the user is at in session_state
sess_key = f"{student_id}::{chosen_topic_id}::qidx"
if sess_key not in st.session_state:
    st.session_state[sess_key] = 0  # 0 or 1 for two questions

q_index = st.session_state[sess_key]
questions = meta["questions"]
if q_index >= len(questions):
    st.session_state[sess_key] = 0
    q_index = 0

current_q = questions[q_index]
st.markdown(f"### Question {q_index + 1} of {len(questions)}")
st.markdown(f"**{current_q['q']}**", unsafe_allow_html=True)

# Show options as radio
choice = st.radio("Choose an option", current_q["options"], key=f"choice_{sess_key}")

# Submit/Next logic
colA, colB = st.columns([1, 1])
with colA:
    if st.button("Submit answer"):
        selected_letter = choice.strip()[0].upper() if len(choice.strip()) > 0 else ""
        correct_letter = current_q["answer"].strip().upper()
        is_correct = (selected_letter == correct_letter)
        # feedback
        if is_correct:
            st.success("Correct! ✅")
        else:
            st.error(f"Incorrect — correct answer: {correct_letter}.")
        # update progress json and mastery engine and append to CSV log
        # initialize student entry if missing
        if student_id not in progress:
            progress[student_id] = {}
        student_dict = progress[student_id]
        if chosen_topic_id not in student_dict:
            student_dict[chosen_topic_id] = {"attempts": 0, "corrects": 0, "last_review": None, "mastery": None}
        entry = student_dict[chosen_topic_id]
        entry["attempts"] = entry.get("attempts", 0) + 1
        entry["corrects"] = entry.get("corrects", 0) + (1 if is_correct else 0)
        entry["last_review"] = datetime.utcnow().isoformat()
        # update mastery via EMA engine
        st.session_state['ema_engine'].update(student_id, chosen_topic_id, int(is_correct), timestamp=datetime.utcnow())
        # store current mastery back
        entry["mastery"] = st.session_state['ema_engine'].get_mastery(student_id, chosen_topic_id)
        # save progress file
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(progress, f, indent=2)
        # append to CSV for logs (train_ml uses this)
        df = pd.DataFrame([{
            "student_id": student_id,
            "topic_id": chosen_topic_id,
            "timestamp": datetime.utcnow().isoformat(),
            "correct": int(is_correct)
        }])
        df.to_csv(LOG_CSV, mode="a", header=False, index=False)
        # advance to next question (or wrap)
        st.session_state[sess_key] = (st.session_state[sess_key] + 1) % len(questions)

with colB:
    if st.button("Skip question"):
        st.info("Skipped. Moving to next question.")
        st.session_state[sess_key] = (st.session_state[sess_key] + 1) % len(questions)

st.markdown("---")
# Quick controls: view progress, reset topic mastery
if st.button("Reset mastery for this topic"):
    # reset in progress and EMA engine
    if student_id in progress and chosen_topic_id in progress[student_id]:
        del progress[student_id][chosen_topic_id]
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump(progress, f, indent=2)
    # remove from EMA maps
    key = f"{student_id}||{chosen_topic_id}"
    if key in st.session_state['ema_engine'].mastery:
        del st.session_state['ema_engine'].mastery[key]
    if key in st.session_state['ema_engine'].last_review:
        del st.session_state['ema_engine'].last_review[key]
    st.success("Reset completed.")

st.caption("Progress is saved locally in data/progress.json and logged to data/students.csv for model training.")
