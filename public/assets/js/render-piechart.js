(function () {
  const renderPiechart = (options) => {
    const pieChartOptions = {
      chart: {
        type: "donut",
        width: 380,
      },
      colors: options.colors,
      dataLabels: {
        enabled: true,
      },
      labels: options.labels,
      legend: {
        fontSize: "13px",
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
        pie: {
          donut: {
            background: "transparent",
            labels: {
              name: {
                color: undefined,
                fontFamily: "Quicksand, sans-serif",
                fontSize: "29px",
                offsetY: -10,
                show: true,
              },
              show: true,
              total: {
                color: "#888ea8",
                formatter: function (w) {
                  return numberWithCommas(
                    w.globals.seriesTotals.reduce(function (a, b) {
                      return a + b;
                    }, 0)
                  );
                },
                label: "Total",
                show: true,
                showAlways: true,
              },
              value: {
                color: "#bfc9d4",
                fontFamily: "Quicksand, sans-serif",
                fontSize: "18px",
                formatter: function (val) {
                  return numberWithCommas(val);
                },
                offsetY: 16,
                show: true,
              },
            },
            size: "65%",
          },
        },
      },
      responsive: [
        {
          breakpoint: 1599,
          options: {
            chart: {
              height: "400px",
              width: "350px",
            },
            legend: {
              position: "top",
            },
          },

          breakpoint: 1439,
          options: {
            chart: {
              height: "390px",
              width: "250px",
            },
            legend: {
              position: "bottom",
            },
            plotOptions: {
              pie: {
                donut: {
                  size: "65%",
                },
              },
            },
          },
        },
      ],
      series: options.series,
      stroke: {
        colors: "#0e1726",
        show: true,
        width: 10,
      },
    };
    $("#pieChartTitle").html(options.title);
    const worldImpactPie = new ApexCharts(
      document.querySelector("#worldImpactPie"),
      pieChartOptions
    );
    worldImpactPie.render();
  };

  if (!window.render) {
    window.render = {};
  }
  window.render.piechart = renderPiechart;
})();
