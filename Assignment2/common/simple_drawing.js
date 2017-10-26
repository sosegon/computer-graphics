
//A constructor for a descriptor of a simple shape (here used to represent models)
function Model(centre, dimensions){
	this.centre = centre;
	this.dimensions = dimensions;

	this.getTransform = function(){
		return createMat4();
	}
	this.render = function(gl, scene, projectionMatrix){
		renderModel(gl, scene, projectionMatrix, this.getTransform(), this);
	}
}

//Called repeatedly to refresh the screen and respond to input
function render(gl,scene,timestamp,previousTimestamp) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var projectionMatrix = arrayToMat4([
		2.365222454071045, 0, 0, 0,
		0, 2.365222454071045, 0, 0,
		0, 0, -1.0070210695266724, -1, 
		0, 0, -1.4049147367477417, 0
	]);

	for(var i = 0; i < scene.objectsToRender.length; i++){
		scene.objectsToRender[i].render(gl, scene, projectionMatrix);
	}
	
	requestAnimationFrame(function(time) {
		render(gl,scene,time,timestamp);
	});
}


//Called repeatedly to refresh the screen and respond to input
function renderModel(gl, scene, projectionMatrix, localToGlobalMatrix, shape) {
	
	var numSubdivisions = parseInt($('#subdiv').val());
	var subDivAlpha = parseFloat($('#subdiv_alpha').val());
	
	
	var subDividedVertexBuffer = subdivideMesh(scene.originalModelVertexData, numSubdivisions, subDivAlpha);
	
	var elementsPerVertex = 3 + 2 + 3;
	var newVertexCount = subDividedVertexBuffer.length / elementsPerVertex;
	if(newVertexCount != scene.vertexCount || subDivAlpha != scene.lastAlpha){
		setVertexBuffer(gl, scene, subDividedVertexBuffer);
		scene.lastAlpha = subDivAlpha;
		initVertexBufferForProgram(gl, scene, scene.program);
		initVertexBufferForProgram(gl, scene, scene.wireframeProgram);
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, scene.vertexBuffer);

	//Translate and scale the model (without relying on they transformation functions in excercise 2)
	var localTransform = arrayToMat4(
		[shape.dimensions[0], 0, 0, 0,
		 0, shape.dimensions[1], 0, 0,
		 0, 0, shape.dimensions[2], 0,
		 shape.centre[0], shape.centre[1], shape.centre[2], 1
		]
	);
	
	var modelMatrix = multiplyMat4(localToGlobalMatrix, localTransform);
	
	renderMonkey(gl, scene, modelMatrix, projectionMatrix);
	
	var wf = $('#wireframe_on').prop("checked");
	if( wf ){
		gl.useProgram(scene.wireframeProgram);
		gl.uniformMatrix4fv(scene.wireframeProgram.modelMatrixUniform, gl.FALSE, modelMatrix);
		gl.uniformMatrix4fv(scene.wireframeProgram.projectionMatrixUniform, gl.FALSE, projectionMatrix);
		//gl.drawArrays(gl.LINE_LOOP, 0, scene.vertexCount);
		
		for(let i = 0; i < scene.vertexCount; i += 3){
			gl.drawArrays(gl.LINE_LOOP, i, 3);
		}
	}
	gl.useProgram(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function setVertexBuffer(gl, scene, vertexBufferData){
	var elementsPerVertex = 3 + 2 + 3;
	var newVertexCount = vertexBufferData.length / elementsPerVertex;

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferData), gl.STATIC_DRAW);

	scene.vertexBuffer = vertexBuffer;
	scene.vertexCount = newVertexCount;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initVertexBufferForProgram(gl, scene, program){
	var elementsPerVertex = 3 + 2 + 3;
	
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, scene.vertexBuffer);
	
	//Load the vertices from the object into a buffer
	//Bind elements of that buffer to the "vertPos" argument in the vertex shader.
	program.positionAttribute = gl.getAttribLocation(program, 'vertPos');
	gl.enableVertexAttribArray(program.positionAttribute);
	//index, size, type, normalized, stride, pointer
	gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, 0);
	
	program.uvAttribute = gl.getAttribLocation(program, 'vertUV');
	if(program.uvAttribute != -1){
		gl.enableVertexAttribArray(program.uvAttribute);
		gl.vertexAttribPointer(program.uvAttribute, 2, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, Float32Array.BYTES_PER_ELEMENT * 3);
	}
	program.normalAttribute = gl.getAttribLocation(program, 'vertNormal');
	if(program.normalAttribute != -1){
		gl.enableVertexAttribArray(program.normalAttribute);
		gl.vertexAttribPointer(program.normalAttribute, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, Float32Array.BYTES_PER_ELEMENT * 5);
	}

	

	gl.useProgram(null);
}



