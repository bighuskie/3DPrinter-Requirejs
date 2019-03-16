define(["jquery"], function($) {
  "use strict";
  $(document).scroll(function() {
    var scrollTop = $(this).scrollTop();
    if (scrollTop >= 900) {
      $(".explain-wrapper span").fadeIn("slow");
    }
  });
});
