(function() {
  const renderGraph = options => {
    var options1 = {
      chart: {
        fontFamily: "Quicksand, sans-serif",
        height: 365,
        type: "area",
        zoom: {
          enabled: false
        },
        dropShadow: {
          enabled: true,
          opacity: 0.3,
          blur: 5,
          left: -7,
          top: 22
        },
        toolbar: {
          show: false
        },
        events: {
          mounted: function(ctx, config) {
            const highest1 = ctx.getHighestValueInSeries(0);
            const highest2 = ctx.getHighestValueInSeries(1);

            ctx.addPointAnnotation({
              x: new Date(
                ctx.w.globals.seriesX[0][
                  ctx.w.globals.series[0].indexOf(highest1)
                ]
              ).getTime(),
              y: highest1,
              label: {
                style: {
                  cssClass: "d-none"
                }
              },
              customSVG: {
                SVG:
                  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#1b55e2" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                cssClass: undefined,
                offsetX: -8,
                offsetY: 5
              }
            });

            ctx.addPointAnnotation({
              x: new Date(
                ctx.w.globals.seriesX[1][
                  ctx.w.globals.series[1].indexOf(highest2)
                ]
              ).getTime(),
              y: highest2,
              label: {
                style: {
                  cssClass: "d-none"
                }
              },
              customSVG: {
                SVG:
                  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#e7515a" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-circle"><circle cx="12" cy="12" r="10"></circle></svg>',
                cssClass: undefined,
                offsetX: -8,
                offsetY: 5
              }
            });
          }
        }
      },
      colors: ["#1b55e2", "#e7515a", "#3cba92"],
      dataLabels: {
        enabled: false
      },
      markers: {
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: 7,
            fillColor: "#000",
            strokeColor: "#000",
            size: 5
          },
          {
            seriesIndex: 2,
            dataPointIndex: 11,
            fillColor: "#000",
            strokeColor: "#000",
            size: 4
          }
        ]
      },
      subtitle: {
        text: "Fatality Rate",
        align: "left",
        margin: 0,
        offsetX: -10,
        offsetY: 35,
        floating: false,
        style: {
          fontSize: "14px",
          color: "#888ea8"
        }
      },
      title: {
        text: options.subtitle,
        align: "left",
        margin: 0,
        offsetX: -10,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: "25px",
          color: "#bfc9d4"
        }
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square"
      },
      series: options.series,
      labels: options.labels,
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
            fontSize: "12px",
            fontFamily: "Quicksand, sans-serif",
            cssClass: "apexcharts-xaxis-title"
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
            fontSize: "12px",
            fontFamily: "Quicksand, sans-serif",
            cssClass: "apexcharts-yaxis-title"
          }
        }
      },
      grid: {
        borderColor: "#191e3a",
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
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: -10
        }
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        offsetY: -50,
        fontSize: "16px",
        fontFamily: "Quicksand, sans-serif",
        markers: {
          width: 10,
          height: 10,
          strokeWidth: 0,
          strokeColor: "#fff",
          fillColors: undefined,
          radius: 12,
          onClick: undefined,
          offsetX: 0,
          offsetY: 0
        },
        itemMargin: {
          horizontal: 0,
          vertical: 20
        }
      },
      tooltip: {
        theme: "dark",
        marker: {
          show: true
        },
        x: {
          show: false
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: 0.28,
          opacityTo: 0.05,
          stops: [45, 100]
        }
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
      ]
    };

    $(".mainGraphTitle").html(options.title);
    var chart1 = new ApexCharts(document.querySelector("#mainGraph"), options1);
    chart1.render();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.graph = renderGraph;
})();
