define(["jquery"], function($) {
  "use strict";
  $(document).scroll(function() {
    var scrollTop = $(this).scrollTop();
    document.title = scrollTop;
    var $locateIcon = $(".explain-wrapper span");
    if (scrollTop >= 900) {
      $(".explain-wrapper span").fadeIn("slow");
    } else {
      $(".explain-wrapper span").fadeOut("slow");
    }
  });
});
