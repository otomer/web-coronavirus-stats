(function() {
  const renderAutocomplete = options => {
    const navigateToCountry = code => {
      window.location.href = "/index.html?country=" + code;
    };
    const selector = $(options.id);
    // Initialize autocomplete with custom appendTo:
    selector.autocomplete({
      lookup: options.lookup,
      onSelect: function(suggestion) {
        navigateToCountry(suggestion.data);
      }
    });
    selector.keypress(function(e) {
      var code = e.keyCode ? e.keyCode : e.which;
      //Enter keycode
      if (code == 13) {
        const countryCode = options.onEnter(selector.val());
        if (countryCode) {
          navigateToCountry(countryCode);
        }
        return false;
      }
    });
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.autocomplete = renderAutocomplete;
})();
