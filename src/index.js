(function () {
    requirejs.config({
        baseUrl: "../assets/js/",
        paths: {
            loadStl: 'loadStl',
            handleStl: 'handleStl',
            jquery: 'libs/Jquery/jquery-1.12.4'

        }
    });
    requirejs(['loadStl','handleStl'], function (loadStl) {
        document.body.onload = loadStl.threeStart();        
    });
})()