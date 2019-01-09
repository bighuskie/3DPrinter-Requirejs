
(function($){

	$.fn.myScroll = function(options){

		//默认配置
		var defaults = {
			speed:40,  //滚动速度,值越大速度越慢
			rowHeight:40 //每行的高度
		};
	
		var opts = $.extend({}, defaults, options),intId = [];
	
		function marquee(obj, step){
			
			obj.find("ul").animate({
				marginTop: '-=1'
			},0,function(){
				var s = Math.abs(parseInt($(this).css("margin-top")));
				if(s >= step){
					$(this).find("li").slice(0, 1).appendTo($(this));
					$(this).css("margin-top", 0);
				}
			});
		}
		this.each(function(i){
			var sh = opts["rowHeight"],speed = opts["speed"],_this = $(this);
			intId[i] = setInterval(function(){
				if(_this.find("ul").height()<=_this.height()){
					clearInterval(intId[i]);
				}else{
					marquee(_this, sh);
				}
			}, speed);

			_this.hover(function(){
				clearInterval(intId[i]);
			},function(){
				intId[i] = setInterval(function(){
					if(_this.find("ul").height()<=_this.height()){
						clearInterval(intId[i]);
					}else{
						marquee(_this, sh);
					}
				}, speed);
			});
		
		});

	}

})(jQuery);



$(document).ready(function(e) {

	


	headerfun();
	$(window).resize(function(e) {
       headerfun(); 
    });

    $(".nav li a").hover(function(){
    	if(!$(this).hasClass('sel')){
    		$(this).find('.nav_wire').animate({left:"0px",width:"100%"},200);
    	}
    },function(){
    	if(!$(this).hasClass('sel')){
    		$(this).find('.nav_wire').animate({left:"50%",width:"0"},200);
    	}
    })

    $('.jq_search_a a').click(function(){
    	$('.jq_search_cont').html($(this).html());
    	$(this).parents('.search_left_cont').hide();
    })

    $('.search_left').hover(function(){
    	$(this).find('.search_left_cont').show();
    },function(){
    	$(this).find('.search_left_cont').hide();
    })

	//alert
	$.alert = function(s,onclose,title,okval,minwid,bodyclass) {
		var butok = '',
			bodystyle = '';

		title ? title = title : title = '提示信息';
		okval ? okval = okval : okval = '确定';
		minwid ? minwid = minwid : minwid = 370;

		if(!(bodyclass === false)){
			bodyclass = true;
		}

		if(okval){
			butok = '<p class="t_c m_t_b_20"><button type="button" class="green_but blue" id="dialog_ok">'+okval+'</button></p>';
		}
		if(bodyclass){
			bodystyle = 't_c p_t_b_20 line_h_30'
		}
		s = '<div class="'+bodystyle+'">' + s + '</div>'+butok;
		if(!document.getElementById('dialog_alert')){
			$('<div class="dialog border shadow" title="'+title+'" id="dialog_alert" style="display: none;">'+s+'</div>').appendTo('body');
		}else{
			$("#dialog_alert").html(s);
		}
		var jdialog_box = $('#dialog_alert');
		jdialog_box.dialog({modal: true,resizable: false, minWidth:minwid, closeOnEscape: false});//.dialog({open: true, modal: true, body: s, onclose: onclose});
		var dialog_ok = $('#dialog_alert #dialog_ok');
		dialog_ok.off('click').on('click', function() {
			if(!onclose || onclose && onclose() !== false) {
				
				$('#dialog_alert').dialog('destroy');
			}
		});
		return jdialog_box;
	}

	//confirm
	$.confirm = function(s,onok,onclose,minwid,title,okcont,cancelcont,readyfun,hid) {
		
		minwid ? minwid = minwid : minwid = 540;
		title ? title = title : title = '提示信息';
		okcont ? okcont = okcont : okcont = '确定';
		cancelcont ? cancelcont = cancelcont : cancelcont = "取消";
		hid ? hid = "confirm_title" : hid = "";

		var s = '<p class="t_c p_t_b_20 line_h_30 body">'+s+'</p><p class="t_c m_b_20"><button type="button" class="green_but button blue m_r_15" id="dialog_ok">'+okcont+'</button> <button type="button" class="but_null button grey"  id="dialog_cancel">'+cancelcont+'</button></p>';
		if(!document.getElementById('dialog_confirm')){
			$('<div class="dialog border shadow" title="'+title+'" id="dialog_confirm" style="display: none;">'+s+'</div>').appendTo('body');
		}else{
			$("#dialog_confirm").html(s);
		}
		if(readyfun){
			setTimeout(function(){readyfun();},500) 
		}
		var jdialog_box = $('#dialog_confirm');
		jdialog_box.dialog({modal: true,resizable: false, minWidth:minwid, closeOnEscape: false , dialogClass: hid});
		var jdialog_ok = $('#dialog_confirm #dialog_ok');
		var jdialog_cancel = $('#dialog_confirm #dialog_cancel');
		jdialog_ok.off('click').on('click', function() {
			if(!onok || onok && onok() !== false) {
				$('#dialog_confirm').dialog('destroy');
			}
		});
		jdialog_cancel.off('click').on('click', function() {
			if(!onclose || onclose && onclose() !== false) {
				$('#dialog_confirm').dialog('destroy');
			}
		});
		return jdialog_box;
	}

	//hint succeed成功  warning警告  fault错误
	$.hint = function(cont,types,times,onfun){
		times ? times = times : times = 1;

	    var logstyle ='';
		if(types == "warning"){
			logstyle = ' style="background-position: 10px -80px;"';
		}else if(types == "fault"){
			logstyle = ' style="background-position: 10px -40px;"';
		}

		var htmllog = '<div class="site_uppop" id="jq_up_hint">'
    				  +'<div class="up_hint"'+logstyle+'>'+cont+'</div>'
    				  +'<div class="site_uppop_bg"></div></div>'

    	$("body").append(htmllog);

    	var objhint = $("#jq_up_hint").show(),
    		objcont = $("#jq_up_hint").find(".up_hint").width()/2 +20;

    	$("#jq_up_hint").find('.up_hint').css("margin-left",-objcont+'px');
    	
    	setTimeout(function(){objhint.remove();onfun&&onfun();},parseInt(times)*1000);
	}
	
	$(".jq_checkbox_min").buttonset();

	$(".jq_checkbox_centre").buttonset();

	$(".jq_radio").buttonset();
	
	//评论晒单显示上边框
	pl_sandan();
	//晒单图片展示
	$(function(){

		if($('.fancybox').length > 0){
			$('.fancybox').fancybox();
		}
	});


	$('.top_list_lh li:even').addClass('lieven');

	
});


$.datepicker.regional["zh-CN"] = { closeText: "关闭", prevText: "&#x3c;上月", nextText: "下月&#x3e;", currentText: "今天", monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], monthNamesShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"], dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"], dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"], dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"], weekHeader: "周", dateFormat: "yy-mm-dd", firstDay: 1, isRTL: !1, showMonthAfterYear: !0, yearSuffix: "年" }

function headerfun(){
	var winw = $(window).width();
	if(winw<1750){
		$(".header").addClass('min_header');
		if(winw>1340){
			$(".header").addClass('min_in_header');
		}else{
			$(".header").removeClass('min_in_header');
		}
	}else{
		$(".header").removeClass('min_header');
	}
}

/*评论晒单*/
function pl_sandan(){
		$('.evaluate_all').children("p").click(function(){
		$('.evaluate_all').children("p").removeClass('all_pinjia');
		$(this).addClass('all_pinjia');
	});
}

