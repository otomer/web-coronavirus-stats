const express = require("express");
const bodyParser = require("body-parser");
const secure = require("express-force-https");
import logger = require("morgan");
const redis = require("redis");
var url = require("url");
var Redis = require("ioredis");

import { Request, Response } from "express";

/**
 * Server Definition
 */
// _____________________________________________________
// Initialization

let redisClient: any;
if (process.env.REDIS_URL) {
  const redis_uri = url.parse(process.env.REDIS_URL);
  redisClient = new Redis({
    port: Number(redis_uri.port) + 1,
    host: redis_uri.hostname,
    password: redis_uri.auth.split(":")[1],
    db: 0,
    tls: {
      rejectUnauthorized: false,
      requestCert: true,
      agent: false
    }
  });
  //Run on server otherwise
} else {
  redisClient = new Redis();
}

redisClient.set("foo", "bar"); // returns promise which resolves to string, "OK"

const config = {
  PORT: process.env.PORT || 3000,
  STARTED: new Date().toString()
};
// _____________________________________________________
const app = express(); // Create global app object
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
app.get("/config", (req: Request, res: Response) =>
  res.send({
    ...config,
    connected: redisClient.connected,
    ready: redisClient.ready,
    shouldBuffer: redisClient.should_buffer,
    address: redisClient.address
  })
);
// app.get("/redis", (req: Request, res: Response) => {
//   const key = "test";
//   redisClient.get(key, (error: any, reply: any) => {
//     if (!error && reply) {
//       res.json({
//         cached: true,
//         json: JSON.parse(reply)
//       });
//     } else {
//       const n: any = { example: Date.now() };
//       res.json({
//         cached: false,
//         json: n
//       });
//       redisClient.setex(key, 60, JSON.stringify(n));
//     }
//   });
// });

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
