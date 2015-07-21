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

        console.log('caio');

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

        if(openNodeCache == null) return;

        graph.setOpenNode(openNodeCache);
        graph.setOpenNodePositions($.extend( {}, openNodePositionCache));

        grid.restoreInstance();

        openNodeCache = null;
        converterData.resetRoot();
        graph.clearFixedNodes();

        graph.setGridRestoreFlag(true);

        converterData.restartGraph();
    };

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
        init : init
    };

}());
