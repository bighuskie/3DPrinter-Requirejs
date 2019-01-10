define(function (window) {
    //预览图的元素
    var divCanvas = document.getElementById("canvas3d");
    //预览图的宽高
    var Width = document.getElementById("canvas3d").clientWidth;
    var Height = document.getElementById("canvas3d").clientHeight;
    //待定参数
    var Input = document.getElementById("input");
    var btn = document.getElementById("btn");



    // window.x_size=x_size;
    // window.y_size=y_size;
    // window.z_size=z_size;

    //上传预览按钮
    // var INPUT = document.getElementById("fileField");
    // var file_name = document.getElementsByClassName("fileName")[0];

    //购物车业务
    var test;
    var SIZE;
    var total;
    var Number = 1;
    var MONEY;
    var dowm = $(".down");
    var add = $(".add");

    dowm.click(function () {
        if (Number == 1) {
            Number = 1
        } else {
            Number -= 1;
            document.getElementsByClassName("num")[0].innerHTML = Number;
            document.getElementsByClassName("money")[0].innerHTML = "￥" + Money * Number;
            MONEY = "￥" + Money * Number;
        }
    });
    add.click(function () {
        Number += 1;
        document.getElementsByClassName("num")[0].innerHTML = Number;
        document.getElementsByClassName("money")[0].innerHTML = "￥" + Money * Number;
        MONEY = "￥" + Money * Number;

    });

    //读取文件信息的函数,刷新视图
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                //得到文件名(base64编码)
                fileName = e.target.result;
                divCanvas.removeChild(renderer.domElement);
                threeStart();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }



    //相机的相应参数
    var container;
    var camera, cameraTarget, scene, renderer, helper;
    var perspectiveAngle = 45;
    var cameraPosX = 900;
    var cameraPosY = 1200;
    var cameraPosZ = 2400;
    var cameraTargetX = -100;
    var cameraTargetY = -500;
    var cameraTargetZ = 800;
    var upVectorX = 0;
    var upVectorY = 50;
    var upVectorZ = 0;
    var cameralScale = 0.5;

    var Money = 0;


    //模型大小比例1:1
    var model_x = model_y = model_z = 1;
    //模型大小参数
    var module_x = 0;
    var module_y = 0;
    var module_z = 0;
    //加载模型初始化函数
    function init() {
        camera = new THREE.PerspectiveCamera(perspectiveAngle, 1, 1, 10000);
        camera.position.set(cameraPosX, cameraPosY, cameraPosZ);
        camera.up.set(upVectorX, upVectorY, upVectorZ);
        cameraTarget = new THREE.Vector3(cameraTargetX, cameraTargetY, cameraTargetZ);
        camera.lookAt(cameraTarget);
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 0, 9000);

        // 实例stlloader
        var loader = new THREE.STLLoader();
        loader.load(fileName, function (geometry) {
            //材料颜色
            var material = new THREE.MeshPhongMaterial({ color: 0x008080, specular: 0xC0C0C0, shininess: 200 });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.scale.set(model_x, model_y, model_z);
            // mesh.rotation.x = -0.5 * Math.PI;
            scene.add(mesh);

            //计算模型尺寸
            geometry.computeBoundingBox();
            var boundbox = geometry.boundingBox;
            //模型尺寸
            module_x = (boundbox.max.x - boundbox.min.x).toFixed(0);
            module_y = (boundbox.max.y - boundbox.min.y).toFixed(0);
            module_z = (boundbox.max.z - boundbox.min.z).toFixed(0);

            //对模型位置进行判断
            if (boundbox.min.y >= 0) {
                mesh.position.set(0, -boundbox.min.y - 600, 0);
            } else {
                mesh.position.set(0, -boundbox.min.y - 600, 0);
            }
            scene.add(camera);
        });

        // 增加lights
        scene.add(new THREE.AmbientLight(0x333333));
        addDirectionalLight(-1, 1, 1, 0xFFFFFF, 1.0);
        addDirectionalLight(1, -1, -1, 0xFFFFFF, 1);

        //网格
        var helper = new THREE.GridHelper(500, 50);
        helper.setColors(scene.fog);
        helper.position.set(0, -600, 0);
        scene.add(helper);

        //x,y,z轴
        var axisHelper = new THREE.AxisHelper(1000);
        axisHelper.position.set(-500, -600, -500);
        scene.add(axisHelper);
        var axisHelper2 = new THREE.AxisHelper(1000);
        axisHelper2.position.set(500, -600, -500);
        axisHelper2.rotation.y = -70.6855;
        scene.add(axisHelper2);

        var axisHelper3 = new THREE.AxisHelper(1000);
        axisHelper3.position.set(-500, -600, 500);
        axisHelper3.rotation.y = 70.6855;
        scene.add(axisHelper3);

        var axisHelper4 = new THREE.AxisHelper(1000);
        axisHelper4.position.set(500, -600, 500);
        axisHelper4.rotation.y = 141.371;
        scene.add(axisHelper4);

        var axisHelper5 = new THREE.AxisHelper(1000);
        axisHelper5.position.set(-500, 800, -500);
        axisHelper5.rotation.z = -70.6855;
        scene.add(axisHelper5);

        var axisHelper6 = new THREE.AxisHelper(1000);
        axisHelper6.position.set(500, 800, -500);
        axisHelper6.rotation.y = -70.6855;
        axisHelper6.rotation.z = -70.6855;
        scene.add(axisHelper6);

        var axisHelper7 = new THREE.AxisHelper(1000);
        axisHelper7.position.set(500, 800, 500);
        axisHelper7.rotation.y = -141.371;
        axisHelper7.rotation.z = -70.6855;
        scene.add(axisHelper7);

        var axisHelper8 = new THREE.AxisHelper(1000);
        axisHelper8.position.set(-500, 800, 500);
        axisHelper8.rotation.y = 70.6855;
        axisHelper8.rotation.z = -70.6855;
        scene.add(axisHelper8);

        // renderer渲染
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xfafafa);
        renderer.setSize(Width, Height);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapCullFace = THREE.CullFaceBack;
        divCanvas.appendChild(renderer.domElement);
        // orbit control鼠标控制
        control = new THREE.OrbitControls(camera, renderer.domElement);
        control.enablePan = true;
    }
    function addDirectionalLight(x, y, z, color, intensity) {
        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z)
        scene.add(directionalLight);
    }
    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    function render() {
        renderer.render(scene, camera);
    }
    function threeStart() {
        init();
        animate();
    }
    return { threeStart, readURL, module_x, module_y, module_z };
});