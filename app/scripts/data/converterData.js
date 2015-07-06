'use strict';

var converterData = (function(){

    var caption = {};

    var position = {};
    var wikipediaID = {};

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

    function restartGraph(){
        graph.removeContent();
        converted.root = converted.rootCache;
        graph.resetPositions();


        console.log(converted);
        graph.start(converted);
        console.log("hey");
    }

    return {
        filterAll : filterAll,
        restartGraph : restartGraph,
        getCaption : function(key){
            return caption[key];
        },
        getMap : function(key){
            return map[key];
        },
        getWikipediaID : function(key){
            return wikipediaID[key];
        },
        checkWikipediaIDExists : function(key){
            return key in wikipediaID;
        },
        getPosition : function(key){
            return position[key];
        },
        getRoot : function(key){
            return converted.rootCache[0];
        },
        request : function(){
            var nameAux = "";

            $.getJSON( './scripts/data/data.json', function(data){



                //creating all nodes
                for(var i=0; i < data.length; i++){

                    if(nameAux != data[i].name){
                        //it's a different node, add to the node
                        nameAux = data[i].name;
                        map[nameAux] = {};

                        var node = {
                            "name" :data[i].name,
                            "type" : data[i].type,
                            "symbol": data[i].symbol,
                            "linkRange": 0, //Math.floor(Math.random() * 201) - 100
                            "id" : data[i].name.replace(" ", "")
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

                graph.start(converted);

            });
        }
    };

})();
