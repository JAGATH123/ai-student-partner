# evaluator.py
import pandas as pd
from datetime import datetime
from mastery import EMAMastery
from recommender import Recommender, extract_topics_from_csv
import numpy as np

def simulate_with_ema(data_csv="data/students.csv", alpha=0.3, steps=5000):
    df = pd.read_csv(data_csv)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    topics = sorted(df['topic_id'].unique().tolist())
    students = sorted(df['student_id'].unique().tolist())

    mastery = EMAMastery(alpha=alpha)
    rec = Recommender(topics, mastery_engine=mastery)

    # Shuffle events to simulate streaming arrival
    events = df.sample(frac=1.0, random_state=42).to_dict('records')

    # process a subset
    for i, e in enumerate(events[:steps]):
        mastery.update(e['student_id'], e['topic_id'], int(e['correct']), timestamp=e['timestamp'])

    # pick a random student to recommend for
    student = np.random.choice(students)
    recos = rec.recommend(student, n=5)
    print("Recommendations for", student, ":", recos)
    # also print mastery scores
    print("Top 5 by lowest mastery:")
    mm = [(t, mastery.get_mastery(student, t)) for t in topics]
    mm.sort(key=lambda x: x[1])
    print(mm[:5])

if __name__ == "__main__":
    simulate_with_ema()
