var canvas;
var gl;

var shaderProgram;

var vertexBuffer;
var indexBuffer;
var aVertexPosition;

var mMatrix;

var startTime;

function initWebGL() {
	gl = null;
	
	try {
		gl = canvas.getContext("webgl", {antialias:true}) ||
			canvas.getContext("experimental-webgl", {antialias:true});
	}
	catch(e) {}
	
	if (!gl) {
		gl = null;
	}
	
	return gl;
}

function getShader(gl, id) {
	var shaderScript, src, cur, shader;
	
	shaderScript = document.getElementById(id);
	
	if (!shaderScript) return null;
	
	src = "";
	cur = shaderScript.firstChild;
	
	while (cur) {
		if (cur.nodeType == cur.TEXT_NODE) {
			src += cur.textContent;
		}
		cur = cur.nextSibling;
	}
	
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return null;
	}
	
	return shader;
}

function initShaders() {
	var fragmentShader = getShader(gl, "fshader");
	var vertexShader = getShader(gl, "vshader");
	
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		return;
	}
	
	gl.useProgram(shaderProgram);
	
	aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
}

function initBuffers() {
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	
	var vertices = [];
	for (var j = 0; j <= 10; j++) {
		for (var i = 0; i <= 100; i++) {
			vertices = vertices.concat([(i - 50) / 5.0, 0.0, -j / 5.0 - 1]);
		}
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	var indices = [];
	for (var j = 0; j < 10; j++) {
		for (var i = 0; i < 100; i++) {
			k = 101 * j + i;
			indices = indices.concat([k, k + 1, k + 101, k + 1, k + 101, k + 102]);
		}
	}
	
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function start() {
	canvas = document.getElementById("glcanvas");
	canvas.width = window.innerWidth;
	
	gl = initWebGL();
	
	if (!gl) return;
	
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.disable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	initShaders();
	initBuffers();
	
	startTime = (new Date).getTime();
	
	setInterval(drawScene, 15);
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	pMatrix = makePerspective(30, canvas.width / canvas.height, 0.1, 100.0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	
	var t = gl.getUniformLocation(shaderProgram, "t");
	var time = (new Date).getTime();
	gl.uniform1f(t, (time - startTime) / 600.0);
	
	var uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(uPMatrix, false, new Float32Array(pMatrix.flatten()));
	
	gl.drawElements(gl.TRIANGLES, 6000, gl.UNSIGNED_SHORT, 0);
}
