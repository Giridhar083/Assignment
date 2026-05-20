const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard?projectId=xxx - Dashboard stats for a project
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId query param required' });

    const project = await Project.findById(projectId).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');

    const now = new Date();

    // Total tasks
    const totalTasks = tasks.length;

    // Tasks by status
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      inprogress: tasks.filter((t) => t.status === 'inprogress').length,
      done: tasks.filter((t) => t.status === 'done').length
    };

    // Overdue tasks
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && new Date(t.dueDate) < now
    ).length;

    // Tasks per user
    const tasksByUser = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        if (!tasksByUser[userId]) {
          tasksByUser[userId] = {
            user: task.assignedTo,
            total: 0,
            todo: 0,
            inprogress: 0,
            done: 0
          };
        }
        tasksByUser[userId].total++;
        tasksByUser[userId][task.status]++;
      }
    });

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksByUser: Object.values(tasksByUser),
      totalMembers: project.members.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
