'use strict';

var menuDict = (function(){

    var dict = {};

    function init(){

        dict.options = {
            'designers': 1,
            'design-theorists': 2,
            'computers-pioneer': 3,
            'counter-culture': 4,
            'institution': 11,
            'publication': 12
        };

        return;
    }


    function getOptionValue(key){
        return dict.options[key];
    }



    return {
        init : init,
        getOptionValue : getOptionValue
    };

}());
