/**
 * index.js
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

// function indexSlider(){
//     $("#theTarget").skippr();
// }





backToTop();
// indexSlider();

