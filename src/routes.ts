import { Request, Response } from "express";
const express = require("express");
const axios = require("axios");
const resources = require("./resources");
const { flag, code } = require("country-emoji");
const redisUtils = require("./redisUtils");
const utils = require("./utils");

/**
 * Router Definition
 */
const router = express.Router();

/**
 * Helpers
 */
const setRoute = (path: string, data: Function) =>
  router.get(path, (req: Request, res: Response) =>
    res.status(200).send({
      data: data(),
      success: true
    })
  );

const cachedRoute = (config: any, cb: any) =>
  router.get(config.key, (req: Request, res: Response) =>
    redisUtils.cache(
      config.key,
      cb,
      (config.refreshMilliseconds / 1000) * config.maxFactor,
      res
    )
  );

// Controllers
let countriesAutocomplete: any = [];
const continents: any = {};
let timeseries: any = {};

const CacheConfig = {
  WORLD: {
    key: "/api/world",
    refreshMilliseconds: 1000 * 60 * 30, //30 minutes
    maxFactor: 2
  },
  TIMESERIES: {
    key: "/api/timeseries",
    refreshMilliseconds: 1000 * 60 * 30, //30 minutes
    maxFactor: 2
  }
};

const getTimeseriesData = () =>
  axios
    .get(resources.timeseries)
    .then(function(response: any) {
      const cTimeseries: any = {};
      // handle success
      for (var prop in response.data) {
        if (response.data.hasOwnProperty(prop)) {
          let newProp;

          switch (prop) {
            case "Mainland China":
              newProp = "China";
              break;
            case "US":
            case "USA":
              newProp = "United States";
              break;
            default:
              newProp = prop;
          }
          if (prop.indexOf("*") !== -1) {
            newProp = prop.split("*").join("");
          }
          cTimeseries[newProp] = response.data[prop];
        }
      }
      timeseries = cTimeseries;
      return cTimeseries;
    })
    .catch(function(error: Error) {
      // handle error
      console.log(error);
    });

//Helpers
const cron = (config: any, cb: Function) => {
  // Callback to set data in cache
  const setCallbackAsync = (data: any) => {
    return new Promise(resolve => {
      resolve(data);
    });
  };

  //Data retrieve actual function execution
  const retrieve = (step: string) =>
    cb().then((d: any) => {
      utils.log(`[Cron:${step}] '${config.key}'`, "✅");
      redisUtils.set(
        config.key,
        () => setCallbackAsync(d),
        (config.refreshMilliseconds / 1000) * config.maxFactor
      );
    });

  //Log start
  utils.log(
    `[Cron:Run] '${config.key}'${
      config.refreshMilliseconds
        ? ` Every ${utils.millisToMinutesAndSeconds(
            config.refreshMilliseconds
          )} minutes`
        : ""
    }`,
    "ℹ️ "
  );

  //Retrieve data (reload)
  if (config.refreshMilliseconds) {
    setInterval(() => retrieve("ReloadData"), config.refreshMilliseconds);
  }

  //Retrieve data for the first time
  retrieve("LoadData");
};

const getWorldData = () =>
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
          switch (value.country) {
            case "Mainland China":
              value.country = "China";
            case "US":
            case "USA":
              value.country = "United States";
              break;
          }
          if (value.country.indexOf("*") !== -1) {
            value.country = value.country.split("*").join("");
          }
          if (!tempMap[value.country]) {
            tempMap[value.country] = value;
          }
        }
      );

      let countries = (scmpResponse.data && scmpResponse.data.entries) || [];

      // Sort countries
      countries = countries.sort((a: any, b: any) =>
        utils.parseCommaNumber(a.cases) > utils.parseCommaNumber(b.cases)
          ? -1
          : 1
      );

      const extraStats = {
        countriesImpacted: 0,
        countriesDeaths: 0,
        active: 0,
        critical: 0,
        todayDeaths: 0,
        todayCases: 0,
        unresolved: stats.data.cases - stats.data.deaths - stats.data.recovered
      };

      countries.forEach((value: any, index: number, array: any) => {
        switch (value.country) {
          case "Mainland China":
            value.country = "China";
            break;
          case "US":
          case "USA":
            value.country = "United States";
            break;
        }
        if (value.country.indexOf("*") !== -1) {
          value.country = value.country.split("*").join("");
        }

        value.casesPerOneMillion = -1;
        value.critical = -1;
        value.active = -1;

        if (tempMap[value.country]) {
          value.casesPerOneMillion = tempMap[value.country].casesPerOneMillion;
          value.critical = tempMap[value.country].critical;
          value.active = tempMap[value.country].active;
          extraStats.active += tempMap[value.country].active || 0;
          extraStats.critical += tempMap[value.country].critical || 0;
          extraStats.todayCases += tempMap[value.country].todayCases || 0;
          extraStats.todayDeaths += tempMap[value.country].todayDeaths || 0;
        }

        value.cases = utils.parseCommaNumber(value.cases);
        value.deaths = utils.parseCommaNumber(value.deaths);
        value.recovered = utils.parseCommaNumber(value.recovered);
        value.unresolved = value.cases - value.deaths - value.recovered;
        value.fatalityRate =
          value.cases >= 0 && value.deaths >= 0
            ? Number(((value.deaths / value.cases) * 100).toFixed(2))
            : null;

        extraStats.countriesImpacted += value.cases > 0 ? 1 : 0;
        extraStats.countriesDeaths += value.deaths > 0 ? 1 : 0;

        value.flag = flag(value.country);
        value.code = code(value.country);

        setRoute("/api/country/" + value.code, () => {
          return {
            ac: countriesAutocomplete,
            timeseries: timeseries[value.country] || [],
            ...value
          };
        });

        const f = countriesAutocomplete.find(
          (item: any) => item.data == value.code
        );

        if (!f) {
          countriesAutocomplete.push({
            value: `${value.flag} ${value.country}`,
            data: value.code
          });
        }

        const continent =
          value.continent.charAt(0).toUpperCase() + value.continent.slice(1);

        if (!continents[continent]) {
          continents[continent] = {
            cases: 0,
            deaths: 0,
            recovered: 0,
            critical: 0,
            active: 0,
            unresolved: 0,
            fatalityRate: 0
          };
        }
        continents[continent].cases += value.cases >= 0 ? value.cases : 0;
        continents[continent].deaths += value.deaths >= 0 ? value.deaths : 0;
        continents[continent].recovered +=
          value.recovered >= 0 ? value.recovered : 0;
        continents[continent].critical +=
          value.critical >= 0 ? value.critical : 0;
        continents[continent].active += value.active >= 0 ? value.active : 0;
        continents[continent].unresolved +=
          value.unresolved >= 0 ? value.unresolved : 0;
      });

      scmpResponse.data.stats = {
        ...stats.data,
        ...extraStats
      };
      scmpResponse.data.ac = countriesAutocomplete;
      scmpResponse.data.continents = continents;
      return scmpResponse.data;
    })
    .catch(function(error: Error) {
      console.log(error);
    });

cachedRoute(CacheConfig.WORLD, getWorldData);
cachedRoute(CacheConfig.TIMESERIES, getTimeseriesData);

cron(CacheConfig.WORLD, getWorldData);
cron(CacheConfig.TIMESERIES, getTimeseriesData);

module.exports = router;
