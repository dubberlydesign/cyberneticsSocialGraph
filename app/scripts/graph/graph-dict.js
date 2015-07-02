'use strict';

var graphDictionary = (function(){

    var values = {};

    return {
        init : function(){
            values.color = {
                '0' : '#171616',
                '1' : '#00A3D9',
                '2' : '#00984B',
                '3' : '#E15D32',
                '4' : '#993366',
                '5' : '#f39c12',
                '6' : '#f39c12',
                '7' : '#f39c12',
                '8' : '#f39c12',
                '9' : '#f39c12',
                '10' : '#f39c12',
                '11' : '#95a5a6',
                '12' : '#bdc3c7'
            };

            values.size = {
                '0' : '10',
                '1' : '10',
                '2' : '10',
                '3' : '10',
                '4' : '10',
                '5' : '10',
                '6' : '10',
                '7' : '10',
                '8' : '10',
                '9' : '10',
                '10' : '10',
                '11' : '5',
                '12' : '5'
            };

            values.symbol = {
                '0' : 'circle',
                '1' : 'circle',
                '2' : 'circle',
                '3' : 'circle',
                '4' : 'circle',
                '5' : 'circle',
                '6' : 'circle',
                '7' : 'circle',
                '8' : 'circle',
                '9' : 'circle',
                '10' : 'circle',
                '11' : 'diamond', //institute triangle-up
                '12' : 'square' //publication
            };

            values.distance =  {
                '1' : 85,
                '2' : 100,
                '3' : 150,
                '4' : 190,
                '5' : 255,
                '6' : 280
            };

            values.linkDistance = {};
        },
        getColor :  function(priority){
            return values.color[priority];
        },
        getSize : function(priority){
            return values.size[priority];
        },
        getSymbol : function(priority){
            return values.symbol[priority];
        },
        setLinkDistance : function(key, value){
            values.linkDistance[key] = value;
        },
        getLinkDistance : function(key){
            return values.linkDistance[key];
        },


    };

})();
