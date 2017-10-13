
//A constructor for a descriptor of a simple shape (here used to represent cubes)
function Shape(centre, dimensions, colour, wireColour){
	this.centre = centre;
	this.dimensions = dimensions;
	this.colour = colour;
	this.wireColour = wireColour;
}

//A cuboid which can be transformed and rendered
function Cuboid(centre, dimensions, colour, wireColour){
	var cube = new Shape(centre, dimensions, colour, wireColour);
	cube.getTransform = function(){
		return createMat4();
	}
	cube.render = function(gl, scene, projectionMatrix){
		renderCuboid(gl, scene, projectionMatrix, this.getTransform(), this);
	}
	return cube;
}



//Called repeatedly to refresh the screen and respond to input
function renderCuboid(gl, scene, projectionMatrix, localToGlobalMatrix, shape) {

	//Start using our vertex and fragment shaders
	gl.useProgram(scene.program);
	
	//Translate and scale the cube (without relying on they transformation functions in excercise 2)
	var localTransform = arrayToMat4(
		[shape.dimensions[0], 0, 0, 0,
		 0, shape.dimensions[1], 0, 0,
		 0, 0, shape.dimensions[2], 0,
		 shape.centre[0], shape.centre[1], shape.centre[2], 1
		]
	);

	var transform = multiplyMat4(localToGlobalMatrix, localTransform);
	
	gl.uniformMatrix4fv(scene.program.modelMatrixUniform, gl.FALSE, transform);
	
	gl.uniformMatrix4fv(scene.program.projectionMatrixUniform, gl.FALSE, projectionMatrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, scene.cube.vertexBuffer);

	gl.uniform3fv(scene.program.inColourUniform, shape.wireColour);
	gl.drawArrays(gl.LINE_LOOP, 0, scene.cube.vertexCount);

	//Bind and render the buffer containing the triangles tha make up our cube
	gl.uniform3fv(scene.program.inColourUniform, shape.colour);
	gl.drawArrays(gl.TRIANGLES, 0, scene.cube.vertexCount);
	
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
	
	var proj = $('input:radio[name=projection]:checked').val();
	if(proj == 'perspective'){
		var projectionMatrix = perspective(l, r, t, b, n, f);
	} else if (proj == 'orthographic'){
		var projectionMatrix = orthographic(l, r, t, b, n, f);
	}

	for(var i = 0; i < scene.objectsToRender.length; i++){
		scene.objectsToRender[i].render(gl, scene, projectionMatrix);
	}
	
	requestAnimationFrame(function(time) {
		render(gl,scene,time,timestamp);
	});
}

/**
* Loads in the vertices of a 3D mesh from the string
* contents of a ".OBJ" file.
*
* @param {string} The contents of an OBJ file.
*/
function loadMeshData(string) {
	var lines = string.split("\n");
	var positions = [];
	var vertices = [];

	for(var i = 0; i < lines.length; i++) {
		var tokens = lines[i].trim().split(' ');
		if(tokens.length > 0){
			if(tokens[0] == 'v'){
				var vec3 = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
				positions.push(vec3);
			}else if(tokens[0] == 'f'){
				for(var v = 1; v < 4; v++){
					var vertexIndex = parseInt(tokens[v]) - 1;
					Array.prototype.push.apply(vertices, positions[vertexIndex])
				}
			}
		}
	}
	return {
		vertices: new Float32Array(vertices),
		vertexCount: vertices.length / 3,
	};
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
function initWebGL(cubeMesh) {
	//The surface and WebGL context
	var surface = document.getElementById('rendering-surface');
	var gl = surface.getContext('experimental-webgl');
	
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
	program.positionAttribute = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(program.positionAttribute);

	var vertexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cubeMesh.vertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, gl.FALSE, Float32Array.BYTES_PER_ELEMENT * 3, 0);

	//Initialise our transformation matrices, and figure out how to pass
	//them to our shaders as uniform variables:
	
	program.projectionMatrixUniform = gl.getUniformLocation(program, 'projectionMatrix');

	var viewMatrix = createMat4();
	program.viewMatrixUniform = gl.getUniformLocation(program, 'viewMatrix');
	gl.uniformMatrix4fv(program.viewMatrixUniform, gl.FALSE, viewMatrix);
	
	program.inColourUniform = gl.getUniformLocation(program, 'inColour');
	program.modelMatrixUniform = gl.getUniformLocation(program, 'modelMatrix');

	cubeMesh.vertexBuffer = vertexBuffer;

	//Clear our binding contexts
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.useProgram(null);
	

	//A bundle of useful state for rendering
	var scene = {
		program: program,
		cube: cubeMesh,
		start: Date.now(),
		//projectionMatrix: projectionMatrix,
		viewMatrix: viewMatrix,
		objectsToRender: initialiseObjectsToRender()
	};

	//Start drawing frames soon
	requestAnimationFrame(function(timestamp) {
		render(gl, scene, timestamp, 0);
	});
}

$(document).ready(function() {
  loadMesh('cube.obj')
});
