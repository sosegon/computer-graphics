//The vertex shader that performs coordinate transformations, and projects the 3D to 2D coordinates.
var vertexShaderSource = `
	precision mediump float;

	//Attributes are different for each vertex.
	//This represents the vertex's 3D position in model space.
	attribute vec3 pos;

	//Uniform variables are the same across all invocations of a shader
	//so each vertex will get the same set of transformation matrices:
	uniform mat4 modelMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;

	//The transformed vertex coordinates are passed on to the next stage of the graphics pipeline.
	void main() {
	  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0); 
	}
`;

//This simple fragment shader makes every pixel it receives a single colour.
var fragmentShaderSource = `
	precision mediump float;

	//The input colour passed in as a uniform argument
	uniform vec3 inColour;

	//Output the colour as an RGBA vector with full alpha
	void main() {
	  gl_FragColor = vec4(inColour, 1.0);
	}
`;


//Compile and link the specified vertex and fragment shaders,
//throwing exceptions if either stage goes wrong.
function createProgram(gl, shaderSpecs) {
	var program = gl.createProgram();
	
	//Go through all shaders in the list
	for(var i = 0; i < shaderSpecs.length; i++){
		var spec = shaderSpecs[i];
		var shader = gl.createShader(spec.type);
		
		//Load the source code from the script tags
		gl.shaderSource(shader, spec.shaderString);
		
		//Compile the shader and check for errors
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw gl.getShaderInfoLog(shader);
		}
		
		//Add the shader to the program, and clean up resources
		gl.attachShader(program, shader);
		gl.deleteShader(shader);
	}
	
	//Link the vertex and fragment shader stages together in the program.
	//If the stages do not have matching input and output variables, an error is thrown.
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
}


