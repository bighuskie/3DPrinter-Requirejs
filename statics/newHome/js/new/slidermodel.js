/**
 * Created by huangbo on 2017/6/26 026.
 */

function showModelSlide() {
  $("#slideModel1").slide({
    mainCell:".modelSlide"
  });
  $("#slideModel2").slide({
    mainCell:".modelSlide"
  });
  $("#slideModel3").slide({
    mainCell:".modelSlide"
  });
  $("#slideModel4").slide({
    mainCell:".modelSlide"
  });
  $("#slideModel1,#slideModel2,#slideModel3,#slideModel4").hover(function(){
    jQuery(this).find(".slidenav").stop(true,true).fadeIn(300)
  },function(){
    jQuery(this).find(".slidenav").fadeOut(300)
  });
}

showModelSlide();