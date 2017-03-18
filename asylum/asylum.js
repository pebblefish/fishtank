var canvas;
var gl;

var shaderProgram;
var outlineProgram;

var vertexBuffer;
var indexBuffer;
var normalBuffer;
var colorBuffer;

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
	var outlineFragment = getShader(gl, "foutline");
	var outlineShader = getShader(gl, "voutline");
	
	// Create primary shader program
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		return;
	}
	
	// Create pre-pass shader program
	outlineProgram = gl.createProgram();
	gl.attachShader(outlineProgram, outlineShader);
	gl.attachShader(outlineProgram, outlineFragment);
	gl.linkProgram(outlineProgram);
	
	if (!gl.getProgramParameter(outlineProgram, gl.LINK_STATUS)) {
		return;
	}
}

function initBuffers() {
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertices = [0.0, -0.1, 0.4,
					
					0.05, 0.1, 0.35,
					0.0, 0.25, 0.35,
					-0.05, 0.1, 0.35,
					0.0, -0.45, 0.3,
					
					0.4, 0.0, 0.0,
					0.3, 0.35, 0.0,
					0.0, 0.45, 0.1,
					-0.3, 0.35, 0.0,
					-0.4, 0.0, 0.0,
					-0.3, -0.35, 0.0,
					0.0, -0.4, 0.0,
					0.3, -0.35, 0.0,
					
					0.35, 0.0, -0.3,
					0.0, 0.35, -0.3,
					-0.35, 0.0, -0.3,
					0.0, -0.35, -0.3,
					
					0.0, 0.0, -0.4];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var normals = [0.0, 0.0, 1.0,
				   
				   0.707, 0.0, 0.707,
				   0.0, 0.707, 0.707,
				   -0.707, 0.0, 0.707,
				   0.0, -0.707, 0.707,
				   
				   1.0, 0.0, 0.0,
				   0.707, 0.707, 0.0,
				   0.0, 1.0, 0.0,
				   -0.707, 0.707, 0.0,
				   -1.0, 0.0, 0.0,
				   -0.707, -0.707, 0.0,
				   0.0, -1.0, 0.0,
				   0.707, -0.707, 0.0,
				   
				   0.707, 0.0, -0.707,
				   0.0, 0.707, -0.707,
				   -0.707, 0.0, -0.707,
				   0.0, -0.707, -0.707,
				   
				   0.0, 0.0, -1.0];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var color = [0.5, 0.9, 1.0, 1.0];
	var colors = [];
	for (var i = 0; i < 18; i++) {
		colors = colors.concat(color);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	var indices = [0, 1, 2,
				   0, 2, 3,
				   0, 3, 4,
				   0, 4, 1,
				   
				   6, 2, 1,
				   8, 3, 2,
				   10, 4, 3,
				   12, 1, 4,
				   
				   1, 12, 5,
				   1, 5, 6,
				   2, 6, 7,
				   2, 7, 8,
				   3, 8, 9,
				   3, 9, 10,
				   4, 10, 11,
				   4, 11, 12,
				   
				   13, 5, 12,
				   13, 6, 5,
				   14, 7, 6,
				   14, 8, 7,
				   15, 9, 8,
				   15, 10, 9,
				   16, 11, 10,
				   16, 12, 11,
				   
				   6, 13, 14,
				   8, 14, 15,
				   10, 15, 16,
				   12, 16, 13,
				   
				   17, 14, 13,
				   17, 15, 14,
				   17, 16, 15,
				   17, 13, 16
				   ];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function start() {
	canvas = document.getElementById("asylum_canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	gl = initWebGL();
	
	if (!gl) return;
	
	gl.clearColor(0, 0, 0, 0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	initShaders();
	initBuffers();
	
	startTime = (new Date).getTime();
	
	setInterval(drawScene, 15);
}

function drawScene() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, canvas.width, canvas.height);
	
	gl.enable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	delta = (new Date).getTime() - startTime;
	theta = delta / 1000;
	mMatrix = [Math.cos(theta), 0, Math.sin(theta),
			   0, 1, 0,
			   -Math.sin(theta), 0, Math.cos(theta)];
	pMatrix = makePerspective(60, canvas.width / canvas.height, 0.1, 100.0);
	
	// Outline pre-pass
	gl.cullFace(gl.FRONT);
	
	gl.useProgram(outlineProgram);
	var aVertexPosition = gl.getAttribLocation(outlineProgram, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
	var aNormal = gl.getAttribLocation(outlineProgram, "aNormal");
	gl.enableVertexAttribArray(aNormal);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	
	var uMMatrix = gl.getUniformLocation(outlineProgram, "uMMatrix");
	gl.uniformMatrix3fv(uMMatrix, false, new Float32Array(mMatrix));
	var uPMatrix = gl.getUniformLocation(outlineProgram, "uPMatrix");
	gl.uniformMatrix4fv(uPMatrix, false, new Float32Array(pMatrix.flatten()));
	
	gl.drawElements(gl.TRIANGLES, 96, gl.UNSIGNED_SHORT, 0);
	
	// Pass
	gl.cullFace(gl.BACK);
	
	gl.useProgram(shaderProgram);
	aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(aVertexPosition);
	aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
	gl.enableVertexAttribArray(aNormal);
	var aColor = gl.getAttribLocation(shaderProgram, "aColor");
	gl.enableVertexAttribArray(aColor);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	
	var uMMatrix = gl.getUniformLocation(shaderProgram, "uMMatrix");
	gl.uniformMatrix3fv(uMMatrix, false, new Float32Array(mMatrix));
	uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(uPMatrix, false, new Float32Array(pMatrix.flatten()));
	
	gl.drawElements(gl.TRIANGLES, 96, gl.UNSIGNED_SHORT, 0);
	
}
