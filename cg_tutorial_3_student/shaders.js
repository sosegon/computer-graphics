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

	//The colour for this vertex. By default, colours will be
	//smoothly interpolated. Add the word "flat" in front of "out" here and
	//in the fragment shader to do flat shading.
	//flat out vec3 outCol;
	out vec3 outCol; // Remove flat to get Gouraud Shading

	
	//##########################################
	//#     Displacement Mapping Parameters    #
	//##########################################
	
	//A weighting factor to multiply the displacement from the texture map
	const float displacementScale = 0.1;

	//A sampler to select pixels from the 2D texture defining the displacement map
	uniform sampler2D displacementMapTexture;
	
	//##########################################
	//#      Transformation Matrices           #
	//##########################################

	//Uniform variables are the same across all invocations of a shader
	//so each vertex will get the same set of transformation matrices:
	uniform mat4 modelMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;

	//##########################################
	//#            Light Parameters            #
	//##########################################
	
	//Homogeneous coordinate of eye/camera (in world coordinates).
	const vec4 eyePos = vec4(0.0);
	
	//Homogeneous coordinate of light source  (in world coordinates).
	const vec4 lightPos = vec4(0.3, 0.0, 1.0, 1.0);

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
	const float shininess = 50.0;

	
	//##########################################
	//#                 Main                   #
	//##########################################

	//The transformed vertex coordinates are passed on to the next stage of the graphics pipeline.
	void main() {
		
		//TODO: Add displacement mapping to pos:
		vec4 col = texture(displacementMapTexture, vertUV);
		float delta = col[0] * displacementScale;
		vec3 newPos = vertPos + (vertNormal * delta);
		vec4 pos = vec4(newPos, 1.0);

		
		
		
		//unit length (the linear interpolation does not preserve vector length).
		vec3 n = normalize((transpose(inverse(mat3(modelMatrix))) * vertNormal));
		
		//TODO: Add phong illumination here, and set outCol to the result instead of materialAmbient
		vec3 eye_pos = vec3(eyePos.x, eyePos.y, eyePos.z);
		vec3 Light_pos = vec3(lightPos.x, lightPos.y, lightPos.z);

		vec3 light_pos = normalize(Light_pos);

		vec3 H = light_pos + eye_pos;
		vec3 h = normalize(H);

		vec3 amb = materialDiffuse*(lightAmbient + materialAmbient*max(0.0, dot(n, light_pos)));
		vec3 phong = materialSpecular*materialAmbient*pow(dot(h, n), shininess);

		vec3 outt = amb + phong;
		outCol = vec3(clamp(outt, 0.0, 1.0));
		//outCol = materialAmbient;


		//Project the final position into global space, then camera space, then projected space
		gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos; 
	}
`;

//This simple fragment shader makes every pixel it receives a single colour.
var fragmentShaderSource = `#version 300 es
	precision mediump float;

	//flat in vec3 outCol;
	in vec3 outCol; // Remove flat to get Gouraud Shading
	
	out vec4 fragColor;

	//Output the value of outCol as an RGBA vector with full alpha
	void main() {
	  fragColor = vec4(outCol, 1.0);
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


