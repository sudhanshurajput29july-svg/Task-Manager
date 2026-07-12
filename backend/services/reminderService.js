import nodemailer from 'nodemailer';
import cron from 'node-cron';
import Task from '../models/Task.js';
import dotenv from 'dotenv';

dotenv.config();

const sendEmailReminder = async (task) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Task Manager" <no-reply@taskmanager.com>',
    to: task.userId.email,
    subject: `Reminder: Task "${task.title}" is due soon!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4f46e5; margin-bottom: 5px;">⏰ Task Due Soon Reminder</h2>
        <p style="font-size: 16px; margin-top: 0; color: #4b5563;">Hello <strong>${task.userId.name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">This is a reminder that the task assigned to you is due in the next 24 hours:</p>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">${task.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;"><strong>Description:</strong> ${task.description || 'No description provided.'}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;"><strong>Priority:</strong> <span style="font-weight: bold; color: ${task.priority === 'High' ? '#dc2626' : task.priority === 'Medium' ? '#d97706' : '#2563eb'}">${task.priority}</span></p>
          <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">Please log in to your dashboard to complete the task and leave a completion remark.</p>
        
        <div style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 12px; color: #9ca3af;">
          Best regards,<br/>
          <strong>Task Manager Team</strong>
        </div>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[MOCK EMAIL REMINDER] Sent to ${task.userId.email} for task "${task.title}". (Set SMTP credentials in .env to send real emails)`);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL REMINDER] Sent successfully to ${task.userId.email} for task "${task.title}"`);
  } catch (error) {
    console.error(`[EMAIL REMINDER ERROR] Failed to send email to ${task.userId.email}: ${error.message}`);
  }
};

export const checkDueTasksAndSendReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find tasks due within 24 hours that are not Completed
    const tasks = await Task.find({
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: tomorrow },
    }).populate('userId', 'name email');

    if (tasks.length === 0) {
      console.log('[REMINDER SERVICE] No tasks due in the next 24 hours.');
      return;
    }

    console.log(`[REMINDER SERVICE] Found ${tasks.length} tasks due soon. Sending email reminders...`);
    for (const task of tasks) {
      if (task.userId && task.userId.email) {
        await sendEmailReminder(task);
      }
    }
  } catch (error) {
    console.error(`[REMINDER SERVICE ERROR] Error running check: ${error.message}`);
  }
};

// Setup cron job to run every hour
cron.schedule('0 * * * *', () => {
  console.log('[CRON JOB] Running hourly task due-soon check...');
  checkDueTasksAndSendReminders();
});

console.log('Task reminder background service scheduled successfully.');
