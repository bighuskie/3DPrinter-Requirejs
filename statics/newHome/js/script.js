$(function()
{	

	$(".add_service_top").click(function()
	{
		$("html, body").animate({
			"scroll-top":0
		},"fast");

	});
	scrolltopfun();

	var lastRmenuStatus=false;
	$(window).scroll(function()
	{
		scrolltopfun();
	});


	function scrolltopfun(){
		var _top=$(window).scrollTop();
		if(_top>200)
		{	
			$(".add_service_top").slideDown();
		}
		else
		{
			$(".add_service_top").slideUp();
		}
		
	}

	$(".new_services_title").click(function(){
		$(".new_services").hide();
		$(".new_services_mine").show();
	})

	$(".new_services_mine").click(function(){
		$(".new_services").show();
		$(".new_services_mine").hide();
	})

});