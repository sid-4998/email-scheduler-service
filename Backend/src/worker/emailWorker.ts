import { Worker, Job } from "bullmq";
import { redis } from "../Redis/redis";
import { prisma } from "../../prisma/index";
import { sendEmail } from "../microservices/mailer.service";
import { enforceRateLimit } from "../microservices/rateLimit.service";

export const emailWorker = new Worker(
  "emails-to-be-send-in-queue",
  async (job: Job) => {
    const { scheduledEmailId } = job.data;
    const email = await prisma.scheduledEmail.findUnique({
      where: { id: scheduledEmailId },
      include: {
        sender: true,
      },
    });

    if (!email) return;
    const locked = await prisma.scheduledEmail.updateMany({
      where: {
        id: email.id,
        status: { in: ["PENDING", "FAILED"] },
      },
      data: {
        status: "PROCESSING",
        attemptCount: { increment: 1 },
      },
    });

    if (locked.count === 0) {
      // Already processed or being processed
      return;
    }

    try {
      const allowedAt = await enforceRateLimit(
        email.senderId,
        email.hourlyLimit
      );

      if (allowedAt > Date.now()) {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: "DELAYED",
            scheduledFor: new Date(allowedAt),
          },
        });

        await job.moveToDelayed(allowedAt);
        return;
      }

      await sendEmail(email);

      await prisma.$transaction([
        prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        }),
        prisma.emailSendLog.create({
          data: {
            scheduledEmailId: email.id,
            sentAt: new Date(),
            success: true,
          },
        }),
      ]);
    } catch (err) {

        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: {
            status: "FAILED",
          },
        });

        throw err; // allow BullMQ retry
    }
  },
  {
    connection: redis,
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5),
  }
);
