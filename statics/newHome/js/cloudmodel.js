var webgl_Detector = {
    canvas: !!window.CanvasRenderingContext2D,
    webgl: function() {
        try {
            var canvas = document.createElement("canvas");
            return !! window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        } catch(e) {
            return false
        }
    } (),
    workers: !!window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,
    getWebGLErrorMessage: function() {
        var element = document.createElement("div");
        element.id = "webgl-error-message";
        element.style.fontFamily = "monospace";
        element.style.fontSize = "13px";
        element.style.fontWeight = "normal";
        element.style.textAlign = "center";
        element.style.background = "#fff";
        element.style.color = "#000";
        element.style.padding = "1.5em";
        element.style.width = "400px";
        element.style.margin = "5em auto 0";
        if (!this.webgl) {
            element.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n") : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n")
        }
        return element
    },
    addGetWebGLMessage: function(parameters){
        var parent, id, element;
        parameters = parameters || {};
        parent = parameters.parent !== undefined ? parameters.parent: document.body;
        id = parameters.id !== undefined ? parameters.id: "oldie";
        element = Detector.getWebGLErrorMessage();
        element.id = id;
        parent.appendChild(element)
    }
};
THREE.OrbitControls = function(object, domElement) {
    this.object = object;
    this.domElement = domElement !== undefined ? domElement: document;
    this.enabled = true;
    this.target = new THREE.Vector3;
    this.center = this.target;
    this.noZoom = false;
    this.zoomSpeed = 1;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.noRotate = false;
    this.rotateSpeed = 1;
    this.noPan = false;
    this.keyPanSpeed = 7;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.noKeys = false;
    this.keys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40
    };
    var scope = this;
    var EPS = 1e-6;
    var rotateStart = new THREE.Vector2;
    var rotateEnd = new THREE.Vector2;
    var rotateDelta = new THREE.Vector2;
    var panStart = new THREE.Vector2;
    var panEnd = new THREE.Vector2;
    var panDelta = new THREE.Vector2;
    var panOffset = new THREE.Vector3;
    var offset = new THREE.Vector3;
    var dollyStart = new THREE.Vector2;
    var dollyEnd = new THREE.Vector2;
    var dollyDelta = new THREE.Vector2;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3;
    var lastPosition = new THREE.Vector3;
    var STATE = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_DOLLY: 4,
        TOUCH_PAN: 5
    };
    var state = STATE.NONE;
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    var changeEvent = {
        type: "change"
    };
    var startEvent = {
        type: "start"
    };
    var endEvent = {
        type: "end"
    };
    this.rotateLeft = function(angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle()
        }
        thetaDelta -= angle
    };
    this.rotateUp = function(angle) {
        if (angle === undefined) {
            angle = getAutoRotationAngle()
        }
        phiDelta -= angle
    };
    this.panLeft = function(distance) {
        var te = this.object.matrix.elements;
        panOffset.set(te[0], te[1], te[2]);
        panOffset.multiplyScalar( - distance);
        pan.add(panOffset)
    };
    this.panUp = function(distance) {
        var te = this.object.matrix.elements;
        panOffset.set(te[4], te[5], te[6]);
        panOffset.multiplyScalar(distance);
        pan.add(panOffset)
    };
    this.pan = function(deltaX, deltaY) {
        var element = scope.domElement === document ? scope.domElement.body: scope.domElement;
        if (scope.object.fov !== undefined) {
            var position = scope.object.position;
            var offset = position.clone().sub(scope.target);
            var targetDistance = offset.length();
            targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
            scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
            scope.panUp(2 * deltaY * targetDistance / element.clientHeight)
        } else if (scope.object.top !== undefined) {
            scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
            scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight)
        } else {
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")
        }
    };
    this.dollyIn = function(dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = getZoomScale()
        }
        scale /= dollyScale
    };
    this.dollyOut = function(dollyScale) {
        if (dollyScale === undefined) {
            dollyScale = getZoomScale()
        }
        scale *= dollyScale
    };
    this.update = function() {
        var position = this.object.position;
        offset.copy(position).sub(this.target);
        var theta = Math.atan2(offset.x, offset.z);
        var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
        if (this.autoRotate) {
            this.rotateLeft(getAutoRotationAngle())
        }
        theta += thetaDelta;
        phi += phiDelta;
        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
        phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
        var radius = offset.length() * scale;
        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
        this.target.add(pan);
        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);
        position.copy(this.target).add(offset);
        this.object.lookAt(this.target);
        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set(0, 0, 0);
        if (lastPosition.distanceTo(this.object.position) > 0) {
            this.dispatchEvent(changeEvent);
            lastPosition.copy(this.object.position)
        }
    };
    this.reset = function() {
        state = STATE.NONE;
        this.target.copy(this.target0);
        this.update()
    };
    function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed
    }
    function getZoomScale() {
        return Math.pow(.95, scope.zoomSpeed)
    }
    function onMouseDown(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        if (event.button === 0) {
            if (scope.noRotate === true) return;
            state = STATE.ROTATE;
            rotateStart.set(event.clientX, event.clientY)
        } else if (event.button === 1) {
            if (scope.noZoom === true) return;
            state = STATE.DOLLY;
            dollyStart.set(event.clientX, event.clientY)
        } else if (event.button === 2) {
            if (scope.noPan === true) return;
            state = STATE.PAN;
            panStart.set(event.clientX, event.clientY)
        }
        scope.domElement.addEventListener("mousemove", onMouseMove, false);
        scope.domElement.addEventListener("mouseup", onMouseUp, false);
        scope.dispatchEvent(startEvent)
    }
    function onMouseMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        var element = scope.domElement === document ? scope.domElement.body: scope.domElement;
        if (state === STATE.ROTATE) {
            if (scope.noRotate === true) return;
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart);
            scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
            scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
            rotateStart.copy(rotateEnd)
        } else if (state === STATE.DOLLY) {
            if (scope.noZoom === true) return;
            dollyEnd.set(event.clientX, event.clientY);
            dollyDelta.subVectors(dollyEnd, dollyStart);
            if (dollyDelta.y > 0) {
                scope.dollyIn()
            } else {
                scope.dollyOut()
            }
            dollyStart.copy(dollyEnd)
        } else if (state === STATE.PAN) {
            if (scope.noPan === true) return;
            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart);
            scope.pan(panDelta.x, panDelta.y);
            panStart.copy(panEnd)
        }
        scope.update()
    }
    function onMouseUp() {
        if (scope.enabled === false) return;
        scope.domElement.removeEventListener("mousemove", onMouseMove, false);
        scope.domElement.removeEventListener("mouseup", onMouseUp, false);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE
    }
    function onMouseWheel(event) {
        if (scope.enabled === false || scope.noZoom === true) return;
        event.preventDefault();
        var delta = 0;
        if (event.wheelDelta !== undefined) {
            delta = event.wheelDelta
        } else if (event.detail !== undefined) {
            delta = -event.detail
        }
        if (delta > 0) {
            scope.dollyOut()
        } else {
            scope.dollyIn()
        }
        scope.update();
        scope.dispatchEvent(startEvent);
        scope.dispatchEvent(endEvent)
    }
    function onKeyDown(event) {
        if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) return;
        switch (event.keyCode) {
            case scope.keys.UP:
                scope.pan(0, scope.keyPanSpeed);
                scope.update();
                break;
            case scope.keys.BOTTOM:
                scope.pan(0, -scope.keyPanSpeed);
                scope.update();
                break;
            case scope.keys.LEFT:
                scope.pan(scope.keyPanSpeed, 0);
                scope.update();
                break;
            case scope.keys.RIGHT:
                scope.pan( - scope.keyPanSpeed, 0);
                scope.update();
                break
        }
    }
    function touchstart(event) {
        if (scope.enabled === false) return;
        switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true) return;
                state = STATE.TOUCH_ROTATE;
                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            case 2:
                if (scope.noZoom === true) return;
                state = STATE.TOUCH_DOLLY;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyStart.set(0, distance);
                break;
            case 3:
                if (scope.noPan === true) return;
                state = STATE.TOUCH_PAN;
                panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            default:
                state = STATE.NONE
        }
        scope.dispatchEvent(startEvent)
    }
    function touchmove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        event.stopPropagation();
        var element = scope.domElement === document ? scope.domElement.body: scope.domElement;
        switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true) return;
                if (state !== STATE.TOUCH_ROTATE) return;
                rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                rotateStart.copy(rotateEnd);
                scope.update();
                break;
            case 2:
                if (scope.noZoom === true) return;
                if (state !== STATE.TOUCH_DOLLY) return;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyEnd.set(0, distance);
                dollyDelta.subVectors(dollyEnd, dollyStart);
                if (dollyDelta.y > 0) {
                    scope.dollyOut()
                } else {
                    scope.dollyIn()
                }
                dollyStart.copy(dollyEnd);
                scope.update();
                break;
            case 3:
                if (scope.noPan === true) return;
                if (state !== STATE.TOUCH_PAN) return;
                panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                panDelta.subVectors(panEnd, panStart);
                scope.pan(panDelta.x, panDelta.y);
                panStart.copy(panEnd);
                scope.update();
                break;
            default:
                state = STATE.NONE
        }
    }
    function touchend() {
        if (scope.enabled === false) return;
        scope.dispatchEvent(endEvent);
        state = STATE.NONE
    }
    this.domElement.addEventListener("contextmenu",
        function(event) {
            event.preventDefault()
        },
        false);
    this.domElement.addEventListener("mousedown", onMouseDown, false);
    this.domElement.addEventListener("mousewheel", onMouseWheel, false);
    this.domElement.addEventListener("DOMMouseScroll", onMouseWheel, false);
    this.domElement.addEventListener("touchstart", touchstart, false);
    this.domElement.addEventListener("touchend", touchend, false);
    this.domElement.addEventListener("touchmove", touchmove, false);
    window.addEventListener("keydown", onKeyDown, false)
};
THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);


