//////////////////////////////////////////////////////////////
/////                Hierarchical Robot Segments
//////////////////////////////////////////////////////////////
	
function RobotSegment(parent, localToParentMatrix, shape){
	this.parent = parent;
	this.localToParentMatrix = localToParentMatrix;
	
	this.shape = shape;
	
	this.getLocalTransform = function(){
		return createMat4();
	}
	
	this.getLocalToGlobalMatrix = function(){
		var transform = this.getLocalTransform();
		
		//TODO implement this so that it returns the correct hierarchical transformation
		//matrix using the local "transform", "this.localToParentMatrix", and any
		//necessary transformations from "this.parent".
		//var result = createMat4();
		var currentParent = this.parent;
		var currentElement = this;
		result = localToParentMatrix
		while(currentParent !== null && currentParent !== undefined) {
			result = multiplyMat4(currentElement.getLocalTransform(), result);
			result = multiplyMat4(currentParent.localToParentMatrix, result);
			var temp = currentParent;
			currentElement = currentParent;
			currentParent = temp.parent;
		}
		
		return result;
	}
	
	this.render = function(gl, scene, projectionMatrix){
		var localToGlobalMatrix = this.getLocalToGlobalMatrix();
		renderCuboid(gl, scene, projectionMatrix, localToGlobalMatrix, this.shape);
	}
}


//////////////////////////////////////////////////////////////
/////  Initialising all Robot Segments (add missing gripper)
//////////////////////////////////////////////////////////////	
		
var GREY = [0.3, 0.3, 0.3];
var GREEN = [0, 1, 0];		
		
function addGripper(robotSegments){

	//TODO implement this to add a gripper to the end of the robot arm
	//Add any new segments to the  "robotSegments" array
	//The end current of the arm is robotSegments[4], whose size can be accessed via robotSegments[4].shape.dimensions
	//Examples of adding and creating segments can be seen in the initRobotSegments() function below
	
	//Also, overwrite the getLocalTransform() functions on any new gripper segments necessary to
	//make it open and close via the slider. The slider value can be retrieved via:
	//var closedness = parseFloat($('#gripper').val());
	//Which returns a closedness variable between 0 and 1
	
}		
		
function initRobotSegments(){
	var robotSegments = []
		
	sizes = [
		[2.0, 0.2, 2.0],
		[1.0, 0.2, 1.0],
		[0.5, 2.0, 0.5],
		[0.4, 1.5, 0.4],
		[0.3, 1.0, 0.3]
	]

	var parent = null;
	var localToParentMatrix = translate(0, -3.5, -11);
	for(var i = 0; i < sizes.length; i++){
		let joint = new RobotSegment(parent, localToParentMatrix, new Shape([0, sizes[i][1] / 2, 0], sizes[i], GREY, GREEN));
		robotSegments.push(joint);
		
		parent = joint;
		var offsetFromParentOriginToJointCentre = (sizes[i][1]);
		var localToParentMatrix = translate(0, offsetFromParentOriginToJointCentre, 0);
	}
	
	robotSegments[0].getLocalTransform = function(){
		var moveX = ($('#move-x').val());
		var moveY = ($('#move-y').val());
		var moveZ = ($('#move-z').val());
		return translate(moveX, moveY, moveZ);
	}
	
	robotSegments[1].getLocalTransform = function(){
		var theta = ($('#joint0').val());
		return rotateY(theta);
	}
	robotSegments[2].getLocalTransform = function(){
		var theta = ($('#joint1').val());
		return rotateZ(theta);
	}
	robotSegments[3].getLocalTransform = function(){
		var theta = ($('#joint2').val());
		return rotateZ(theta);
	}
	robotSegments[4].getLocalTransform = function(){
		var theta = ($('#joint3').val());
		return rotateZ(theta);
	}

	addGripper(robotSegments);

	return robotSegments;
}


