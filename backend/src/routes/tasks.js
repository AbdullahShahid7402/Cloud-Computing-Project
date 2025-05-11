const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const winston = require('winston');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `tasks/${Date.now().toString()}-${file.originalname}`);
    }
  })
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Get all tasks for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', verifyToken, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;
    const attachment_url = req.file ? req.file.location : null;

    const newTask = await pool.query(
      'INSERT INTO tasks (user_id, title, description, due_date, priority, attachment_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, title, description, due_date, priority, attachment_url]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', verifyToken, upload.single('attachment'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, priority, status } = req.body;
    const attachment_url = req.file ? req.file.location : undefined;

    // Check if task exists and belongs to user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    if (title) {
      updateFields.push(`title = $${valueIndex}`);
      values.push(title);
      valueIndex++;
    }
    if (description) {
      updateFields.push(`description = $${valueIndex}`);
      values.push(description);
      valueIndex++;
    }
    if (due_date) {
      updateFields.push(`due_date = $${valueIndex}`);
      values.push(due_date);
      valueIndex++;
    }
    if (priority) {
      updateFields.push(`priority = $${valueIndex}`);
      values.push(priority);
      valueIndex++;
    }
    if (status) {
      updateFields.push(`status = $${valueIndex}`);
      values.push(status);
      valueIndex++;
    }
    if (attachment_url) {
      updateFields.push(`attachment_url = $${valueIndex}`);
      values.push(attachment_url);
      valueIndex++;
    }

    values.push(id);
    values.push(req.user.id);

    const updatedTask = await pool.query(
      `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1} RETURNING *`,
      values
    );

    res.json(updatedTask.rows[0]);
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete attachment from S3 if exists
    if (task.rows[0].attachment_url) {
      const key = task.rows[0].attachment_url.split('/').pop();
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: `tasks/${key}`
      }).promise();
    }

    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 