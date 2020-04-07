const express = require("express");
const bodyParser = require("body-parser");
const secure = require("express-force-https");
import logger = require("morgan");

import { Request, Response } from "express";

import redis from "./redis";

/**
 * Initialization
 */
const redisClient = redis.client();
redis.test();

const config = {
  PORT: process.env.PORT || 3000,
  STARTED: new Date().toString(),
};

/**
 * Express Configurations
 */
const app = express(); // Create global app object
app.use(secure);
app.use(logger("dev"));
app.use(express.static("public")); // Static files configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Support JSON bodies

/**
 * Express Routes
 */

app.use(require("./routes")); // API Routes
app.get("/status", (req: Request, res: Response) => res.send("Live! 🔥"));
app.get("/config", (req: Request, res: Response) =>
  res.send({
    ...config,
    REDIS: {
      host: redisClient.options.host,
      port: redisClient.options.port,
      status: redisClient.status,
    },
  })
);

function getTimeAsync() {
  return new Promise((resolve) => {
    resolve({
      date: new Date(),
    });
  });
}

app.get("/redis", (req: Request, res: Response) => {
  return redis.cache("time", getTimeAsync, 60, res);
});

app.get("/", (req: Request, res: Response) =>
  res.sendFile("index.html", { root: "public" })
);
app.get("*", function (req: Request, res: Response) {
  res.status(404);
  res.sendFile("404.html", { root: "public" });
});

/**
 * Start the server
 */
const server = app.listen(config.PORT, () =>
  console.log(
    `🚀 Server is listening on http://localhost:${server.address().port}`
  )
);
