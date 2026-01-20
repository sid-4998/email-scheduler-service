import { emailQueue } from "../queues/email.queue";
import { ScheduledEmail } from '../../generated/prisma/client';

export async function scheduleEmailJob(email: ScheduledEmail) {
  const delay = new Date(email.scheduledFor).getTime() - Date.now();

  await emailQueue.add(
    "send-email",
    {
      scheduledEmailId: email.id,
    },
    {
      delay: Math.max(delay, 0),
      jobId: email.id,
    }
  );
}