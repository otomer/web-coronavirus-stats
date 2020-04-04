(function () {
  const renderChart = (options) => {
    /*
        ===================================
            Unique Visitors | Options
        ===================================
    */

    var d_1options1 = {
      chart: {
        dropShadow: {
          blur: 1,
          color: "#515365",
          enabled: true,
          left: 1,
          opacity: 0.3,
          top: 1,
        },
        height: 350,
        toolbar: {
          show: false,
        },
        type: "bar",
      },
      colors: options.colors,
      dataLabels: {
        enabled: false,
      },
      fill: {
        gradient: {
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          shade: "dark",
          shadeIntensity: 0.3,
          stops: [0, 100],
          type: "vertical",
        },
        type: "gradient",
      },
      grid: {
        borderColor: "#191e3a",
      },
      legend: {
        fontSize: "14px",
        horizontalAlign: "center",
        itemMargin: {
          horizontal: 0,
          vertical: 8,
        },
        markers: {
          height: 10,
          width: 10,
        },
        position: "bottom",
      },
      plotOptions: {
        bar: {
          columnWidth: "55%",
          endingShape: "rounded",
          horizontal: false,
        },
      },
      series: options.series,
      stroke: {
        colors: ["transparent"],
        show: true,
        width: 2,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
      xaxis: {
        categories: options.categories,
      },
    };

    const container = document.querySelector(options.id);
    $(".chart-7 .title").html(options.title);
    var d_1C_3 = new ApexCharts(container, d_1options1);
    d_1C_3.render();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.chart = renderChart;
})();
