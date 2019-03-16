(function() {
  requirejs.config({
    baseUrl: "./assets/js/",
    paths: {
      jquery: "libs/Jquery/jquery-1.12.4",
      animate: "animate"
    }
  });
  requirejs(["animate"], function(animate) {
    
  });
})();
