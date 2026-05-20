const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects - Get all projects the user is a member of
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects - Create a new project
router.post(
  '/',
  protect,
  [body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { name, description } = req.body;

      const project = await Project.create({
        name,
        description,
        createdBy: req.user._id,
        members: [{ user: req.user._id, role: 'admin' }]
      });

      await project.populate('members.user', 'name email');
      await project.populate('createdBy', 'name email');

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// GET /api/projects/:id - Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/projects/:id/members - Add member (admin only)
router.post('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    if (project.isMember(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userToAdd._id, role: 'member' });
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('createdBy', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member (admin only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    if (req.params.userId === project.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project creator' });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('createdBy', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
