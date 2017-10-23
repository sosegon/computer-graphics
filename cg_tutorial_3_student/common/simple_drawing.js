
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
function renderModel(gl, scene, projectionMatrix, localToGlobalMatrix, shape) {

	//Start using our vertex and fragment shaders
	gl.useProgram(scene.program);
	
	
	
	//Translate and scale the model (without relying on they transformation functions in excercise 2)
	var localTransform = arrayToMat4(
		[shape.dimensions[0], 0, 0, 0,
		 0, shape.dimensions[1], 0, 0,
		 0, 0, shape.dimensions[2], 0,
		 shape.centre[0], shape.centre[1], shape.centre[2], 1
		]
	);
	
	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, scene.texture);

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(scene.program.textureUniform, 0);

	var transform = multiplyMat4(localToGlobalMatrix, localTransform);
	
	gl.uniformMatrix4fv(scene.program.modelMatrixUniform, gl.FALSE, transform);
	
	gl.uniformMatrix4fv(scene.program.projectionMatrixUniform, gl.FALSE, projectionMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, scene.model.vertexBuffer);

	gl.drawArrays(gl.TRIANGLES, 0, scene.model.vertexCount);
	
	gl.useProgram(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


//Called repeatedly to refresh the screen and respond to input
function render(gl,scene,timestamp,previousTimestamp) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var surface = document.getElementById('rendering-surface');
	var aspect = surface.width/surface.height;
	var fovy = parseFloat($('#fov-slider').val());
		
	var n = parseFloat($('#n-slider').val());
	var f = parseFloat($('#f-slider').val());	
	var t = n * Math.tan(fovy / 2);		
	var b = -t;
	var r = t * aspect;
	var l = -r;
	

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

	//Start using the program to figure out how to pass arguments to it.
	gl.useProgram(program);

	//Load the vertices from the object into a buffer
	//Bind elements of that buffer to the "pos" argument in the vertex shader.
	program.positionAttribute = gl.getAttribLocation(program, 'vertPos');
	gl.enableVertexAttribArray(program.positionAttribute);
	program.uvAttribute = gl.getAttribLocation(program, 'vertUV');
	gl.enableVertexAttribArray(program.uvAttribute);
	program.normalAttribute = gl.getAttribLocation(program, 'vertNormal');
	gl.enableVertexAttribArray(program.normalAttribute);
	
	
	var vertexBuffer = gl.createBuffer();
	var elementsPerVertex = 3 + 2 + 3;
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelMesh.vertexBuffer, gl.STATIC_DRAW);
	//index, size, type, normalized, stride, pointer
	gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, 0);
	gl.vertexAttribPointer(program.uvAttribute, 2, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, Float32Array.BYTES_PER_ELEMENT * 3);
	gl.vertexAttribPointer(program.normalAttribute, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * elementsPerVertex, Float32Array.BYTES_PER_ELEMENT * 5);
	//Initialise our transformation matrices, and figure out how to pass
	//them to our shaders as uniform variables:
	
	program.projectionMatrixUniform = gl.getUniformLocation(program, 'projectionMatrix');

	var viewMatrix = createMat4();
	program.viewMatrixUniform = gl.getUniformLocation(program, 'viewMatrix');
	gl.uniformMatrix4fv(program.viewMatrixUniform, gl.FALSE, viewMatrix);
	
	program.inColourUniform = gl.getUniformLocation(program, 'inColour');
	program.textureUniform = gl.getUniformLocation(program, 'texSampler');
	program.modelMatrixUniform = gl.getUniformLocation(program, 'modelMatrix');

	modelMesh.vertexBuffer = vertexBuffer;

	//Clear our binding contexts
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.useProgram(null);
	
	var texture = loadTexture(gl, './displ.png');
	
	//A bundle of useful state for rendering
	var scene = {
		program: program,
		model: modelMesh,
		start: Date.now(),
		//projectionMatrix: projectionMatrix,
		viewMatrix: viewMatrix,
		objectsToRender: initialiseObjectsToRender(),
		texture: texture
	};

	//Start drawing frames soon
	requestAnimationFrame(function(timestamp) {
		render(gl, scene, timestamp, 0);
	});
}

$(document).ready(function() {
  loadMesh('sphere.obj')
});