/*  将模型转能预览的格式  现在只支持3种格式文件 fyn  */

function parse_3d_file(filename, s) {
    switch (filename.split(".").pop().toLowerCase()) {
        case "stl":
            return parse_stl_bin(s);
            break;
        case "obj":
            return parse_obj(s);
            break;
        case "vf":
            return parse_vf(arrayBufferToString(s));
            break;
        case "igs":
            return parse_stl_bin(s);
            break;
        case "stp":
            return parse_stl_bin(s);
            break;
        default:
            return "Unknown file type this is fyn edit!!!"
    }
}
function arrayBufferToString(buffer, onSuccess, onFail) {
    var bufView = new Uint8Array(buffer);
    var length = bufView.length;
    var result = "";
    for (var i = 0; i < length; i += 65535) {
        var addition = 65535;
        if (i + 65535 > length) {
            addition = length - i
        }
        result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition))
    }
    if (result) {
        if (onSuccess) onSuccess(result)
    } else {
        if (onFail) onFail("buffer was invalid")
    }
    return result
}


/*obj  装换格式函数*/

function parse_obj(s) {
    var obj_string = arrayBufferToString(s);
    function vector(x, y, z) {
        return new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z))
    }
    function uv(u, v) {
        return new THREE.Vector2(parseFloat(u), parseFloat(v))
    }
    function face3(a, b, c, normals) {
        return new THREE.Face3(a, b, c, normals)
    }
    var object = new THREE.Object3D;
    var geometry, material, mesh;
    function parseVertexIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + vertices.length
    }
    function parseNormalIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + normals.length
    }
    function parseUVIndex(index) {
        index = parseInt(index);
        return index >= 0 ? index - 1 : index + uvs.length
    }
    function add_face(a, b, c, normals_inds) {
        if (1 == 1) {
            geometry.faces.push(face3(vertices[parseVertexIndex(a)] - 1, vertices[parseVertexIndex(b)] - 1, vertices[parseVertexIndex(c)] - 1))
        } else {
            geometry.faces.push(face3(vertices[parseVertexIndex(a)] - 1, vertices[parseVertexIndex(b)] - 1, vertices[parseVertexIndex(c)] - 1, [normals[parseNormalIndex(normals_inds[0])].clone(), normals[parseNormalIndex(normals_inds[1])].clone(), normals[parseNormalIndex(normals_inds[2])].clone()]))
        }
    }
    function add_uvs(a, b, c) {
        geometry.faceVertexUvs[0].push([uvs[parseUVIndex(a)].clone(), uvs[parseUVIndex(b)].clone(), uvs[parseUVIndex(c)].clone()])
    }
    function handle_face_line(faces, uvs, normals_inds) {
        if (faces[3] === undefined) {
            add_face(faces[0], faces[1], faces[2], normals_inds);
            if (uvs !== undefined && uvs.length > 0) {
                add_uvs(uvs[0], uvs[1], uvs[2])
            }
        } else {
            if (normals_inds !== undefined && normals_inds.length > 0) {
                add_face(faces[0], faces[1], faces[3], [normals_inds[0], normals_inds[1], normals_inds[3]]);
                add_face(faces[1], faces[2], faces[3], [normals_inds[1], normals_inds[2], normals_inds[3]])
            } else {
                add_face(faces[0], faces[1], faces[3]);
                add_face(faces[1], faces[2], faces[3])
            }
            if (uvs !== undefined && uvs.length > 0) {
                add_uvs(uvs[0], uvs[1], uvs[3]);
                add_uvs(uvs[1], uvs[2], uvs[3])
            }
        }
    }
    if (/^o /gm.test(obj_string) === false) {
        geometry = new THREE.Geometry
    }
    var vertices = [];
    var normals = [];
    var uvs = [];
    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
    var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
    var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
    var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;
    var lines = obj_string.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        line = line.trim();
        var result;
        if (line.length === 0 || line.charAt(0) === "#") {
            continue
        } else if ((result = vertex_pattern.exec(line)) !== null) {
            vertices.push(geometry.vertices.push(vector(result[1], result[2], result[3])))
        } else if ((result = normal_pattern.exec(line)) !== null) {
            normals.push(vector(result[1], result[2], result[3]))
        } else if ((result = uv_pattern.exec(line)) !== null) {
            uvs.push(uv(result[1], result[2]))
        } else if ((result = face_pattern1.exec(line)) !== null) {
            handle_face_line([result[1], result[2], result[3], result[4]])
        } else if ((result = face_pattern2.exec(line)) !== null) {
            handle_face_line([result[2], result[5], result[8], result[11]], [result[3], result[6], result[9], result[12]])
        } else if ((result = face_pattern3.exec(line)) !== null) {
            handle_face_line([result[2], result[6], result[10], result[14]], [result[3], result[7], result[11], result[15]], [result[4], result[8], result[12], result[16]])
        } else if ((result = face_pattern4.exec(line)) !== null) {
            handle_face_line([result[2], result[5], result[8], result[11]], [], [result[3], result[6], result[9], result[12]])
        } else if (/^o /.test(line)) {
            geometry = new THREE.Geometry
        } else if (/^g /.test(line)) {} else if (/^usemtl /.test(line)) {} else if (/^mtllib /.test(line)) {} else if (/^s /.test(line)) {} else {}
    }
    var children = object.children;
    for (var i = 0,
             l = children.length; i < l; i++) {
        var geometry = children[i].geometry
    }
    return {
        vertices: geometry.vertices,
        faces: geometry.faces,
        colors: false
    }
}
function parse_stl_ascii(s) {

    try{
        var stl_string = arrayBufferToString(s);
        var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
        geometry = new THREE.Geometry;
        patternFace = /facet([\s\S]*?)endfacet/g;
        while ((result = patternFace.exec(stl_string)) !== null) {
            text = result[0];
            patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternNormal.exec(text)) !== null) {
                normal = new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]))
            }
            patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;
            while ((result = patternVertex.exec(text)) !== null) {
                geometry.vertices.push(new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5])))
            }
            length = geometry.vertices.length;
            geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal))
        }
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        return {
            vertices: geometry.vertices,
            faces: geometry.faces,
            colors: false
        }
    } catch(err) {
        return "Can't parse file"
    }
}


