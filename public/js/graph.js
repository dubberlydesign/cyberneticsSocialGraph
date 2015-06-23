var w = window.innerWidth;
var h = window.innerHeight;

var focus_node = null,
    highlight_node = null;

var nodeTooltipCounter = [];

linksDistanceDict = {};

var text_center = true;

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

var currentScale = 0;
var spacebar = false;
var nominal_base_node_size = 8;
var nominal_text_size = 10;
var max_text_size = 24;
var max_base_node_size = 36;
var min_zoom = 0.5;
var max_zoom = 1.8; //7 
var svg = d3.select("body").append("svg");
var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]).on('zoomend', function(){

});



var g = svg.append("g").classed('graph-container', true);
svg.style("cursor", "move");

window.addEventListener('keydown', function(event) {
    if (event.keyCode === 32) { spacebar = true; }
});

window.addEventListener('keyup', function(event) {
    if (event.keyCode === 32) { spacebar = false; }
});

var node = null;
var nodePath = null;
var link = null;
var text = null;

function createGraph(graph){

    var linkedByIndex = {};
    nodeTooltipCounter = [];
    
    graph.links.forEach(function(d) {
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
        .on('mousedown', seeLinkInfo)
        // .on('mouseover', linkNodeOver)
        .on('mouseover', function(d){

            if($(".active").length > 0){
                $(".nav").find(".active").removeClass("active");
                activeFilters = null;
            }

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

            if(d.tooltip_link != undefined) return;

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

    text = node.append("text")
        .classed('node-name', true)
        .attr("dy", function(d){ if(d.name in openNode) { return "2.25em" } else { return "1.55em"; } })
        .style("font-size", nominal_text_size + "px")
        .on("click", seeNodeInfo)
        .on("mouseover", function(d){
            if(d.name in wikipediaID)
                d3.select(this).classed('text-link', true);
        })
        .on("mouseout", function(d){
            d3.select(this).classed('text-link', false);    
        });

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

    // text = g.selectAll(".text")
    //     .data(graph.nodes)
    //     .enter().append("text")
    //     .classed('node-name', true)
    //     .attr("dy", function(d){ if(d.name in openNode) { return "2.25em" } else { return "1.55em"; } })
    //     .style("font-size", nominal_text_size + "px")
    //     .on("click", seeNodeInfo)
    //     .on("mouseover", function(d){
    //         if(d.name in wikipediaID)
    //             d3.select(this).classed('text-link', true);
    //     })
    //     .on("mouseout", function(d){
    //         d3.select(this).classed('text-link', false);    
    //     });

    // if (text_center)
    //     text.text(function(d) {
    //         return d.name;
    //     })
    //     .style("text-anchor", "middle");
    // else
    //     text.attr("dx", function(d) {
    //         return (size(d.size) || nominal_base_node_size);
    //     })
    //     .text(function(d) {
    //         return '\u2002' + d.name;
    //     });

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
            // clearTooltips(false);

            if(d.tooltip_node != undefined){
                d.tooltip_node.destroy();
                d.tooltip_node = undefined;   
            }

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

        if(d3.event.scale > 0.5 && d3.event.scale < 1.8){
            $('.zoom-btn').prop('disabled', false);
        }else{
            
            if ( d3.event.scale > 0.5) { $('.zoom-in').prop('disabled', true); }
            else { $('.zoom-out').prop('disabled', true); }

        }

        clearTooltips(true);

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

    // zoom.on('zoomend', functio(){ });

    svg.call(zoom);

    resize();
    //window.focus();
    d3.select(window).on("resize", resize).on("keydown", keydown);

    force.on("tick", function() {

        node.attr("transform", function(d) {

            if(graphLaunched && d.name == converted.root[0]){

                d.x = (window.innerWidth / 2  * zoom.scale());
                d.y = (window.innerHeight / 2 * zoom.scale());

                graphLaunched = false;
            }

            if(d.name in openNode){

                d.fixed = true;

                // console.log(openNodePositions);
                /*
                Here I'll make all the nodes being positioned based on theirselfs and not related to the 
                window.

                */

                if(Object.keys(openNodePositions).length === 0){ openNodePositions[d.name] = d;}
                else{
                    console.log(openNodePositions);

                    var obj = openNodePositions[Object.keys(openNodePositions)[0]];
                    console.log(obj);

                    if(d.name != obj.name){
                        console.log(d.linkRange);
                        // return "translate(" + d.x + "," + (obj.y + d.linkRange) + ")";                                    
                        d.y = (obj.y + d.linkRange);
                    }

                    if(!(d.name in openNodePositions)) { openNodePositions[d.name] = d;}

                }
            }

            return "translate(" + d.x + "," + d.y + ")";
        });
        // text.attr("transform", function(d) {
        //     return "translate(" + d.x + "," + d.y + ")";
        // });

        link.selectAll('line').attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {

                // if(d.source.name in openNode){
                //     if(Object.keys(openNodePositions).length !== 0){
                //         console.log(openNodePositions);

                //         var obj = openNodePositions[Object.keys(openNodePositions)[0]];
                //         console.log(obj);

                //         if(d.target.name != obj.name){
                //             return obj.y;
                //         }

                //     }
                // }

                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                // if(d.target.name in openNode){
                //     if(Object.keys(openNodePositions).length !== 0){
                //         console.log(openNodePositions);

                //         var obj = openNodePositions[Object.keys(openNodePositions)[0]];
                //         console.log(obj);

                //         if(d.target.name != obj.name){
                //             return obj.y;
                //         }

                //     }
                // }
                return d.target.y;
            });

        // node.attr("cx", function(d) {
        //         return d.x;
        //     })
        //     .attr("cy", function(d) {
        //         return d.y;
        //     });

        link.selectAll('path').attr('transform', function(d){

            if(d.tooltip_link != undefined){
                d.tooltip_link.destroy();
                d.tooltip_link = undefined;
            }

            var x = (d.source.x + d.target.x)/2;
            var y = (d.source.y + d.target.y)/2;

            // if(d.source.name in openNode){

            //     if(Object.keys(openNodePositions).length === 0){ openNodePositions[d.source.name] = d;}
            //     else{
            //         console.log(openNodePositions);

            //         var obj = openNodePositions[Object.keys(openNodePositions)[0]];
            //         console.log(obj);

            //         if(d.source.name != obj.name){
            //             return "translate(" + x + "," + obj.y + ")";                                    
            //         }

            //         if(!(d.source.name in openNodePositions)) { openNodePositions[d.source.name] = d;}

            //     }

            // }

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
    openNode = {}, 
    openNodePositions = {};  //nodes that are being displayed and opened (showing all it's children)

var filterActive = false; //Menu's filter


function startGraph(graphData, captions){
    svg.selectAll('.link-related').remove();
    svg.selectAll('.link-personal').remove();
    svg.selectAll('.link-influence').remove();

    cache = graphData;
    cacheCaptions = captions;

    for(var i = 0; i < graphData.root.length; i++){
        openNode[graphData.root[i]] = graphData.root[i];
        // openNode[graphData.root[i]] = graphData.root[i];
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
            if(!(nodes[links[j].target].name in nodesDict)){
              //checking to see if the person is an entity different from a person
              nodesDisplayed[nodesDisplayed.length] = nodes[links[j].target];
              nodesDict[nodes[links[j].target].name] = nodes[links[j].target].name;
            }
          }
        }
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
function seeLinkInfo(d){
    if(d.tooltip_link != undefined){
        force.resume();
        d.tooltip_link.destroy(); //removing tooltip
        d.tooltip_link = undefined;
    } else if(d.tooltip_link != ''){
        force.stop();
        d.tooltip_link = d3.tip().attr('class', 'd3-tip')
          .html( d.linkInfo );

        svg.call(d.tooltip_link);
        d.tooltip_link.show();
    }
}

function seeNodeInfo(d){
    if(d.fixed != true){ //d.fixed mights be undefined 
        d.fixed = true;
    }

    if(!(d.name in wikipediaID))
        return;

    if(d.tooltip_node != undefined){
        nodeTooltipCounter.pop();
        if(nodeTooltipCounter.length == 0)
            force.resume();    
        
        
        d.tooltip_node.destroy(); //removing tooltip
        d.tooltip_node = undefined;
    } else if(d.tooltip_node != ''){
        

        var thumbsize = 219; // px width 
        var charSize = 200; // number of chars

        var url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&format=json&exintro=&explaintext=";
        url += "&pithumbsize="+ thumbsize;
        // url += "&exchars=" + charSize;
        url += "&titles=" + wikipediaID[d.name];

        var target = this;

        $.ajax({
            url: url,
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function(data) {
                var values;
                for(var key in data.query.pages) 
                    values = data.query.pages[key];
                var html = "";

                if(values.thumbnail != undefined && (values.thumbnail.source != undefined ||  values.thumbnail.source != ""))
                    html += "<img src=" + values.thumbnail.source +" class='img-node' />";

                html += "<h4>" + values.title + "</h4>";
                html += "<h6>"+  (values.extract.length > 200 ? (values.extract.slice(0,200) + "...") : values.extract)   +"</h6>";
                html += "<hr>";
                html += "<h6><a href='https://en.wikipedia.org/wiki/" + wikipediaID[d.name] + " ' target='_blank' class='info-link'>Source: Wikipedia. Read more" +"</a></h6>";


                d.tooltip_node = d3.tip().attr('class', 'd3-tip-node ')
                .offset([0, 5])
                .direction('e')
                .html( html );

                force.stop();
                nodeTooltipCounter.push("");
                svg.call(d.tooltip_node);
                d.tooltip_node.show(target);


            },
            error: function(e) {

            }
        });


    }
}


function clickNode(obj, data){


    if (d3.event.defaultPrevented || d3.event.target.nodeName == 'text') return;

    clearTooltips(true);

    if(!(obj.name in openNode)){
        openNode[obj.name] = obj.name;
    }else{
        delete openNode[obj.name];
        delete openNodePositions[obj.name];

        if(Object.keys(openNode).length == 0)
            openNode[obj.name] = obj.name;
    }

    formatGraph(cache.nodes, cache.links);
}

function linkNodeOver(d, p){ //path

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

  if(d.tooltip_link != undefined)
    return;

  if( d.linkInfo != undefined && d.linkInfo != "" ){
    d.tooltip = d3.tip().attr('class', 'd3-tip')
      .html( d.linkInfo );
    svg.call(d.tooltip);
    d.tooltip.show();
  }

}

//graph functions

function clearTooltips( event ){

    nodeTooltipCounter = [];

    svg.selectAll('g').classed('link-faded', false);
    svg.selectAll('text').classed('text-faded', false);
    svg.selectAll('path').classed('node-faded', false);

    d3.selectAll('path').each(function(d){


        if( d.tooltip_link != undefined){
            d.tooltip_link.destroy();
            d.tooltip_link = undefined;
        }
            
        if( d.tooltip_node != undefined){
            d.tooltip_node.destroy();
            d.tooltip_node = undefined;
        }

    });
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