//Load the the .OBJ file asynchronously, and pass the contents
//on to the loadMeshData() and init() functions if successful.
function loadMesh(filename) {
	$.ajax({
		url: filename,
		dataType: 'text',
		mimeType: 'text/plain; charset=x-user-defined',
	}).done(function(data) {
		initWebGL(loadMeshData(data));
	}).fail(function() {
		alert('Failed to retrieve [' + filename + "]");
	});
}


//Initialise WebGL for rendering the given 3D object
function initWebGL(modelMesh) {
	//The surface and WebGL context
	var surface = document.getElementById('rendering-surface');
	//var gl = surface.getContext('experimental-webgl');
	var gl = surface.getContext('webgl2');
	
	//Set up the camera and culling options.
	gl.viewport(0,0,surface.width,surface.height);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	//Make the background clear colour dark grey.
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	//Load and compile our vertex and fragment shaders
	var program = createProgram(gl,
		[{shaderString: vertexShaderSource, type: gl.VERTEX_SHADER},
		{shaderString: fragmentShaderSource, type: gl.FRAGMENT_SHADER}]
	);
	
	var wireframeProgram = createProgram(gl,
		[{shaderString: wireframeVertexShaderSource, type: gl.VERTEX_SHADER},
		{shaderString: wireframeFragmentShaderSource, type: gl.FRAGMENT_SHADER}]
	);

	//Start using the program to figure out how to pass arguments to it.
	gl.useProgram(program);

	//Initialise our transformation matrices, and figure out how to pass
	//them to our shaders as uniform variables:
	program.modelMatrixUniform = gl.getUniformLocation(program, 'modelMatrix');	
	program.viewMatrixUniform = gl.getUniformLocation(program, 'viewMatrix');
	var viewMatrix = createMat4();
	gl.uniformMatrix4fv(program.viewMatrixUniform, gl.FALSE, viewMatrix);
	program.projectionMatrixUniform = gl.getUniformLocation(program, 'projectionMatrix');
	program.displacementScaleUniform = gl.getUniformLocation(program, 'displacementScale');
	
	program.textureUniform = gl.getUniformLocation(program, 'displacementMapTexture');
	
	gl.useProgram(wireframeProgram);
	
	wireframeProgram.modelMatrixUniform = gl.getUniformLocation(wireframeProgram, 'modelMatrix');	
	wireframeProgram.viewMatrixUniform = gl.getUniformLocation(wireframeProgram, 'viewMatrix');
	var viewMatrix = createMat4();
	gl.uniformMatrix4fv(wireframeProgram.viewMatrixUniform, gl.FALSE, viewMatrix);
	wireframeProgram.projectionMatrixUniform = gl.getUniformLocation(wireframeProgram, 'projectionMatrix');

	//Clear our binding contexts
	
	gl.useProgram(null);
	
	var texture = loadTexture(gl, './bump.png');
	
	//A bundle of useful state for rendering
	var scene = {
		program: program,
		wireframeProgram: wireframeProgram,
		originalModelVertexData: modelMesh,
		vertexBuffer: -1,
		vertexCount: 0,
		lastAlpha: 0,
		start: Date.now(),
		//projectionMatrix: projectionMatrix,
		viewMatrix: viewMatrix,
		objectsToRender: initialiseObjectsToRender(),
		texture: texture
	};
	
	setVertexBuffer(gl, scene, modelMesh);

	//Start drawing frames soon
	requestAnimationFrame(function(timestamp) {
		render(gl, scene, timestamp, 0);
	});
}

$(document).ready(function() {
  loadMesh('monkey.obj')
});
