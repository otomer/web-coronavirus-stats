$(document).ready(function() {
  // URL Params
  var countryCode = getUrlVars()["cc"];

  // DOM
  var title = $("#topTitle");

  window.pageData = {
    geoip: {},
    scmp: {},
    timeseries: {},
    scmpCountries: {},
    country: {},
    mostImpactedCountry: null
  };

  /*
  Components 
    1. #cd-simple             (Top Counters)
    2. #worldImpactPie        (World impact so far pie chart)
    3. #mainGraph             (Graph for Impact over time)
    4. #selectedCountryCharts (Charts for selected country)
    5. #world-map             (World map)
    6. #countriesTable        (Countries table)
  */

  if (countryCode) {
    window.render.loaded();

    fetchCountry(countryCode)
      .then(res => handleCountryResponse(res, pageData))
      .catch(res => {
        window.location = "/";
      })
      .then(() => {
        title.html(`${pageData.country.country} ${pageData.country.flag} `);

        window.render.counters([
          {
            value: pageData.country.cases,
            title: "Cases"
          },
          { value: pageData.country.critical, title: "Critical" },
          { value: pageData.country.deaths, title: "Deaths" }
        ]);

        const graphOptions = {
          colors: ["#1b55e2", "#e7515a", "#3cba92"],
          series: [
            {
              data: pageData.country.timeseries.map(c => c.confirmed),
              name: "Cases"
            },
            {
              data: pageData.country.timeseries.map(c => c.deaths),
              name: "Deaths"
            },
            {
              data: pageData.country.timeseries.map(c => c.recovered),
              name: "Recovered"
            }
          ],
          labels: pageData.country.timeseries.map(c => c.date)
        };
        window.render.graph(graphOptions);
      });
  } else {
    $("body").on("map-selectRegion", function(event, countryCode) {
      updateSelectedCountryCharts(pageData.scmpCountries[countryCode]);
    });

    fetchGeoip()
      .then(res => handleGeoipResponse(res, pageData))
      .then(fetchScmp)
      .then(res => handleScmpResponse(res, pageData))
      .then(fetchTimeseries)
      .then(res => handleTimeseriesResponse(res, pageData))
      .then(() => {
        console.log(pageData);
      });
  }
});

/*
=================================
Get SCMP Data
=================================
*/
const fetchScmp = () => $.getJSON("/scmp");

