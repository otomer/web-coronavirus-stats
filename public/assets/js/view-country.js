(function () {
  const init = (options) => {
    const country = options.country;
    const title = options.selectors.title;
    const countryIndicator = options.selectors.countryIndicator;

    $("#rowChartStacked").hide();
    title.html(`${country.country} Live Statistics`);
    countryIndicator.html(`${country.flag}&nbsp;
        <div class="media-body align-self-center">
          <h6>${country.country}</h6>
        </div>`);

    window.render.loaded();

    window.render.autocomplete({
      lookup: country.ac,
      id: "#autocomplete-dynamic",
      onEnter: (text) => countriesModule.code(text),
    });

    window.render.counters([
      {
        value: country.cases,
        title: "Cases",
      },
      { value: country.critical, title: "Critical" },
      { value: country.deaths, title: "Deaths" },
      { value: country.fatalityRate, title: "Fatality Rate" },
    ]);
    const fatalityRate = Number(country.fatalityRate) + "%";
    const tsGraph = selectLast(
      country.timeseries,
      ViewsConfig.Country.GRAPH_DAYS
    );
    window.render.graph({
      title: `Impact over time (${ViewsConfig.Country.GRAPH_DAYS} Days)`,
      colors: ["#1b55e2", "#e7515a", "#3cba92"],
      subtitle: fatalityRate,
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
      labels: tsGraph.map((c) => c.date),
    });

    window.render.piechart({
      title: "Impact so far",
      labels: ["Cases", "Recovered", "Unresolved", "Deaths"],
      colors: ["#1b55e2", "#3cba92", "#e2a03f", "#e7515a"],
      series: [
        country.cases,
        country.recovered,
        country.unresolved,
        country.deaths,
      ],
    });

    const tsPiechart = selectLast(
      country.timeseries,
      ViewsConfig.Country.COMPARE_CHART_DAYS
    );
    window.render.chart({
      title: `Deaths vs. Recovered (Last ${ViewsConfig.Country.COMPARE_CHART_DAYS} Days)`,
      categories: tsPiechart.map((c) => c.date),
      series: [
        {
          name: "Deaths",
          data: tsPiechart.map((c) => c.deaths),
        },
        {
          name: "Recovered",
          data: tsPiechart.map((c) => c.recovered),
        },
      ],
    });

    let tableRows = "";
    country.timeseries.forEach((v, i, arr) => {
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
      tableRows: tableRows,
      lengthMenu: [10, 30, 50, 100, 500],
      pageLength: 30,
      order: [[0, "desc"]],
    });
  };

  window.view = {
    country: init,
  };
})();
