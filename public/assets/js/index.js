$(document).ready(function () {
  window.pageData = {
    country: {},
    geoip: {},
    mostImpactedCountry: null,
    scmp: {},
    scmpCountries: {},
    timeseries: {},
  };

  // URL Params
  var countryCode = getUrlVars()["country"];

  // DOM
  var title = $("#topTitle");
  var countryIndicator = $("#countryIndicator");

  if (countryCode) {
    $(".specific-row").hide();

    fetchCountry(countryCode)
      .then((res) => handleCountryResponse(res, pageData))
      .catch((res) => {
        window.location = "/";
      })
      .then(() => {
        window.view.country({
          country: pageData.country,
          selectors: {
            countryIndicator,
            title,
          },
        });
      });
  } else {
    title.html(`World Live Statistics`);

    $(".specific-row").show();
    $("#rowChartStacked").show();

    $("body").on("map-selectRegion", function (event, countryCode) {
      updateSelectedCountryCharts(pageData.scmpCountries[countryCode]);
    });

    fetchGeoip()
      .then((res) => handleGeoipResponse(res, pageData))
      .then(fetchWorld)
      .then((res) => handleWorldResponse(res, pageData))
      .then(fetchTimeseries)
      .then((res) => handleTimeseriesResponse(res, pageData))
      .then(() => {
        window.view.main({
          pageData,
        });

        window.log = () => console.log(pageData);
      });
  }
});

/*
=================================
Get World Data
=================================
*/
const fetchWorld = () => $.getJSON("/api/world");

const handleWorldResponse = (scmpResponse, pageData) => {
  pageData.scmp = scmpResponse;
};

/*
=================================
Get Timeseries Data
=================================
*/
const fetchTimeseries = () =>
  $.getJSON("https://pomber.github.io/covid19/timeseries.json");

const handleTimeseriesResponse = (timeseriesResponse, pageData) => {
  pageData.timeseries = timeseriesResponse;
};
/*
=================================
Get Country Data
=================================
*/
const fetchCountry = (cc) => $.getJSON(`/api/country/${cc}`);
const handleCountryResponse = (countryResponse, pageData) => {
  pageData.country = countryResponse.data;
};
/*
=================================
Get GeoIP Data
=================================
*/
const fetchGeoip = () =>
  $.ajax({
    dataType: "json",
    url: "https://ipapi.co/json/",
  });

const handleGeoipResponse = (geoipResponse, pageData) => {
  pageData.geoip = geoipResponse;
};

/*
=================================
Selected country charts
=================================
*/
const updateSelectedCountryCharts = (country) => {
  if (!country) {
    console.log("Could not find country");
    return;
  }

  const selectedCountryCharts = $("#selectedCountryCharts");
  selectedCountryCharts
    .find(".country-name")
    .html(`${countriesModule.flag(country.country)} ${country.country}`);

  const generateStat = (idx, text, val, percent) => {
    $(`.stat-title-${idx}`).html(text);
    $(`.stat-count-${idx}`).html(numberWithCommas(val));
    $(`.stat-progress-${idx}`).css("width", `${percent}%`);
  };

  const overall = country.recovered + country.deaths + country.cases;
  //Statistic bars for selected country
  [
    {
      amount: country.cases,
      percent: Math.ceil(
        (country.cases / pageData.mostImpactedCountry.cases) * 100
      ),
      title: "Cases",
    },
    {
      amount: country.deaths,
      percent: Math.ceil(
        (country.deaths / pageData.mostImpactedCountry.cases) * 100
      ),
      title: "Deaths",
    },
    {
      amount: country.recovered,
      percent: Math.ceil(
        (country.recovered / pageData.mostImpactedCountry.cases) * 100
      ),
      title: "Recovered",
    },
    {
      amount: overall,
      percent: Math.ceil(
        (overall / pageData.mostImpactedCountry.overall) * 100
      ),
      title: "Overall Impacted",
    },
  ].forEach((value, index) =>
    generateStat(index + 1, value.title, value.amount, value.percent)
  );
};
