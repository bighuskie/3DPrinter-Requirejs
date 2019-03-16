define(["jquery"], function($) {
  "use strict";
  $(document).scroll(function() {
    var scrollTop = $(this).scrollTop();
    var $locateIcon = $(".explain-wrapper span");
    if (scrollTop >= 900) {
      $locateIcon.fadeIn("slow");
    } else {
      $locateIcon.fadeOut("slow");
    }
  });
});
