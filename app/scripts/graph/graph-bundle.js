'use strict';

function getWikipediaData(target, d, i) {
	var wikipediaID = converterData.getWikipediaID(d.name);

	if (wikipediaID) {
		var url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&format=json&exintro=&explaintext=";
		url += "&pithumbsize=399";
		url += "&titles=" + wikipediaID;

		$.ajax({
			url: url,
			type: 'GET',
			crossDomain: true,
			dataType: 'jsonp',
			success: function(data) {
				var result;
				for(var key in data.query.pages) {
					result = data.query.pages[key];
				}

				var href = 'https://en.wikipedia.org/wiki/' + converterData.getWikipediaID(d.name);
				var content = '<h3 class="details-title visible-xs visible-sm visible-md"><a href="' + href + '" target="_blank">' + d.name + '<i class="glyphicon glyphicon-chevron-right"></i></a></h3>';
				if (result.thumbnail != undefined && result.thumbnail.source != undefined && result.thumbnail.source != "") {
					content += '<img src="' + result.thumbnail.source  + '" class="img-node"/>';
				}
				content += '<h3 class="details-title visible-lg"><a href="' + href + '" target="_blank">' + d.name + '<i class="glyphicon glyphicon-chevron-right"></i></a></h3>';
				content += marked(result.extract.split("\n").shift());
				content += "<p><a href='" + href + "' target='_blank' class='info-link'>Read more on Wikipedia</a></p>";
				target.html(content);
			},
			error: function(e) {
				console.error(e);
			}
		});
	} else {
		var href = 'https://www.google.com/search?q=' + encodeURI(d.name);
		var content = '<h3 class="details-title"><a href="' + href + '" target="_blank">' + d.name + '<i class="glyphicon glyphicon-chevron-right"></i></a></h3>';
		content += '<p><a href="'+ href +'" target="_blank">Search Google for ' + d.name + '</a></p>';
		target.html(content);
	}
}

var graph = (function(graph) {
	var w = 900;
	var h = 900;
  var r = Math.min(w,h) / 2;

	var nodeTooltipCounter = [];

	var cluster = d3.layout.cluster().size([360, r/2]).sort(function(a,b) {
		if (a.type === 11 && b.type === 11) {
			return d3.descending(a.name,b.name);
		} else {
			return d3.ascending(a.name.split(' ').pop(),b.name.split(' ').pop());
		}
	});

  var bundle = d3.layout.bundle();
  var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d){ return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

  var arc = d3.svg.arc().innerRadius(r/4).outerRadius(r/3);

  var svg = d3.select(".body-content").append("svg")
    .style("max-width", w + 'px')
    .style("max-height", h + 'px')
    .style('width', '100%')
    .style('height', '100%')
    .attr('viewBox', [0, 0, w, h].join(', '))
  .append("g")
    .attr("transform", "translate(" + w/2 + "," + h/2 + ")")
	.append("g")
		.attr("transform", "rotate(-55)");

	var details = d3.select("#details");
	var detailsTitle = details.append('h2').attr('class', 'details-title');
	var detailsBody = details.append('div').attr('class', 'details-body');

  function createGraph() {}

	function getColor(d,i) {

	}

  function startGraph(data) {
		var active = null;
    var nest = d3.nest().key(function(d) { return d.type; }).entries(data.nodes);
    var test = { parent: null, children: nest.map(function(d,i) { return { name: d.key, children: d.values }; }) };
    var nodeData = cluster(test);
    var linkData = bundle(data.links);
    var nodes = svg.selectAll('.node').data(nodeData.filter(function(n){ return !n.children; }));
    var links = svg.selectAll('.link').data(linkData);

		var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
			var link = data.links.filter(function(l) {
				return l.source === active && l.target === d;
			}).shift();

			if (link && link.linkInfo && link.linkInfo !== '') {
				return link.linkInfo;
			} else {
				return "No link info available";
			}
		});

		svg.call(tip);

		function relatedNodes(d) {
			return nodes.filter(function(n) {
				var links = linkData.filter(function(l) {
					return d.id === l[0].id && n.id === l[l.length - 1].id;
				});

				return links.length > 0;
			});
		}

		function unrelatedNodes(d) {
			return nodes.filter(function(n) {
				var links = linkData.filter(function(l) {
					return d.id === l[0].id && n.id === l[l.length - 1].id;
				});

				return links.length === 0;
			});
		}

		function relatedLinks(d) {
			return links.filter(function(l) {
				return l.source === d;
			});
		}

		function unrelatedLinks(d) {
			return links.filter(function(l) {
				return l.source !== d;
			});
		}

		function classedSelected(selection) {
			selection.classed({
				active: false,
				inactive: false,
				selected: true
			});
		}

		function classedActive(selection) {
			selection.classed({
				active: true,
				inactive: false,
				selected: false
			});
		}

		function classedInactive(selection) {
			selection.classed({
				active: false,
				inactive: true,
				selected: false
			});
		}

		function classedReset(selection) {
			selection.classed({
				active: false,
				inactive: false,
				selected: false
			});
		}

    function highlight(d) {
			var related = d.relatedLinks.data();
			links.sort(function(a, b) {
	      a = related.indexOf(a);
	      b = related.indexOf(b);
				return d3.ascending(a, b);
	  	});

			d.relatedLinks.call(classedActive);
			d.unrelatedLinks.call(classedInactive);
			d.relatedNodes.call(classedActive);
			d.unrelatedNodes.call(classedInactive);
			d3.select(this).call(classedActive);
    }

    function lowlight() {
      links.call(classedReset);
      nodes.call(classedReset);
    }

		function deselect() {
			hideDetails();
			nodes.on('mouseover', highlight)
      .on('mouseout', lowlight)
			.on('click', select);
			d3.select(this).call(classedReset);
			if (d3.event) d3.event.stopPropagation();
		}

		function reset() {
			lowlight();
			deselect();
		}

		function showDetails(d, i) {
			details.classed('details-active', true).html('').call(getWikipediaData, d, i);
		}

		function hideDetails() {
			details.classed('details-active', false);
		}

		function select(d,i) {
			d3.event.stopPropagation();
			active = d;
			tip.hide();
			highlight.call(this, d, i);
			nodes.on('mouseover', null).on('mouseout', null).on('click', null);
			d.relatedNodes.on('click', select).on('mouseover', tip.show).on('mouseout', tip.hide);
			d3.select(this).call(classedSelected).on('click', deselect);
			showDetails(d, i);
		}

    links.enter().append('path')
      .each(function(d) {
        d.source = d[0];
        d.target = d[d.length - 1];
      })
      .attr('class', 'link')
      .attr('d', line);

    nodes.enter().append('text')
      .attr('class','node')
      .attr('dy', '0.31em')
      .attr('transform', function(d) {
        var transform = ["rotate(" + (d.x - 90) + ")", "translate(" + (d.y + 8) + ",0)"];
        if (d.type === 11) transform.push("rotate(180)");
        return transform.join(' ');
      })
      .style('text-anchor', function(d) { return d.type === 11 ? 'end' : 'start'; })
      .text(function(d) { return d.name; })
      .on('mouseover', highlight)
      .on('mouseout', lowlight)
			.on('click', select)
			.each(function(d,i) {
				d.relatedNodes = relatedNodes(d);
				d.unrelatedNodes = unrelatedNodes(d);
				d.relatedLinks = relatedLinks(d);
				d.unrelatedLinks = unrelatedLinks(d);
			});

		document.addEventListener('click', reset, false);
  }

  graph.bundle = {
    create: createGraph,
    start: startGraph
  }

  return graph;
}(graph || {}));
