import { Queue } from 'bullmq';
import { redis } from '../Redis/redis';

export const EMAIL_QUEUE_TITLE = 'emails-to-be-send-in-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_TITLE, {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    },
});