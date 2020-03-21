import { Request, Response } from "express";
const express = require("express");
const axios = require("axios");
const resources = require("./resources");

/**
 * Router Definition
 */
const router = express.Router();

const setRoute = (path: string, data: Function) =>
  router.get(path, (req: Request, res: Response) =>
    res.status(200).send({
      data: data(),
      message: "Data retrieved",
      success: true
    })
  );

// Controllers
let scmp = {};
setRoute("/scmp", () => scmp);

let countries = {};
setRoute("/countries", () => countries);

//Helpers
const cronDataInterval = (cb: Function, refreshMilliseconds?: number) => {
  if (refreshMilliseconds) {
    setInterval(() => cb(), refreshMilliseconds);
  }
  cb();
};

cronDataInterval(
  () =>
    axios
      .all([
        axios.get(resources.scmp),
        axios.get(resources.countries),
        axios.get(resources.allStats)
      ])
      .then((responseArr: any) => {
        const scmpResponse = responseArr[0];
        const countriesResponse = responseArr[1];
        const stats = responseArr[2];
        const tempMap: any = {};

        countriesResponse.data.forEach(
          (value: any, index: number, array: any) => {
            if (!tempMap[value.country]) {
              tempMap[value.country] = value;
            }
          }
        );

        let countries = (scmpResponse.data && scmpResponse.data.entries) || [];

        // Sort countries
        countries = countries.sort((a: any, b: any) =>
          parseCommaNumber(a.cases) > parseCommaNumber(b.cases) ? -1 : 1
        );

        const extraStats = {
          active: 0,
          critical: 0,
          todayDeaths: 0,
          todayCases: 0
        };

        countries.forEach((value: any, index: number, array: any) => {
          value.casesPerOneMillion = -1;
          value.critical = -1;
          value.active = -1;

          if (tempMap[value.country]) {
            value.casesPerOneMillion =
              tempMap[value.country].casesPerOneMillion;
            value.critical = tempMap[value.country].critical;
            value.active = tempMap[value.country].active;

            extraStats.active += tempMap[value.country].active || 0;
            extraStats.critical += tempMap[value.country].critical || 0;
            extraStats.todayCases += tempMap[value.country].todayCases || 0;
            extraStats.todayDeaths += tempMap[value.country].todayDeaths || 0;
          }

          value.cases = parseCommaNumber(value.cases);
          value.deaths = parseCommaNumber(value.deaths);
          value.recovered = parseCommaNumber(value.recovered);

          if (value.country.indexOf("*") != -1) {
            value.country = value.country.replace("*", "");
          }
        });
        scmpResponse.data.stats = {
          ...stats.data,
          ...extraStats
        };

        scmp = scmpResponse.data;
      }),
  1000 * 60 * 90
);

const parseCommaNumber = (x: string) =>
  parseInt(parseFloat(x.replace(/,/g, "")) as any);

module.exports = router;
