var width = window.innerWidth,
  height = window.innerHeight;

var captions = {};

var positionCache = {};
var wikipediaID = {};

var graphLaunched = true;

var converted = {
  "root": [
    "\"Behavior, Purpose, and Teleology\""
  ],
  "rootCache": [
    "\"Behavior, Purpose, and Teleology\""
  ],
  "nodes" : [],
  "links" : []
};

var nameAux = "";
var map = {};
var dijkstra = {};

$.getJSON( 'public/json/data.json', function(data){



  //creating all nodes
  for(var i=0; i < data.length; i++){

    if(nameAux != data[i].name){
      //it's a different node, add to the node
      nameAux = data[i].name;
      map[nameAux] = {};

      var node = {
        "name" :data[i].name,
        "type" : data[i].type,
        "symbol": data[i].symbol,
        "linkRange": 0, //Math.floor(Math.random() * 201) - 100
        "id" : data[i].name.replace(" ", "")
      };

      if (converted['root'].indexOf( node.name ) !== -1) {
        node.x = width/2;
        node.y = height/2;
      }

      converted.nodes.push(node);
    }

    map[nameAux][data[i].linkTo] = 10; //some nodes have too many childrens 
  }

  for(var i = 0; i < data.length; i++){

    var source = findPosition(data[i].name, converted.nodes),
      target = findPosition(data[i].linkTo, converted.nodes),
      linkInfo = "--",
      linkAux = source > target?
        data[i].linkTo + "-" + data[i].name :
        data[i].name + "-" + data[i].linkTo;

    if(!(linkAux in captions)){
      captions[linkAux] = "";
    }

    if(data[i].wikipediaID != undefined && data[i].wikipediaID != "" && !(data[i].wikipediaID in wikipediaID)){
      wikipediaID[data[i].name] = data[i].wikipediaID;
    }


    captions[linkAux] = data[i].linkInfo == "" ? captions[linkAux] : data[i].linkInfo;
    linkInfo = captions[linkAux];

    converted.links.push({
      "source" : source,
      "target": target,
      "linkType": data[i].linkType,
      "linkInfo": linkInfo,
      "depth": data[i].depth
    });
  }
  
  startGraph(converted, captions);

});


function findPosition(name, array){

  if(name in positionCache){
    return positionCache[name];
  }

  var position = 0;
  var i = 0;

  while(i < array.length){
    if(array[i].name == name){
      position = i;
      i = array.length;

      positionCache[name] = position; //saving into the cache
    }

    i++;
  }

  return position;
}