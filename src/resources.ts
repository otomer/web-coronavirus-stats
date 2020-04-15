/**
 * Resources Definition
 */
const resources = {
  // The Virus Tracker API
  allCountriesTotals:
    "https://api.thevirustracker.com/free-api?countryTotals=ALL",
  globalStats: "https://api.thevirustracker.com/free-api?global=stats",
  countryTimeline: (countryCode: string) =>
    `https://api.thevirustracker.com/free-api?countryTimeline=${countryCode}`,

  // Coronavirus-19-API
  //https://github.com/javieraviles/covidAPI
  allStats: "https://coronavirus-19-api.herokuapp.com/all",
  countries: "https://coronavirus-19-api.herokuapp.com/countries",
  country: (name: string) =>
    `https://coronavirus-19-api.herokuapp.com/countries/${name}`,

  // Pomber API
  //https://github.com/pomber/covid19
  countriesDailyStatistics: "https://pomber.github.io/covid19/timeseries.json",

  //South China Morning Post
  virusCases: "https://interactive-static.scmp.com/sheet/wuhan/viruscases.json",

  //Countries population
  restCountriesAll: "https://restcountries.eu/rest/v2/all",
};

export default resources;
