var w = window.innerWidth;
var h = window.innerHeight;

var focus_node = null,
    highlight_node = null;

linksDistanceDict = {};

var text_center = true;

var highlight_trans = 0.1;

var size = d3.scale.pow().exponent(1)
    .domain([1, 100])
    .range([8, 24]);

var force = d3.layout.force()
    .charge(function(d, i) {
      return i ? -1400 : 0;
    })
    .gravity(0.01)
    .friction(.3)
    .linkStrength(0.6)
    .linkDistance( function(d){
        var distanceKey = d.source.index > d.target.index ? d.target.name + d.source.name : d.source.name + d.target.name;

        if(linksDistanceDict[distanceKey] == undefined){
          //it means that this link hasn't be created yet, let's put this into the dictionary and keeping tracking everybody
          linksDistanceDict[distanceKey] =  Math.floor(Math.random() * (depthDistance(d.depth) +11)) + depthDistance(d.depth);
        }
        return linksDistanceDict[distanceKey];
    })
    .size([w, h]);

var default_node_color = "#ccc";
var default_link_color = "#888";
var nominal_base_node_size = 8;
var nominal_text_size = 10;
var max_text_size = 24;
var max_base_node_size = 36;
var min_zoom = 0.55;
var max_zoom = 1.6; //7 
var svg = d3.select("body").append("svg");
var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])
var g = svg.append("g").classed('graph-container', true);
svg.style("cursor", "move");

var spacebar = false;
window.addEventListener('keydown', function(event) {
    if (event.keyCode === 32) {
        spacebar = true;
    }
});
window.addEventListener('keyup', function(event) {
    if (event.keyCode === 32) {
        spacebar = false;
    }
});

var node = null;
var nodePath = null;
var link = null;
var text = null;

