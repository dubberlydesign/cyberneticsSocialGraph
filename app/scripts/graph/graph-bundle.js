'use strict';

var graph = (function(graph) {
	var w = 900;
	var h = 900;
  var r = Math.min(w,h) / 2;

	var nodeTooltipCounter = [];

	var cluster = d3.layout.cluster().size([360, r/2]);
  var bundle = d3.layout.bundle();
  var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d){ return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

  var arc = d3.svg.arc().innerRadius(r/4).outerRadius(r/3);

  var svg = d3.select(".body-content").append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox', [0, 0, w, h].join(', '))
  .append("g")
    .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

  function createGraph() {}

  function startGraph(data) {
    var nest = d3.nest().key(function(d) { return d.type; }).entries(data.nodes);
    var test = { parent: null, children: nest.map(function(d,i) { return { name: menuDict.getOptionValue(d.key), children: d.values }; }) };
    var nodeData = cluster(test);
    var linkData = bundle(data.links);
    var nodes = svg.selectAll('.node').data(nodeData.filter(function(n){ return !n.children; }));
    var links = svg.selectAll('.link').data(linkData);

    function highlight(d) {
      links.filter(function(l){ return l.source === d; }).style({
        stroke: function(d) { return d.source.color || '#ccc'; },
        opacity: 1
      });

      links.filter(function(l){ return l.source !== d; }).style({
        stroke: '#ccc',
        opacity: 0.1
      });

      nodes.filter(function(n) {
        var links = linkData.filter(function(l) {
          return d.id === l[0].id && n.id === l[l.length - 1].id;
        })
        return d.id !== n.id && links.length === 0;
      }).style({
        fill: '#ccc',
        opacity: 0.25
      });

      nodes.filter(function(n) {
        var links = linkData.filter(function(l) {
          return d.id === l[0].id && n.id === l[l.length - 1].id;
        })
        return d.id === n.id || links.length > 0;
      }).style({
        fill: function(d) { return d.color; },
        opacity: 1
      });
    }

    function reset(d) {
      links.style({
        stroke: 'black',
        opacity: 1
      });

      nodes.style({
        fill: 'black',
        opacity: 1
      });
    }

    links.enter().append('path')
      .each(function(d) {
        d.source = d[0];
        d.target = d[d.length - 1];
      })
      .attr('class', 'link')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', 'black');

    nodes.enter().append('text')
      .attr('class','node')
      .attr('dy', '0.31em')
      .attr('transform', function(d) {
        var transform = ["rotate(" + (d.x - 90) + ")", "translate(" + (d.y + 8) + ",0)"];
        if (285 < d.x || d.x <= 105) transform.push("rotate(180)");
        return transform.join(' ');
      })
      .style('text-anchor', function(d) { return 285 > d.x && d.x >= 105 ? 'start' : 'end'; })
      .style('font-weight', 'bold')
      .text(function(d) { return d.name; })
      .on('mouseover', highlight)
      .on('mouseout', reset);
  }

  graph.bundle = {
    create: createGraph,
    start: startGraph
  }

  return graph;
}(graph || {}));
