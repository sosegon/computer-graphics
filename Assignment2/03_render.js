
function renderMonkey(gl, scene, modelMatrix, projectionMatrix){

//Start using our vertex and fragment shaders
	gl.useProgram(scene.program);
	
	var normalMapScale = parseFloat($('#normal_map_scale').val());
	displacementScaleUniformLocation = gl.getUniformLocation(scene.program, 'displacementScale');
	gl.uniform1f(displacementScaleUniformLocation, normalMapScale);
	
	var shininessVal = parseFloat($('#shininess').val());

	//TODO: pass in shininessVal to the fragment shader's uniform variable 'shininess' here:
	var shininessLoc = gl.getUniformLocation(scene.program, "shininess");
	gl.uniform1f(shininessLoc, shininessVal)
	
	
	
	
	//Set up the normal map texture
	gl.activeTexture(gl.TEXTURE0); // Tell WebGL we want to affect texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, scene.texture); // Bind the texture to texture unit 0
	gl.uniform1i(scene.program.textureUniform, 0); // Tell the shader we bound the texture to texture unit 0

	//Set up the transformation matrices
	gl.uniformMatrix4fv(scene.program.modelMatrixUniform, gl.FALSE, modelMatrix);
	gl.uniformMatrix4fv(scene.program.projectionMatrixUniform, gl.FALSE, projectionMatrix);
	
	gl.drawArrays(gl.TRIANGLES, 0, scene.vertexCount);	
}