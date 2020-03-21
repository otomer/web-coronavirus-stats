$(document).ready(function() {
  window.pageData = {
    geoip: {},
    scmp: {},
    timeseries: {},
    scmpCountries: {},
    mostImpactedCountry: null
  };

  $("body").on("map-selectRegion", function(event, countryCode) {
    updateSelectedCountryCharts(pageData.scmpCountries[countryCode]);
  });

  /*
  Components 
    1. #cd-simple             (Top Counters)
    2. #worldImpactPie        (World impact so far pie chart)
    3. #mainGraph             (Graph for Impact over time)
    4. #selectedCountryCharts (Charts for selected country)
    5. #world-map             (World map)
    6. #countriesTable        (Countries table)
  */

  fetchGeoip()
    .then(res => handleGeoipResponse(res, pageData))
    .then(fetchScmp)
    .then(res => handleScmpResponse(res, pageData))
    .then(fetchTimeseries)
    .then(res => handleTimeseriesResponse(res, pageData))
    .then(() => {
      console.log(pageData);
    });
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
  loaded();
  pageData.timeseries = timeseriesResponse;

  const mapByDate = {};
  const tillYesterdayCountryMap = {};
  const seriesCases = [];
  const seriesDeaths = [];
  const seriesRecovered = [];
  const seriesLabels = [];

  renderCounters(pageData.scmp.data.stats);

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

  const mainGraphOptions = {
    chart: {
      dropShadow: {
        blur: 5,
        enabled: true,
        left: -7,
        opacity: 0.3,
        top: 22
      },
      events: {
        mounted: function(ctx, config) {
          const highest1 = ctx.getHighestValueInSeries(0);
          const highest2 = ctx.getHighestValueInSeries(1);

          ctx.addPointAnnotation({
            customSVG: {
              SVG:
                '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
              cssClass: undefined,
              offsetX: -8,
              offsetY: 5
            },
            label: {
              style: {
                cssClass: "d-none"
              }
            },
            x: new Date(
              ctx.w.globals.seriesX[0][
                ctx.w.globals.series[0].indexOf(highest1)
              ]
            ).getTime(),
            y: highest1
          });

          ctx.addPointAnnotation({
            customSVG: {
              SVG:
                '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
              cssClass: undefined,
              offsetX: -8,
              offsetY: 5
            },
            label: {
              style: {
                cssClass: "d-none"
              }
            },
            x: new Date(
              ctx.w.globals.seriesX[1][
                ctx.w.globals.series[1].indexOf(highest2)
              ]
            ).getTime(),
            y: highest2
          });
        }
      },
      fontFamily: "Nunito, sans-serif",
      height: 365,
      toolbar: {
        show: false
      },
      type: "area",
      zoom: {
        enabled: false
      }
    },
    colors: ["#1b55e2", "#e7515a", "#3cba92"],
    dataLabels: {
      enabled: false
    },
    fill: {
      gradient: {
        inverseColors: !1,
        opacityFrom: 0.28,
        opacityTo: 0.05,
        shadeIntensity: 1,
        stops: [45, 100],
        type: "vertical"
      },
      type: "gradient"
    },
    grid: {
      borderColor: "#191e3a",
      padding: {
        bottom: 0,
        left: -10,
        right: 0,
        top: 0
      },
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    labels: seriesLabels,
    legend: {
      fontFamily: "Nunito, sans-serif",
      fontSize: "16px",
      horizontalAlign: "right",
      itemMargin: {
        horizontal: 0,
        vertical: 20
      },
      markers: {
        fillColors: undefined,
        height: 10,
        offsetX: 0,
        offsetY: 0,
        onClick: undefined,
        radius: 12,
        strokeColor: "#fff",
        strokeWidth: 0,
        width: 10
      },
      offsetY: -50,
      position: "top"
    },
    markers: {
      discrete: [
        {
          dataPointIndex: 7,
          fillColor: "#000",
          seriesIndex: 0,
          size: 5,
          strokeColor: "#000"
        },
        {
          dataPointIndex: 11,
          fillColor: "#000",
          seriesIndex: 2,
          size: 4,
          strokeColor: "#000"
        }
      ]
    },
    responsive: [
      {
        breakpoint: 575,
        options: {
          legend: {
            offsetY: -30
          }
        }
      }
    ],
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
    stroke: {
      curve: "smooth",
      lineCap: "square",
      show: true,
      width: 2
    },
    subtitle: {
      align: "left",
      floating: false,
      margin: 0,
      offsetX: -10,
      offsetY: 35,
      style: {
        color: "#888ea8",
        fontSize: "14px"
      },
      text: "Total People"
    },
    title: {
      align: "left",
      floating: false,
      margin: 0,
      offsetX: -10,
      offsetY: 0,
      style: {
        color: "#bfc9d4",
        fontSize: "25px"
      }
      // text: "$10,840"
    },
    tooltip: {
      marker: {
        show: true
      },
      theme: "dark",
      x: {
        show: false
      }
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        show: true
      },
      labels: {
        offsetX: 0,
        offsetY: 5,
        style: {
          cssClass: "apexcharts-xaxis-title",
          fontFamily: "Nunito, sans-serif",
          fontSize: "12px"
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(value, index) {
          return value / 1000 + "K";
        },
        offsetX: -22,
        offsetY: 0,
        style: {
          cssClass: "apexcharts-yaxis-title",
          fontFamily: "Nunito, sans-serif",
          fontSize: "12px"
        }
      }
    }
  };

  const mainGraph = new ApexCharts(
    document.querySelector("#mainGraph"),
    mainGraphOptions
  );
  mainGraph.render();

  // Table
  let tableRows = "";
  const mainPageLength = 30;

  // Pie chart

  // Construct countries object
  let countries =
    (pageData.scmp && pageData.scmp.data && pageData.scmp.data.entries) || [];

  let maxCasesNormalized;

  countries.forEach((value, index, array) => {
    value.flag = countriesModule.flag(value.country);
    value.code = countriesModule.code(value.country);
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
    <td>${value.country}</td>
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
    lengthMenu: [10, mainPageLength, 50, 100, 500],
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
    colors: ["#1b55e2", "#3cba92", "#e7515a", "#e2a03f"], //purple, green, red, orange
    dataLabels: {
      enabled: false
    },
    labels: ["Cases", "Recovered", "Deaths"],
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

const renderCounters = stats => {
  const counters = $("#cd-simple");

  const addCounter = (value, name) => {
    counters.append(`<div class="countdown">
    <div class="clock-count-container">
      <h1 class="clock-val">${value}</h1>
    </div>
    <h4 class="clock-text">${name}</h4>
  </div>`);
  };
  addCounter(stats.todayDeaths, "Today Deaths");
  addCounter(stats.todayCases, "Today Cases");
  addCounter(stats.critical, "Critical");
  addCounter(stats.deaths, "Deaths");
  addCounter(stats.cases, "Cases");
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
    $(`.stat-count-${idx}`).html(val);
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

/*
=================================
Format date as datetime string
=================================
*/
const formatDate = date => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return `${date.getMonth() +
    1}/${date.getDate()}/${date.getFullYear()} ${strTime}`;
};

/*
=================================
Numbers Formatting
=================================
*/
const numberWithCommas = x =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const parseCommaNumber = x => parseInt(parseFloat(x.replace(/,/g, "")));

/*
=================================
Hide page loader
=================================
*/
const loaded = () => {
  var load_screen = document.getElementById("load_screen");
  document.body.removeChild(load_screen);
};
