/**
 * 上传文件逻辑处理
 */
(function (window,loadStl) {
    //sessionStorage变量->文件名
    var Storage = sessionStorage.getItem("data");
    var filename = sessionStorage.getItem("fileName");

    //全局变量->文件名(读取文件用)
    var fileName;
    window.fileName = fileName;
    //全局变量->文件名(读取文件名)
    var f_name;
    window.f_name = f_name;

    //判断是否有本地缓存（5M以下）
    if (isNaN(Storage)) {
        fileName = Storage;
        f_name = filename;
        //删除缓存
        sessionStorage.setItem("data", null);
        sessionStorage.setItem("filename", null);
    }

   
    // window.readURL=readURL;
    var INPUT = document.getElementById("fileField");
    var file_name = document.getElementsByClassName("fileName")[0];
    //文件名处理
    if (!fileName) {
        // fileName = 'static/module/bike_frame.stl'
        console.log("ok")
    } else {

    }


    INPUT.onchange = function () {
        //获取文件路径
        var path = INPUT.value;
        // 截取文件名后缀
        var file = path.substr(path.lastIndexOf("."));
        test = this.files[0].name;
        SIZE = this.files[0].size;
        file_name.innerHTML = this.files[0].name || f_name;
        //根据文件名后缀决定操作
        if (file !== ".stl") {
            INPUT.value = "";
            return;
        } else {
            loadStl.readURL(INPUT);
        }
    };


})(window,loadStl)