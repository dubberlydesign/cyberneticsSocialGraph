var active = {};
var openNodeCache = null;

var activeFilters = null;

$(".nav a").on("click", function(){
  //  $(".nav").find(".active").removeClass("active");

  

  if($(this).parent().hasClass('active')){
    delete active[$(this).attr('id')]; //removing element from the active list

    if($(this).attr('id') ==  "all"){
        openNode = $.extend( {}, openNodeCache ); //making a copy
        openNodeCache = null;

        converted.root = converted.rootCache;

        startGraph(converted, captions);
    }

    $(this).parent().removeClass("active");

  } else{
    $(this).parent().addClass("active");
    active[$(this).attr('id')] = $(this).attr('id');


    if($(this).attr('id') == "all"){
        if(openNodeCache == null){
            openNodeCache = $.extend( {}, openNode);

            console.log(openNodeCache);
        }

        openNode = {};
        clickEvent = false;

        active = {};
        $(".nav").find(".active").removeClass("active");
        $(this).parent().addClass("active");

        filterAll();
        return;
    }
  }

  if($(".active").length == 0){
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

    if(Object.keys(activeFilters).length == 0){
        //undo the previous filter

        d3.selectAll('path').classed('node-faded', false);
        d3.selectAll('g').classed('link-faded', false);
        d3.selectAll('text').classed('text-faded', false);


         return; 
    } //don't  apply the filter

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
        if(parseInt(t.type) in activeFilters)
            return false;
        else
            return true;
    });
}


function filterAll(){

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