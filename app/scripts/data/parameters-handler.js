'use strict';

var parameters = (function(){

    var query = location.search.substr(1);
    var result = {};
    var loadedPage = true; //

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

            //
            // var search = location.search.substring(1);
            //
            // search = search.split('&');

            par = getJsonFromUrl();

            // console.log(par, par.s, par.e);
            if(par != null){
                if(par.s != undefined && par.e != undefined){

                    $('#txtStart').val(par.s);
                    $('#txtEnd').val(par.e);


                    $('#form').trigger('submit');

                    $('#txtStart').val("");
                    $('#txtEnd').val("");

                }else if(par.s != undefined){

                    // graph.setOpenNode(menu.getOpenNodeCache());
                    // menu.setOpenNodeCache({});

                    graph.setOpenNode({});

                    // menu.resetGraphConfig();

                    converterData.setRoot(par.s);
                    converterData.restartGraph();
                }else if(par.e != undefined){

                    // graph.setOpenNode(menu.getOpenNodeCache());
                    // menu.setOpenNodeCache({});

                    graph.setOpenNode({});

                    // menu.resetGraphConfig();

                    converterData.setRoot(par.e);
                    converterData.restartGraph();
                }
            }

            return par;
        },
        hasParameters : function(){
            return result != null;
        }
    };

})();
