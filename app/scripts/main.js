'use strict';

var main = (function(){

    var tour = null;
    var loadedPage = true; //this is going to be used just when the user loads the page

    $('.navmenu').offcanvas({ autohide: false});
    window.onload = function(){
        showBodyIntro();
    }


    // Click functions
    $('#startBtn').click(showBodyContent);
    $('#startBtn').click(showBodyContent);

    $('.help-btn').click(showBodyIntro);

    $('svg').click(hideMenu);

    // [end] Click functions


    // Functions that handle the clicks

    function showBodyIntro(){
        $('.navmenu').offcanvas('hide');
        $('.navmenu').show();
        $('.navmenu').offcanvas('hide');

        menu.resetIntroMenu();

        if(!loadedPage){
            $('.body-content').fadeOut('slow');
        }else{
            $('.body-content').hide();
        }

        $('.body-intro').fadeIn('slow');
    }

    function showBodyContent(){

        $('.body-intro').fadeOut();
        $('.body-content').fadeIn('slow');

        if(loadedPage){
            $('.navmenu').offcanvas('hide');
            $('.navmenu').show();
            $('.navmenu').offcanvas('hide');

            setTimeout(function(){


                // introInit();

                menuDict.init();
                graphDictionary.init();
                converterData.init();
                converterData.request();


            }, 650);

            loadedPage = false;
        }

        tourGraphInit();

    }

    function hideMenu(){

        $('.navmenu').offcanvas('hide');
        $('.offcanvas-clone').remove();
        hideTour();
    }

    // Introduction's messages

    var introMenu = 'Select one or more filters to see the relations between nodes.';
    var introCreate = 'To see how individuals are connected to one another, enter names into the form fields in the tools panel.';
    var introGraph = 'You can explore the graph by clicking, mousing over or dragging any of the objects. Select a dot to learn more.';


    function tourGraphInit(){
        // start the introduction

        setTimeout(function(){
            tour = new Tour({
                steps: [
                    {
                        element: "#" + converterData.getRoot().replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, ''),
                        content: introGraph,
                        placement: function(){
                            var place = 'left';
                            var root = "#" + converterData.getRoot().replace(/\ /g, '').replace(/\"/g, '').replace(/\,/g, '');
                            var rootX = d3.transform(d3.select(root).attr("transform")).translate[0];
                            var rootY = d3.transform(d3.select(root).attr("transform")).translate[0];

                            if( rootX < (window.innerWidth / 2) ){
                                place = 'right';
                            }

                            return place;
                        }
                    }],
                next: -1,
                prev: -1,
                storage: false,
                onShown:function(){
                    $("button[data-role='end']").text('I got it!');
                }});


            tour.init();
            tour.start();


        }, 200);
    }

    function hideTour(){
        if(tour != null){
            tour.end();
            tour = null;
        }
    }

    function introduceMenu(){



        setTimeout(function(){
            tour = new Tour({
                steps: [
                    {
                        element: '#publication',
                        content: introMenu,
                        placement: 'right'
                    },
                    {
                        element: '#form',
                        content: introCreate,
                        placement: 'right'
                    }
                    ],
                next: -1,
                prev: -1,
                storage: false,
                onShown:function(){
                    $("button[data-role='end']").text('I got it!');
                }});


            tour.init();
            tour.start();

        }, 200);


    }

    return {
        introInit : tourGraphInit,
        hideTour: hideTour,
        introduceMenu : introduceMenu
    };

}());
