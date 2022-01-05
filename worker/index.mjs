import keys from './keys.mjs'
import { createClient  } from 'redis'
import fibo from "./fibo.mjs";

const redis = createClient ({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
  retry_strategy: () => 1000
});

await redis.on('error', err => console.log('Redis Client Error: ', err));

await redis.connect();

const subscriber = redis.duplicate();

await subscriber.connect();

await subscriber.subscribe('insert', async message => 
  await redis.hSet('values', message, fibo(parseInt(message)))
)