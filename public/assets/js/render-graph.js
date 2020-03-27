(function() {
  const renderGraph = options => {
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
      colors: options.colors,
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
      labels: options.labels,
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
      series: options.series,
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
    $("#mainGraphTitle").html(options.title);
    const mainGraph = new ApexCharts(
      document.querySelector("#mainGraph"),
      mainGraphOptions
    );
    mainGraph.render();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.graph = renderGraph;
})();
