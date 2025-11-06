# mastery.py
from datetime import datetime, timedelta

# EMA Mastery Engine
class EMAMastery:
    def __init__(self, alpha=0.3, initial=0.2):
        """
        alpha: EMA factor (how quickly mastery updates)
        initial: initial mastery score in [0,1]
        """
        self.alpha = alpha
        self.mastery = {}  # key: (student_id, topic_id) -> mastery score
        self.last_review = {}  # key -> datetime
        self.initial = initial

    def _key(self, student_id, topic_id):
        return f"{student_id}||{topic_id}"

    def get_mastery(self, student_id, topic_id):
        return self.mastery.get(self._key(student_id, topic_id), self.initial)

    def update(self, student_id, topic_id, correct, timestamp=None):
        k = self._key(student_id, topic_id)
        prev = self.mastery.get(k, self.initial)
        new = self.alpha * (1.0 if correct else 0.0) + (1 - self.alpha) * prev
        self.mastery[k] = new
        self.last_review[k] = timestamp

# SM-2 spaced repetition (simplified)
class SM2Item:
    def __init__(self, ef=2.5, interval=0, repetitions=0, next_review=None):
        self.ef = ef
        self.interval = interval
        self.repetitions = repetitions
        self.next_review = next_review

class SM2Mastery:
    """
    Implement simplified SM-2 (Ebbinghaus) algorithm.
    For each (student,topic) keep EF, repetitions, interval and compute next review date.
    Quality score q: 5 (perfect) to 0 (complete blackout). We map correct (1) -> q=5, incorrect (0) -> q=2
    """
    def __init__(self):
        self.store = {}  # key -> SM2Item

    def _key(self, student_id, topic_id):
        return f"{student_id}||{topic_id}"

    def update(self, student_id, topic_id, correct, timestamp):
        k = self._key(student_id, topic_id)
        item = self.store.get(k, SM2Item())
        q = 5 if correct else 2  # simple mapping
        if q < 3:
            item.repetitions = 0
            item.interval = 1
        else:
            item.repetitions += 1
            if item.repetitions == 1:
                item.interval = 1
            elif item.repetitions == 2:
                item.interval = 6
            else:
                item.interval = round(item.interval * item.ef)
            # update EF
            item.ef = max(1.3, item.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
        # schedule next review
        item.next_review = timestamp + timedelta(days=item.interval)
        self.store[k] = item

    def get_next_review(self, student_id, topic_id):
        k = self._key(student_id, topic_id)
        item = self.store.get(k)
        return item.next_review if item else None

    def get_mastery_score_estimate(self, student_id, topic_id):
        """Return a pseudo-mastery from repetitions and EF in [0,1] for ranking."""
        k = self._key(student_id, topic_id)
        item = self.store.get(k)
        if item is None:
            return 0.2
        # simple mapping: more repetitions & higher EF => higher mastery
        score = min(0.99, 0.2 + 0.2 * item.repetitions + 0.2 * (item.ef - 1.3))
        return score
