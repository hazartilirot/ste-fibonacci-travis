import keys from "./keys.mjs";
import express from 'express'
import cors from 'cors';
import kpg from 'pg';
import { createClient } from 'redis'

const app = express();
app.use(cors())

app.use(express.json())

const pool = new kpg.Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const client = await pool.connect()

await client.query('create table if not exists values (number int)')

const redis = createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
  retry_strategy: () => 1000
});

await redis.on('error', err => console.log('Redis Client Error: ', err))

await redis.connect();

const publisher = redis.duplicate()

await publisher.connect();

app.get('/', (req, res) => res.send('Hi'))

app.get('/values/all', async (req, res) => {
  const { rows } = await client.query('select * from values')
  res.send(rows);
});

app.get('/values/current', async (req, res) => {
  const values = await redis.hGetAll('values');
  res.send(values);
})

app.post('/values', async (req, res) => {
  const { index } = req.body

  if (parseInt(index) > 40)
    return res.status(422).send('Index too high');

  await redis.hSet('values', index, 'Nothing yet')
  await pool.query('insert into values (number) values ($1)', [index]);
  await publisher.publish('insert', index);

  res.send({working: true})
})

app.listen(5000, () => console.log('Listening'))