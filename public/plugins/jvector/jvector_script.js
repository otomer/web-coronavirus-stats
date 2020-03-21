$(function() {
  $("#world-map").vectorMap({
    map: "world_mill_en",
    backgroundColor: "#5c1ac3",

    borderColor: "#818181",
    borderOpacity: 0.25,
    borderWidth: 1,
    color: "#f4f3f0",
    regionStyle: {
      initial: {
        fill: "#fff"
      }
    },
    showLabels: true,
    markerStyle: {
      initial: {
        r: 9,
        fill: "#fff",
        "fill-opacity": 1,
        stroke: "#000",
        "stroke-width": 5,
        "stroke-opacity": 0.4
      }
    },
    enableZoom: true,
    hoverColor: "#060818",
    hoverOpacity: null,

    showLabels: true,
    normalizeFunction: "linear",
    scaleColors: ["#b6d6ff", "#005ace"],
    selectedColor: "#c9dfaf",
    selectedRegions: [],

    onRegionClick: function(element, code, region) {
      $("body").trigger("map-selectRegion", [code.toUpperCase()]);
    },

    showTooltip: true
  });
});
