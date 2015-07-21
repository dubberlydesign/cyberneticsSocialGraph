'use strict';

var menuDict = (function(){

    var dict = {};

    function init(){

        dict.options = {
            'scientists': 0,
            'designers': 1,
            'design-theorists': 2,
            'computers-pioneer': 3,
            'counter-culture': 4,
            'institution': 11,
            'publication': 12
        };

        dict.optionsKey = {
            0 : 'scientists',
            1 : 'designers',
            2 : 'design-theorists',
            3 : 'computers-pioneer',
            4 : 'counter-culture',
            11 : 'institution',
            12 : 'publication'
        };

        return;
    }


    function getOptionValue(key){
        return dict.options[key];
    }

    function getOptionKeys(){

        return Object.keys(dict.options);
    }

    function getOptionKey(key){
        return dict.optionsKey[key];
    }

    return {
        init : init,
        getOptionValue : getOptionValue,
        getOptionKeys : getOptionKeys, //returns an array with all the options
        getOptionKey : getOptionKey //return an element with the option's name
    };

}());
