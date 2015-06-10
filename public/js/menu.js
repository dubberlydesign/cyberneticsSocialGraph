var active = {};
var openNodeCache = null;

$(".nav a").on("click", function(){
  //  $(".nav").find(".active").removeClass("active");

  console.log(openNode);

  if(openNodeCache == null){
    openNodeCache = $.extend( {}, openNode);
  }

  console.log(displayed);

  var all = false;

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
    displayed = [];
    linksCreated = {};
    linksDistanceDict = {};

    converted.root = rootAux;

    startGraph(converted, captions); //start everything again with the main root
    return;
  }

  filter(all);
});

function clearMenu(){
  
}

function filter(all){
  console.log(all);
  var nodesAux = [];
  var rootAux = [];

  var activeList = {};

  for( act in active){
    // console.log(act);
    activeList[menuDict(act)] = menuDict(act);
  }

  openNode = {};
  displayed = [];
  linksCreated = {};
  linksDistanceDict = {};

  for(var i = 0; i < converted.nodes.length; i++){

    if(converted.nodes[i].type in activeList || all)
      nodesAux.push({
        "name" :converted.nodes[i].name,
        "type" : converted.nodes[i].type,
        "symbol": converted.nodes[i].symbol
      });

    if(all)
      rootAux.push(converted.nodes[i].name);
  }


  filterActive = true;
  converted.root = rootAux;
  if(!all)
    update(nodesAux, []);
  else{
    startGraph(converted, captions);
  }

  // update(nodesAux, all ? converted.links : []);

}
