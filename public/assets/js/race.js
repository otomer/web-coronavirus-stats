$(function () {
  am4core.ready(function () {
    const fetchRace = (cc) => $.getJSON(`/api/race`);
    const handleRaceResponse = (raceResponse) => {
      window.render.autocomplete({
        id: "#autocomplete-dynamic",
        lookup: raceResponse.data.ac,
        onEnter: (text) => countriesModule.code(text),
      });

      initRaceChart(raceResponse.data.race);
    };

    fetchRace()
      .then((res) => handleRaceResponse(res))
      .catch((res) => {
        console.log("err", res);
      });
  }); // end am4core.ready()
});

const initRaceChart = (allData) => {
  var startDateString = "2020-01-22";
  var startDate = new Date(startDateString);
  var maxDate = new Date();

  var interpolationDurationFactor = 4;
  var stepDuration = 1000;

  // Themes begin
  am4core.useTheme(am4themes_dark);

  am4core.useTheme(am4themes_animated);
  // Themes end
  am4core.globalAdapter.addAll(2);
  var chart = am4core.create("chartdiv", am4charts.XYChart);

  var padding = 5;
  chart.padding(padding, padding, padding, padding);
  chart.numberFormatter.numberFormat = "0.00";
  var label = chart.plotContainer.createChild(am4core.Label);
  label.x = am4core.percent(97);
  label.y = am4core.percent(95);
  label.horizontalCenter = "right";
  label.verticalCenter = "middle";
  label.dx = -15;
  label.fontSize = 30;

  // Do not crop bullets
  // chart.maskBullets = false;
  // Remove padding
  // chart.paddingBottom = 0;

  var playButton = chart.plotContainer.createChild(am4core.PlayButton);
  playButton.x = am4core.percent(97);
  playButton.y = am4core.percent(95);
  playButton.dy = -2;
  playButton.verticalCenter = "middle";
  playButton.events.on("toggled", function (event) {
    if (event.target.isActive) {
      play();
    } else {
      stop();
    }
  });

  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.dataFields.category = "countryCategory";
  categoryAxis.renderer.minGridDistance = 1;
  categoryAxis.renderer.inversed = true;
  categoryAxis.renderer.grid.template.disabled = true;

  var image = new am4core.Image();
  image.horizontalCenter = "middle";
  image.width = 20;
  image.height = 20;
  image.verticalCenter = "middle";
  image.adapter.add("href", (href, target) => {
    let category = target.dataItem.category;
    if (category) {
      switch (category) {
        case "El Salvador":
          category = "Salvador";
          break;
        case "Poland":
          category = "Republic of Poland";
          break;
        case "Timor-Leste":
          category = "East Timor";
          break;
        case "Uzbekistan":
          category = "Uzbekistn";
          break;
      }

      return (
        "https://www.amcharts.com/wp-content/uploads/flags/" +
        category.split(" ").join("-").toLowerCase() +
        ".svg"
      );
    }
    return href;
  });
  categoryAxis.dataItems.template.bullet = image;

  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.rangeChangeEasing = am4core.ease.linear;
  valueAxis.rangeChangeDuration = stepDuration;
  valueAxis.extraMax = 0.1;
  valueAxis.renderer.grid.template.strokeDasharray = "4,4";
  // valueAxis.renderer.labels.template.disabled = true;

  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.categoryY = "countryCategory";
  series.dataFields.valueX = "countryValue";
  series.tooltipText = "{valueX.value}";
  series.columns.template.strokeOpacity = 0;
  series.columns.template.column.cornerRadiusBottomRight = 5;
  series.columns.maxColumns = 1;
  series.columns.template.column.cornerRadiusTopRight = 5;
  series.columns.template.tooltipText = "{categoryY}: [bold]{valueX}[/b]";

  series.interpolationDuration = stepDuration;
  series.interpolationEasing = am4core.ease.linear;
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.horizontalCenter = "right";
  labelBullet.label.text = "{values.valueX.workingValue}";
  labelBullet.label.textAlign = "end";
  labelBullet.label.dx = -30;
  labelBullet.label.fontWeight = "bold";
  labelBullet.label.maxColumns = 1;
  chart.zoomOutButton.disabled = false;

  var bullet = series.bullets.push(new am4charts.Bullet());
  var image = bullet.createChild(am4core.Image);
  image.horizontalCenter = "left";
  image.verticalCenter = "bottom";
  image.dy = 20;
  image.y = am4core.percent(100);
  image.propertyFields.href = "bullet";
  image.tooltipText = series.columns.template.tooltipText;
  image.propertyFields.fill = "color";
  image.filters.push(new am4core.DropShadowFilter());
  image.heightRatio = 0.5;
  // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
  series.columns.template.adapter.add("fill", function (fill, target) {
    return chart.colors.getIndex(target.dataItem.index);
  });

  var currentDate = startDate;
  label.text = currentDate.toLocaleDateString();

  var interval;

  function play() {
    interval = setInterval(function () {
      nextDay();
    }, stepDuration);
    nextDay();
  }

  function stop() {
    if (interval) {
      clearInterval(interval);
    }
  }

  function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);

    if (currentDate > maxDate) {
      currentDate = new Date(startDateString);
    }

    var dateString = currentDate.toLocaleDateString();
    var newData = allData[dateString];
    var itemsWithNonZero = 0;
    for (var i = 0; i < chart.data.length; i++) {
      chart.data[i].countryValue = newData[i].countryValue;
      if (chart.data[i].countryValue > 0) {
        itemsWithNonZero++;
      }
    }

    if (itemsWithNonZero > 25) {
      itemsWithNonZero = 25;
    }

    if (currentDate == startDate) {
      series.interpolationDuration = stepDuration / interpolationDurationFactor;
      valueAxis.rangeChangeDuration =
        stepDuration / interpolationDurationFactor;
    } else {
      series.interpolationDuration = stepDuration;
      valueAxis.rangeChangeDuration = stepDuration;
    }

    chart.invalidateRawData();
    label.text = currentDate.toLocaleDateString();

    categoryAxis.zoom({
      end: itemsWithNonZero / categoryAxis.dataItems.length,
      start: 0,
    });
  }

  categoryAxis.sortBySeries = series;

  chart.data = JSON.parse(
    JSON.stringify(allData[currentDate.toLocaleDateString()])
  );
  categoryAxis.zoom({ end: 1 / chart.data.length, start: 0 });

  series.events.on("inited", function () {
    setTimeout(function () {
      playButton.isActive = true; // this          starts interval
    }, 2000);
  });
  setTimeout(() => window.render.loaded(), 1000);
};
