$(document).ready(function() {
  // URL Params
  var countryCode = getUrlVars()["country"];

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

  if (countryCode) {
    $(".specific-row").hide();

    fetchCountry(countryCode)
      .then(res => handleCountryResponse(res, pageData))
      .catch(res => {
        window.location = "/";
      })
      .then(() => {
        window.render.loaded();
        title.html(`${pageData.country.country} ${pageData.country.flag} `);

        window.render.counters([
          {
            value: pageData.country.cases,
            title: "Cases"
          },
          { value: pageData.country.critical, title: "Critical" },
          { value: pageData.country.deaths, title: "Deaths" },
          { value: pageData.country.fatalityRate, title: "Fatality Rate" }
        ]);
        const tsGraphDays = 20;
        const tsGraph = selectLast(pageData.country.timeseries, tsGraphDays);
        window.render.graph({
          title: `Impact over time (Last ${tsGraphDays} Days)`,
          colors: ["#1b55e2", "#e7515a", "#3cba92"],
          series: [
            {
              data: tsGraph.map(c => c.confirmed),
              name: "Cases"
            },
            {
              data: tsGraph.map(c => c.deaths),
              name: "Deaths"
            },
            {
              data: tsGraph.map(c => c.recovered),
              name: "Recovered"
            }
          ],
          labels: tsGraph.map(c => c.date)
        });

        window.render.piechart({
          title: "Impact so far",
          labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
          colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"],
          series: [
            pageData.country.cases,
            pageData.country.recovered,
            pageData.country.unresolved,
            pageData.country.deaths
          ]
        });

        const tsPiechartDays = 7;
        const tsPiechart = selectLast(
          pageData.country.timeseries,
          tsPiechartDays
        );
        window.render.chart({
          title: `Deaths vs. Recovered (Last ${tsPiechartDays} Days)`,
          categories: tsPiechart.map(c => c.date),
          series: [
            {
              name: "Deaths",
              data: tsPiechart.map(c => c.deaths)
            },
            {
              name: "Recovered",
              data: tsPiechart.map(c => c.recovered)
            }
          ]
        });
      });
  } else {
    $(".specific-row").show();
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
        window.log = () => console.log(pageData);
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
      title: "Countries +Deaths"
    },
    {
      value: pageData.scmp.data.stats.countriesImpacted,
      title: "Countries +Cases"
    }
  ]);

  timeseriesResponse["United States"] = timeseriesResponse["US"];
  delete timeseriesResponse["US"];

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
  const lastGraphItems = 25;
  const graphOptions = {
    title: `Impact over time (Last ${lastGraphItems} Days)`,
    colors: ["#1b55e2", "#e7515a", "#3cba92"],
    series: [
      {
        data: selectLast(seriesCases, lastGraphItems),
        name: "Cases"
      },
      {
        data: selectLast(seriesDeaths, lastGraphItems),
        name: "Deaths"
      },
      {
        data: selectLast(seriesRecovered, lastGraphItems),
        name: "Recovered"
      }
    ],
    labels: selectLast(seriesLabels, lastGraphItems)
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
    <td><a href="?country=${value.code}">${value.country}</a></td>
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
    <td>${value.fatalityRate > 0 ? value.fatalityRate : "-"}</td>
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

  window.render.piechart({
    title: "🌍 World impact so far",
    labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
    colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"],
    series: [
      pageData.scmp.data.stats.cases,
      pageData.scmp.data.stats.recovered,
      pageData.scmp.data.stats.unresolved,
      pageData.scmp.data.stats.deaths
    ]
  });

  const chartDays = 7;

  window.render.chart({
    title: `Deaths vs. Recovered (Last ${chartDays} Days)`,
    categories: selectLast(seriesLabels, chartDays),
    series: [
      {
        name: "Deaths",
        data: selectLast(seriesDeaths, chartDays)
      },
      {
        name: "Recovered",
        data: selectLast(seriesRecovered, chartDays)
      }
    ]
  });
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