const handleScmpResponse = (scmpResponse, pageData) => {
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
  window.render.loaded();
  pageData.timeseries = timeseriesResponse;

  const mapByDate = {};
  const tillYesterdayCountryMap = {};
  const seriesCases = [];
  const seriesDeaths = [];
  const seriesRecovered = [];
  const seriesLabels = [];

  window.render.counters([
    { value: pageData.scmp.data.stats.todayDeaths, title: "Today Deaths" },
    { value: pageData.scmp.data.stats.todayCases, title: "Today Cases" },
    { value: pageData.scmp.data.stats.critical, title: "Critical" },
    { value: pageData.scmp.data.stats.deaths, title: "Deaths" },
    { value: pageData.scmp.data.stats.cases, title: "Cases" },
    {
      value: pageData.scmp.data.stats.countriesDeaths,
      title: "Countries with losses"
    },
    {
      value: pageData.scmp.data.stats.countriesImpacted,
      title: "Countries with cases"
    }
  ]);

  //Iterate countries
  for (let countryName in timeseriesResponse) {
    if (!tillYesterdayCountryMap[countryName]) {
      tillYesterdayCountryMap[countryName] = {
        cases: 0,
        deaths: 0,
        recovered: 0
      };
    }

    const currentCountry = timeseriesResponse[countryName];

    //Iterate days per country
    for (let dateKey in currentCountry) {
      const dailyRow = currentCountry[dateKey];
      if (!mapByDate[dailyRow.date]) {
        mapByDate[dailyRow.date] = {
          cases: 0,
          deaths: 0,
          recovered: 0
        };
      }
      mapByDate[dailyRow.date].cases += dailyRow.confirmed;
      mapByDate[dailyRow.date].deaths += dailyRow.deaths;
      mapByDate[dailyRow.date].recovered += dailyRow.recovered;
    }

    const lastDateForCountry =
      currentCountry[
        Object.keys(currentCountry)[Object.keys(currentCountry).length - 1]
      ];
    tillYesterdayCountryMap[countryName].cases += lastDateForCountry.confirmed;
    tillYesterdayCountryMap[countryName].deaths += lastDateForCountry.deaths;
    tillYesterdayCountryMap[countryName].recovered +=
      lastDateForCountry.recovered;
  }

  const mapByDateKeys = Object.keys(mapByDate);
  const labelsToShow = 50;
  for (
    let i = mapByDateKeys.length - labelsToShow;
    i < mapByDateKeys.length;
    i++
  ) {
    seriesLabels.push(mapByDateKeys[i]);
    seriesCases.push(mapByDate[mapByDateKeys[i]].cases);
    seriesDeaths.push(mapByDate[mapByDateKeys[i]].deaths);
    seriesRecovered.push(mapByDate[mapByDateKeys[i]].recovered);
  }

  const graphOptions = {
    colors: ["#1b55e2", "#e7515a", "#3cba92"],
    series: [
      {
        data: seriesCases,
        name: "Cases"
      },
      {
        data: seriesDeaths,
        name: "Deaths"
      },
      {
        data: seriesRecovered,
        name: "Recovered"
      }
    ],
    labels: seriesLabels
  };
  window.render.graph(graphOptions);

  // Table
  let tableRows = "";
  const mainPageLength = 50;

  // Pie chart

  // Construct countries object
  let countries =
    (pageData.scmp && pageData.scmp.data && pageData.scmp.data.entries) || [];

  let maxCasesNormalized;

  countries.forEach((value, index, array) => {
    value.flag = value.flag;
    value.code = value.code;
    value.altName = countriesModule.name(value.code);

    if (!pageData.mostImpactedCountry) {
      // Since countries are already sorted by cases, it should be the max assignment.
      pageData.mostImpactedCountry = {
        cases: value.cases,
        overall: value.cases + value.recovered + value.deaths
      };
      maxCasesNormalized = Math.ceil(value.cases / 50);
    }

    let impactPercentage = Math.ceil((value.cases / maxCasesNormalized) * 100);
    let impactLevel = "primary";
    if (impactPercentage > 80) {
      impactLevel = "danger";
    } else if (impactPercentage > 50) {
      impactLevel = "warning";
    } else {
    }

    var tdDiff = prop => {
      const prev =
        tillYesterdayCountryMap[value.country] ||
        tillYesterdayCountryMap[value.altName];

      let v1,
        v2,
        diff = "-",
        txt = "-",
        cls = "";

      if (prev) {
        v1 = value[prop];

        v2 = prev[prop];
        diff = v1 - v2;
      }

      if (diff === 0) {
        txt = "-";
        cls = "";
      } else if (diff > 0) {
        txt = "+" + diff;
        cls = "increase";
      } else if (diff < 0) {
        txt = "" + diff;
        cls = "decrease";
      }

      return `<td class="${cls}">${txt}</td>`;
    };

    tableRows += `
  <tr>
    <td class="flag-emoji">${value.flag || "-"}</td>
    <td><a href="?cc=${value.code}">${value.country}</a></td>
    <td>${value.code || "-"}</td>
    <td>
      <div class="progress br-30">
          <div class="progress-bar br-30 bg-${impactLevel}" role="progressbar" style="width: ${impactPercentage}%" aria-valuenow="${impactPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </td>
    <td>${value.cases}</td>
    ${tdDiff("cases")}
    <td>${value.deaths}</td>
    ${tdDiff("deaths")}
    <td>${value.recovered}</td>
    ${tdDiff("recovered")}
    <td>${value.casesPerOneMillion > 0 ? value.casesPerOneMillion : "-"}</td>
    <td>${value.critical > 0 ? value.critical : "-"}</td>
  </tr>`;

    if (!pageData.scmpCountries[value.code]) {
      pageData.scmpCountries[value.code] = value;
    }

    if (value.code === pageData.geoip.country_code) {
      updateSelectedCountryCharts(value);
    }
  }); //end of countries.forEach

  // Set table rows content
  const countriesTable = $("#countriesTable");
  countriesTable.find("tbody").html(tableRows);
  countriesTable.DataTable({
    lengthMenu: [10, 30, mainPageLength, 100, 500],
    oLanguage: {
      oPaginate: {
        sNext:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        sPrevious:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>'
      },
      sInfo: "Showing page _PAGE_ of _PAGES_",
      sLengthMenu: `Results (Last update @ ${formatDate(
        new Date(pageData.scmp.data.last_updated)
      )}) :  _MENU_`,
      sSearch:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      sSearchPlaceholder: "Search..."
    },
    order: [[3, "desc"]],
    ordering: true,
    pageLength: mainPageLength,
    stripeClasses: []
  });

  const selectedCountryOptions = {
    chart: {
      type: "donut",
      width: 380
    },
    colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"], //purple, green, red, orange
    dataLabels: {
      enabled: false
    },
    labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
    legend: {
      fontSize: "14px",
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 0,
        vertical: 8
      },
      markers: {
        height: 10,
        width: 10
      },
      position: "bottom"
    },
    plotOptions: {
      pie: {
        donut: {
          background: "transparent",
          labels: {
            name: {
              color: undefined,
              fontFamily: "Quicksand, sans-serif",
              fontSize: "29px",
              offsetY: -10,
              show: true
            },
            show: true,
            total: {
              color: "#888ea8",
              formatter: function(w) {
                return numberWithCommas(
                  w.globals.seriesTotals.reduce(function(a, b) {
                    return a + b;
                  }, 0)
                );
              },
              label: "Total",
              show: true,
              showAlways: true
            },
            value: {
              color: "#bfc9d4",
              fontFamily: "Quicksand, sans-serif",
              fontSize: "26px",
              formatter: function(val) {
                return numberWithCommas(val);
              },
              offsetY: 16,
              show: true
            }
          },
          size: "65%"
        }
      }
    },
    responsive: [
      {
        breakpoint: 1599,
        options: {
          chart: {
            height: "400px",
            width: "350px"
          },
          legend: {
            position: "top"
          }
        },

        breakpoint: 1439,
        options: {
          chart: {
            height: "390px",
            width: "250px"
          },
          legend: {
            position: "bottom"
          },
          plotOptions: {
            pie: {
              donut: {
                size: "65%"
              }
            }
          }
        }
      }
    ],
    series: [
      pageData.scmp.data.stats.cases,
      pageData.scmp.data.stats.recovered,
      pageData.scmp.data.stats.unresolved,
      pageData.scmp.data.stats.deaths
    ],
    stroke: {
      colors: "#0e1726",
      show: true,
      width: 14
    }
  };

  const worldImpactPie = new ApexCharts(
    document.querySelector("#worldImpactPie"),
    selectedCountryOptions
  );
  worldImpactPie.render();
};
/*
=================================
Get Country Data
=================================
*/
const fetchCountry = cc => $.getJSON(`/country/${cc}`);
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
    url: "https://ipapi.co/json/"
  });

const handleGeoipResponse = (geoipResponse, pageData) => {
  pageData.geoip = geoipResponse;
};

const updateSelectedCountryCharts = country => {
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
      title: "Cases"
    },
    {
      amount: country.deaths,
      percent: Math.ceil(
        (country.deaths / pageData.mostImpactedCountry.cases) * 100
      ),
      title: "Deaths"
    },
    {
      amount: country.recovered,
      percent: Math.ceil(
        (country.recovered / pageData.mostImpactedCountry.cases) * 100
      ),
      title: "Recovered"
    },
    {
      amount: overall,
      percent: Math.ceil(
        (overall / pageData.mostImpactedCountry.overall) * 100
      ),
      title: "Overall Impacted"
    }
  ].forEach((value, index) =>
    generateStat(index + 1, value.title, value.amount, value.percent)
  );
};
