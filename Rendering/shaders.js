//The vertex shader that performs coordinate transformations, and projects the 3D to 2D coordinates.
var vertexShaderSource = `#version 300 es
	precision mediump float;

	//##########################################
	//#          Per-Vertex Inputs             #
	//##########################################

	//The vertex's 3D position in model space.
	in vec3 vertPos;
	
	//The 2D texture coordinates for this vertex (use for displacement mapping)
	in vec2 vertUV;
	
	//The normal vector at this vertex in model space.
	in vec3 vertNormal;
	
	//##########################################
	//#                Outputs                 #
	//##########################################

	
	//TODO: Add new output variables here for texture uvs and vertex normals
	out vec3 vertexNormal;
	out vec2 vertexUV;
	
	out vec3 eyeVec;
	out vec3 lightVec;
	
	//##########################################
	//#            Light Parameters            #
	//##########################################
	
	//Homogeneous coordinate of eye/camera (in world coordinates).
	const vec4 eyePos = vec4(0.0);
	
	//Homogeneous coordinate of light source  (in world coordinates).
	const vec4 lightPos = vec4(1.0, 0.0, 0.0, 1.0);
	
	//##########################################
	//#      Transformation Matrices           #
	//##########################################

	//Uniform variables are the same across all invocations of a shader
	//so each vertex will get the same set of transformation matrices:
	uniform mat4 modelMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;


	//##########################################
	//#                 Main                   #
	//##########################################

	//The transformed vertex coordinates are passed on to the next stage of the graphics pipeline.
	void main() {

		vec4 pos = vec4(vertPos, 1.0);
		
		
		//TODO: set up the normal vector and texture uvs to pass to the fragment shader here:
		//You will need to add new in/out variables in both shaders for this.
		vertexNormal = vertNormal;
		vertexUV = vertUV;
		
		vec4 vGlobal = modelMatrix * pos;

		//Calculate the vector from the vertex to the viewer's eye (in world coordinates).
		eyeVec = (eyePos - vGlobal).xyz;

		//Calculate the vector from the vertex to the light source (in world coordinates).
		lightVec = (lightPos - vGlobal).xyz;

		gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos; 
	}
`;

//This simple fragment shader makes every pixel it receives a single colour.
var fragmentShaderSource = `#version 300 es
	precision mediump float;
	
	//##########################################
	//#      Inputs from the Vertex Shader      #
	//##########################################
	
	
	//TODO: add new input variables matching those from the vertex shader to receive the normal and texture uv coordinates
	in vec3 vertexNormal;
	in vec2 vertexUV;
	
	in vec3 eyeVec;
	in vec3 lightVec;
	
	out vec4 fragColor;
	
	//##########################################
	//#        Normal Mapping Parameters       #
	//##########################################
	
	//A weighting factor to multiply the displacement from the texture map
	uniform float displacementScale;

	//A sampler to select pixels from the 2D texture defining the displacement map
	uniform sampler2D normalMapTexture;
	

	//##########################################
	//#            Light Parameters            #
	//##########################################

	//The single point light's intensity (split into rgb channels to give it a configurable colour).
	const vec3 lightIntensity = vec3(0.8);

	//The rgb colour of the ambient light in the scene.
	const vec3 lightAmbient = vec3(0.3);
	
	//##########################################
	//#           Material Parameters          #
	//##########################################

	//The diffuse colour of the model (how much diffuse light it reflects in rgb channels).
	const vec3 materialDiffuse = vec3(0.4, 0.9, 0.4);

	//The model's specular reflection intensity for each rgb colour channel.
	const vec3 materialSpecular = vec3(1.0, 1.0, 1.0);

	//The intensity of the ambient light reflected by the model for each rgb colour channel.
	const vec3 materialAmbient = vec3(0.4, 0.9, 0.4);

	//The exponent in the phong specularity calculation.
	//Smoother, more mirror-like surfaces should have higher values, 
	//which will reduce the size of the specular highlight.
	
	
	//TODO change this to a uniform variable instead of a const after you have implemented code to 
	//initialise its value in 03_render.js
	
	uniform float shininess;
	
	
	
	//##########################################
	//#                 Main                   #
	//##########################################

	//Output the colour as an RGBA vector with full alpha
	void main() {

		vec4 tex = texture(normalMapTexture, vertexUV);
		vec3 vectorDisp = vec3(tex.x, tex.y, tex.z) * 2.0 - vec3(1, 1, 1); // from -1 to 1
		vec3 vectorDispSca = vectorDisp * displacementScale;
		vec3 newN = vertexNormal + vectorDispSca;
		vec3 n = normalize(newN);
	
	
		//TODO: implement phong illumination here to return more than just materialAmbient:
		vec3 eye_vec = normalize(eyeVec);
		vec3 light_vec = normalize(lightVec);
		
		vec3 H = light_vec + eye_vec;
		vec3 h = normalize(H);

		vec3 amb = materialDiffuse*(lightAmbient + lightIntensity*max(0.0, dot(vertexNormal, light_vec)));
		vec3 phong = materialSpecular*lightIntensity*pow(dot(h, n), shininess);

		vec3 outt = amb + phong;
		vec3 outCol = vec3(clamp(outt, 0.0, 1.0));
	
		fragColor = vec4(outCol, 1.0);
	}
`;






//A flat colour shader for rendering the wireframe model

var wireframeVertexShaderSource = `
	precision mediump float;

	//Attributes are different for each vertex.
	//This represents the vertex's 3D position in model space.
	attribute vec3 vertPos;

	//Uniform variables are the same across all invocations of a shader
	//so each vertex will get the same set of transformation matrices:
	uniform mat4 modelMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;

	//The transformed vertex coordinates are passed on to the next stage of the graphics pipeline.
	void main() {
	  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vertPos, 1.0); 
	}
`;

//This simple fragment shader makes every pixel it receives a single colour.
var wireframeFragmentShaderSource = `
	precision mediump float;

	//Output the colour as an RGBA vector with full alpha
	void main() {
	  gl_FragColor = vec4(1.0);
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


