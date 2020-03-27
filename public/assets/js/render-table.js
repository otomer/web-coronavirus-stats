(function() {
  const renderTable = options => {
    const table = $(options.id);
    table.find("tbody").html(options.tableRows);
    table.DataTable({
      lengthMenu: options.lengthMenu,
      oLanguage: {
        oPaginate: {
          sNext:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
          sPrevious:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>'
        },
        sInfo: "Showing page _PAGE_ of _PAGES_",
        sLengthMenu: `Results (Last update @ ${options.lastUpdate}) :  _MENU_`,
        sSearch:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        sSearchPlaceholder: "Search..."
      },
      order: options.order,
      ordering: true,
      pageLength: options.pageLength,
      stripeClasses: []
    });
    table.show();
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.table = renderTable;
})();