/*************将stl 格式的转化**************/

function parse_stl_bin(s) {
    var vertices = [];
    var faces = [];
    var vert_hash = {};
    var vertexIndex;
    var f1, f2, f3;
    var v1, v2, v3;
    var def_red_color, def_green_color, def_blue_color;
    var r, g, b, colors, alpha;
    var cpos = arrayBufferToString(s.slice(0, 80)).toLowerCase().indexOf("color");
    var fdata = new DataView(s, 0);
    var pos = 80;
    try {
        var tcount = fdata.getUint32(pos, true)
    } catch(err) {
        return "Can't parse file"
    }
    if (cpos > -1) {
        def_red_color = fdata.getUint8(cpos + 6, true);
        def_green_color = fdata.getUint8(cpos + 7, true);
        def_blue_color = fdata.getUint8(cpos + 8, true);
        alpha = fdata.getUint8(cpos + 9) / 255;
        colors = new Float32Array(tcount * 3 * 3)
    }
    var predictedSize = 80 + 4 + 50 * tcount;
    if (! (s.byteLength == predictedSize)) return parse_stl_ascii(s);
    try {
        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;
        var offset = 0;
        var geometry = new THREE.BufferGeometry;
        var vertices = new Float32Array(tcount * 3 * 3);
        var normals = new Float32Array(tcount * 3 * 3);
        var faces = new Float32Array(tcount * 3);
        for (var face = 0; face < tcount; face++) {
            var start = dataOffset + face * faceLength;
            var normalX = fdata.getFloat32(start, true);
            var normalY = fdata.getFloat32(start + 4, true);
            var normalZ = fdata.getFloat32(start + 8, true);
            if (cpos > -1) {
                var packedColor = fdata.getUint16(start + 48, true);
                if ((packedColor & 32768) === 0) {
                    r = (packedColor & 31) / 31;
                    g = (packedColor >> 5 & 31) / 31;
                    b = (packedColor >> 10 & 31) / 31
                } else {
                    r = def_red_color;
                    g = def_green_color;
                    b = def_blue_color
                }
            }
            for (var i = 1; i <= 3; i++) {
                var vertexstart = start + i * 12;
                vertices[offset] = fdata.getFloat32(vertexstart, true);
                vertices[offset + 1] = fdata.getFloat32(vertexstart + 4, true);
                vertices[offset + 2] = fdata.getFloat32(vertexstart + 8, true);
                normals[offset] = normalX;
                normals[offset + 1] = normalY;
                normals[offset + 2] = normalZ;
                if (cpos > -1) {
                    colors[offset] = r;
                    colors[offset + 1] = g;
                    colors[offset + 2] = b
                }
                offset += 3
            }
        }
        geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute("normal", new THREE.BufferAttribute(normals, 3));
        if (cpos > -1) {
            geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
            geometry.hasColors = true;
            geometry.alpha = alpha
        }
        return {
            geometry: geometry
        }
    } catch(err) {
        return "Can't parse file"
    }
}
function parse_vf(s) {
    var o = JSON.parse(s);
    var vertices = [];
    var faces = [];
    try {
        var len = o.vertices.length;
        for (i = 0; i < len; i++) vertices.push(new THREE.Vector3(o.vertices[i][0], o.vertices[i][1], o.vertices[i][2]));
        var len = o.faces.length;
        for (i = 0; i < len; i++) faces.push(new THREE.Face3(o.faces[i][0], o.faces[i][1], o.faces[i][2]));
        return {
            vertices: vertices,
            faces: faces,
            colors: false
        }
    } catch(err) {
        return "Can't parse file"
    }
}
function geo_to_vf(geo) {
    var vertices = [];
    var faces = [];
    var len = geo.vertices.length;
    for (i = 0; i < len; i++) vertices.push([geo.vertices[i].x, geo.vertices[i].y, geo.vertices[i].z]);
    var len = geo.faces.length;
    for (i = 0; i < len; i++) faces.push([geo.faces[i].a, geo.faces[i].b, geo.faces[i].c]);
    return {
        vertices: vertices,
        faces: faces,
        colors: false
    }
}
if (!ArrayBuffer.prototype.slice) {
    ArrayBuffer.prototype.slice = function(begin, end) {
        if (begin === void 0) {
            begin = 0
        }
        if (end === void 0) {
            end = this.byteLength
        }
        begin = Math.floor(begin);
        end = Math.floor(end);
        if (begin < 0) {
            begin += this.byteLength
        }
        if (end < 0) {
            end += this.byteLength
        }
        begin = Math.min(Math.max(0, begin), this.byteLength);
        end = Math.min(Math.max(0, end), this.byteLength);
        if (end - begin <= 0) {
            return new ArrayBuffer(0)
        }
        var result = new ArrayBuffer(end - begin);
        var resultBytes = new Uint8Array(result);
        var sourceBytes = new Uint8Array(this, begin, end - begin);
        resultBytes.set(sourceBytes);
        return result
    }
}
function upload_file(f, url) {
    if (waiting) return;
    if (!supported_file_type(f.name)) {
        alert("不支持该文件类型");
        switch_view("drag");
        $("#uploadifive-3d_submit span").html("上传模型");
        $(".3d_upload .d_submit_bg").remove();
        $(".3d_upload").css("cursor", "pointer");
        $("#uploadifive-3d_submit span").html("上传模型");
        $(".upload_butt .d_submit_bg").remove();
        $(".upload_butt").css("cursor", "pointer");
        return false
    }

    if (f.size > max_file_size) {
        alert("您上传的文件太大!");
        switch_view("drag");
        $("#uploadifive-3d_submit span").html("上传模型");
        $(".3d_upload .d_submit_bg").remove();
        $(".3d_upload").css("cursor", "pointer");
        $("#uploadifive-3d_submit span").html("上传模型");
        $(".upload_butt .d_submit_bg").remove();
        $(".upload_butt").css("cursor", "pointer");
        return false
    }
    read_file(f, url)
}



