(function() {
  const renderCompareChart = options => {
    var sColStacked = {
      chart: {
        height: 350,
        type: "bar",
        stacked: true,
        toolbar: {
          show: false
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      series: options.series,
      xaxis: {
        type: "string",
        categories: options.categories
      },
      legend: {
        position: "right",
        offsetY: 40
      },
      fill: {
        opacity: 1
      }
    };

    var chart = new ApexCharts(
      document.querySelector(options.id).querySelector(".s-col-stacked"),
      sColStacked
    );

    $(options.id)
      .find(".stacked-title")
      .html(options.title);
    chart.render();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.compareChart = renderCompareChart;
})();
