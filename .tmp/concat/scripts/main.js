'use strict';

var zoomControl = (function(){
    $('.zoom-btn').click(function() {
        graph.zoomClick($(this).hasClass('zoom-in'), this);
    });

    function showButtons(){
        $('.zoom-btn').prop('disabled', false);
    }

    return {
        showButtons : showButtons
    };

}());

var Dijkstra = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
			predecessor = {},
		    u = end;

		while (u) {
			nodes.push(u);
			predecessor = predecessors[u];
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Dijkstra = function (map) {
		this.map = map;
	}

	Dijkstra.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Dijkstra.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Dijkstra;

})();

'use strict';

var grid = (function(){

	var gridLayoutCache = null,
		gridDictPositionCache  = null;

	var gridLayout;
	var gridDictPosition; 	//dictionary for the positions, this is going to return
							//an object {top : <int>, left: <int>} related to the position in the grid

	function createGrid(grid){

		for(var i = 0; i < 16; i++){
			var array = [];
			for(var j = 0; j < 16; j++)
				array.push(null);

			grid.push(array);
		}

		return grid;
	}

	function initDict(){

		gridLayout = [];
		gridDictPosition = {};

		gridLayout = createGrid(gridLayout);


		gridLayout[0][0] = converterData.getRoot();
		gridDictPosition[converterData.getRoot()] = {"top" : 0 , "right" : 0};

		// return gridLayout;
		return false;

	}

	function calculateNewPath(path){
		//Path is an [] with the positions that are going to be related to the main root (position [0][0])

		var gridAux = createGrid([]);
		gridDictPosition = {};

		gridAux[0] = path;



		for(var i = 0; i < path.length; i++){
			gridAux[0][i] = path[i];
			gridDictPosition[path[i]] = {"top" : 0 , "right" : i};
		}

		for(var i = 0; i < gridLayout.length; i++){
			for(var j = 0; j < gridLayout[i].length; j++){

				if( (gridLayout[i][j] != null) && (graph.checkOpenNode(gridLayout[i][j])) && !(gridLayout[i][j] in gridDictPosition)){
					var top = i;

					if(gridAux[i][j] != null){
						while(gridAux[top][j] != null){
							top++;
					 	} //looking for the next position available
					}

					if(top == 0){ top = 1; } // this row is for the short path

					gridDictPosition[gridLayout[i][j]] = {"top" : top , "right" : j};
					gridAux[top][j] = gridLayout[i][j];
				}

			}
		}
		gridLayout = gridAux;

	}

	function gridPosition(node){ return gridDictPosition[node]; }

	function removeNode(node){
		delete gridDictPosition[node];
	}


	return {
		createInstance : function(root){
			initDict();

			return false;
		},
		saveInstance : function(){
			gridLayoutCache = gridLayout.slice();
			gridDictPositionCache = $.extend( {}, gridDictPosition);
		},
		restoreInstance : function(instance){
			gridLayout = gridLayoutCache.slice();
			gridDictPosition = $.extend( {}, gridDictPositionCache);
		},
		addNode : calculateNewPath,
		removeNode : removeNode,
		getGridPosition : gridPosition
	}

}());

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
    var min_zoom = 0.5;
    var max_zoom = 1.8; //7
    var svg = d3.select(".body-content").append("svg");


    var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom]);

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
              .size(80)
              .type('circle'))
            .attr('class', function(d){
              return 'link-' + d.linkType;
            })
            .on('mousedown', seeLinkInfo)
            .on('mouseover', function(d){

                if(d.tooltip_link != undefined) return;

                if( d.linkInfo != undefined && d.linkInfo != "" ){
                    d.tooltip = d3.tip().attr('class', 'd3-tip')
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
                    return 650; //for circles or squares
                }
                return 300;
            })
            .type(function(d){ return graphDictionary.getSymbol(d.type); }))
            .attr('fill', function(d){ return graphDictionary.getColor(d.type); })
            .on("click", clickNode);

        text = node.append("text")
            .classed('node-name', true)
            .attr("dy", function(d){
                if(d.name in openNode) {

                    if(graphDictionary.getSymbol(d.type) == 'diamond')
                        return '2.35em';
                    else
                        return "2.15em";

                } else {

                    if(graphDictionary.getSymbol(d.type) == 'diamond')
                        return '2em';
                    else
                        return "1.55em";
                }

            })
            .on("click", seeNodeInfo)
            .on("mouseover", function(d){
                // if($(".active").length > 0){ return; } //prevent the graph to disable the filter that is being used (active)

                if(converterData.checkWikipediaIDExists(d.name))
                    d3.select(this).classed('text-link', true);
            })
            .on("mouseout", function(d){
                // if($(".active").length > 0){ return; }//prevent the graph to disable the filter that is being used (active)

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

                if($(".active").length > 0){ return; } //prevent the graph to disable the filter that is being used (active)

                removeFadeOut();
            });

        zoom.on("zoom", function() {

            if(d3.event.scale > 0.5 && d3.event.scale < 1.8){
                $('.zoom-btn').prop('disabled', false);
            }else{

                if ( d3.event.scale > 0.5) { $('.zoom-in').prop('disabled', true); }
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
            d.tooltip_link = d3.tip().offset([10,0]).attr('class', 'd3-tip')
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

        if(d.tooltip_node_showed != undefined){
            nodeTooltipCounter.pop();
            if(nodeTooltipCounter.length == 0)
                force.resume();
            // d.tooltip_node.destroy(); //removing tooltip
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

        formatGraph();
    }

    //graph functions

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

'use strict';

var graphDictionary = (function(){

    var values = {};

    return {
        init : function(){
            values.color = {
                '0' : '#171616',
                '1' : '#00A3D9',
                '2' : '#00984B',
                '3' : '#E15D32',
                '4' : '#993366',
                '5' : '#f39c12',
                '6' : '#f39c12',
                '7' : '#f39c12',
                '8' : '#f39c12',
                '9' : '#f39c12',
                '10' : '#f39c12',
                '11' : '#95a5a6',
                '12' : '#bdc3c7'
            };

            values.size = {
                '0' : '10',
                '1' : '10',
                '2' : '10',
                '3' : '10',
                '4' : '10',
                '5' : '10',
                '6' : '10',
                '7' : '10',
                '8' : '10',
                '9' : '10',
                '10' : '10',
                '11' : '5',
                '12' : '5'
            };

            values.symbol = {
                '0' : 'circle',
                '1' : 'circle',
                '2' : 'circle',
                '3' : 'circle',
                '4' : 'circle',
                '5' : 'circle',
                '6' : 'circle',
                '7' : 'circle',
                '8' : 'circle',
                '9' : 'circle',
                '10' : 'circle',
                '11' : 'diamond', //institute triangle-up
                '12' : 'square' //publication
            };

            values.distance =  {
                '1' : 85,
                '2' : 100,
                '3' : 150,
                '4' : 190,
                '5' : 255,
                '6' : 280
            };

            values.linkDistance = {};
        },
        getColor :  function(priority){
            return values.color[priority];
        },
        getSize : function(priority){
            return values.size[priority];
        },
        getSymbol : function(priority){
            return values.symbol[priority];
        },
        setLinkDistance : function(key, value){
            values.linkDistance[key] = value;
        },
        getLinkDistance : function(key){
            return values.linkDistance[key];
        },


    };

})();

'use strict';

var converterData = (function(){

    var caption = {};

    var position = {};
    var wikipediaID = {};
    var tagsDict = {};
    var tags = [];
    var filter = {};

    var root = '\"Behavior, Purpose, and Teleology\"';

    var converted = {
        'root' : [
            '\"Behavior, Purpose, and Teleology\"'
        ],
        'rootCache' : [
            '\"Behavior, Purpose, and Teleology\"'
        ],
        'nodes' : [],
        'links' : []

    };

    var map = {};


    function findPosition(name, array){

        if(name in position){ return position[name]; }

        var pstn = 0; //position
        var i = 0;

        while(i < array.length){
            if(array[i].name == name){
                pstn = i;
                i = array.length;

                position[name] = pstn; //saving into the cache
            }

            i++;
        }

        return pstn;
    }

    function filterAll(){

        graph.removeContent();

        var rootAux = [];

        for(var i = 0; i < converted.nodes.length; i++){
            rootAux.push(converted.nodes[i].name);
        }

        converted.root = rootAux.slice();

        graph.start(converted);

        return;

    }

    // Return a list with all the the nodes name
    // that is going to be used for the autocomplete function

    function getNodeTags(){
        return tags;
    }


    function restartGraph(){
        graph.removeContent();
        converted.root = [root];

        graph.start(converted);

        return false;
    }

    function applyFilter(ftlr){
        return filter[ftlr];
    }

    function init(){
        var dict = menuDict.getOptionKeys();


        for(var i = 0; i < dict.length; i++){
            filter[dict[i]] = [];
        }

    }

    return {
        filterAll : filterAll,
        restartGraph : restartGraph,
        init : init,
        getCaption : function(key){
            return caption[key];
        },
        getMap : function(key){
            // return dictionary with a list of all the nodes that the node(key)
            // is connected to
            return map[key];
        },
        getFullMap : function(){
            //return ta list with all nodes in the same format as the getMap()
            return map;
        },
        getWikipediaID : function(key){
            return wikipediaID[key];
        },
        checkWikipediaIDExists : function(key){
            return key in wikipediaID;
        },
        checkNodeNameExists : function(key){
            return key in tagsDict;
        },
        getNodeTags : getNodeTags,
        getPosition : function(key){
            return position[key];
        },
        applyFilter : applyFilter,
        getRoot : function(){
            return root;
        },
        setRoot : function(rt){
            root = rt;
            return;
        },
        resetRoot : function(){
            root = converted.rootCache[0];
            return;
        },
        request : function(){
            var nameAux = "";

            $.getJSON( './scripts/data/data.json', function(data){

                graph.setGridRestoreFlag(false);

                //creating all nodes
                for(var i=0; i < data.length; i++){

                    if(nameAux != data[i].name){
                        //it's a different node, add to the node
                        nameAux = data[i].name;
                        map[nameAux] = {};

                        //autocomplete into the menu
                        tags.push(data[i].name);
                        tagsDict[data[i].name] = data[i].name;

                        //filtering
                        if(filter[menuDict.getOptionKey(data[i].type)] != undefined)
                            filter[menuDict.getOptionKey(data[i].type)].push(data[i].name);

                        if(data[i].type != 0)
                            filter['scientists'].push(data[i].name);


                        var node = {
                            "name" :data[i].name,
                            "type" : data[i].type,
                            "symbol": data[i].symbol,
                            "id" : data[i].name.replace(" ", ""),
                            'x' : window.innerWidth/2,
                            'y' : window.innerHeight/2,
                            'px' : window.innerWidth/2,
                            'py' : window.innerHeight/2
                        };

                        if (converted['root'].indexOf( node.name ) !== -1) {
                            node.x = window.innerWidth/2;
                            node.y = window.innerHeight/2;
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

                    if(!(linkAux in caption)){ caption[linkAux] = ""; }

                    if(data[i].wikipediaID != undefined && data[i].wikipediaID != "" && !(data[i].wikipediaID in wikipediaID)){
                        wikipediaID[data[i].name] = data[i].wikipediaID;
                    }


                    caption[linkAux] = data[i].linkInfo == "" ? caption[linkAux] : data[i].linkInfo;
                    linkInfo = caption[linkAux];

                    converted.links.push({
                        "source" : source,
                        "target": target,
                        "linkType": data[i].linkType,
                        "linkInfo": linkInfo,
                        "depth": data[i].depth
                    });
                }

                menu.init(); // making the autocomplete avaliable based on the list

                main.introInit();

                graph.start(converted);

                parameters.getParameters();

            });
        }
    };

})();

'use strict';

var parameters = (function(){

    var query = location.search.substr(1);
    var result = {};

    function getJsonFromUrl() {

        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });

        if("" in result){
            result = null;
        }

        return result;
    }


    return {
        getParameters : function(){
            var par = {};

            par = getJsonFromUrl();

            if(par != null){
                if(par.s != undefined && par.e != undefined){

                    // If I'm passing two arguments is the same as using the "Create your own graph" functionality
                    
                    $('#txtStart').val(par.s);
                    $('#txtEnd').val(par.e);


                    $('#form').trigger('submit');

                    $('#txtStart').val("");
                    $('#txtEnd').val("");

                }else if(par.s != undefined){

                    graph.setOpenNode({});

                    converterData.setRoot(par.s);
                    converterData.restartGraph();
                }else if(par.e != undefined){

                    graph.setOpenNode({});

                    converterData.setRoot(par.e);
                    converterData.restartGraph();
                }
            }

            return par;
        },
        hasParameters : function(){
            // Verify if we are using some parameters to initiate the graph or not.
            return result != null;
        }
    };

})();

'use strict';

var menuDict = (function(){

    var dict = {};

    function init(){

        dict.options = {
            'scientists': 0,
            'designers': 1,
            'design-theorists': 2,
            'computers-pioneer': 3,
            'counter-culture': 4,
            'institution': 11,
            'publication': 12
        };

        dict.optionsKey = {
            0 : 'scientists',
            1 : 'designers',
            2 : 'design-theorists',
            3 : 'computers-pioneer',
            4 : 'counter-culture',
            11 : 'institution',
            12 : 'publication'
        };

        return;
    }


    function getOptionValue(key){
        return dict.options[key];
    }

    function getOptionKeys(){

        return Object.keys(dict.options);
    }

    function getOptionKey(key){
        return dict.optionsKey[key];
    }

    return {
        init : init,
        getOptionValue : getOptionValue,
        getOptionKeys : getOptionKeys, //returns an array with all the options
        getOptionKey : getOptionKey //return an element with the option's name
    };

}());

'use strict';

var menu = (function(){

    var active = {};

    var openNodeCache = null;
    var openNodePositionCache = null;
    var gridCache = null;

    var activeFilters = null;

    var source = [];

    var inputObj;

    var firstTimeMenu = true; //first time using the menu, this is going

    function init(){
        source = converterData.getNodeTags();

        $("#txtStart").typeahead({ source: source });
        $("#txtEnd").typeahead({ source: source });

    }

    $('.navbar-toggle').on('click', function(){

        if(firstTimeMenu){
            firstTimeMenu = false;


            main.introduceMenu();

        }

    });


    $('.nav a').on('click', function(){

        if($(this).parent().hasClass('active')){
            delete active[$(this).attr('id')]; //removing element from the active list

            if($(this).attr('id') ==  'all'){

                graph.setOpenNode($.extend( {}, openNodeCache));

                openNodeCache = null;

                converterData.restartGraph();

                graph.setFilterAllFlag(false);
            }

            $(this).parent().removeClass('active');

        } else{
            $(this).parent().addClass('active');
            active[$(this).attr('id')] = $(this).attr('id');



            if($(this).attr('id') == 'all'){
                var valid = converterData.checkNodeNameExists($("#txtStart").val()) && converterData.checkNodeNameExists($("#txtEnd").val());

                if(valid){
                    // it's because the user is using this functionality, so just restore first
                    restore();

                    $("#txtStart").val('');
                    $("#txtEnd").val('');
                }


                if(openNodeCache == null){
                    openNodeCache = $.extend( {}, graph.getOpenNode());
                    graph.setFilterAllFlag(true);
                }

                graph.setOpenNode({});

                active = {};
                $('.nav').find('.active').removeClass('active');
                $(this).parent().addClass('active');

                graph.setFilterAllFlag(true);

                converterData.filterAll();
                return;
            }
        }

        if($('.active').length == 0){
            graph.removeFadeOut();
            return;
        }

        graph.displayFilters(active);
    });

    function checkLinkPosition(name, array){
        var position = 0;
        var i = 0;
        var found = false;

        while(i < array.length){
            if(array[i].name == name){
                position = i;
                i = array.length;
                found = true;
            }
            i++;
        }
        return position;
    }

    // Form's functions

    // Validating input's value

    $("input").focusout(function(){
        if(!converterData.checkNodeNameExists($(this).val())){
            $(this).val('');
        }

        return;
    });


    $('form').submit(function(){

        var valid = converterData.checkNodeNameExists($("#txtStart").val()) && converterData.checkNodeNameExists($("#txtEnd").val());



        if(valid){

            $('.typeahead').find('.active').removeClass('active');

            if(openNodeCache == null){
                openNodeCache = $.extend( {}, graph.getOpenNode());
                openNodePositionCache = $.extend( {}, graph.getOpenNodePositions());
                grid.saveInstance();
            }



            var map = converterData.getFullMap();



            converterData.setRoot($("#txtStart").val());

            var dijkstra = new Dijkstra(map);
            var shortPath = dijkstra.findShortestPath($("#txtStart").val(), $("#txtEnd").val());

            var open = {};

            for(var i = 0; i < shortPath.length; i++){
                open[shortPath[i]] = shortPath[i];
            };


            graph.setOpenNode(open);
            graph.setOpenNodePositions({});


            grid.createInstance();
            grid.addNode(shortPath);
            graph.clearFixedNodes();
            graph.format();

            return false;

        }

        return false;
    });

    $('.input-btn').click(function(){

        if($(this).hasClass('txt-start')){
            inputObj = $("#txtStart");
        }else{
            inputObj = $("#txtEnd");
        }

        menuModal.create();
    });

    function updateInput(value){
        inputObj.val(value);
    }



    $('form').on('reset', restore);

    function restore(){


        if(openNodeCache == null) return; //checking if the app is or  using parameters

        if(parameters.hasParameters()){
            parameters.getParameters();
            return;
        }

        resetGraphConfig();

        converterData.restartGraph();
    };

    function resetGraphConfig(){


        graph.setOpenNode(openNodeCache);
        graph.setOpenNodePositions($.extend( {}, openNodePositionCache));

        grid.restoreInstance();

        openNodeCache = null;
        converterData.resetRoot();
        graph.clearFixedNodes();

        graph.setGridRestoreFlag(true);

    }

    return {
        setActiveFilters : function(active){
            activeFilters = active;
        },
        getActiveFilters : function(){
            return activeFilters;
        },
        updateInput : updateInput,
        resetIntroMenu : function(){
            firstTimeMenu = true;
        },
        resetGraphConfig : resetGraphConfig,
        init : init
    };

}());

'use strict';

var menuModal = (function(){

    var selected;

    function createModal(){
        $('.modal-menu').find('.active').removeClass('active');
        $('.modal-menu').find('.all').addClass('active');

        selected = null;

        //displaying all at once
        createContent(converterData.applyFilter('scientists'));


    }

    $('.modal-btn').click(function(){

        if($(this).hasClass('select-btn')){

            if(selected != null)
                menu.updateInput(selected);
        }
        $('#menu').offcanvas('show');



        selected = null;
    });

    $('.modal-see-all').click(function(){

        if($(this).hasClass('active')) return;

        $('.modal-menu').find('.active').removeClass('active');

        var filter = $(this).attr('class').split(' ')[1];

        createContent(converterData.applyFilter(filter));

        $(this).addClass('active');
    });

    function createContent(content){
        var html = "";

        for(var i = 0; i < content.length; i++){
            html += '<div class=\'col-lg-4 col-md-6 col-sd-6 col-xs-6 modal-item\'>'
            html += '<h5 class=\'modal-see-all\'>' + content[i] + '</h5>';
            html += '</div>'
        }



        $("#modalContent").html(html);

        $('.modal-item').click(function(){

            selected = $(this).children()[0].textContent;

            $('#modalContent').find('.active').removeClass('active');

            $(this).addClass('active');
        });
    }


    return {
        create : createModal
    };

}());

'use strict';

var main = (function(){

    var tour = null;
    var loadedPage = true; //this is going to be used just when the user loads the page

    $('.navmenu').offcanvas({ autohide: false});
    window.onload = function(){
        showBodyIntro();
    }


    // Click functions
    $('#startBtn').click(showBodyContent);
    $('#startBtn').click(showBodyContent);

    $('.help-btn').click(showBodyIntro);

    $('svg').click(hideMenu);

    // [end] Click functions


    // Functions that handle the clicks

    function showBodyIntro(){

        $("#menu").removeClass('canvas-slid');

        menu.resetIntroMenu();

        if(!loadedPage){
            $('.body-content').fadeOut('slow');
        }else{
            $('.body-content').hide();
        }

        $('.body-intro').fadeIn('slow');
    }

    function showBodyContent(){

        $('.body-intro').fadeOut();
        $('.body-content').fadeIn('slow');

        // Prevent the tour being displayed more times, we should display
        // it only when the user loads the page or go to the "what's this graph about?"

        if(loadedPage){
            $('.navmenu').offcanvas('hide');
            $('.navmenu').show();
            $('.navmenu').offcanvas('hide');

            setTimeout(function(){

                menuDict.init();
                graphDictionary.init();
                converterData.init();
                converterData.request();


            }, 650);

            loadedPage = false;
        }

        tourGraphInit();

    }

    function hideMenu(){
        $("#menu").removeClass('.canvas-slid');

        $('.navmenu').offcanvas('hide');
        $('.offcanvas-clone').remove();
        hideTour();
        $('.popover').fadeOut('slow', function(){
            if(this != undefined)
                $(this).remove();
        });
    }

    // Introduction's messages

    var introMenu = 'Select one or more filters to see the relations between nodes.';
    var introCreate = 'To see how individuals are connected to one another, enter names into the form fields in the tools panel.';
    var introGraph = 'You can explore the graph by clicking, mousing over or dragging any of the objects. Select a dot to learn more.';


    function tourGraphInit(){
        // start the introduction

        // I'm using a timeout function because the menu slider
        // has an animation and those animations were overlaping each other.
        // So I decided to wait a little bit and then trigger this function
        setTimeout(function(){
            tour = new Tour({
                steps: [
                    {
                        element: "#" + converterData.getRoot().replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, ''),
                        content: introGraph,
                        placement: function(){
                            var place = 'left';
                            var root = "#" + converterData.getRoot().replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, '');
                            var rootX = d3.transform(d3.select(root).attr("transform")).translate[0];
                            var rootY = d3.transform(d3.select(root).attr("transform")).translate[0];

                            if( rootX < (window.innerWidth / 2) ){
                                place = 'right';
                            }

                            return place;
                        }
                    }],
                next: -1,
                prev: -1,
                storage: false,
                onShown:function(){
                    $("button[data-role='end']").text('I got it!');
                }});


            tour.init();
            tour.start();


        }, 200);
    }

    function hideTour(){
        if(tour != null){
            tour.end();
            tour = null;
        }
    }

    function introduceMenu(){


        // I'm using a timeout function because the menu slider
        // has an animation and those animations were overlaping each other.
        // So I decided to wait a little bit and then trigger this function
        setTimeout(function(){
            tour = new Tour({
                steps: [
                    {
                        element: '#publication',
                        content: introMenu,
                        placement: 'right'
                    },
                    {
                        element: '#form',
                        content: introCreate,
                        placement: 'right'
                    }
                    ],
                next: -1,
                prev: -1,
                storage: false,
                onShown:function(){
                    $("button[data-role='end']").text('I got it!');
                }});


            tour.init();
            tour.start();

        }, 200);


    }

    return {
        introInit : tourGraphInit,
        hideTour: hideTour,
        introduceMenu : introduceMenu
    };

}());