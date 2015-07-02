'use strict';

var grid = (function(){

	var gridLayout;
	var gridDictPosition; 	//dictionary for the positions, this is going to return
							//an object {top : <int>, left: <int>} related to the position in the grid


	function createGrid(grid){

		for(var i = 0; i < 16; i++){
			var array = [];
			for(var j = 0; j < 16; j++)
				array.push(null);

			grid.push(array);
		}

		return grid;
	}

	function initDict(root){

		gridLayout = [];
		gridDictPosition = {};

		gridLayout = createGrid(gridLayout);


		gridLayout[0][0] = root;
		gridDictPosition[root] = {"top" : 0 , "right" : 0};

		return gridLayout;

	}

	function calculateNewPath(path){
		//Path is an [] with the positions that are going to be related to the main root (position [0][0])

		var gridAux = createGrid([]);
		gridDictPosition = {};

		gridAux[0] = path;



		for(var i = 0; i < path.length; i++){
			gridAux[0][i] = path[i];
			gridDictPosition[path[i]] = {"top" : 0 , "right" : i};
		}

		for(var i = 0; i < gridLayout.length; i++){
			for(var j = 0; j < gridLayout[i].length; j++){

				if( (gridLayout[i][j] != null) && (graph.checkOpenNode(gridLayout[i][j])) && !(gridLayout[i][j] in gridDictPosition)){
					var top = i;

					if(gridAux[i][j] != null){
						while(gridAux[top][j] != null){
							top++;
					 	} //looking for the next position available
					}

					if(top == 0){ top = 1; } // this row is for the short path

					gridDictPosition[gridLayout[i][j]] = {"top" : top , "right" : j};
					gridAux[top][j] = gridLayout[i][j];
				}

			}
		}
		gridLayout = gridAux;

	}

	function gridPosition(node){ return gridDictPosition[node]; }

	function removeNode(node){
		delete gridDictPosition[node];

		return gridDictPosition;
	}


	return {
		createInstance : function(root){
			gridLayout = initDict(root);

			return gridLayout;
		},
		addNode : calculateNewPath,
		removeNode : function(){
			console.log('remove');
		},
		getGridPosition : gridPosition
	}

}());
