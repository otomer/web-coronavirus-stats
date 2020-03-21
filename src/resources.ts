/**
 * Resources Definition
 */
const resources = {
  //South China Morning Post
  scmp: "https://interactive-static.scmp.com/sheet/wuhan/viruscases.json",
  //https://github.com/pomber/covid19
  pomber: "",
  //https://github.com/javieraviles/covidAPI
  allStats: "https://coronavirus-19-api.herokuapp.com/all",
  countries: "https://coronavirus-19-api.herokuapp.com/countries",
  country: (name: string) =>
    `https://coronavirus-19-api.herokuapp.com/countries/${name}`
};

module.exports = resources;
