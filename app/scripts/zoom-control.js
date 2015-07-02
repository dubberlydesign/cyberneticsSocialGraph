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
