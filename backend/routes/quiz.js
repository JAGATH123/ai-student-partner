import express from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Load subjects data
let subjectsData = null;
const loadSubjects = async () => {
  if (!subjectsData) {
    const dataPath = join(__dirname, '../../data/subjects.json');
    const data = await readFile(dataPath, 'utf-8');
    subjectsData = JSON.parse(data);
  }
  return subjectsData;
};

// @route   GET /api/quiz/subjects
// @desc    Get all subjects
// @access  Private
router.get('/subjects', protect, async (req, res) => {
  try {
    const data = await loadSubjects();
    res.json({
      success: true,
      subjects: data.subjects.map(s => ({
        subjectName: s.subject_name,
        slug: s.slug,
        topicCount: s.topics.length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quiz/subjects/:slug
// @desc    Get subject details with all topics
// @access  Private
router.get('/subjects/:slug', protect, async (req, res) => {
  try {
    const data = await loadSubjects();
    const subject = data.subjects.find(s => s.slug === req.params.slug);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      subject: {
        subjectName: subject.subject_name,
        slug: subject.slug,
        topics: subject.topics.map(t => ({
          topicId: t.topic_id,
          title: t.title,
          questionCount: t.questions.length
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quiz/topics/:topicId
// @desc    Get a specific topic with questions
// @access  Private
router.get('/topics/:topicId', protect, async (req, res) => {
  try {
    const data = await loadSubjects();
    let topic = null;
    let subjectName = null;

    for (const subject of data.subjects) {
      const found = subject.topics.find(t => t.topic_id === req.params.topicId);
      if (found) {
        topic = found;
        subjectName = subject.subject_name;
        break;
      }
    }

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    res.json({
      success: true,
      topic: {
        topicId: topic.topic_id,
        title: topic.title,
        subjectName,
        questions: topic.questions.map((q, idx) => ({
          id: `${topic.topic_id}_Q${idx + 1}`,
          question: q.q,
          options: q.options,
          answer: q.answer
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quiz/topics/:topicId/question
// @desc    Get a single random question from topic
// @access  Private
router.get('/topics/:topicId/question', protect, async (req, res) => {
  try {
    const data = await loadSubjects();
    let topic = null;
    let subjectName = null;

    for (const subject of data.subjects) {
      const found = subject.topics.find(t => t.topic_id === req.params.topicId);
      if (found) {
        topic = found;
        subjectName = subject.subject_name;
        break;
      }
    }

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Get already answered question IDs from query parameter (comma-separated)
    const answeredIds = req.query.answered ? req.query.answered.split(',') : [];

    // Filter out already answered questions
    const availableIndices = topic.questions
      .map((q, idx) => idx)
      .filter(idx => !answeredIds.includes(`${topic.topic_id}_Q${idx + 1}`));

    // If all questions have been answered, return a completion message
    if (availableIndices.length === 0) {
      return res.json({
        success: true,
        completed: true,
        message: 'You have completed all questions in this topic!',
        totalQuestions: topic.questions.length
      });
    }

    // Get random question from available ones
    const randomAvailableIndex = Math.floor(Math.random() * availableIndices.length);
    const randomIndex = availableIndices[randomAvailableIndex];
    const question = topic.questions[randomIndex];

    res.json({
      success: true,
      question: {
        id: `${topic.topic_id}_Q${randomIndex + 1}`,
        topicId: topic.topic_id,
        topicTitle: topic.title,
        subjectName,
        question: question.q,
        options: question.options,
        // Don't send answer to client
        questionIndex: randomIndex
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
