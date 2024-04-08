import Redis from "ioredis";
const localRedisConnection = new Redis("redis://local:123@127.0.0.1:6379/2");

export default localRedisConnection;