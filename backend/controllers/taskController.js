import Task from '../models/Task.js';

// @desc    Get all user tasks (with search & status filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, search, userId } = req.query;
    
    let query = {};
    
    // Admin can see all tasks, or filter by a specific employee
    if (req.user.role === 'admin') {
      if (userId) {
        query.userId = userId;
      }
    } else {
      // Employee can only see tasks assigned to them
      query.userId = req.user._id;
    }

    // Filter by status if not 'All'
    if (status && status !== 'All') {
      query.status = status;
    }

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this task');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, userId, priority, dueDate } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Title is required');
    }

    // Admin can assign to other users (employees), employee defaults to themselves
    const assignedUser = req.user.role === 'admin' && userId ? userId : req.user._id;

    const task = await Task.create({
      userId: assignedUser,
      title,
      description: description || '',
      status: status || 'Pending',
      remark: '',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id).populate('userId', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, remark, userId, priority, dueDate } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    if (isAdmin) {
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.remark = remark !== undefined ? remark : task.remark;
      task.priority = priority || task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      if (userId) {
        task.userId = userId;
      }
    } else {
      // Employee can only update status and remark
      task.status = status || task.status;
      task.remark = remark !== undefined ? remark : task.remark;
    }

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('userId', 'name email');
    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error('Not authorized to delete this task');
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Patch task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const patchTaskStatus = async (req, res, next) => {
  try {
    const { status, remark } = req.body;

    if (!status || !['Completed', 'Pending', 'In Progress'].includes(status)) {
      res.status(400);
      throw new Error('Valid status is required (Completed, Pending, or In Progress)');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error('Not authorized to update this task');
    }

    task.status = status;
    if (remark !== undefined) {
      task.remark = remark;
    }
    
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('userId', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  patchTaskStatus,
};
