(function () {
  const ViewsConfig = {
    Main: {
      COMPARE_CHART_DAYS: 10,
      GRAPH_DAYS: 30,
    },
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

  window.updateSelectedCountryCharts = updateSelectedCountryCharts;
  const init = (options) => {
    const pageData = options.pageData;
    const countriesDailyStats = pageData.timeseries;
    const mapByDate = {};
    const tillYesterdayCountryMap = {};
    const seriesCases = [];
    const seriesDeaths = [];
    const seriesRecovered = [];
    const seriesLabels = [];

    window.render.loaded();

    window.render.map({
      id: "#world-map",
      getCountryData: (countryCode) => pageData.scmpCountries[countryCode],
      selectedRegion: () => pageData.geoip.country_code,
    });

    window.render.counters([
      { title: "Today Deaths", value: pageData.scmp.stats.todayDeaths },
      { title: "Today Cases", value: pageData.scmp.stats.todayCases },
      { title: "Critical", value: pageData.scmp.stats.critical },
      { title: "Deaths", value: pageData.scmp.stats.deaths },
      { title: "Cases", value: pageData.scmp.stats.cases },
    ]);

    countriesDailyStats["United States"] = countriesDailyStats["US"];
    delete countriesDailyStats["US"];

    //Iterate countries
    for (let countryName in countriesDailyStats) {
      if (!tillYesterdayCountryMap[countryName]) {
        tillYesterdayCountryMap[countryName] = {
          cases: 0,
          deaths: 0,
          recovered: 0,
        };
      }

      const currentCountry = countriesDailyStats[countryName];

      //Iterate days per country
      for (let dateKey in currentCountry) {
        const dailyRow = currentCountry[dateKey];
        if (!mapByDate[dailyRow.date]) {
          mapByDate[dailyRow.date] = {
            cases: 0,
            deaths: 0,
            recovered: 0,
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
      tillYesterdayCountryMap[countryName].cases +=
        lastDateForCountry.confirmed;
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

    const casesLastDay = selectLast(seriesCases, 1);
    const deathsLastDay = selectLast(seriesDeaths, 1);

    const fatalityRate =
      Number(((deathsLastDay / casesLastDay) * 100).toFixed(2)) + "%";

    const graphOptions = {
      colors: ["#1b55e2", "#e7515a", "#3cba92"],
      labels: selectLast(seriesLabels, ViewsConfig.Main.GRAPH_DAYS),
      series: [
        {
          data: selectLast(seriesCases, ViewsConfig.Main.GRAPH_DAYS),
          name: "Cases",
        },
        {
          data: selectLast(seriesDeaths, ViewsConfig.Main.GRAPH_DAYS),
          name: "Deaths",
        },
        {
          data: selectLast(seriesRecovered, ViewsConfig.Main.GRAPH_DAYS),
          name: "Recovered",
        },
      ],
      subtitle: fatalityRate,
      title: `Impact over time (${ViewsConfig.Main.GRAPH_DAYS} Days)`,
    };
    window.render.graph(graphOptions);

    // Table
    let tableRows = "";

    // Pie chart

    // Construct countries object
    let countries =
      (pageData.scmp && pageData.scmp && pageData.scmp.entries) || [];

    let maxCasesNormalized;

    countries.forEach((value, index, array) => {
      value.flag = value.flag;
      value.code = value.code;
      value.altName = countriesModule.name(value.code);

      if (!pageData.mostImpactedCountry) {
        // Since countries are already sorted by cases, it should be the max assignment.
        pageData.mostImpactedCountry = {
          cases: value.cases,
          overall: value.cases + value.recovered + value.deaths,
        };
        maxCasesNormalized = Math.ceil(value.cases / 50);
      }

      let impactPercentage = Math.ceil(
        (value.cases / maxCasesNormalized) * 100
      );
      let impactLevel = "primary";
      if (impactPercentage > 80) {
        impactLevel = "danger";
      } else if (impactPercentage > 50) {
        impactLevel = "warning";
      } else {
      }

      var tdDiff = (prop, pos) => {
        const prev =
          tillYesterdayCountryMap[value.country] ||
          tillYesterdayCountryMap[value.altName];

        let v1,
          v2,
          diff = "-";

        if (prev) {
          v1 = value[prop];
          v2 = prev[prop];
          diff = v1 - v2;
        }

        return convertDiffToTd(diff, pos);
      };
      const countryHref = `href="?country=${value.code}"`;

      tableRows += `
  <tr>
    <td class="flag-emoji">${value.flag || "-"}</td>
    <td><a class="country-link" ${countryHref}>${value.country}</a></td>
    <td>${value.code || "-"}</td>
    <td>
      <div class="progress br-30">
          <div class="progress-bar br-30 bg-${impactLevel}" role="progressbar" style="width: ${impactPercentage}%" aria-valuenow="${impactPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </td>
    <td>${value.continent}</td>
    <td>${value.cases}</td>
    ${tdDiff("cases")}
    <td>${value.deaths}</td>
    ${tdDiff("deaths")}
    <td>${value.recovered}</td>
    ${tdDiff("recovered", 1)}
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
    window.render.table({
      id: "#countriesTable",
      lastUpdate: formatDate(new Date(pageData.scmp.last_updated)),
      lengthMenu: [10, 30, 50, 100, 500],
      order: [[3, "desc"]],
      pageLength: 50,
      tableRows: tableRows,
    });

    window.render.piechart({
      colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"],
      labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
      series: [
        pageData.scmp.stats.cases,
        pageData.scmp.stats.recovered,
        pageData.scmp.stats.unresolved,
        pageData.scmp.stats.deaths,
      ],
      title: "Impact so far",
    });

    window.render.chart({
      categories: selectLast(seriesLabels, ViewsConfig.Main.COMPARE_CHART_DAYS),
      colors: ["#5c1ac3", "#ffbb44"],
      id: "#basicChart",
      series: [
        {
          data: selectLast(seriesDeaths, ViewsConfig.Main.COMPARE_CHART_DAYS),
          name: "Deaths",
        },
        {
          data: selectLast(
            seriesRecovered,
            ViewsConfig.Main.COMPARE_CHART_DAYS
          ),
          name: "Recovered",
        },
      ],
      title: `Deaths vs. Recovered (${ViewsConfig.Main.COMPARE_CHART_DAYS} Days)`,
    });

    for (let con in pageData.scmp.continents) {
      pageData.scmp.continents[con].fatalityRate = Number(
        (
          (pageData.scmp.continents[con].deaths /
            pageData.scmp.continents[con].cases) *
          100
        ).toFixed(2)
      );
    }

    const renderChartContinents = () => {
      const renderContinents = (id, cc, title) => {
        const continentsByProperty = (cc, name) => {
          const arr = [];
          for (let con in cc) {
            arr.push(cc[con][name]);
          }
          return arr;
        };

        window.render.compareChart({
          categories: Object.keys(cc),
          id: id,
          series: [
            {
              data: continentsByProperty(cc, "cases"),
              name: "Cases",
            },
            {
              data: continentsByProperty(cc, "recovered"),
              name: "Recovered",
            },

            {
              data: continentsByProperty(cc, "fatalityRate"),
              name: "Fatality Rate",
            },
            {
              data: continentsByProperty(cc, "deaths"),
              name: "Deaths",
            },
            {
              data: continentsByProperty(cc, "critical"),
              name: "Critical",
            },
          ],
          title: title,
        });
      };

      const cc1 = {};
      const cc2 = {};
      const cc3 = {};

      let i = 0;
      for (let continentName in pageData.scmp.continents) {
        if (i < 3) {
          cc1[continentName] = pageData.scmp.continents[continentName];
        } else if (i < 6) {
          cc2[continentName] = pageData.scmp.continents[continentName];
        } else {
          cc3[continentName] = pageData.scmp.continents[continentName];
        }
        i++;
      }
      renderContinents("#chartColumnStacked-1", cc1, "Top Continents");
      renderContinents("#chartColumnStacked-2", cc2, "Other Continents");
      renderContinents("#chartColumnStacked-3", cc3, "Other Continents");
    };
    renderChartContinents();

    window.render.autocomplete({
      id: "#autocomplete-dynamic",
      lookup: pageData.scmp.ac,
      onEnter: (text) => countriesModule.code(text),
    });
  };

  if (!window.view) {
    window.view = {};
  }

  window.view.main = init;
})();