/*  读取文件信息  f 是文件的信息大小   url  是文件的存储的本地位置  */
function read_file(f, url) {

   

    var pbar = $(".cjcpbar").find(".file_pbar");
    pbar.val(0);
    var oReq = new XMLHttpRequest;
    oReq.open("GET", url, true);
    oReq.responseType = "blob";
    oReq.onload = function(oEvent) {
        var blob = oReq.response;
        waiting = true;
        var pbar = $(".cjcpbar").find(".file_pbar");
        var reader = new FileReader;
        reader.onerror = function(e) {
            var error_str = "";
            switch (e.target.error.code) {
                case e.target.error.NOT_FOUND_ERR:
                    error_str = "File not found";
                    break;
                case e.target.error.NOT_READABLE_ERR:
                    error_str = "Can't read file - too large?";
                    break;
                case e.target.error.ABORT_ERR:
                    error_str = "Read operation aborted";
                    break;
                case e.target.error.SECURITY_ERR:
                    error_str = "File is locked";
                    break;
                case e.target.error.ENCODING_ERR:
                    error_str = "File too large";
                    break;
                default:
                    error_str = "Error reading file"
            }
            switch_view("drag");
            return after_error()
        };
        reader.onload = function(readerEvt) {
            switch_view("proc");
            setTimeout(function() {
                    after_file_load(f.name, readerEvt.target.result)
                },
                500)
        };
        reader.onprogress = function(readerEvt) {
            if (cancel_download) {
                reader.abort();
                return after_error()
            } else pbar.val(readerEvt.loaded / readerEvt.total * 100)
        };
        reader.readAsArrayBuffer(blob)
    };
	//added by grand
	 oReq.onreadystatechange = function(){
		 if(oReq.readyState == 4){
			console.log("4, oReq loaded，",oReq);
		 	if(oReq.status == 200){
				console.log("status 200, ok")
			}
			else{
				console.log("status " + oReq.status + " error happens")
				
			}
		 }
		 
	 }
    oReq.send(null)
}
var is_ie = !!window.MSStream;
var waiting = false;
var mesh = null;
var line = null;
var material = new THREE.MeshLambertMaterial({
    color: 3321481,
    overdraw: 1,
    wireframe: false,
    shading: THREE.FlatShading,
    vertexColors: THREE.FaceColors
});
if (!is_ie) material.side = THREE.DoubleSide;
var cancel_download = false;
var max_file_size = 124e6;
var mesh_color = "#32ae89";
var xsize = 0;
var ysize = 0;
var zsize = 0;
var vol = 0;
var area = 0;
var hd = 0;
var triangles_count = 0;
var model_filename = "";
var view_units = 1;
var file_units = 1;
var bg_color = 3355443;
var jscbg_color = "#333333";
function $id(id) {
    return document.getElementById(id)
}
function set_view_units(v) {
    view_units = v;
    setCookie("units", v == "1" ? "mm": "in", 1e3);
    recalc_units()
}
function set_file_units(v) {
    file_units = v;
    recalc_units()
}
function recalc_units() {
    if (file_units == view_units) {
        set_vol_and_size(vol, area, hd, xsize, ysize, zsize)
    } else if (file_units == 1) set_vol_and_size(vol / 16387.064, area / 645.16, hd / 25.4, xsize / 25.4, ysize / 25.4, zsize / 25.4);
    else {
        set_vol_and_size(vol * 16387.064, area * 645.16, hd * 25.4, xsize * 25.4, ysize * 25.4, zsize * 25.4)
    }
}
function handleDragOver(e) {
    if (waiting) return;
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy"
}

