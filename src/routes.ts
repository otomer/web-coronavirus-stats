import { Request, Response } from "express";

import axios from "axios";
import express from "express";
import redis from "./redis";
import resources from "./resources";
import utils from "./utils";

const { code, flag } = require("country-emoji");

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
      success: true,
    })
  );

const createCachableRoute = (config: any, cb: any) =>
  router.get(config.key, (req: Request, res: Response) =>
    redis.cache(
      config.key,
      cb,
      (config.refreshMilliseconds / 1000) * config.maxFactor,
      res
    )
  );

// Controllers
const _countriesAutocomplete: any = [];
const _continents: any = {};
let _countriesDailyStatsMap: any = {};
let _countriesRace: any = {};

const RoutesConfig = {
  COUNTRIES_DAILY: {
    key: "/api/countries",
    maxFactor: 2,
    refreshMilliseconds: 1000 * 30 * 60, //30 minutes
  },
  COUNTRY: {
    key: "/api/country/",
  },
  RACE_CHART: {
    key: "/api/race",
  },
  WORLD: {
    key: "/api/world",
    maxFactor: 2,
    refreshMilliseconds: 1000 * 30 * 60, //30 minutes
  },
};

/**
 * Data Retrieval
 */

const getCountriesDailyStatistics = () =>
  axios
    .all([
      axios.get(resources.countriesDailyStatistics),
      axios.get(resources.restCountriesAll),
    ])
    .then((responseArr: any) => {
      const response = responseArr[0];
      const countriesPopulation = responseArr[1].data;
      const countriesDailyStatsMap: any = {};
      const populationMap: any = {};

      countriesPopulation.forEach((item: any) => {
        const cn = utils.countryNameAlign(item.name);
        populationMap[cn] = {
          flagUrl: item.flag,
          population: item.population,
        };
      });

      for (var countryName in response.data) {
        if (response.data.hasOwnProperty(countryName)) {
          let newCountryName = utils.countryNameAlign(countryName);
          countriesDailyStatsMap[newCountryName] = response.data[countryName];

          let previousDay: {
            confirmed: number;
            date: string;
            deaths: number;
            recovered: number;
          };

          let hasValidPopulation = false;
          if (populationMap[newCountryName]) {
            if (populationMap[newCountryName].population >= 1000000) {
              hasValidPopulation = true;
            }
            // else {
            //   console.log(
            //     `${newCountryName} - has only ${populationMap[newCountryName].population} population`
            //   );
            // }
          } else {
            // console.log(`${newCountryName} - No population item`);
          }

          countriesDailyStatsMap[newCountryName].forEach(
            (item: any, index: any) => {
              const currDateString = new Date(item.date).toLocaleDateString();
              if (!_countriesRace[currDateString]) {
                _countriesRace[currDateString] = [];
              }

              if (item.deaths >= 0 && hasValidPopulation) {
                let raceVal: number =
                  (item.deaths / populationMap[newCountryName].population) *
                  1000000;
                raceVal = parseFloat(raceVal.toFixed(2));

                _countriesRace[currDateString].push({
                  // bullet: `https://www.amcharts.com/wp-content/uploads/flags/${newCountryName.toLowerCase()}.svg`,
                  // bullet: populationMap[newCountryName].flagUrl,
                  countryCategory: newCountryName,
                  countryValue: raceVal,
                });
              }

              if (!previousDay) {
                previousDay = item;
              } else {
                item.diffConfirmed = item.confirmed - previousDay.confirmed;
                item.diffDeaths = item.deaths - previousDay.deaths;
                item.diffRecovered = item.recovered - previousDay.recovered;
                previousDay = { ...item };
              }
            }
          );
        }
      }

      setRoute(RoutesConfig.RACE_CHART.key, () => ({
        ac: _countriesAutocomplete,
        race: _countriesRace,
      }));

      _countriesDailyStatsMap = countriesDailyStatsMap;
      return countriesDailyStatsMap;
    })
    .catch((error: Error) => {
      console.log(error);
    });

