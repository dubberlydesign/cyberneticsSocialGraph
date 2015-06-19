$('.zoom-btn').click(function() {
	zoomClick($(this).hasClass('zoom-in'), this);
});

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

function zoomed() {
    g.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
}

function zoomClick(zoomIn, obj) {

	clearTooltips(true);

    var direction = 1,
	    factor = 0.2,
	    target_zoom = 1,
	    center = [width / 2, height / 2],
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

    ablingButtons();

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
}

function ablingButtons(){
	$('.zoom-btn').prop('disabled', false);
}