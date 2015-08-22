'use strict';

var graph = (function(){


    var w = window.innerWidth;
    var h = window.innerHeight;

    var nodeTooltipCounter = [];

    var force = d3.layout.force()
        .charge(function( d, i ) {
            return i ? -1400: 0;
        })
        .gravity( 0.01 )
        .friction( .58 )
        .linkStrength( .6 )
        .linkDistance( 150 )
        .size( [w, h]);

    var spacebar = false;
    var min_zoom = 0.15;
    var max_zoom = 1.8; //7
    var svg = d3.select(".body-content").append("svg");


    var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);

    var animationOver = true;

    var g = svg.append("g").classed('graph-container', true);
    svg.style("cursor", "move");

    window.addEventListener('keydown', function(event) {
        if (event.keyCode === 32) { spacebar = true; }
    });

    window.addEventListener('keyup', function(event) {
        if (event.keyCode === 32) { spacebar = false; }
    });

    // graph's core

    var node = null,
        nodePath = null,
        link = null,
        text = null,
        cache = null,
        shortPath = [],
        openNode = {},
        openNodePositions = {},
        filterAll = false,
        gridRestoreFlag = false;  //nodes that are being displayed and opened (showing all it's children)

    function createGraph(graph){

        var linkedByIndex = {};
        nodeTooltipCounter = [];

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
              .size(80)
              .type('circle'))
            .attr('class', function(d){
              return 'link-' + d.linkType;
            })
            .on('mousedown', seeLinkInfo)
            .on('mouseover', function(d){

                force.stop();

                if(d.tooltip_link != undefined) return;

                if( d.linkInfo != undefined && d.linkInfo != "" ){
                    d.tooltip = d3.tip().offset([-10,0]).attr('class', 'd3-tip')
                        .html( d.linkInfo );
                        svg.call(d.tooltip);
                        d.tooltip.show();
                }

                if($(".active").length > 0){
                    return;
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




            })
            .on('mouseout', function(d){

                if(animationOver){
                    force.resume();
                }

                if(d.tooltip != undefined) d.tooltip.destroy();

                if($(".active").length > 0){ return; }

                removeFadeOut();




            })
            .classed('hasInfo', function(d){ return  !(d.linkInfo != undefined && d.linkInfo != ""); });


        svg.selectAll('.hasInfo').remove();

        node = g.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function(d){ return d.name.replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, ''); })
        .call(force.drag)


        node.on("dblclick.zoom", function(d) {
            d3.event.stopPropagation();
            var dcx = (window.innerWidth / 2 - d.x * zoom.scale());
            var dcy = (window.innerHeight / 2 - d.y * zoom.scale());
            main.hideTour(); // in the case that we have any tourtip opened
            zoom.translate([dcx, dcy]);
            g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");

        });

        nodePath = node.append("svg:path")
            .attr("d", d3.svg.symbol()
            .size(function(d){
                if(d.name in openNode){
                    if(parseInt(d.type) == 11)
                      return 450; //for diamonds symbols because they look disproportional when they are opened
                    return 1200; //for circles or squares
                }

                if(parseInt(d.type) == 11)
                  return 200;

                return 300;
            })
            .type(function(d){ return graphDictionary.getSymbol(d.type); }))
            .attr('fill', function(d){ return graphDictionary.getColor(d.type); })
            .on("click", clickNode);

        text = node.append("text")
            .classed('node-name', true)
            .attr("dy", function(d){
                if(d.name in openNode) {
                    return '2.25em';
                    // if(graphDictionary.getSymbol(d.type) == 'diamond')
                    //     return '2.35em';
                    // else
                    //     return "2.15em";

                } else {

                    if(graphDictionary.getSymbol(d.type) == 'diamond')
                        return '1.9em';
                    else
                        return "1.55em";
                }

            })
            .on("click", seeNodeInfo)
            .on("mouseover", function(d){
                // if($(".active").length > 0){ return; } //prevent the graph to disable the filter that is being used (active)

                force.stop();

                if(converterData.checkWikipediaIDExists(d.name))
                    d3.select(this).classed('text-link', true);
            })
            .on("mouseout", function(d){
                // if($(".active").length > 0){ return; }//prevent the graph to disable the filter that is being used (active)

                if(animationOver){
                    force.resume();
                }

                d3.select(this).classed('text-link', false);
            })
            .text(function(d) {

                if(converterData.checkWikipediaIDExists(d.name))
                    return d.name + '   \uf0c1';
                else
                    return d.name;
            })
            .style("text-anchor", "middle");

        node.on("mouseover", function(d) {
                var notFaded = {};

                force.stop();

                if($(".active").length > 0){ return ; }

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

                if(animationOver){
                    force.resume();
                }

                if($(".active").length > 0){ return; } //prevent the graph to disable the filter that is being used (active)

                removeFadeOut();
            });

        zoom.on("zoom", function() {
            force.resume();
            if(d3.event.scale > min_zoom && d3.event.scale < max_zoom){
                $('.zoom-btn').prop('disabled', false);
            }else{

                if ( d3.event.scale > min_zoom) { $('.zoom-in').prop('disabled', true); }
                else { $('.zoom-out').prop('disabled', true); }

            }

            main.hideTour();
            clearTooltips(true);
            g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });


        svg.call(zoom);

        resize();

        d3.select(window).on("resize", resize).on("keydown", keydown);

        force.on("tick", tick);

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
            }
        }
    }

    function tick() {

        node.attr("transform", function(d) {

            if(!filterAll && !(d.name in openNodePositions)){

                openNodePositions[d.name] = d;
            }



            if((d.name in openNodePositions)){

                // Everything is going to be related to the main root
                var mainRoot = openNodePositions[converterData.getRoot()];
                mainRoot.fixed = true;

                mainRoot.x = (w/2.1);
                mainRoot.y = h/2;

                var id = d.name.replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, '');

                if(grid.getGridPosition(d.name) != undefined){

                    // making the node be fixed and related to the main root (also this is going to be realted to the Start Node)

                    var gridPosTop = grid.getGridPosition(d.name).top;

                    var x = (grid.getGridPosition(d.name).right * 300);
                    var y = gridPosTop < 2 ? gridPosTop  * (-250) : (-250) - ((gridPosTop-1) * 130);

                    d.x = d.px =  (mainRoot.x + x);
                    d.y = d.py =  (mainRoot.y + y);

                }

            }
            // if the node is not opened, so it is going to be related
            // to its own position, not based into the main root position
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.selectAll('line').attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // This is for the link's path (circle) that helps the user to see the link's info

        link.selectAll('path').attr('transform', function(d){

            if(d.tooltip_link != undefined){
                d.tooltip_link.destroy();
                d.tooltip_link = undefined;
            }

            var x = (d.source.x + d.target.x)/2;
            var y = (d.source.y + d.target.y)/2;

            return "translate(" + x + "," + y+ ')';
        });


    }

    function animationGrid(animationTime, obj){

        animationOver = false;

        node.transition()
            .duration(animationTime)
            .attr("transform", function(d) {


                if((d.name in openNode)){

                    // Everything is going to be related to the main root
                    var mainRoot = openNodePositions[converterData.getRoot()];
                    mainRoot.fixed = true;

                    mainRoot.x = (w/2.1);
                    mainRoot.y = h/2;



                    if(grid.getGridPosition(d.name) != undefined){

                        // making the node be fixed and related to the main root (also this is going to be realted to the Start Node)

                        var gridPosTop = grid.getGridPosition(d.name).top;

                        var x = (grid.getGridPosition(d.name).right * 300);
                        var y = gridPosTop < 2 ? gridPosTop  * (-250) : (-250) - ((gridPosTop-1) * 130);

                        d.x = d.px =  (mainRoot.x + x);
                        d.y = d.py =  (mainRoot.y + y);

                    }


                }else{
                    d.fixed = false;
                }
                // if the node is not opened, so it is going to be related
                // to its own position, not based into the main root position

                return "translate(" + d.x + "," + d.y + ")";

            });

        link.transition()
            .duration(animationTime)
            .selectAll('line').attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        link.transition()
            .duration(animationTime)
            .selectAll('path').attr('transform', function(d){

            if(d.tooltip_link != undefined){
                d.tooltip_link.destroy();
                d.tooltip_link = undefined;
            }

            var x = (d.source.x + d.target.x)/2;
            var y = (d.source.y + d.target.y)/2;

            return "translate(" + x + "," + y+ ')';
        });

        d3.selectAll("text").transition()
            .duration(animationTime)
            .attr("dy", function(d){
                if(d.name in openNode) {
                    return '2.25em';

                } else {

                    if(graphDictionary.getSymbol(d.type) == 'diamond')
                        return '1.9em';
                    else
                        return "1.55em";
                }

            });

        d3.select(obj).transition()
            .duration(animationTime)
            .attr("d", d3.svg.symbol()
                .size(function(d){
                    if(d.name in openNode){
                        if(parseInt(d.type) == 11)
                          return 450; //for diamonds symbols because they look disproportional when they are opened
                        return 1200; //for circles or squares
                    }

                    if(parseInt(d.type) == 11)
                      return 200;

                    return 300;
                })
                .type(function(d){ return graphDictionary.getSymbol(d.type); }))
            .each("end", function(d){
                if(animationOver)
                    return;

                formatGraph();
            });

    }


    /**/
    function startGraph(graphData){
        removeContent();
        removeFadeOut();

        cache = graphData;

        for(var i = 0; i < graphData.root.length; i++){
            openNode[graphData.root[i]] = graphData.root[i];
        }

        if(!filterAll && !gridRestoreFlag){

            grid.createInstance(converterData.getRoot());

            gridRestoreFlag = false;
        }

        formatGraph();
    }

    function formatGraph(){

        force.resume();

        if(!animationOver){
            animationOver = true;
        }

        var nodes = cache.nodes;
        var links = cache.links;

        var position = 0;
        var nodesDisplayed = [];
        var linksDisplayed = [];
        var nodesDict = {};
        var linksDict = {};

        //listing all the main nodes

        for(var open in openNode){

            position = converterData.getPosition(open); //check the node position related to the "nodes"'s array

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
            position = converterData.getPosition(open);
            var pstLink = checkLinkPosition(open, nodesDisplayed);

            //checking link by link from the original data
            for(var j = 0; j < links.length; j++){


              //creating the format for the dictionary based win who is indexed first into the array
              // <name>-<name>
                var linkAux = links[j].source > links[j].target ?
                    nodes[links[j].target].name + "-" + nodes[links[j].source].name:
                    nodes[links[j].source].name + "-" + nodes[links[j].target].name;

                if( !(linkAux in linksDict) && links[j].source == position){
                    linksDisplayed.push({
                        "source": pstLink,
                        "target": checkLinkPosition(nodes[links[j].target].name, nodesDisplayed),
                        "linkType": links[j].linkType,
                        "linkInfo": converterData.getCaption(linkAux),
                        "depth": links[j].depth
                    });

                    linksDict[linkAux] = linkAux;
                }

            }
        }

        removeContent();

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
            d.tooltip_link = d3.tip().offset([-10,0]).attr('class', 'd3-tip')
              .html( d.linkInfo );

            svg.call(d.tooltip_link);
            d.tooltip_link.show();
        }
    }

    function seeNodeInfo(d){
        if(d.fixed != true){ //d.fixed mights be undefined
            d.fixed = true;
        }

        if(!(converterData.checkWikipediaIDExists(d.name)))
            return;

        if(d.tooltip_node != undefined){
            nodeTooltipCounter.pop();
            if(nodeTooltipCounter.length == 0)
                force.resume();

            d.tooltip_node = undefined;

            d.tooltip_node_showed = undefined;
        } else if(d.tooltip_node != ''){


            var thumbsize = 399; // px width
            var charSize = 200; // number of chars

            var url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&format=json&exintro=&explaintext=";
            url += "&pithumbsize="+ thumbsize;
            // url += "&exchars=" + charSize;
            url += "&titles=" + converterData.getWikipediaID(d.name);

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
                    var html = "<div class='node-info-box'>";

                    if(values.thumbnail != undefined && (values.thumbnail.source != undefined ||  values.thumbnail.source != "")){
                        html += "<div class='box-img'><img src=" + values.thumbnail.source  +" class='img-node'/></div>";
                    }

                    html += "<div class='box-info'><h4>" + values.title + "</h4>";
                    html += "<h6>"+  (values.extract.length > 146 ? (values.extract.slice(0,146) + "...") : values.extract)   +"</h6>";
                    html += "<hr>";
                    html += "<h6><a href='https://en.wikipedia.org/wiki/" + converterData.getWikipediaID(d.name) + " ' target='_blank' class='info-link'>Source: Wikipedia." +"</a></h6></div>";


                    d.tooltip_node = d3.tip().attr('class', 'd3-tip-node')
                    .offset([0, 5])
                    .direction('e')
                    .html( html );


                    force.stop();
                    nodeTooltipCounter.push("");
                    svg.call(d.tooltip_node);
                    d.tooltip_node.show(target);
                    $(target).addClass('hasToolTip');

                    d.tooltip_node_showed = true;


                    $('img').load(function(){

                        d.tooltip_node.show(target);

                    });

                    $('img').error(function(){
                        $(this).remove();
                    });



                },
                error: function(e) {

                }
            });


        }
    }


    function clickNode(obj, data){

        main.hideTour(); // in the case that we have any tourtip opened

        if (d3.event.defaultPrevented || d3.event.target.nodeName == 'text' || filterAll) return;

        clearTooltips();

        if(!(obj.name in openNode)){
            openNode[obj.name] = obj.name;
            var mapAux = {};
            mapAux[obj.name] = converterData.getMap(obj.name); // this should be in the graph as well

            for(var open in openNode){
                mapAux[open] = converterData.getMap(open);
            };

            var dijkstra = new Dijkstra(mapAux);
            shortPath = dijkstra.findShortestPath(converterData.getRoot(), obj.name);
            grid.addNode(shortPath);

        }else{

            if(obj.name != converterData.getRoot()){

                delete openNode[obj.name];
                delete openNodePositions[obj.name];
                grid.removeNode(obj.name);
                obj.fixed = false;
                tick();

                if(Object.keys(openNode).length == 0)
                    openNode[obj.name] = obj.name;

            }

        }

        var animationTime = 400;

        animationGrid(animationTime, this);

        // formatGraph();
    }

    //graph functions

    svg.on("click", clearTooltips);

    function clearTooltips( event ){

        nodeTooltipCounter = [];


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

        $('.d3-tip-node').remove();
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

    // Zoom's function

    function interpolateZoom (translate, scale) {
        var self = this;

        return d3.transition().duration(350).tween("zoom", function () {

            var iTranslate = d3.interpolate(zoom.translate(), translate),
                iScale = d3.interpolate(zoom.scale(), scale);

            return function (t) {
                zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
                zoomed();
            };
        });

    }

    function zoomClick(zoomIn, obj) { // Zoom Click

        clearTooltips(true);

        var direction = 1,
            factor = 0.2,
            target_zoom = 1,
            center = [w / 2, h / 2],
            extent = zoom.scaleExtent(),
            translate = zoom.translate(),
            translate0 = [],
            l = [],
            view = {x: translate[0], y: translate[1], k: zoom.scale()};

        direction = (zoomIn) ? 1 : -1;
        target_zoom = zoom.scale() * (1 + factor * direction);

        if (target_zoom < extent[0] || target_zoom > extent[1]) {
            $(obj).prop('disabled', true);
            return false;
        }

        zoomControl.showButtons();

        translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
        view.k = target_zoom;
        l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

        view.x += center[0] - l[0];
        view.y += center[1] - l[1];

        interpolateZoom([view.x, view.y], view.k);
    }

    function zoomed() {
        g.attr("transform",
            "translate(" + zoom.translate() + ")" +
            "scale(" + zoom.scale() + ")"
        );
    }

    // Menu's functions

    function displayFilters(active){


        var activeFilters = {};
        var nodeNameFilters = {}; // where the filter should or shouldn't be applied
        for(var act in active)
            activeFilters[menuDict.getOptionValue(act)] = menuDict.getOptionValue(act);

        if(Object.keys(activeFilters).length == 0){
            //undo the previous filter

            d3.selectAll('path').classed('node-faded', false);
            d3.selectAll('g').classed('link-faded', false);
            d3.selectAll('text').classed('text-faded', false);


             return;
        } //don't  apply the filter



        d3.selectAll('g').classed('link-faded', function(l){
            if(l == undefined || l.linkType == undefined) { return; }

            if(d3.select(this).classed('graph-container') || !d3.select(this).classed('link')
                || (parseInt(l.source.type) in activeFilters && parseInt(l.target.type) in activeFilters)
                || l.linkType in active){
                    nodeNameFilters[l.source.name] = l.source.name;
                    nodeNameFilters[l.target.name] = l.target.name;

                    return false;
                }

            else
                return true;
        });



        d3.selectAll('path').classed('node-faded', function(d){
            if(parseInt(d.type) in activeFilters || d.name in nodeNameFilters){ return false; }
            else{ return true; }
        });

        d3.selectAll('text').classed('text-faded', function(t){

            if(parseInt(t.type) in activeFilters || t.name in nodeNameFilters)
                return false;
            else
                return true;
        });
    }

    function removeFadeOut(){
        svg.selectAll('g').classed('link-faded', false);
        svg.selectAll('text').classed('text-faded', false);
        svg.selectAll('path').classed('node-faded', false);
    }

    function removeContent(){
        if(node != null) node.remove();
        if(link != null) link.remove();
        if(text != null) text.remove();
    }


    return {
        removeContent : removeContent,
        resetPositions : tick,
        zoomClick : zoomClick,
        create : createGraph,
        format : formatGraph,
        start : startGraph,
        displayFilters : displayFilters,
        removeFadeOut : removeFadeOut,
        setOpenNode : function(open){
            openNode = open;
            return;
        },
        clearFixedNodes: function(){
            d3.selectAll('path').classed('path', function(d){
                d.fixed = false;
                return false;
            })
        },
        getOpenNode : function(){
            return openNode;
        },
        setOpenNodePositions : function(open){
            openNodePositions = open;
            return;
        },
        getOpenNodePositions : function(){
            return openNodePositions;
        },
        checkOpenNode : function(key){
            return key in openNode;
        },
        setFilterAllFlag : function(flag){
            filterAll = flag;
        },
        setGridRestoreFlag : function(flag){
            gridRestoreFlag = flag;
        },

    };

})();
