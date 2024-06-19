import Redis from "ioredis";
// const localRedis = new Redis("redis://:123@127.0.0.1:6379/1");
const localRedis = new Redis("redis://redis:6379/1");

export default localRedis;