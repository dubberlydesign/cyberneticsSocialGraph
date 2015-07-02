'use strict';

var menu = (function(){

    var active = {};

    var openNodeCache = null;

    var activeFilters = null;


    $('.nav a').on('click', function(){

        if($(this).parent().hasClass('active')){
            delete active[$(this).attr('id')]; //removing element from the active list

            if($(this).attr('id') ==  'all'){
                // openNode = $.extend( {}, openNodeCache ); //making a copy

                graph.setOpenNode($.extend( {}, openNodeCache));

                openNodeCache = null;

                // converted.root = converted.rootCache;

                converterData.restartGraph();

                graph.setFilterAllFlag(false);

                // graph.start(converted);
            }

            $(this).parent().removeClass('active');

        } else{
            $(this).parent().addClass('active');
            active[$(this).attr('id')] = $(this).attr('id');


            if($(this).attr('id') == 'all'){
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

    return {
        setActiveFilters : function(active){
            activeFilters = active;
        },
        getActiveFilters : function(){
            return activeFilters;
        }
    };

}());
