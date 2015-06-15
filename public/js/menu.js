var active = {};
var openNodeCache = null;

var activeFilters = null;

$(".nav a").on("click", function(){
  //  $(".nav").find(".active").removeClass("active");

  if(openNodeCache == null){
    openNodeCache = $.extend( {}, openNode);
  }

  var all = false;
  openNode = {};

  if($(this).parent().hasClass('active')){
    delete active[$(this).attr('id')]; //removing element from the active list

    $(this).parent().removeClass("active");
  } else{
    $(this).parent().addClass("active");
    active[$(this).attr('id')] = $(this).attr('id');


    if($(this).attr('id') == "all"){
      all = true;
      active = {};
      $(".nav").find(".active").removeClass("active");
      $(this).parent().addClass("active");
    }else{
      $("#all").parent().removeClass("active");
    }
  }

  if($(".active").length == 0){

    console.log(openNodeCache);
    var rootAux = [];
    for(open in openNodeCache)
      rootAux.push(open);

    openNodeCache = null;

    openNode = {};
    linksCreated = {};
    linksDistanceDict = {};

    converted.root = rootAux;
    activeFilters = null;

    startGraph(converted, captions); //start everything again with the main root / previous stage
    return;
  }

  filter(all);
});


function filter(all){

    if(all){

        if(node != null) node.remove();
        if(link != null) link.remove();
        if(text != null) text.remove();

        var rootAux = [];

        for(var i = 0; i < converted.nodes.length; i++){
            rootAux.push(converted.nodes[i].name);
        }

        converted.root = rootAux.slice();

        startGraph(converted, captions); //start everything again with the main root / previous stage

        // createGraph({
        //     "graph": [],
        //     "links": converted.links,
        //     "nodes": converted.nodes,
        //     "directed": true,
        //     "multigraph": true
        // });  
        return;
    }

    var nodesAux = [];
    var linksAux = [];
    var linkAux = "";

    activeFilters = {};
    var nodesDisplayed = {};
    var linksCreated = {};

    console.log("------");
    for(act in active) activeFilters[menuDict(act)] = menuDict(act);

    // console.log(activeFilters);

    for(var i = 0; i < converted.nodes.length; i++){
        if(converted.nodes[i].type in activeFilters || all){
            nodesAux.push({
                "name" : converted.nodes[i].name,
                "type" : converted.nodes[i].type,
                "symbol" : converted.nodes[i].symbol
            });
            nodesDisplayed[converted.nodes[i].name] = converted.nodes[i].name;
        }
    }

    for(n in nodesDisplayed){
        //checking link by link from the original data
        for(var j = 0; j < cache.links.length; j++){

          //creating the format for the dictionary
          // <name>-<name>
            linkAux = cache.links[j].source > cache.links[j].target ?
                cache.nodes[cache.links[j].target].name + "-" + cache.nodes[cache.links[j].source].name:
                cache.nodes[cache.links[j].source].name + "-" + cache.nodes[cache.links[j].target].name;

            if(!(linkAux in linksCreated) && (cache.nodes[cache.links[j].target].name in nodesDisplayed && cache.nodes[cache.links[j].source].name in nodesDisplayed)){
                console.log("********", cache.nodes[cache.links[j].source].name , cache.nodes[cache.links[j].target].name);
                // console.log( + " --> " + checkLinkPosition(cache.nodes[cache.links[j].target].name, nodesAux));
                linksAux.push({
                    "source": checkLinkPosition(cache.nodes[cache.links[j].source].name, nodesAux),
                    "target": checkLinkPosition(cache.nodes[cache.links[j].target].name, nodesAux),
                    "linkType": cache.links[j].linkType,
                    "linkInfo": cacheCaptions[linkAux],
                    "depth": cache.links[j].depth
                });

                linksCreated[linkAux] =  linkAux;
            }
                
        }
    }

    console.log(linksAux);
    console.log(nodesAux);
    // console.log(nodesDisplayed);

    if(node != null) node.remove();
    if(link != null) link.remove();
    if(text != null) text.remove();

    createGraph({
        "graph": [],
        "links": linksAux,
        "nodes": nodesAux,
        "directed": true,
        "multigraph": true
    });   


}

function checkLinkPosition(name, array){
  var position = 0;
  var i = 0;
  var achou = false;

  while(i < array.length){
    // console.log(name, array[i].name);
    if(array[i].name == name){
      position = i;
      i = array.length;
      achou = true;
      // console.log(position);
    }

    i++;
  }

  // if(!achou)
  //   console.log('nao achou');

  return position;
}