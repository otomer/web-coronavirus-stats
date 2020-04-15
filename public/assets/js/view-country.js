(function () {
  const ViewsConfig = {
    Country: {
      COMPARE_CHART_DAYS: 10,
      GRAPH_DAYS: 30,
    },
  };

  const init = (options) => {
    const country = options.country;

    $("#rowChartStacked").hide();

    options.selectors.title.html(
      `${country.country} (${country.continent}) Live Statistics`
    );
    options.selectors.countryIndicator.html(`${country.flag}&nbsp;
        <div class="media-body align-self-center">
          <h6>${country.country}</h6>
        </div>`);

    //Remove loader
    window.render.loaded();

    window.render.autocomplete({
      id: "#autocomplete-dynamic",
      lookup: country.ac,
      onEnter: (text) => countriesModule.code(text),
    });

    window.render.counters([
      {
        title: "Cases",
        value: country.cases,
      },
      { title: "Critical", value: country.critical },
      { title: "Deaths", value: country.deaths },
      { title: "Fatality Rate", value: country.fatalityRate },
      { title: "Unresolved", value: country.unresolved },
    ]);
    const fatalityRate = Number(country.fatalityRate) + "%";
    const tsGraph = selectLast(
      country.timeseries,
      ViewsConfig.Country.GRAPH_DAYS
    );
    window.render.graph({
      colors: ["#1b55e2", "#e7515a", "#3cba92"],
      labels: tsGraph.map((c) => c.date),
      series: [
        {
          data: tsGraph.map((c) => c.confirmed),
          name: "Cases",
        },
        {
          data: tsGraph.map((c) => c.deaths),
          name: "Deaths",
        },
        {
          data: tsGraph.map((c) => c.recovered),
          name: "Recovered",
        },
      ],
      subtitle: fatalityRate,
      title: `Impact over time (${ViewsConfig.Country.GRAPH_DAYS} Days)`,
    });

    window.render.piechart({
      colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"],
      labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
      series: [
        country.cases,
        country.recovered,
        country.unresolved,
        country.deaths,
      ],
      title: "Impact so far",
    });

    const tsPiechart = selectLast(
      country.timeseries,
      ViewsConfig.Country.COMPARE_CHART_DAYS
    );
    window.render.chart({
      categories: tsPiechart.map((c) => c.date),
      colors: ["#5c1ac3", "#ffbb44"],
      id: "#basicChart",
      series: [
        {
          data: tsPiechart.map((c) => c.deaths),
          name: "Deaths",
        },
        {
          data: tsPiechart.map((c) => c.recovered),
          name: "Recovered",
        },
        // {
        //   data: tsPiechart.map((c) => c.confirmed),
        //   name: "Confirmed",
        // },
      ],
      title: `Deaths vs. Recovered (Last ${ViewsConfig.Country.COMPARE_CHART_DAYS} Days)`,
    });

    let tableRows = "";
    country.timeseries.forEach((v, i, arr) => {
      const d = new Date(v.date);
      tableRows += `
          <tr>
            <td>${v.date}</td>
            <td>${v.confirmed}</td>
            ${convertDiffToTd(v.diffConfirmed)}
            <td>${v.deaths}</td>
            ${convertDiffToTd(v.diffDeaths)}
            <td>${v.recovered}</td>
            ${convertDiffToTd(v.diffRecovered, 1)}
          </tr>`;
    });

    window.render.table({
      id: "#countryTable",
      lastUpdate: selectLast(country.timeseries, 1)[0].date,
      lengthMenu: [10, 30, 50, 100, 500],
      order: [[0, "desc"]],
      pageLength: 30,
      tableRows: tableRows,
    });
  };

  if (!window.view) {
    window.view = {};
  }

  window.view.country = init;
})();
