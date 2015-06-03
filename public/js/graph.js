var width = window.innerWidth,
  height = window.innerHeight;

var cache = {},
  cacheCaptions = {},
  openNode = {},
  displayed = [],
  linksCreated = {},
  linksDistanceDict = {};

var linkAux = "";


var force = d3.layout.force()
  .charge(function(d, i) { return i ? -2000 : 0; })
  .gravity(.01)
  .friction(.3)
  .linkStrength(0.6)
  .linkDistance( function(d){
    var distanceKey = d.source.index > d.target.index ? d.target.name + d.source.name : d.source.name + d.target.name;

    if(linksDistanceDict[distanceKey] == undefined){
      //it means that this link hasn't be created yet, let's put this into the dictionary and keeping tracking everybody
      linksDistanceDict[distanceKey] =  Math.floor(Math.random() * (depthDistance(d.depth) +11)) + depthDistance(d.depth);
    }
    return linksDistanceDict[distanceKey];
  } )
  .size([width, height]);


var svg = d3.select("#graph").append('svg')
  .attr('width', width)
  .attr('height', height);


function startGraph(graphData, captions){

  //making the data available for the entire js
  cache = graphData;
  cacheCaptions = captions;
  //initializing the initial root
  for(var i = 0; i < graphData.root.length; i++){
    graphData.root[i].x = width / 2;
    graphData.root[i].y = height / 2;
    // displayed[displayed.length] = openNode[graphData.root[i]] = graphData.root[i]; //this node is going to be displayed and opened
    displayed[displayed.length] = graphData.root[i];
  }
  //generating the graph
  createGraph(cache.nodes, cache.links);

  setTimeout(function(){
    $("#graph").fadeIn('slow');
  }, 1000);
}

function createGraph(nodes, links){

  var position = 0;
  var nodesDisplayed = []; //parameter for the update's function
  var linksDisplayed = []; //parameter for the update's function
  var nodesDict = {};

  //listing all the main nodes
  for(var i = 0; i < displayed.length; i++){
    position = checkNodePosition(displayed[i]); //check the node position related to the "nodes"'s array

    if(!(nodes[position].name in nodesDict)){
      nodesDisplayed[nodesDisplayed.length] = nodes[position];
      nodesDict[nodes[position].name] = nodes[position].name;
    }

    for(var j = 0; j < links.length; j++){

      if(links[j].source == position){
        //checking if the node wasn't listed before
        if(!(nodes[links[j].target].name in nodesDict)){
          //checking to see if the person is an entity different from a person
          nodesDisplayed[nodesDisplayed.length] = nodes[links[j].target];
          nodesDict[nodes[links[j].target].name] = nodes[links[j].target].name;
        }
      }
    }
  }

  //creating links
  for(var i = 0; i < displayed.length; i++){
    position = checkNodePosition(displayed[i]);
    pstLink = checkLinkPosition(displayed[i], nodesDisplayed);

    //checking link by link from the original data
    for(var j = 0; j < links.length; j++){


      //creating the format for the dictionary
      // <name>-<name>
      linkAux = links[j].source > links[j].target ?
        nodes[links[j].target].name + "-" + nodes[links[j].source].name:
        nodes[links[j].source].name + "-" + nodes[links[j].target].name;

      if(links[j].source == position && !(linkAux in linksCreated)){
        linksCreated[linkAux] = linkAux;

        linksDisplayed.push({
          "source": pstLink,
          "target": checkLinkPosition(nodes[links[j].target].name, nodesDisplayed),
          "linkType": links[j].linkType,
          "linkInfo": cacheCaptions[linkAux],
          "depth": links[j].depth
        });

      }
    }
  }

  update(nodesDisplayed, linksDisplayed);
}


