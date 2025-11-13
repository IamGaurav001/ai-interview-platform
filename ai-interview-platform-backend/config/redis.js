import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err.message));
redisClient.on("connect", () => console.log("✅ Redis client ready (initializing connection)"));

export default redisClient;
