/**
 * modelbase.js for modelbase
 * github:https://github.com/hbsndg
 * @author huangbo
 */

function backToTop() {
    $("#backTop").click(function() {
        console.log(11);
        $('body,html').animate({scrollTop:0},800);
        return false;
    });
}

function mSlider(){
    $("#mbanner").skippr();
}

function indexSlider(){
  $("#mindexSlider").skippr();
}

backToTop();
mSlider();
indexSlider();
