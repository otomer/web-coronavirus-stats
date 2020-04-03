var url = require("url");
var Redis = require("ioredis");
const utils = require("./utils");
const winston = require("winston");
const wlogger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

import { Response } from "express";

let redis_url = process.env.REDIS_URL;
if (!redis_url) {
  redis_url = "redis://127.0.0.1";
}

let redisClient: any, client: any, redis: any;

const redisUtils = {
  client: () => {
    if (!redisClient) {
      //redis setup
      redisClient = require("redis").createClient(redis_url);
      redis = new Redis(redis_url);
    }

    return redisClient;
  },
  test: () => {
    if (!redisClient) {
      redisUtils.client();
    }
    const SAMPLE_REDIS_KEY = "test";
    const val = "Yep, Redis works! 👌";
    redisClient.set(SAMPLE_REDIS_KEY, val);
    console.log("Redis tested.");
    return val;
  },
  set: (key: string, cb: Function, expirationSeconds: number) => {
    return cb().then((resultObject: any) => {
      utils.log(
        `[Cache:Set] '${key}' for ${utils.millisToMinutesAndSeconds(
          1000 * expirationSeconds
        )} minutes`,
        "⏳"
      );

      redisClient.set(
        key,
        JSON.stringify(resultObject),
        "EX",
        expirationSeconds
      );
      return resultObject;
    });
  },
  cache: (
    key: string,
    cb: any,
    expirationSeconds: number,
    response: Response
  ) =>
    redisClient.get(key, (err: any, result: any) => {
      if (err) {
        return response ? response.json({ err }) : { err };
      } else {
        let resultObject;
        if (result) {
          utils.log(`[Cache:Retrieve] '${key}'`, "⏳");
          resultObject = JSON.parse(result);
          return response ? response.json(resultObject) : resultObject;
        } else {
          utils.log(
            `[Cache:MissSet] '${key}' for ${utils.millisToMinutesAndSeconds(
              1000 * expirationSeconds
            )} minutes`,
            "⏳"
          );
          resultObject = redisUtils.set(key, cb, expirationSeconds);
          resultObject.then((resultObject: any) =>
            response ? response.json(resultObject) : resultObject
          );
        }
      }
    })
};

module.exports = redisUtils;
