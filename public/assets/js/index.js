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
      .catch((res) => handleGeoipFailure(res))
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
    timeout: 2000,
    url: "https://ipapi.co/json/",
  });

const handleGeoipResponse = (geoipResponse, pageData) => {
  pageData.geoip = geoipResponse;
};

const handleGeoipFailure = (err) => {
  return { country_code: "US" };
};
