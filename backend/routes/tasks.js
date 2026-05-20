const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks?projectId=xxx - Get tasks for a project
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId query param required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/tasks - Create task (admin only)
router.post(
  '/',
  protect,
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { title, description, priority, dueDate, projectId, assignedTo } = req.body;

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found' });

      if (!project.isAdmin(req.user._id)) {
        return res.status(403).json({ message: 'Only admins can create tasks' });
      }

      // Validate assignee is a project member
      if (assignedTo && !project.isMember(assignedTo)) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }

      const task = await Task.create({
        title,
        description,
        priority: priority || 'medium',
        dueDate,
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user._id
      });

      await task.populate('assignedTo', 'name email');
      await task.populate('createdBy', 'name email');

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// PATCH /api/tasks/:id - Update task
router.patch('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project._id || task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const isAdmin = project.isAdmin(req.user._id);
    const isAssignee =
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    // Members can only update status of their own tasks
    if (!isAdmin) {
      if (!isAssignee) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      // Members can only update status
      const allowedFields = ['status'];
      const updateKeys = Object.keys(req.body);
      const hasInvalidField = updateKeys.some((key) => !allowedFields.includes(key));
      if (hasInvalidField) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
    }

    const allowed = isAdmin
      ? ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo']
      : ['status'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
