// import Redis from 'ioredis';

// const host = process.env.REDIS_HOST || '127.0.0.1';
// const isLocal = host === '127.0.0.1' || host === 'localhost';

// const redis = new Redis({
//   host,
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD,
//   // Managed Redis providers (e.g. Upstash) require TLS; local Redis does not.
//   ...(isLocal ? {} : { tls: {} }),
// });

// export default redis;

import Redis from 'ioredis';

const redisUrl = process.env.REDIS_DATABASE_URL;
if (!redisUrl) {
  throw new Error('REDIS_DATABASE_URL is not defined');
}

const redis = new Redis(redisUrl);

export default redis;
