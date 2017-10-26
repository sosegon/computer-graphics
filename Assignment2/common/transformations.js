//////////////////////////////////////////////////////////////
/////             Transformation Matrices
//////////////////////////////////////////////////////////////
	
	//Return a translation matrix
	function translate(x, y, z) {
		return arrayToMat4(
			[1, 0, 0, 0,
			 0, 1, 0, 0,
			 0, 0, 1, 0,
			 x, y, z, 1]
		);
	}	

	//Return a scale matrix
	function scale(x, y, z) {
		return arrayToMat4(
			[x, 0, 0, 0,
			 0, y, 0, 0,
			 0, 0, z, 0,
			 0, 0, 0, 1]
		);
	}
	
	//Rotation matrixes for different axes:
	
	function rotateX(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);
		return arrayToMat4(
			[1, 0, 0, 0,
			 0, c, s, 0,
			 0, -s,c, 0,
			 0, 0, 0, 1]
		);
	}
	
	function rotateY(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);
		return arrayToMat4(
			[c, 0, s, 0,
			 0, 1, 0, 0,
			 -s,0, c, 0,
			 0, 0, 0, 1]
		);
	}
	
	function rotateZ(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);
		return arrayToMat4(
			[c, s, 0, 0,
			-s, c, 0, 0,
			 0, 0, 1, 0,
			 0, 0, 0, 1]
		);
	}
	
