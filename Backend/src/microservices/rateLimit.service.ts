import { redis } from "../Redis/redis";

const HOUR_MS = 60 * 60 * 1000;

export async function enforceRateLimit(
  senderId: string,
  hourlyLimit: number
): Promise<number> {
  const now = Date.now();
  const hourBucket = Math.floor(now / HOUR_MS);
  const hourKey = `email_rate:${senderId}:${hourBucket}`;

  const count = await redis.incr(hourKey);

  if (count === 1) {
    await redis.pexpire(hourKey, HOUR_MS);
  }

  if (count > hourlyLimit) {
    const nextHourTs = (hourBucket + 1) * HOUR_MS;
    return nextHourTs;
  }

  return now;
}
