# data_gen.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

os.makedirs("data", exist_ok=True)

def generate_simulated_logs(num_students=50, num_topics=12, interactions_per_student=60, start_date=None):
    rng = np.random.default_rng(42)
    if start_date is None:
        start_date = datetime.utcnow() - timedelta(days=60)
    rows = []
    topic_difficulty = rng.uniform(0.2, 0.9, size=num_topics)  # higher = harder

    for s in range(1, num_students + 1):
        mastery = rng.uniform(0.0, 0.6, size=num_topics)  # hidden initial mastery per student
        last_time = start_date
        for i in range(interactions_per_student):
            # pick a topic with some bias toward weaker mastery
            weights = (1 - mastery) + 0.1
            topic = int(rng.choice(np.arange(num_topics), p=weights/weights.sum()))
            # simulate time gap (in minutes) between interactions
            last_time += timedelta(minutes=int(rng.exponential(scale=24*60/3)))  # avg few interactions/day
            # probability of correct depends on mastery and topic difficulty
            prob_correct = 0.2 * (1 - topic_difficulty[topic]) + 0.8 * mastery[topic]
            correct = int(rng.random() < prob_correct)
            # update hidden mastery (simulated learning)
            mastery[topic] = mastery[topic] * 0.85 + 0.15 * correct
            rows.append({
                "student_id": f"student_{s}",
                "topic_id": f"topic_{topic+1}",
                "timestamp": last_time.isoformat(),
                "correct": correct
            })

    df = pd.DataFrame(rows)
    df.to_csv("data/students.csv", index=False)
    print("Generated data/students.csv with", len(df), "rows")
    return df

if __name__ == "__main__":
    generate_simulated_logs()
