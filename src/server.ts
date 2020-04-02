const express = require("express");
const bodyParser = require("body-parser");
const secure = require("express-force-https");
import logger = require("morgan");
const redis = require("redis");

import { Request, Response } from "express";

/**
 * Server Definition
 */
// _____________________________________________________
// Initialization
let redisClient: any;
if (process.env.REDIS_URL) {
  redisClient = redis.createClient(process.env.REDIS_URL);
  //Run on server otherwise
} else {
  redisClient = redis.createClient();
}
const config = {
  PORT: process.env.PORT || 3000,
  STARTED: new Date().toString()
};
const app = express(); // Create global app object
// _____________________________________________________
// Express Configurations
app.use(secure);

app.use(logger("dev"));
app.use(express.static("public")); // Static files configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Support JSON bodies

// _____________________________________________________
// Routes

app.use(require("./routes")); // API Routes
app.get("/status", (req: Request, res: Response) => res.send("Live! 🔥"));
app.get("/config", (req: Request, res: Response) => res.send(config));
app.get("/redis", (req: Request, res: Response) => {
  const key = "test";
  redisClient.get(key, (error: any, reply: any) => {
    if (!error && reply) {
      res.json({
        cached: true,
        json: JSON.parse(reply)
      });
    } else {
      const n: any = { example: Date.now() };
      res.json({
        cached: false,
        json: n
      });
      redisClient.setex(key, 60, JSON.stringify(n));
    }
  });
});

app.get("/", (req: Request, res: Response) =>
  res.sendFile("index.html", { root: "public" })
);
app.get("*", function(req: Request, res: Response) {
  res.status(404);
  res.sendFile("404.html", { root: "public" });
});
// _____________________________________________________
// Start the server

const server = app.listen(config.PORT, () =>
  console.log(
    `🚀 Server is listening on http://localhost:${server.address().port}`
  )
);
