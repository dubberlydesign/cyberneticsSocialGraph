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

    var requested = false;


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

            if(requested){
                return;
            }else{
                requested = true;
            }

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
