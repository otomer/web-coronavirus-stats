const Redis = require("ioredis");

import { Response } from "express";
import utils from "./utils";

let redisUrl = process.env.REDIS_URL || "redis://127.0.0.1";
let redisClient: any, client: any, redis: any;

const redisUtils = {
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
    }),
  client: () => {
    if (!redisClient) {
      redisClient = require("redis").createClient(redisUrl);
      redis = new Redis(redisUrl);
    }

    return redisClient;
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
};

export default redisUtils;
