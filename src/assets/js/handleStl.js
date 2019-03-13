define(['loadStl', 'jquery'], function (loadStl, $) {
    /**
     * 上传文件逻辑处理
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

    var moduleSize;//模型x、y、z的尺寸
    var cacheFileArray = [];//缓存模型文件对象数组
    var cacheArrayIndex = 0;//根据缓存索引值找加入队列的文件
    input_hidden.onchange = function () {
        //获取文件路径
        var path = input_hidden.value;
        // 截取文件名后缀
        var suffixName = path.substr(path.lastIndexOf("."));
        //根据文件名后缀决定操作
        if (suffixName !== ".stl") {
            this.value = "";
            return;
        } else {
            loadStl.readURL(this);
            showFileName.innerHTML = this.files[0].name;
            cacheFileArray.push(this.files[0]);
            cacheArrayIndex++;
            // uploadWrapper.style.display = "none";
            // document.body.style.overflow = "auto";
        }
        //得到模型尺寸，通过延时使数据同步(之后应该用回调)
        setTimeout(function () {
            moduleSize = loadStl.getModuleSize();
        }, 500);
        //重置模型单价、每个模型总金额、数量数值和显示
        modulePrice = totalMoney = 0;
        moduleNumber = 1;
        $(".num").text(1)
        $(".money").text("￥" + 0);
    };


    /**
     * 购物车所需数据的显示与处理:
     * 模型单价=模型体积*材料价格*材料比例(...)
     * 每个模型总金额=模型数量*模型单价
     */

    var moduleNumber = 1;
    var modulePrice;//模型单价
    var printerModel;//打印模式
    var totalMoney;//每个模型总金额
    var materialPrice = 0.000008;//材料价格
    //根据进度改变的模型尺寸,初始为模型大小
    var pro_moduleX;
    var pro_moduleY;
    var pro_moduleZ;


    //显示模型数量和显示每个模型总金额的区域
    var moduleNumberInner = $(".num");
    var totalMoneyInner = $(".money");

    $(".down").on("click", function () {
        if (moduleNumber == 1) {
            moduleNumber = 1;
        } else {
            moduleNumber -= 1;
        }
        showChangeNumber()
        moduleNumberInner.text(moduleNumber);
        totalMoneyInner.text("￥" + totalMoney);
    });
    $(".add").on("click", function () {
        moduleNumber += 1;
        showChangeNumber();
        moduleNumberInner.text(moduleNumber);
        totalMoneyInner.text("￥" + totalMoney);
    });

    //没调进度条时改变模型数量，显示相应的数值
    function showChangeNumber() {
        if (!modulePrice) {
            var moduleVolume = Math.abs(moduleSize.moduleX * moduleSize.moduleY * moduleSize.moduleZ);
            modulePrice = Math.ceil(moduleVolume * materialPrice);
            totalMoney = modulePrice * moduleNumber;
        } else {
            totalMoney = moduleNumber * modulePrice;
        }
    }



    /**
     * 进度条调整模型大小
     */

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
            if (moduleSize) {
                //模型大小的显示span,显示模型大小变化
                var x_size = document.getElementsByClassName("x_size")[0];
                var y_size = document.getElementsByClassName("y_size")[0];
                var z_size = document.getElementsByClassName("z_size")[0];
                //随滚动条变化的模型x、y、z的尺寸
                pro_moduleX = Math.floor(moduleSize.moduleX * (proMove / 100));
                pro_moduleY = Math.floor(moduleSize.moduleY * (proMove / 100));
                pro_moduleZ = Math.floor(moduleSize.moduleZ * (proMove / 100));
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



    //打印模式的选择

    var btn_list = $(".pri_type button");
    for (var i = 0; i < btn_list.length; i++) {
        (function (i) {
            $(btn_list[i]).click(function () {
                $(btn_list[i]).addClass("selected")
                    .siblings().removeClass("selected");
            });
        })(i);
    }


    //触发文件上传按钮，文件上传预览
    var btnList = $(".operation button");
    btnList.eq(0).click(function () {
        $("#fileField").click();
    });

    //购物车结算跳转(暂时保留)

    $(".sumAll").click(function () {
        // alert("ok")
    });


    /**
     * 在购物车里显示文件信息和之前设置的相关参数
     */
    //得到确定上传文件的按钮
    // var $sumMoney = $(".sumMoney");
    var fileArray = [];//模型文件对象数组
    var fileArrayIndex = 0;
    var sumMoney = [];//所有模型总金额    
    //加入打印队列文件处理
    $(".joinQueue").on("click", function () {
        //保存要加入队列的文件在数组里
        fileArray.push(cacheFileArray[cacheArrayIndex - 1]);
        //将缓存文件清零
        cacheFileArray = [];
        cacheArrayIndex = 0;
        if (!modulePrice) {
            var moduleVolume = Math.abs(moduleSize.moduleX * moduleSize.moduleY * moduleSize.moduleZ);
            modulePrice = Math.ceil(moduleVolume * materialPrice);
            totalMoney = modulePrice * moduleNumber;
        } else {
            totalMoney = modulePrice * moduleNumber;
        }
        var $queue = createQueue(fileArray[fileArrayIndex]);
        $(".tb_queue").append($queue);
        fileArrayIndex += 1;
        sumMoney.push(totalMoney);
        showSumMoney(sumMoney);
    });

    //生成购物车信息队列
    function createQueue(obj) {
        var $queue = $(" <tr><td>" + obj.name +
            "</td><td>" + new Date().getTime() + "</td><td>" + "xxx" + " mm³</td><td>" + moduleNumber + "</td><td>" + totalMoney + "</td><td>\n" +
            "<button class=\"btn btn-danger dancel\">取消</button>\n" +
            "</td>\n" +
            "</tr>");
        return $queue;
    }

    //计算所有模型总金额
    function showSumMoney(moneyArray) {
        var showSumMoney = moneyArray.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue;
        });
        $(".sumMoney").text("￥" + showSumMoney);
    }


    $("body").delegate(".sum", "click", function () {
        console.log($(this).index());;
    });

    $("body").delegate(".dancel", "click", function () {
        sumMoney.splice($(this).parents("tr").index() - 1, 1);
        $(this).parents("tr").remove();
        if (sumMoney.length === 0) {
            $(".sumMoney").text("￥" + 0);
        } else {
            showSumMoney(sumMoney);
        }
    });

});