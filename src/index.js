(function () {
    requirejs.config({
        baseUrl: "./assets/js/",
        paths: {
            loadStl: 'loadStl',
            handleStl: 'handleStl',
            jquery: 'libs/Jquery/jquery-1.12.4'

        }
    });
    requirejs(['handleStl'], function (handleStl) {
        threeStart = handleStl.threeStart;
        window.onload = threeStart();
    });
})()