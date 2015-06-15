var width = window.innerWidth,
  height = window.innerHeight;

var captions = {};

var positionCache = {};

var converted = {
  "root": [
    "\"Behavior, Purpose, and Teleology\""
    // "Gordon Pask",
    // "Stewart Brand",
    // "Cedric Price",
    // "Norbert Wiener",
    // "Marshall McLuhan",
    // "Julian Bigelow"
  ],
  "rootCache": [
    "\"Behavior, Purpose, and Teleology\""
  ],
  "nodes" : [],
  "links" : []
};

var nameAux = "";

$.getJSON( 'public/json/data.json', function(data){



  //creating all nodes
  for(var i=0; i < data.length; i++){

    if(nameAux != data[i].name){
      //it's a different node, add to the node
      nameAux = data[i].name;
      // positionCache[data[i].name] = i; 

      var node = {
        "name" :data[i].name,
        "type" : data[i].type,
        "symbol": data[i].symbol,
        "score" : Math.random()
      };

      if (converted['root'].indexOf( node.name ) !== -1) {
        node.x = width/2;
        node.y = height/2;
      }

      converted.nodes.push(node);
    }
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

  // console.log(positionCache);
  // console.log(converted.links);

  startGraph(converted, captions);

  // createGraph({
  //   "graph": [],
  //   "links": converted.links,
  //   "nodes": converted.nodes,
  //   "directed": false,
  //   "multigraph": false
  // });

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