// 上传格式控制函数
function handleFileDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    if (waiting) return;
    if (e.dataTransfer.files.length > 0) {

        // 判断文件大小
        if (e.dataTransfer.files[0].size > max_file_size) {
            
            alert("文件太大");

            switch_view("drag");
            $("#uploadifive-3d_submit span").html("上传模型");
            $(".3d_upload .d_submit_bg").remove();
            $(".3d_upload").css("cursor", "pointer");
            $("#uploadifive-3d_submit span").html("上传模型");
            $(".upload_butt .d_submit_bg").remove();
            $(".upload_butt").css("cursor", "pointer");
            return false
        }
        if (!supported_file_type(e.dataTransfer.files[0].name)) {
            alert("不支持ply等格式");

            switch_view("drag");
            $("#uploadifive-3d_submit span").html("上传模型");
            $(".3d_upload .d_submit_bg").remove();
            $(".3d_upload").css("cursor", "pointer");
            $("#uploadifive-3d_submit span").html("上传模型");
            $(".upload_butt .d_submit_bg").remove();
            $(".upload_butt").css("cursor", "pointer");
            return false
        }
        read_file(e.dataTransfer.files[0])
    } else if (typeof e.dataTransfer.getData("Text") === "string") {}
}
function supported_file_type(filename) {
    switch (filename.split(".").pop().toLowerCase()) {
        case "stp":
        case "3dm":
        case "igs":
        case "ply":
        case "stl":
        case "obj":
        case "sql":
        case "vf":
            return true;
            break;
        default:
            return false
    }
}
function switch_view(v) {
    $(".cjcdrag").css("display", v == "drag" ? "block": "none");
    $(".cjcpbar").css("display", v == "pbar" ? "block": "none");
    $(".cjcproc").css("display", v == "proc" ? "block": "none");
    $(".cjc").css("display", v == "cjc" ? "block": "none")
}
function after_error() {
    switch_view("drag");
    cancel_download = false;
    waiting = false;
    return false
}


