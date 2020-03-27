(function() {
  const renderCounters = stats => {
    const counters = $("#cd-simple");

    const addCounter = (value, name) => {
      counters.append(`<div class="countdown">
      <div class="clock-count-container">
        <h1 class="clock-val">${numberWithCommas(value)}</h1>
      </div>
      <h4 class="clock-text">${name}</h4>
    </div>`);
    };

    stats.forEach(function(v, i, arr) {
      if (v.value >= 0) {
        addCounter(v.value, v.title);
      }
    });
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.counters = renderCounters;
})();
