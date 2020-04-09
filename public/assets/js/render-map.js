(function () {
  const renderMap = (options) => {
    $("body").on("map-selectRegion", function (event, countryCode) {
      updateSelectedCountryCharts(options.getCountryData(countryCode));
    });

    $(options.id).vectorMap({
      backgroundColor: "#5c1ac3",
      borderColor: "#818181",
      borderOpacity: 0.25,
      borderWidth: 1,
      color: "#f4f3f0",
      enableZoom: true,
      hoverColor: "#060818",
      hoverOpacity: null,
      map: "world_mill_en",
      markerStyle: {
        initial: {
          fill: "#fff",
          "fill-opacity": 1,
          r: 9,
          stroke: "#000",
          "stroke-opacity": 0.4,
          "stroke-width": 5,
        },
      },
      normalizeFunction: "linear",
      onRegionClick: function (element, code, region) {
        $("body").trigger("map-selectRegion", [code.toUpperCase()]);
      },
      regionStyle: {
        initial: {
          fill: "#fff",
        },
      },
      regionsSelectable: true,
      regionsSelectableOne: true,
      scaleColors: ["#b6d6ff", "#005ace"],
      selectedColor: "#c9dfaf",
      selectedRegions: [options.selectedRegion()],
      showLabels: true,
      showLabels: true,
      showTooltip: true,
    });
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.map = renderMap;
})();
