define(['loadStl', 'jquery'], function (loadStl, $) {
    /**
     * 1、上传文件逻辑处理
     */
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

    var INPUT = document.getElementById("fileField");
    var file_name = document.getElementsByClassName("fileName")[0];
    //文件名处理
    if (!fileName) {
        // fileName = 'static/module/bike_frame.stl'
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

    /**
     * 2、购物车显示与处理
     */

    // //监听窗口变化，重新加载页面
    // var timer = null;
    // window.onresize = function () {
    //     clearInterval(timer);
    //     //进行节流
    //     timer = setTimeout(function () {
    //         location.reload()
    //     }, 200);
    // };

    /************************js进度条***************************/

    //得到进度条的所需元素
    var pro_bar = document.getElementsByClassName("pro_bar");
    var progress = document.getElementsByClassName("progress")[0];
    var progress_bar = document.getElementsByClassName("progress-bar")[0];
    var mask = document.getElementsByClassName("pro_control")[0];
    var progress_value = document.getElementById("progress_value");

    //鼠标按下出发事件对象
    mask.onmousedown = function (event) {
        var e = event || window.event;
        // 2.1 获取初始位置
        var offsetLeft = e.clientX - mask.offsetLeft;
        // 2.2 监听鼠标的移动
        document.onmousemove = function (event) {
            var e = event || window.event;
            // 2.3 获取移动的位置
            var x = e.clientX - offsetLeft;
            // 边界值处理
            if (x < 0) {
                x = 0;
            } else if (x >= progress.offsetWidth - mask.offsetWidth) {
                x = progress.offsetWidth - mask.offsetWidth;
            }
            // 2.4 走起来
            progress_bar.style.width = x + 'px';
            mask.style.left = x + 'px';
            var proMove = parseInt(x / (progress.offsetWidth - mask.offsetWidth) * 100);
            progress_value.innerHTML = proMove + '%';

            //模型大小的显示span,显示模型大小变化
            var x_size = document.getElementsByClassName("x_size")[0];
            var y_size = document.getElementsByClassName("y_size")[0];
            var z_size = document.getElementsByClassName("z_size")[0];

           
            if (loadStl.module_x || loadStl.module_x == 0) {
                
                x_size.innerHTML = Math.abs(loadStl.module_x) + "mm x";
                y_size.innerHTML = Math.abs(loadStl.module_y) + "mm x";
                z_size.innerHTML = Math.abs(loadStl.module_z) + "mm";
                total = Math.abs(loadStl.module_x * loadStl.module_y * loadStl.module_z);
                Money = Math.ceil(total * 0.00008);
                document.getElementsByClassName("money")[0].innerHTML = "￥" + Money * Number;
                MONEY = "￥" + Money * Number;
                console.log(loadStl.module_x);
            } else {
                console.log(loadStl.module_x+'222');
                return;
            }

            return false;
        }
    };


    // 2.5 监听鼠标抬起
    document.onmouseup = function () {
        document.onmousemove = null;
    };



    /************************jq打印模式的选择*******************************/


    var btn_list = $(".pri_type button");
    for (var i = 0; i < btn_list.length; i++) {
        (function (i) {
            $(btn_list[i]).click(function () {
                $(btn_list[i]).addClass("selected")
                    .siblings().removeClass("selected");
            });
        })(i);
    }


    /************************jq文件上传、队列、下*******************************/

    var btnList = $(".operation button");

    btnList.eq(0).click(function () {
        //js对象->jq对象
        $("#fileField").click();
    });

    /************************jq结算跳转*******************************/

    $(".sumAll").click(function () {
        // alert("ok")
    });


    //得到确定上传文件的按钮
    var $sumMoney = $(".sumMoney");
    var btn = $(".op_btn2");

    var arr = [];
    var queue = [];
    var num = 0;
    //测试是否得到输入框的文件
    btn.click(function () {
        fi = test;
        //缓存文件在数组
        arr.push(fi);
        //文件的大小
        file_size = SIZE;

        var $queue = createQueue(arr[num]);
        $(".tb_queue").append($queue);
        num += 1;

        numMoney.push(Money * Number);

        allMoney += Money * Number;
        $sumMoney.text("￥" + allMoney);
        Number = 1;
        document.getElementsByClassName("num")[0].innerHTML = Number;
    });


    function createQueue(arr) {
        var $queue = $(" <tr><td>" + arr +
            "</td><td>" + new Date().getTime() + "</td><td>" + total + " mm³</td><td>" + Number + "</td><td>" + MONEY + "</td><td>\n" +
            "<button class=\"btn btn-danger dancel\">取消</button>\n" +
            "</td>\n" +
            "</tr>");
        // queue.push(obj);
        return $queue;
    }

    var allMoney = 0;
    var numMoney = [];


    $("body").delegate(".sum", "click", function () {
        console.log($(this).index());;
    });

    $("body").delegate(".dancel", "click", function () {
        allMoney -= numMoney[$(this).parents("tr").index() - 1];
        var arr = numMoney[$(this).parents("tr").index() - 1];


        numMoney.splice($.inArray(arr, numMoney), 1);

        $sumMoney.text("￥" + allMoney);

        if (String(allMoney) == "NaN") {
            $sumMoney.text("￥ 0");
        }
        $(this).parents("tr").remove();

    });
    var threeStart = loadStl.threeStart;
    return { threeStart }

});