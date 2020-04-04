/**
 * Resources Definition
 */
const resources = {
  //https://github.com/javieraviles/covidAPI
  allStats: "https://coronavirus-19-api.herokuapp.com/all",
  countries: "https://coronavirus-19-api.herokuapp.com/countries",
  //South China Morning Post
  scmp: "https://interactive-static.scmp.com/sheet/wuhan/viruscases.json",
  //https://github.com/pomber/covid19
  timeseries: "https://pomber.github.io/covid19/timeseries.json",
  vtcountries: "https://api.thevirustracker.com/free-api?countryTotals=ALL",
  vtcountry: "https://api.thevirustracker.com/free-api?countryTimeline=IL",
  vtstats: "https://api.thevirustracker.com/free-api?global=stats",
  country: (name: string) =>
    `https://coronavirus-19-api.herokuapp.com/countries/${name}`,
};

module.exports = resources;