// 最重要弹出框
// 上传成功后加载执行  filename是传过来的 文件名称 s是json
function after_file_load(filename, s) {

   
    var vf_data;
    try {
        vf_data = parse_3d_file(filename, s)


        
    } catch(err) {
        vf_data = "Error parsing the file"
    }

    


    /*如何上传的不是指定的文件格式则不能预览*/
    if (typeof vf_data === "string"){

        alert("格式不支持，请联系网站客服解决！");

        $("#uploadifive-3d_submit span").html("上传模型");
        $(".3d_upload .d_submit_bg").remove();
        $(".3d_upload").css("cursor", "pointer");
        $("#uploadifive-3d_submit span").html("上传模型");
        $(".upload_butt .d_submit_bg").remove();
        $(".upload_butt").css("cursor", "pointer");
        switch_view("drag");
        waiting = false;
        return
    }
    if (mesh != null) {
        scene.remove(mesh);
        mesh = null
    }
    if (line != null) {
        scene.remove(line);
        line = null
    }
    var size = 500,
        step = 50;
    var geometry = new THREE.Geometry;
    for (var i = -size; i <= size; i += step) {
        geometry.vertices.push(new THREE.Vector3( - size, 0, i));
        geometry.vertices.push(new THREE.Vector3(size, 0, i));
        geometry.vertices.push(new THREE.Vector3(i, 0, -size));
        geometry.vertices.push(new THREE.Vector3(i, 0, size))
    }
    var material = new THREE.LineBasicMaterial({
        color: 16777215,
        opacity: .5
    });
    line = new THREE.Line(geometry, material);
    line.type = THREE.LinePieces;



    
// vf_data.vertices 这个是新加的obj 预览的条件；
// 
    if (vf_data.geometry  ) {
        var geometry = new THREE.Geometry;
        var attrib = vf_data.geometry.getAttribute("position");
        if (attrib === undefined) {
            throw new Error("a given BufferGeometry object must have a position attribute.")
        }
        var positions = attrib.array;
        var vertices = [];
        for (var i = 0,
                 n = positions.length; i < n; i += 3) {
            var x = positions[i];
            var y = positions[i + 1];
            var z = positions[i + 2];
            vertices.push(new THREE.Vector3(x, y, z))
        }
        var faces = [];
        for (var i = 0,
                 n = vertices.length; i < n; i += 3) {
            faces.push(new THREE.Face3(i, i + 1, i + 2))
        }
        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeFaceNormals();
        geometry.mergeVertices();
        geometry.computeVertexNormals();
        var material = new THREE.MeshPhongMaterial({
            color: 3321481,
            wireframe: false,
            overdraw: 1,
            wireframe: false,
            shading: THREE.FlatShading
        });
        THREE.GeometryUtils.center(geometry);
        mesh = new THREE.Mesh(geometry, material);
        mesh.useQuaternion = true;
        var axis = new THREE.Vector3(100, 100, 100).normalize();
        var angle = Math.PI / .3;
        var q = (new THREE.Quaternion).setFromAxisAngle(axis, angle);
        mesh.quaternion.copy(q);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        set_color(null, bg_color, true);
        scene.add(mesh);
        directionalLight.position.x = geometry.boundingBox.min.y * 2;
        directionalLight.position.y = geometry.boundingBox.min.y * 2;
        directionalLight.position.z = geometry.boundingBox.max.z * 2;
        line.position.y = geometry.boundingBox.min.z;
        scene.add(line);
        pointLight.position.x = (geometry.boundingBox.min.y + geometry.boundingBox.max.y) / 2;
        pointLight.position.y = (geometry.boundingBox.min.y + geometry.boundingBox.max.y) / 2;
        pointLight.position.z = geometry.boundingBox.max.z * 2;
        camera.position.set(0, 0, Math.min(geometry.boundingBox.min.x * 3, geometry.boundingBox.min.y * 3, geometry.boundingBox.min.z * 3));
        controls.reset();
        switch_view("cjc");
        waiting = false;
        xsize = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        ysize = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        zsize = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
        vol_area = calc_vol_and_area(geometry);
        vol = vol_area[0];
        area = vol_area[1];
        hd = vol_area[2];
        triangles_count = geometry.faces.length;
        model_filename = filename;
        guess_file_units(xsize, ysize, zsize);


        /*   执行这个函数 在调用一个函数set_vol_and_size 这个函数 设置cookie值 就是这个mymodel  ''''author fyn  */
        recalc_units();   


        var filenameend = $.cookie("3d_model_name") ? $.cookie("3d_model_name") : model_filename;
        $(".3d_name").html(filenameend.substr(0, 20))
        var uStatus = $.cookie('uStatus');

        // 上传成功后 在这个文件里面执行加载自助云底下模型页列表

        try {
            if (drawCompleted && typeof drawCompleted == "function" && !uStatus) {
                console.log('第一个判断');

                $.cookie('state_obj',1,{ expires: 1 });
                drawCompleted()
            }
        } catch(e) {
            console.log(e)
        }
    } else {

        /*** 假如没有不是上传的stl的文件 自动走这个else  fyn                ***/
        var geo = new THREE.Geometry;
        geo.vertices = vf_data.vertices;
        geo.faces = vf_data.faces;
        geo.computeBoundingBox();
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        THREE.GeometryUtils.center(geo);
        var material = new THREE.MeshPhongMaterial({
            color: 3321481,
            wireframe: false,
            overdraw: 1,
            wireframe: false,
            shading: THREE.FlatShading
        });
        mesh = new THREE.Mesh(geo, material);
        mesh.useQuaternion = true;
        var axis = new THREE.Vector3(100, 100, 100).normalize();
        var angle = Math.PI / .3;
        var q = (new THREE.Quaternion).setFromAxisAngle(axis, angle);
        mesh.quaternion.copy(q);
        if (vf_data.colors) set_color($id("white_color"), "#e0eaf1");
        update_mesh_color();
        set_color(null, bg_color, true);
        scene.add(mesh);
        directionalLight.position.x = geo.boundingBox.min.y * 2;
        directionalLight.position.y = geo.boundingBox.min.y * 2;
        directionalLight.position.z = geo.boundingBox.max.z * 2;
        line.position.y = geo.boundingBox.min.z;
        scene.add(line);

        pointLight.position.x = (geo.boundingBox.min.y + geo.boundingBox.max.y) / 2;
        pointLight.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) / 2;
        pointLight.position.z = geo.boundingBox.max.z * 2;
        camera.position.set(0, 0, Math.min(geo.boundingBox.min.x * 3, geo.boundingBox.min.y * 3, geo.boundingBox.min.z * 3));
        controls.reset();
        switch_view("cjc");
        xsize = geo.boundingBox.max.x - geo.boundingBox.min.x;
        ysize = geo.boundingBox.max.y - geo.boundingBox.min.y;
        zsize = geo.boundingBox.max.z - geo.boundingBox.min.z;
        vol_area = calc_vol_and_area(geo);
        vol = vol_area[0];
        area = vol_area[1];
        hd = vol_area[2];
        triangles_count = geo.faces.length;
        model_filename = filename;
        guess_file_units(xsize, ysize, zsize);

        recalc_units();
        var filenameend = $.cookie("3d_model_name") ? $.cookie("3d_model_name") : model_filename;
        $(".3d_name").html(filenameend.substr(0, 20));

        waiting = false
          
        /***这是新加的 如果第一个不是传的stl 模型的话 fyn vf_data.vertices*/
        var aaa=$.cookie('state_obj');

          


        if(vf_data.vertices && aaa==0){
          $.cookie('state_obj',1,{ expires: 1 });
          drawCompleted(); 
          
        }
    }
}




