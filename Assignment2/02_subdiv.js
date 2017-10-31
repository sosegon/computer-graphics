
function subdivideMesh(originalVerexData, numSubdivisions, alpha) {	
	if(numSubdivisions == 0){
		return originalVerexData;
	}else{
		var numElementsInBuffer = originalVerexData.length;
		var elementsPerVertex = 3 + 2 + 3;
		var numVertices = numElementsInBuffer / elementsPerVertex;
		var elementsPerFace = elementsPerVertex * 3;

		var newVertexData = [];
		
		var counter = 0;
		while(counter < numElementsInBuffer) {
			var vertex0Data = originalVerexData.slice(counter, counter + 8);
			var vertex1Data = originalVerexData.slice(counter + 8, counter + 16);
			var vertex2Data = originalVerexData.slice(counter + 16, counter + 24);

			var vertex01Data = generateVertexData(vertex0Data, vertex1Data, alpha);
			var vertex12Data = generateVertexData(vertex1Data, vertex2Data, alpha);
			var vertex02Data = generateVertexData(vertex2Data, vertex0Data, alpha);

			// Apply alpha displacement
			if(alpha !== 0 && numSubdivisions === 1) {
				vertex0Data = displaceVertex(vertex0Data, alpha); 
				vertex1Data = displaceVertex(vertex1Data, alpha); 
				vertex2Data = displaceVertex(vertex2Data, alpha); 
				vertex01Data = displaceVertex(vertex01Data, alpha);
				vertex12Data = displaceVertex(vertex12Data, alpha);
				vertex02Data = displaceVertex(vertex02Data, alpha);
			}

			// Generate the new triangles
			var allData = [
				vertex0Data, vertex01Data, vertex02Data,
				vertex01Data, vertex1Data, vertex12Data,
				vertex12Data, vertex2Data, vertex02Data,
				vertex01Data, vertex12Data, vertex02Data];

			// Add the new data to the new buffer
			for(var i = 0; i < allData.length; i++){
				currentData = allData[i];
				for(var j = 0; j < currentData.length; j++) {
					newVertexData.push(currentData[j]);
				}
			}
			counter = counter + 24;
		}
		
		return subdivideMesh(newVertexData, numSubdivisions - 1, alpha);
	}
}

function generateVertexData(data1, data2) {
	var nt = [
		data1[5] + data2[5],
		data1[6] + data2[6],
		data1[7] + data2[7]
	];
	var mnt = 2
	// This vector is divided by 2 since is half way between
	// vectors 1 and 2. It is not normalized, to mantain the
	// illumination in the model. Remember that the fragment
	// shader is doing the interpolation for us, that means,
	// it calculates the normals automatically. Those calculated
	// normals are not normalized to get the smooth effect; we
	// want the same effect when subdividing the mesh
	nt = [nt[0] / mnt, nt[1] / mnt, nt[2] / mnt];
	var data = [
		(data1[0] + data2[0]) / 2,
		(data1[1] + data2[1]) / 2,
		(data1[2] + data2[2]) / 2,
		(data1[3] + data2[3]) / 2,
		(data1[4] + data2[4]) / 2,
		nt[0],
		nt[1],
		nt[2]
	];

	return data;
}

function displaceVertex(data, alpha) {
	var nt = [
		data[5],
		data[6],
		data[7]
	];

	var nt_mag = Math.sqrt(nt[0] * nt[0] + nt[1] * nt[1] + nt[2] * nt[2]);
	displ_vector = [
		alpha * nt[0] / nt_mag, 
		alpha * nt[1] / nt_mag, 
		alpha * nt[2] / nt_mag
	];

	return [
		data[0] + displ_vector[0],
		data[1] + displ_vector[1],
		data[2] + displ_vector[2],
		data[3],
		data[4],
		data[5],
		data[6],
		data[7]
	];
}
