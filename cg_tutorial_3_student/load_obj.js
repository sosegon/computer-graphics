/**
* Loads in the vertices of a 3D mesh from the string
* contents of a ".OBJ" file.
*
* @param {string} The contents of an OBJ file.
*/
function loadMeshData(string) {
	var lines = string.split("\n");

	var vertexBuffer = [];

	var positions = [];
	var normals = [];
	var uvs = [];

	var temp_positions = [];
	var temp_normals = [];
	var temp_uvs = [];

	for(var i = 0; i < lines.length; i++) {
		var tokens = lines[i].trim().split(' ');
		if(tokens.length > 0){
			switch(tokens[0]){
				//TODO: Fill this in to load the .obj file into vertexBuffer with positions, texture uvs, and normals
				case 'v':
					temp_positions.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					break;
				case 'vt':
					temp_uvs.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
					break;
				case 'vn':
					temp_normals.push([parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])]);
					break;
				case 'f': // At this point all positions, normals and uvs have been collected
					for(var k = 1; k <= 3; k++){
						face_elem = tokens[k].split('/');
						var pos = temp_positions[parseInt(face_elem[0]) - 1];
						var uvs = temp_uvs[parseInt(face_elem[1]) - 1];
						var nor = temp_normals[parseInt(face_elem[2]) - 1];
						for(var j = 0; j < pos.length; j++){
							vertexBuffer.push(pos[j])
						}
						for(var j = 0; j < uvs.length; j++){
							vertexBuffer.push(uvs[j])
						}
						for(var j = 0; j < nor.length; j++){
							vertexBuffer.push(nor[j])
						}
					}
					break;
				default:
					break;
			}
		}
	}
	var elementsPerVertex = 3 + 2 + 3;
	return {
		vertexBuffer: new Float32Array(vertexBuffer),
		vertexCount: vertexBuffer.length / elementsPerVertex,
	};
}