function update(nodes, links){

  svg.selectAll('g').remove();
  svg.selectAll('.link-related').remove();
  svg.selectAll('.link-personal').remove();
  svg.selectAll('.link-influence').remove();

  force
    .nodes(nodes)
    .links(links)
    .start();

    var link = svg.selectAll('.link')
      .data(links)
      .enter().append('g').attr('class','link');

      link.append('line')
        .attr('class', function(d){
          return 'link-' + d.linkType;
        });

      link.append("svg:path")
        .attr("d", d3.svg.symbol()
          .size(50)
          // .type('triangle-down'))
          .type('circle'))
        .attr('class', function(d){
          return 'link-' + d.linkType;
        })
        .classed('hasInfo', function(d){ return  !(d.linkInfo != undefined && d.linkInfo != ""); })
        .on('mouseover', linkNodeOver)
        .on('mouseout', function(d){

          link.classed('link-faded', false);

          d3.selectAll('path')
            .classed('node-faded', false);

          d3.selectAll('text')
            .classed('text-faded', false);

          $('.d3-tip').remove();
        });


      svg.selectAll('.hasInfo').remove();

    var node = svg.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .on('click', function(d){
        click(this, d);
      })
      .on('mouseover', function(d){

        $('.d3-tip').remove();

        var notFaded = {};

        link.classed('link-faded', function(l){
          if(d === l.source || d === l.target){

            notFaded[l.source.name] = l.source.name;
            notFaded[l.target.name] = l.target.name;
            return false;
          }else{
            return true;
          }
        });

        d3.selectAll('path')
          .classed('node-faded', function(nd){
            var condition = !(nd.name in notFaded) && parseInt(nd.type) < 10
              || !(nd.name in notFaded) && parseInt(nd.type) == 12
              || !(nd.name in notFaded) && parseInt(nd.type) == 11;

              return condition;
          });

        d3.selectAll('text')
          .classed('text-faded', function(nd){
            return !(nd.name in notFaded);
          });

      })
      .on('mouseout', function(){

        $('.d3-tip').remove();

        link.classed('link-faded', false);

        d3.selectAll('path')
          .classed('node-faded', false);

          d3.selectAll('text')
            .classed('text-faded', false);

      }).call(force.drag);

    node.append("svg:path")
      .attr("d", d3.svg.symbol()
        .size(function(d){
            if(checkNodeOpened(d.name)){
              if(parseInt(d.type) == 11)
                return 300;
              return 500;
            }
            return 150;
        })
        .type(function(d){
          return prioritySymbol(d.type);
        }))
      .classed('node-publication', function(d){ return parseInt(d.type) == 12})
      .classed('node-other', function(d){ return parseInt(d.type) == 11})
      .attr('fill', function(d){
        return priorityColor(d.type); });

    node.append("text")
      .attr("dy", function(d){
        if(checkNodeOpened(d.name))
          return "1.95em";
        else
          return "1.55em";
      })
      .text(function(d){
        return d.name;
      }).style("cursor", "pointer")
      .attr("text-anchor", "middle");

    force.on('tick', function(event){

      node.attr("transform", function(d) {

        d.x = Math.max(10, Math.min(width-10, d.x));
        d.y = Math.max(30, Math.min(height-10, d.y));

        return "translate(" + d.x + "," + d.y + ")"; });

      link.selectAll('line').attr("x1", function(d) {
         return Math.min(width-10, d.source.x); })
        .attr("y1", function(d) { return Math.min(height-10, d.source.y); })
        .attr("x2", function(d) { return Math.min(width-10, d.target.x); })
        .attr("y2", function(d) { return Math.min(height-10, d.target.y); });

      link.selectAll('path').attr('transform', function(d){
        var x = (d.source.x + d.target.x)/2;
        var y = (d.source.y + d.target.y)/2;

        return "translate(" + x + "," + y+ ')';
      });
    });
}


function linkNodeOver(d, p){ //path


  $('.d3-tip').remove();

  var notFaded = {};
  notFaded[d.source.name] = d.source.name;
  notFaded[d.target.name] = d.target.name;


  svg.selectAll('g')
    .classed('link-faded', function(l){
      if(l === d)
        return false;
      else
        return true;
    });

  d3.selectAll('path')
    .classed('node-faded', function(nd){
      var condition = !(nd.name in notFaded) && parseInt(nd.type) < 10
        || !(nd.name in notFaded) && parseInt(nd.type) == 12
        || !(nd.name in notFaded) && parseInt(nd.type) == 11;

        return condition;
    });

  d3.selectAll('text')
    .classed('text-faded', function(nd){
      return !(nd.name in notFaded);
    });


  if( d.linkInfo != undefined && d.linkInfo != "" ){
    d.tooltip = d3.tip().attr('class', 'd3-tip')
      .html( d.linkInfo );
    svg.call(d.tooltip);
    d.tooltip.show();
  }

}


function click(obj, data){
  if (d3.event.defaultPrevented) return;


    if(d3.event.altKey){
      data.fixed = !data.fixed;
      d3.select(obj).classed("fixed", data.fixed);
      return;
    }


    d3.select(obj).selectAll('text').each(function(d){

      linksCreated = {}; //update the links

      data.fixed = !checkNodeOpened(d.name);
      d3.select(obj).classed("fixed", data.fixed);

      if(!checkNodeOpened(d.name)){

        //if the node is not oppened, so open!
        displayed[displayed.length] = d.name;
        openNode[d.name] = d.name;
      }else{
        //remove from the list that is displayed, then create a new graph
        displayed = [];
        removeNodeOpened(d.name);
        delete openNode[d.name];

        //very specific case for the last person in the graph
        if(Object.keys(openNode).length == 0){
          update([d], []);
          return;
        }

        refreshOpenedNodes();
      }

      createGraph(cache.nodes, cache.links);

    });


}

//refresht the nodes that are being displayed on the graph
function refreshOpenedNodes(){

  displayed[0] = Object.keys(openNode)[0];
  for(var i = 1; i < Object.keys(openNode).length; i++){
    displayed[i] = Object.keys(openNode)[i];
  }
}


function checkNodePosition(name){
  var position = 0;
  var i = 0;

  while(i < cache.nodes.length){
    if(cache.nodes[i].name == name){
      position = i;
      i = cache.nodes.length;
    }

    i++;
  }

  return position;
}

function checkLinkPosition(name, array){
  var position = 0;
  var i = 0;

  while(i < array.length){
    if(array[i].name == name){
      position = i;
      i = array.length;
    }

    i++;
  }

  return position;
}

function checkNodeOpened(name){
  var position = -1; //false stage
  var i = 0;

  while(i < displayed.length){
    if(displayed[i] == name){
      position = i;
      i = displayed.length;
    }

    i++;
  }

  return position != -1;
}

function removeNodeOpened(name){
  var array = [];
  var aux = 0;

  for(var i = 0; i < displayed.length; i++){
    if(name != displayed[i]){
      array[aux] = displayed[i];
      aux++;
    }
  }
  displayed = array;

}