//Helpers
const cron = (config: any, cb: Function) => {
  // Callback to set data in cache
  const setCallbackAsync = (data: any) => {
    return new Promise((resolve) => {
      resolve(data);
    });
  };

  //Data retrieve actual function execution
  const retrieve = (step: string) =>
    cb().then((d: any) => {
      utils.log(`[Cron:${step}] '${config.key}'`, "✅");
      redis.set(
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

const fallbackCountries = (response: any) => {
  let countriesResponse = response.data.countryitems[0];
  let altCountriesResponse: any = [];
  Object.keys(countriesResponse).forEach(function (key) {
    if (key !== "stat" && key !== "stats") {
      const value = countriesResponse[key];
      altCountriesResponse.push({
        active: value.total_active_cases,
        cases: value.total_cases,
        casesPerOneMillion: -1,
        code: value.code,
        country: value.title,
        critical: value.total_serious_cases,
        deaths: value.total_deaths,
        recovered: value.total_recovered,
        todayCases: value.total_new_cases_today,
        todayDeaths: value.total_new_deaths_today,
        unresolved: value.total_unresolved,
      });
      /*
      FROM
      {
        code: "IL",
        total_unresolved: 0,
        total_active_cases: 7118,
       }
      TO
      {
        casesPerOneMillion: 907,
        deathsPerOneMillion: 25,
        totalTests: 1487493,
        testsPerOneMillion: 4494
        }
      */
    }
  });
  return { data: altCountriesResponse };
};

const applyFallback = false;
const countriesUrl = applyFallback
  ? resources.allCountriesTotals
  : resources.countries;

const getWorldStatistics = () =>
  axios
    .all([
      axios.get(resources.virusCases),
      axios.get(countriesUrl),
      axios.get(resources.allStats),
    ])
    .then((responseArr: any) => {
      const virusCasesResponse = responseArr[0];
      const countriesResponse = applyFallback
        ? fallbackCountries(responseArr[1])
        : responseArr[1];
      const allStatsResponse = responseArr[2];
      const tempMap: any = {};

      countriesResponse.data.forEach((item: any, index: number, array: any) => {
        item.country = utils.countryNameAlign(item.country);
        if (!tempMap[item.country]) {
          tempMap[item.country] = item;
        }
      });

      let countries =
        (virusCasesResponse.data && virusCasesResponse.data.entries) || [];

      // Sort countries
      countries = countries.sort((a: any, b: any) =>
        utils.parseCommaNumber(a.cases) > utils.parseCommaNumber(b.cases)
          ? -1
          : 1
      );

      const extraStats = {
        active: 0,
        countriesDeaths: 0,
        countriesImpacted: 0,
        critical: 0,
        todayCases: 0,
        todayDeaths: 0,
        unresolved:
          allStatsResponse.data.cases -
          allStatsResponse.data.deaths -
          allStatsResponse.data.recovered,
      };

      countries.forEach((item: any, index: number, array: any) => {
        item.country = utils.countryNameAlign(item.country);
        if (item.country === "Chile") {
          item.continent = "South America";
        }
        const continent =
          item.continent.charAt(0).toUpperCase() + item.continent.slice(1);

        item.casesPerOneMillion = -1;
        item.critical = -1;
        item.active = -1;

        if (tempMap[item.country]) {
          item.casesPerOneMillion = tempMap[item.country].casesPerOneMillion;
          item.critical = tempMap[item.country].critical;
          item.active = tempMap[item.country].active;

          // Sum
          extraStats.active += tempMap[item.country].active || 0;
          extraStats.critical += tempMap[item.country].critical || 0;
          extraStats.todayCases += tempMap[item.country].todayCases || 0;
          extraStats.todayDeaths += tempMap[item.country].todayDeaths || 0;
        }

        item.cases = utils.parseCommaNumber(item.cases);
        item.deaths = utils.parseCommaNumber(item.deaths);
        item.recovered = utils.parseCommaNumber(item.recovered);
        item.unresolved = item.cases - item.deaths - item.recovered;
        item.fatalityRate =
          item.cases >= 0 && item.deaths >= 0
            ? Number(((item.deaths / item.cases) * 100).toFixed(2))
            : null;

        extraStats.countriesImpacted += item.cases > 0 ? 1 : 0;
        extraStats.countriesDeaths += item.deaths > 0 ? 1 : 0;

        item.flag = flag(item.country);
        item.code = code(item.country);

        setRoute(`${RoutesConfig.COUNTRY.key}${item.code}`, () => ({
          ac: _countriesAutocomplete,
          timeseries: _countriesDailyStatsMap[item.country] || [],
          ...item,
        }));

        const f = _countriesAutocomplete.find(
          (item: any) => item.data == item.code
        );

        if (!f) {
          _countriesAutocomplete.push({
            data: item.code,
            value: `${item.flag} ${item.country}`,
          });
        }

        if (!_continents[continent]) {
          _continents[continent] = {
            active: 0,
            cases: 0,
            critical: 0,
            deaths: 0,
            fatalityRate: 0,
            recovered: 0,
            unresolved: 0,
          };
        }
        _continents[continent].cases += item.cases >= 0 ? item.cases : 0;
        _continents[continent].deaths += item.deaths >= 0 ? item.deaths : 0;
        _continents[continent].recovered +=
          item.recovered >= 0 ? item.recovered : 0;
        _continents[continent].critical +=
          item.critical >= 0 ? item.critical : 0;
        _continents[continent].active += item.active >= 0 ? item.active : 0;
        _continents[continent].unresolved +=
          item.unresolved >= 0 ? item.unresolved : 0;
      });

      virusCasesResponse.data.stats = {
        ...allStatsResponse.data,
        ...extraStats,
      };
      virusCasesResponse.data.ac = _countriesAutocomplete;
      virusCasesResponse.data.continents = _continents;
      return virusCasesResponse.data;
    })
    .catch((error: Error) => {
      console.error(error);
    });

/**
 * Set Routes
 */
createCachableRoute(RoutesConfig.WORLD, getWorldStatistics);
createCachableRoute(RoutesConfig.COUNTRIES_DAILY, getCountriesDailyStatistics);

/**
 * Set Cron jobs
 */
cron(RoutesConfig.WORLD, getWorldStatistics);
cron(RoutesConfig.COUNTRIES_DAILY, getCountriesDailyStatistics);

module.exports = router;
