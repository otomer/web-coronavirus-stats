/*
=================================
Hide page loader
=================================
*/

(function() {
  const loaded = () => {
    var load_screen = document.getElementById("load_screen");
    document.body.removeChild(load_screen);
  };
  if (!window.render) {
    window.render = {};
  }
  window.render.loaded = loaded;
})();
