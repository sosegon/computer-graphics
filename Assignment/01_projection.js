//////////////////////////////////////////////////////////////
/////                Projection Matrices
//////////////////////////////////////////////////////////////

/**
* Returns a perspective projection matrix
* Perameters are left, right, top, bottom, near, and far coordinates of the viewing frustrum.
*/
function perspective(l, r, t, b, n, f) {

	// Assuming that l = -r, b = -t, 
 	var persp = [n/r, 0,    0,                    0,
                0,    n/t,  0,                    0,
                0,    0,    (-(f + n)/(f - n)),   -1,
                0,    0,    ((-2*f*n)/(f - n)),    0];
        
	//TODO replace this with a perspective matrix
	persp = arrayToMat4(persp);	
	return persp;
}

/**
* Returns an orthographic projection matrix
* Perameters are left, right, top, bottom, near, and far coordinates of the viewing frustrum.
*/
function orthographic(l, r, t, b, n, f) {

	//TODO replace this with an orthographic matrix
	// Assuming that l = -r, b = -t, 
	var mortho = [
		1/r,  	  0, 	 	   0, 0,
		  0,	1/t,		   0, 0,
		  0,	  0,     2/(n-f), 0,
		  0,	  0,		   0, 1
	];
	return arrayToMat4(mortho);
}
