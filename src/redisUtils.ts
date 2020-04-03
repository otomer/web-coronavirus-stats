var url = require("url");
var Redis = require("ioredis");
const utils = require("./utils");

import { Response } from "express";

let redis: any;

const redisUtils = {
  client: () => {
    if (!redis) {
      if (process.env.REDIS_URL) {
        const redis_uri = url.parse(process.env.REDIS_URL);
        redis = new Redis({
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
        redis = new Redis();
      }
    }

    return redis;
  },
  test: () => {
    if (!redis) {
      redisUtils.client();
    }
    const SAMPLE_REDIS_KEY = "test";
    const val = "Yep, Redis works! 👌";
    redis.set(SAMPLE_REDIS_KEY, val);
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

      redis.set(key, JSON.stringify(resultObject), "EX", expirationSeconds);
      return resultObject;
    });
  },
  cache: (
    key: string,
    cb: any,
    expirationSeconds: number,
    response: Response
  ) =>
    redis.get(key, (err: any, result: any) => {
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
