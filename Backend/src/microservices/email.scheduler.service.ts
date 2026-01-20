import { emailQueue } from "../queues/email.queue";
import { ScheduledEmail } from '../../generated/prisma/client';

export async function scheduleEmailJobs(
  emails: ScheduledEmail[]
) {
  const jobs = emails.map(email => {
    const delay = new Date(email.scheduledFor).getTime() - Date.now();

    return {
      name: "send-email",
      data: { scheduledEmailId: email.id },
      opts: {
        delay: Math.max(delay, 0),
        jobId: email.id,
      },
    };
  });

  await emailQueue.addBulk(jobs);
}