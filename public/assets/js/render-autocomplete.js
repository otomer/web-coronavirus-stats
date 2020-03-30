(function() {
  const renderAutocomplete = options => {
    // Initialize autocomplete with custom appendTo:
    $("#autocomplete-dynamic").autocomplete({
      lookup: options.lookup,
      onSelect: function(suggestion) {
        alert("a");
        window.location.href = "/index.html?country=" + suggestion.data;
      }
    });
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.autocomplete = renderAutocomplete;
})();
