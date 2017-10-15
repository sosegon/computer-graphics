//////////////////////////////////////////////////////////////
/////             Transformation Matrices
//////////////////////////////////////////////////////////////
	
	//TODO Fill these in so they return the correct transformation
	//matrices instead of the identity matrix.
	
	//Return a translation matrix
	function translate(x, y, z) {
		var t = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1
		];
		return arrayToMat4(t);
	}	

	//Return a scale matrix
	function scale(x, y, z) {
		var s = [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		];
		return arrayToMat4(s);
	}
	
	//Rotation matrixes for different axes:
	
	function rotateX(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);

		var r = [
			1, 0, 0, 0,
			0, c, s, 0,
			0, -s, c, 0,
			0, 0, 0, 1
		];
		return arrayToMat4(r);
	}
	
	function rotateY(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);

		var r = [
			c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1
		];
		return arrayToMat4(r);
	}
	
	function rotateZ(theta) {
		var s = Math.sin(theta);
		var c = Math.cos(theta);

		var r = [
			c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		return arrayToMat4(r);
	}
	
