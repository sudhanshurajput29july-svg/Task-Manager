import cron from 'node-cron';
import Task from '../models/Task.js';

// Schedule a cron job to run every hour to check for upcoming or overdue task reminders
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find incomplete tasks due within the next 24 hours
    const upcomingTasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: next24Hours },
    }).populate('assignedTo', 'name email');

    if (upcomingTasks.length > 0) {
      console.log(`[Reminder Service] ${upcomingTasks.length} task(s) due within the next 24 hours.`);
    }
  } catch (error) {
    console.error('[Reminder Service] Error checking task reminders:', error.message);
  }
});

console.log('Task Reminder Service initialized.');
