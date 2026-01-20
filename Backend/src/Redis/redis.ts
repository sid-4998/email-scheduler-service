import IOredis from 'ioredis';

export const redis = new IOredis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    maxRetriesPerRequest: null, // To ensure BullMQ avoids deadlocks
});
