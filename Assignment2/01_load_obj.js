/**
* Loads in the vertices of a 3D mesh from the string
* contents of a ".OBJ" file.
*
* @param {string} The contents of an OBJ file.
*/
function loadMeshData(string) {
	var lines = string.split("\n");
	var positions = [];
	var normals = [];
	var uvs = [];
	var vertexBuffer = [];

	for(var i = 0; i < lines.length; i++) {
		var tokens = lines[i].trim().split(' ');
		if(tokens.length > 0){
			

			//TODO: Implement this to fill in the vertexBuffer (see Tutorial 3 for more details)

				
		}
	}
	
	return vertexBuffer;
}
