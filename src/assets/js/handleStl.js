define(['loadStl', 'jquery'], function (loadStl, $) {
    /**
     * 1、上传文件逻辑处理
     */
    //隐藏的真正上传按钮
    var input_hidden = document.getElementById("fileField");
    var uploadWrapper = document.getElementsByClassName("upload-wrapper")[0];
    //点击类似蒙版打印文件界面的上传按钮触发上传文件按钮，同时改变相关样式
    $('.btn-upload').on('click', function () {
        $(input_hidden).click();
    });

    var showFileName = document.getElementsByClassName("fileName")[0];
    //文件名处理
    if (!loadStl.fileName) {
        // fileName = 'static/module/bike_frame.stl'
    } else {

    }
    //模型x、y、z的尺寸
    var moduleSize;
    input_hidden.onchange = function () {
        //获取文件路径
        var path = input_hidden.value;
        // 截取文件名后缀
        var file = path.substr(path.lastIndexOf("."));
        test = this.files[0].name;
        fileSize = this.files[0].size;
        showFileName.innerHTML = this.files[0].name || f_name;
        //根据文件名后缀决定操作
        if (file !== ".stl") {
            input_hidden.value = "";
            return;
        } else {
            uploadWrapper.style.display = "none";
            document.body.style.overflow = "auto";
            // document.getElementById("container").style.display = "block";
            // document.getElementById("footer").style.display = "block";
            loadStl.readURL(input_hidden);
        }
        //得到模型尺寸，通过延时使数据同步(之后应该用回调)
        setTimeout(function () {
            moduleSize = loadStl.getModuleSize();
        }, 100)
    };


    /**
     * 2、购物车显示与处理
     * 模型单价=模型体积*材料价格*材料比例(...)
     * 模型总金额=模型数量*模型单价
     */

    var moduleNumber = 1;
    var modulePrice;//模型单价
    var printerModel;//打印模式
    var totalMoney;//每个模型总金额
    var sumMoney;//所有模型总金额
    var materialPrice = 0.00008;//材料价格
    //根据进度改变的模型尺寸,初始为模型大小
    var pro_moduleX;
    var pro_moduleY;
    var pro_moduleZ;

    //模型体积

    //购物车业务

    //显示模型数量和显示每个模型总金额的区域
    var moduleNumberInner = $(".num");
    var totalMoneyInner = $(".money");

    $(".down").on("click", function () {
        if (moduleNumber == 1) {
            moduleNumber = 1;
        } else {
            moduleNumber -= 1;
        }

        if (!modulePrice) {
            var moduleVolume = Math.abs(moduleSize.moduleX * moduleSize.moduleY * moduleSize.moduleZ);
            modulePrice = Math.ceil(moduleVolume * materialPrice);
            totalMoney = modulePrice * moduleNumber;
        } else {
            totalMoney = modulePrice * moduleNumber;
        }
        moduleNumberInner.text(moduleNumber);
        totalMoneyInner.text("￥" + totalMoney);
    });
    $(".add").on("click", function () {
        moduleNumber += 1;
        if (!modulePrice) {
            var moduleVolume = Math.abs(moduleSize.moduleX * moduleSize.moduleY * moduleSize.moduleZ);
            modulePrice = Math.ceil(moduleVolume * materialPrice);
            totalMoney = modulePrice * moduleNumber;
        } else {
            totalMoney = moduleNumber * modulePrice;
        }
        moduleNumberInner.text(moduleNumber);
        totalMoneyInner.text("￥" + totalMoney);
    });

    //根据进度条的改变显示模型金额
    function showMoney(moduleX, moduleY, moduleZ, materialPrice) {
        var moduleVolume = Math.abs(moduleX * moduleY * moduleZ);
        modulePrice = Math.ceil(moduleVolume * materialPrice);
        totalMoney = modulePrice * moduleNumber;
        document.getElementsByClassName("money")[0].innerHTML = "￥" + totalMoney;
    }




    /************************js进度条***************************/

    //得到进度条的所需元素
    var pro_bar = document.getElementsByClassName("pro_bar");
    var progress = document.getElementsByClassName("progress")[0];
    var progress_bar = document.getElementsByClassName("progress-bar")[0];
    var mask = document.getElementsByClassName("pro_control")[0];
    var progress_value = document.getElementById("progress_value");
    var proMove = 100;
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
            proMove = parseInt(x / (progress.offsetWidth - mask.offsetWidth) * 100)
            progress_value.innerHTML = proMove + '%';

            //2.5 显示修改后的尺寸、模型数量和每个模型总金额

            //模型大小的显示span,显示模型大小变化
            var x_size = document.getElementsByClassName("x_size")[0];
            var y_size = document.getElementsByClassName("y_size")[0];
            var z_size = document.getElementsByClassName("z_size")[0];
            //随滚动条变化的模型x、y、z的尺寸
            pro_moduleX = Math.floor(moduleSize.moduleX * (proMove / 100));
            pro_moduleY = Math.floor(moduleSize.moduleY * (proMove / 100));
            pro_moduleZ = Math.floor(moduleSize.moduleZ * (proMove / 100));
            if (moduleSize.moduleX) {
                x_size.innerHTML = Math.abs(pro_moduleX) + "mm x";
                y_size.innerHTML = Math.abs(pro_moduleY) + "mm x";
                z_size.innerHTML = Math.abs(pro_moduleZ) + "mm";
                var moduleVolume = Math.abs(pro_moduleX * pro_moduleY * pro_moduleZ);
                modulePrice = Math.ceil(moduleVolume * materialPrice);
                totalMoney = modulePrice * moduleNumber;
                document.getElementsByClassName("money")[0].innerHTML = "￥" + totalMoney;
            } else {
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
        file_size = fileSize;

        var $queue = createQueue(arr[num]);
        $(".tb_queue").append($queue);
        num += 1;

        numMoney.push(modulePrice * moduleNumber);

        allMoney += modulePrice * moduleNumber;
        $sumMoney.text("￥" + allMoney);
        moduleNumber = 1;
        document.getElementsByClassName("num")[0].innerHTML = moduleNumber;
    });


    function createQueue(arr) {
        var $queue = $(" <tr><td>" + arr +
            "</td><td>" + new Date().getTime() + "</td><td>" + total + " mm³</td><td>" + moduleNumber + "</td><td>" + MONEY + "</td><td>\n" +
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