(function() {
  const renderChart = options => {
    /*
        ===================================
            Unique Visitors | Options
        ===================================
    */

    var d_1options1 = {
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: "#515365",
          opacity: 0.3
        }
      },
      colors: ["#5c1ac3", "#ffbb44"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          width: 10,
          height: 10
        },
        itemMargin: {
          horizontal: 0,
          vertical: 8
        }
      },
      grid: {
        borderColor: "#191e3a"
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      series: options.series,
      xaxis: {
        categories: options.categories
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.3,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function(val) {
            return val;
          }
        }
      }
    };

    /*
        ===================================
            Unique Visitors | Script
        ===================================
    */
    const container = document.querySelector("#uniqueVisits");
    $(".chart-7 .title").html(options.title);
    var d_1C_3 = new ApexCharts(container, d_1options1);
    d_1C_3.render();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.chart = renderChart;
})();
