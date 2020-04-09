$(document).ready(function () {
  window.pageData = {
    countryView: {},
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
          country: pageData.countryView,
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

    fetchGeoIp()
      .catch((res) => handleGeoIpFailure(res))
      .then((res) => handleGeoIpResponse(res, pageData))
      .then(fetchWorld)
      .then((res) => handleWorldResponse(res, pageData))
      .then(fetchCountriesDailyStats)
      .then((res) => handleCountriesDailyStats(res, pageData))
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

const handleWorldResponse = (worldResponse, pageData) => {
  pageData.scmp = worldResponse;
};

/*
=================================
Get Countries Daily Statistics Data
=================================
*/
const fetchCountriesDailyStats = () =>
  $.getJSON("https://pomber.github.io/covid19/timeseries.json");

const handleCountriesDailyStats = (countriesDailyStatsResponse, pageData) => {
  pageData.timeseries = countriesDailyStatsResponse;
};

/*
=================================
Get Country Data
=================================
*/
const fetchCountry = (cc) => $.getJSON(`/api/country/${cc}`);
const handleCountryResponse = (countryResponse, pageData) => {
  pageData.countryView = countryResponse.data;
};
/*
=================================
Get GeoIP Data
=================================
*/
const fetchGeoIp = () =>
  $.ajax({
    dataType: "json",
    timeout: 2000,
    url: "https://ipapi.co/json/",
  });

const handleGeoIpResponse = (geoIpResponse, pageData) => {
  pageData.geoip = geoIpResponse;
};

const handleGeoIpFailure = (err) => {
  return { country_code: "US" };
};