// d3.json("public/json/graph.json", function(error, graph) {
function createGraph(graph){
    // console.log(graph);

    var linkedByIndex = {};
    // console.log(graph.nodes);
    // console.log(graph.links);
    graph.links.forEach(function(d) {
        // console.log(d.source + ', ' + d.target );
        linkedByIndex[d.source + "," + d.target] = true;
    });

    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    function hasConnections(a) {
        for (var property in linkedByIndex) {
            s = property.split(",");
            if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property]) return true;
        }
        return false;
    }

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    link = g.selectAll(".link")
        .data(graph.links)
        .enter().append("g")
        .attr("class", "link");

    link.append("line")
        .attr('class', function(d){
            return 'link-' + d.linkType;
        });

    link.append("svg:path")
        .attr("d", d3.svg.symbol()
          .size(50)
          .type('circle'))
        .attr('class', function(d){
          return 'link-' + d.linkType;
        })
        .on('mousedown', seeNodeInfo)
        // .on('mouseover', linkNodeOver)
        .on('mouseover', function(d){

            svg.selectAll('g').classed('link-faded', function(l){
                if(d3.select(this).classed('graph-container'))
                    return false;
                if(l === d){ return false; } else{ return true; }
            });

            svg.selectAll('text').classed('text-faded', function(t){
                if(t === d.source || t === d.target) return false;
                else return true;
            });

            svg.selectAll('path').classed('node-faded', function(n){
                if(n === d.source || n === d.target || n === d) return false;
                else return true;
            });

            if(d.tooltip_click != undefined) return;

            if( d.linkInfo != undefined && d.linkInfo != "" ){
                d.tooltip = d3.tip().attr('class', 'd3-tip')
                    .html( d.linkInfo );
                    svg.call(d.tooltip);
                    d.tooltip.show();
            }


        })
        .on('mouseout', function(d){
            svg.selectAll('g').classed('link-faded', false);
            svg.selectAll('text').classed('text-faded', false);
            svg.selectAll('path').classed('node-faded', false);

            if(d.tooltip != undefined) d.tooltip.destroy();
            

        })
        .classed('hasInfo', function(d){ return  !(d.linkInfo != undefined && d.linkInfo != ""); });


    svg.selectAll('.hasInfo').remove(); 

    node = g.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")

    .call(force.drag)


    node.on("dblclick.zoom", function(d) {
        d3.event.stopPropagation();
        var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
        var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
        zoom.translate([dcx, dcy]);
        g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");

    });

    nodePath = node.append("svg:path")
        .attr("d", d3.svg.symbol()
        .size(function(d){
            if(d.name in openNode){
                if(parseInt(d.type) == 11)
                  return 300;
                return 500;
            }
            return 150;
        })
        .type(function(d){ return prioritySymbol(d.type); }))
        .classed('node-publication', function(d){ return parseInt(d.type) == 12})
        .classed('node-other', function(d){ return parseInt(d.type) == 11})
        .attr('fill', function(d){ return priorityColor(d.type); })
        .on("click", clickNode);


    text = g.selectAll(".text")
        .data(graph.nodes)
        .enter().append("text")
        .classed('node-name', true)
        .attr("dy", function(d){ if(d.name in openNode) { return "2.25em" } else { return "1.55em"; } })
        .style("font-size", nominal_text_size + "px")
        // .style("text-anchor", "middle");

    if (text_center)
        text.text(function(d) {
            return d.name;
        })
        .style("text-anchor", "middle");
    else
        text.attr("dx", function(d) {
            return (size(d.size) || nominal_base_node_size);
        })
        .text(function(d) {
            return '\u2002' + d.name;
        });

    node.on("mouseover", function(d) {
            var notFaded = {};

            link.classed('link-faded', function(l){
                if(d === l.source || d === l.target){
                    notFaded[l.source.name] = l.source.name;
                    notFaded[l.target.name] = l.target.name;

                    return false;
                }else{ return true; }

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
        .on("mousedown", function(d) {
            d3.event.stopPropagation();
            if (spacebar) {
                d.fixed = false;
            }else{
                d.fixed = true;
            }

        }).on("mouseout", function(d) {

            svg.selectAll('g').classed('link-faded', false);
            svg.selectAll('text').classed('text-faded', false);
            svg.selectAll('path').classed('node-faded', false);

        });

    zoom.on("zoom", function() {

        var base_radius = nominal_base_node_size;
        if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
        nodePath.attr("d", d3.svg.symbol()
            .size(function(d) {
                if(d.name in openNode){
                    if(parseInt(d.type) == 11)
                        return 300;
                    return 500;
                }
                return 150;
            })
            .type(function(d) {
                return prioritySymbol(d.type);
            }))

        var text_size = nominal_text_size;
        if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
        text.style("font-size", text_size + "px");

        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    });

    svg.call(zoom);

    resize();
    //window.focus();
    d3.select(window).on("resize", resize).on("keydown", keydown);

    force.on("tick", function() {

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        text.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.selectAll('line').attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });

        link.selectAll('path').attr('transform', function(d){
            var x = (d.source.x + d.target.x)/2;
            var y = (d.source.y + d.target.y)/2;
            return "translate(" + x + "," + y+ ')';
        });


    });

    function resize() {
        var width = window.innerWidth,
            height = window.innerHeight;
        svg.attr("width", width).attr("height", height);

        force.size([force.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
        w = width;
        h = height;
    }

    function keydown() {
        if (d3.event.keyCode == 32) {
            spacebar = true;
            // force.stop();
        } 
    }
}

// graph's core

var cache = null, 
    cacheCaptions = null,
    openNode = {};  //nodes that are being displayed and opened (showing all it's children)

var filterActive = false; //Menu's filter


function startGraph(graphData, captions){
    svg.selectAll('.link-related').remove();
    svg.selectAll('.link-personal').remove();
    svg.selectAll('.link-influence').remove();

    cache = graphData;
    cacheCaptions = captions;

    for(var i = 0; i < graphData.root.length; i++){
        openNode[graphData.root[i]] = graphData.root[i];
    }

    formatGraph(cache.nodes, cache.links);  
}

function formatGraph(nodes, links){
    var position = 0;
    var nodesDisplayed = []; 
    var linksDisplayed = []; 
    var nodesDict = {};
    var linksDict = {};

    //listing all the main nodes
    for(var open in openNode){

        position = positionCache[open]; //check the node position related to the "nodes"'s array

        if(!(nodes[position].name in nodesDict)){
            nodesDisplayed[nodesDisplayed.length] = nodes[position];
            nodesDict[nodes[position].name] = nodes[position].name;
        }

        for(var j = 0; j < links.length; j++){

          if(links[j].source == position){
            //checking if the node wasn't listed before
            // console.log(nodes[links[j].target].name);
            if(!(nodes[links[j].target].name in nodesDict)){
              //checking to see if the person is an entity different from a person
              nodesDisplayed[nodesDisplayed.length] = nodes[links[j].target];
              // displayednodes[links[j].target].name
              nodesDict[nodes[links[j].target].name] = nodes[links[j].target].name;
            }
          }
        }
    }

    if(activeFilters != null){
        console.log('clickando com o filtro ativo');
    }else{
        console.log('clickando com o filtro INATIVO');
    }

    //creating links
    for(var open in openNode){
        position = positionCache[open];
        pstLink = checkLinkPosition(open, nodesDisplayed);

        //checking link by link from the original data
        for(var j = 0; j < links.length; j++){


          //creating the format for the dictionary
          // <name>-<name>
            linkAux = links[j].source > links[j].target ?
                nodes[links[j].target].name + "-" + nodes[links[j].source].name:
                nodes[links[j].source].name + "-" + nodes[links[j].target].name;

            if( !(linkAux in linksDict) && links[j].source == position){
                linksDisplayed.push({
                    "source": pstLink,
                    "target": checkLinkPosition(nodes[links[j].target].name, nodesDisplayed),
                    "linkType": links[j].linkType,
                    "linkInfo": cacheCaptions[linkAux],
                    "depth": links[j].depth
                });

                linksDict[linkAux] = linkAux;
            }
                
        }
    }

    filterActive = false;
    // update(nodesDisplayed, linksDisplayed);

    if(node != null) node.remove();
    if(link != null) link.remove();
    if(text != null) text.remove();

    createGraph({
        "graph": [],
        "links": linksDisplayed,
        "nodes": nodesDisplayed,
        "directed": true,
        "multigraph": true
      });
}

//this function enables the user to open the tooltip and keep it there. 
function seeNodeInfo(d){
    if(d.tooltip_click != undefined){
        d.tooltip_click.destroy(); //removing tooltip
        d.tooltip_click = undefined;
    } else if(d.tooltip_click != ''){
        
        d.tooltip_click = d3.tip().attr('class', 'd3-tip')
          .html( d.linkInfo );

        svg.call(d.tooltip_click);
        d.tooltip_click.show();
    }
}


function clickNode(obj, data){
    if (d3.event.defaultPrevented || d3.event.target.nodeName == 'text') return;

    if(!(obj.name in openNode)){
        console.log('open');
        openNode[obj.name] = obj.name;
    }else{
        delete openNode[obj.name];
        console.log('close');

        delete openNode[obj.name];

        if(Object.keys(openNode).length == 0)
            openNode[obj.name] = obj.name;
    }

    formatGraph(cache.nodes, cache.links);
}

function linkNodeOver(d, p){ //path


  // $('.d3-tip').remove();

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

  if(d.tooltip_click != undefined)
    return;

  if( d.linkInfo != undefined && d.linkInfo != "" ){
    d.tooltip = d3.tip().attr('class', 'd3-tip')
      .html( d.linkInfo );
    svg.call(d.tooltip);
    d.tooltip.show();
  }

}

//graph functions

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