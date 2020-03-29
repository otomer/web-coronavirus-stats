/*jslint  browser: true, white: true, plusplus: true */
/*global $, countries */

$(function() {
  "use strict";

  var countriesArray = $.map(countries, function(value, key) {
    return { value: value, data: key };
  });

  // Setup jQuery ajax mock:
  // $.mockjax({
  //   url: "*",
  //   responseTime: 2000,
  //   response: function(settings) {
  //     var query = settings.data.query,
  //       queryLowerCase = query.toLowerCase(),
  //       re = new RegExp(
  //         "\\b" + $.Autocomplete.utils.escapeRegExChars(queryLowerCase),
  //         "gi"
  //       ),
  //       suggestions = $.grep(countriesArray, function(country) {
  //         // return country.value.toLowerCase().indexOf(queryLowerCase) === 0;
  //         return re.test(country.value);
  //       }),
  //       response = {
  //         query: query,
  //         suggestions: suggestions
  //       };

  //     this.responseText = JSON.stringify(response);
  //   }
  // });
  var options = [
    { value: "Adam", data: "AD" },
    // ...
    { value: "Tim", data: "TM" }
  ];
  // Initialize autocomplete with custom appendTo:
  $("#autocomplete-dynamic").autocomplete({
    lookup: countriesArray
  });
});