function set_color_by_name(color, is_bg_color) {
    is_bg_color = is_bg_color || false;
    switch (color.toLowerCase()) {
        case "black":
            set_color($id("black_color"), "#000000", is_bg_color);
            break;
        case "white":
            set_color($id("white_color"), "#FFFFFF", is_bg_color);
            break;
        case "blue":
            set_color($id("blue_color"), "#0000FF", is_bg_color);
            break;
        case "green":
            set_color($id("green_color"), "#00FF00", is_bg_color);
            break;
        case "red":
            set_color($id("red_color"), "#FF0000", is_bg_color);
            break;
        case "yellow":
            set_color($id("yellow_color"), "#FFFF00", is_bg_color);
            break;
        case "gray":
            set_color($id("gray_color"), "#909090", is_bg_color);
            break;
        case "azure":
            set_color($id("azure_color"), "#00FFFF", is_bg_color);
            break;
        case "pink":
            set_color($id("pink_color"), "#FF00FF", is_bg_color);
            break;
        case "purple":
            set_color($id("purple_color"), "#703487", is_bg_color);
            break;
        case "darkblue":
            set_color($id("darkblue_color"), "#102075", is_bg_color);
            break;
        case "brown":
            set_color($id("brown_color"), "#654321", is_bg_color);
            break;
        case "transparent":
            set_color($id("white_color"), "transparent", true);
            break;
        default:
            if (/^#[0-9A-F]{6}$/i.test(color)) set_color($id("white_color"), color, is_bg_color)
    }
}
function set_color(o, o_color, is_bg_color) {
    is_bg_color = is_bg_color || false;
    if (is_bg_color) {
        bg_color = o_color;
        if (o_color == "transparent") renderer.setClearColor(0, 0);
        else renderer.setClearColor(o_color, 1);
        return
    }
    mesh_color = o_color;
    update_mesh_color()
}
function update_mesh_color() {
    if (mesh == null) return;
    mesh.material.color.set(parseInt(mesh_color.substr(1), 16))
}
function calc_vol_and_area(geo) {
    var x1, x2, x3, y1, y2, y3, z1, z2, z3, i;
    var len = geo.faces.length;
    var totalVolume = 0;
    var totalArea = 0;
    var a, b, c, s;
    var toz, tox, toy;
    for (i = 0; i < len; i++) {
        x1 = geo.vertices[geo.faces[i].a].x;
        y1 = geo.vertices[geo.faces[i].a].y;
        z1 = geo.vertices[geo.faces[i].a].z;
        x2 = geo.vertices[geo.faces[i].b].x;
        y2 = geo.vertices[geo.faces[i].b].y;
        z2 = geo.vertices[geo.faces[i].b].z;
        x3 = geo.vertices[geo.faces[i].c].x;
        y3 = geo.vertices[geo.faces[i].c].y;
        z3 = geo.vertices[geo.faces[i].c].z;
        totalVolume += -x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3;
        a = geo.vertices[geo.faces[i].a].distanceTo(geo.vertices[geo.faces[i].b]);
        b = geo.vertices[geo.faces[i].b].distanceTo(geo.vertices[geo.faces[i].c]);
        c = geo.vertices[geo.faces[i].c].distanceTo(geo.vertices[geo.faces[i].a]);
        if (!toz) {
            toz = Math.min(a, b, c)
        } else {
            toz = Math.min(toz, a, b, c)
        }
        s = (a + b + c) / 2;
        if (String(Math.sqrt(s * (s - a) * (s - b) * (s - c))) == "NaN") {
            continue
        }
        totalArea += Math.sqrt(s * (s - a) * (s - b) * (s - c))
    }
    return [Math.abs(totalVolume / 6), totalArea, toz]
}
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".")
}
function set_shading(i) {
    if (i == 2) material.wireframe = true;
    else {
        material.wireframe = false;
        material.shading = i == 1 ? THREE.SmoothShading: THREE.FlatShading;
        if (mesh != null) mesh.geometry.normalsNeedUpdate = true
    }
}
function reset() {
    if (waiting) return;
    switch_view("drag");
    if (mesh != null) {
        scene.remove(mesh);
        mesh = null
    }
    $id("fileselect").value = ""
}
function open_img() {
    var imgform = document.createElement("form");
    imgform.target = "_blank";
    imgform.method = "POST";
    imgform.action = "/snap_img/";
    var imginput = document.createElement("input");
    imginput.type = "text";
    imginput.name = "img_data";
    if (is_webgl) {
        imginput.value = renderer.domElement.toDataURL("image/png")
    } else {
        imginput.value = document.getElementById("upload_canvas").toDataURL("image/png")
    }
    $("#3d_base64_image").val(imginput.value);
    return imginput.value
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date;
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1e3);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
    }
    return ""
}
function guess_file_units(xsize, ysize, zsize) {
    if (xsize < 1 && ysize < 1 && zsize < 1) {
        file_units = 2
    } else {
        file_units = 1
    }
}
function set_vol_and_size(vol, area, hd, xsize, ysize, zsize) {
    var p = view_units == 2 ? 2 : 2;
    $(".3d_volume").html(vol.toFixed(p));
    $(".3d_area").html(area.toFixed(p));
    $(".3d_long").html(xsize.toFixed(p));
    $(".3d_wide").html(ysize.toFixed(p));
    $(".3d_tall").html(zsize.toFixed(p));
    $.ajax({
        type: "post",
        url: "/user-interface-modelcheck",
        data: {
            mname: $.cookie("3d_model_name") ? $.cookie("3d_model_name") : model_filename,
            "long": numberWithCommas(xsize.toFixed(p)),
            wide: numberWithCommas(ysize.toFixed(p)),
            high: numberWithCommas(zsize.toFixed(p)),
            area: numberWithCommas(area.toFixed(p)),
            volume: numberWithCommas(vol.toFixed(p)),
            percent: "100"
        },
        cache: false,
        dataType: "json",
        success: function(data) {},
        error: function() {}
    });
    $("#jq_amount").slider("enable");
    $(".jq_amount_cont").removeAttr("disabled");
    $("#jq_amount").slider("value", 100);
    $(".jq_amount_cont").val("100");


    /*  这是个model_filename 是上传文件名称 */
    modelval.mname = $.cookie("3d_model_name") ? $.cookie("3d_model_name") : model_filename;
    modelval.long = xsize;
    modelval.wide = ysize;
    modelval.high = zsize;
    modelval.area = area;
    modelval.volume = vol;
    if (!$.cookie("mymodel")) {


        var mymodel = new Object;



        mymodel.mname = $.cookie("3d_model_name") ? $.cookie("3d_model_name") : model_filename;
        mymodel.long = xsize.toFixed(p);
        mymodel.wide = ysize.toFixed(p);
        mymodel.high = zsize.toFixed(p);
        mymodel.area = area.toFixed(p);
        mymodel.volume = vol.toFixed(p);
        mymodel.percent = "100";
        mymodel.stlurl = $("#3d_stlurl").val();
        var objmymodel = JSON.stringify(mymodel);


        /**********************************这是存的cookie 终于找出来了 fyn********************* */
        $.cookie("mymodel", objmymodel, {
            expires: 30
        })
        console.log("这里存的关于文件信息的cookie",objmymodel);
    }
    $("#loading").load(Url, {
            percent: "100"
        },
        function() {
            clearingscr("load")
        });
    $("html, body").animate({
            "scroll-top": 690
        },
        "fast");
    $("#uploadifive-3d_submit span").html("上传模型");
    $(".upload_butt .d_submit_bg").remove();
    $(".upload_butt").css("cursor", "pointer");
    var singleinfo = $.cookie('singleinfo');


    try {
        if (after_singleLoad && typeof after_singleLoad == "function" && singleinfo) {
           after_singleLoad(singleinfo)
        }
    } catch(e) {
        console.log(e)
    }
    var i = JSON.parse($.cookie('i'));
}
function jscfun(path, wid, hig) {
    if (is_webgl) {
        return false
    }
    $("#upload_canvas").remove();
    $("#cjcwrap").find(".cjc").append('<canvas id="upload_canvas" width="' + wid + '" height="' + hig + '"></canvas>');
    var mycanvas = document.getElementById("upload_canvas");
    var viewer = new JSC3D.Viewer(mycanvas);
    var theScene = new JSC3D.Scene;
    var stlpath = path;
    viewer.setParameter("SceneUrl", stlpath);
    viewer.setParameter("InitRotationX", -90);
    viewer.setParameter("InitRotationY", -180);
    viewer.setParameter("InitRotationZ", 0);
    viewer.setParameter("ModelColor", mesh_color);
    viewer.setParameter("BackgroundColor1", jscbg_color);
    viewer.setParameter("BackgroundColor2", jscbg_color);
    viewer.setParameter("RenderMode", "flat");
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        viewer.setParameter("Definition", "Standard")
    } else {
        viewer.setParameter("Definition", "High")
    }
    viewer.init();
    viewer.update();
    $(document).on("dragover", "#cjcwrap .cjc", handleDragOverjsc);
    $(document).on("drop", "#cjcwrap .cjc", handleFileSelect)
}
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    preview_stl(files[0])
}
function handleDragOverjsc(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy"
}
var handle_file_select = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var f = e.target.files[0];
    preview_stl(f)
};
function preview_stl(f) {
    var reader = new FileReader;
    var ext = f.name.split(".")[1];
    reader.onload = function(file) {
        return function(e) {
            theScene = new JSC3D.Scene;
            stl_loader = new JSC3D.StlLoader;
            stl_loader.parseStl(theScene, e.target.result);
            viewer.replaceScene(theScene);
            viewer.update()
        }
    } (f);
    if (ext.toLowerCase() != "stl") {
        alert("请上传模型文件。")
    } else {
        reader.readAsBinaryString(f)
    }
}