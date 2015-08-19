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
            result = {};
        }

        return result;
    }


    return {
        getParameters : function(){
            var par = {};

            par = getJsonFromUrl();

            if(par != null){
                // enabling a viewport argument
                if(par.view != undefined){

                  $(".navbar").fadeOut('fast', function(){
                    main.showBodyContent();
                    $(".navbar").remove();

                  });

                }

                if(par.skipIntro != undefined){
                    console.log('hey');
                    main.showBodyContent();
                }

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

            return getJsonFromUrl() != null;
        },
        hasViewRequested : function(){
            return getJsonFromUrl().view != undefined;
        },
        hasSkipedIntro : function(){
            return getJsonFromUrl().skipIntro != undefined;
        }
    };

})();
