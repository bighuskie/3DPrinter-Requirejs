/**
 * base.js
 * github:https://github.com/hbsndg
 * @author huangbo
 */

function includeCommon() {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
    $("#page").load("page.html");
}
$(window).scroll(function(){
    var sigh = $(window).scrollTop() -( $(document).height() - $(window).height());
    if(sigh>=(-530)){
       $(".opt").css({"bottom":"525px"});
       $(".opt_index").css({"bottom":"525px"});
    }else{
       $(".opt").css({"bottom":"0"});
        $(".opt_index").css({"bottom":"0"});
    }

    var sigh2 = $(window).scrollTop() -( $(document).height() - $(window).height());
    if(sigh2>=(-1900)){
        $(".navpanel").css({"top":"10px","position":"fixed"});
    }else{
        $(".navpanel").css({"top":"370px","position":"absolute"});
    }
});


function resizeMdHeight(){
    $(".md_left").height($(".md_right").height());

}

function resizeRight() {
    $(".md_item_left").each(function(e){
        var rightHeight = $(this).siblings(".md_item_right").height();
        $(this).height(rightHeight);
    });
}

includeCommon();

resizeMdHeight();

resizeRight();

