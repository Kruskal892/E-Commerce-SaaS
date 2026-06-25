import Redis from 'ioredis';

const host = process.env.REDIS_HOST || '127.0.0.1';
const isLocal = host === '127.0.0.1' || host === 'localhost';

const redis = new Redis({
  host,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  // Managed Redis providers (e.g. Upstash) require TLS; local Redis does not.
  ...(isLocal ? {} : { tls: {} }),
});

export default redis;
