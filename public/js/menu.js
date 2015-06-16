var active = {};
var openNodeCache = null;

var activeFilters = null;

$(".nav a").on("click", function(){
  //  $(".nav").find(".active").removeClass("active");

  

  if($(this).parent().hasClass('active')){
    delete active[$(this).attr('id')]; //removing element from the active list

    $(this).parent().removeClass("active");
  } else{
    $(this).parent().addClass("active");
    active[$(this).attr('id')] = $(this).attr('id');


    if($(this).attr('id') == "all"){
        if(openNodeCache == null){
            openNodeCache = $.extend( {}, openNode);
        }

        var all = false;
        openNode = {};

        all = true;
        active = {};
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");

        filter(all);
        return;
    }else{
        $("#all").parent().removeClass("active");
    }
  }

  if($(".active").length == 0){
    // d3.selectAll('path').classed('node-faded', function(d){
    //     console.log("***", d);
    //     return false;
    // });
    // d3.selectAll('g').classed('link-faded', false);
    // d3.selectAll('text').classed('text-faded', false);

        svg.selectAll('g').classed('link-faded', false);
        svg.selectAll('text').classed('text-faded', false);
        svg.selectAll('path').classed('node-faded', false);

        return;
  }

  displayFilters()
});


function displayFilters(){

    activeFilters = {};
    for(var act in active)
        activeFilters[menuDict(act)] = menuDict(act);

    d3.selectAll('path').classed('node-faded', function(d){
        // console.log(d.type);
        if(parseInt(d.type) in activeFilters){ return false; }
        else{ return true; }
    });

    d3.selectAll('g').classed('link-faded', function(l){

        if(d3.select(this).classed('graph-container') || !d3.select(this).classed('link') 
            || (parseInt(l.source.type) in activeFilters && parseInt(l.target.type) in activeFilters))
            return false;
        else
            return true;
    });


    d3.selectAll('text').classed('text-faded', function(t){
        console.log(t);
        // console.log((parseInt(t.source.type) in activeFilters && parseInt(t.target.type) in activeFilters));
        if(parseInt(t.type) in activeFilters)
            return false;
        else
            return true;
    });
}


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

        startGraph(converted, captions); 
        return;
    }

    var nodesAux = [];
    var linksAux = [];
    var linkAux = "";

    activeFilters = {};
    var nodesDisplayed = {};
    var linksCreated = {};

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