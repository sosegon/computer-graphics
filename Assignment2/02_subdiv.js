
function subdivideMesh(originalVerexData, numSubdivisions, alpha) {	
	if(numSubdivisions == 0){
		return originalVerexData;
	}else{
		var numElementsInBuffer = originalVerexData.length;
		var elementsPerVertex = 3 + 2 + 3;
		var numVertices = numElementsInBuffer / elementsPerVertex;
		var elementsPerFace = elementsPerVertex * 3;

		var newVertexData = [];
		
		
		//TODO: Implement subdivision here:
		
		
		return newVertexData;
	}
}

