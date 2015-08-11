'use strict';

var main = (function(){

    var tour = null;
    var loadedPage = true; //this is going to be used just when the user loads the page

    $('.navmenu').offcanvas({ autohide: false});


    window.onload = function(){

        $('.body-intro').hide();
        $('.body-content').hide();

        if(!parameters.hasParameters()){
            showBodyIntro();
        }else{

            $('.body-content').fadeIn('slow', function(){
                $('.navmenu').offcanvas('hide');

                setTimeout(function(){

                    menuDict.init();
                    graphDictionary.init();
                    converterData.init();
                    converterData.request();
                    loadedPage = false;

                }, 650);
            });


        }

    }


    // Click functions
    $('#startBtn').click(showBodyContent);
    $('#startBtn').click(showBodyContent);

    $('.help-btn').click(function(){

        $('.navmenu').offcanvas('hide');

        showBodyIntro();
    });

    $('svg').click(hideMenu);

    // [end] Click functions


    // Functions that handle the clicks

    function showBodyIntro(){

        $("#menu").removeClass('canvas-slid');

        setTimeout(function(){
            menu.resetIntroMenu();

            $('.body-content').fadeOut('slow', function(){
                $('.body-intro').fadeIn('slow');
            });
        }, 250);


    }

    function showBodyContent(){

        $('.body-intro').fadeOut('slow', function(){
            $('.body-content').fadeIn('slow');

            // Prevent the tour being displayed more times, we should display
            // it only when the user loads the page or go to the "what's this graph about?"

            if(loadedPage){
                $('.navmenu').offcanvas('hide');
                $('.navmenu').show();
                $('.navmenu').offcanvas('hide');

                setTimeout(function(){

                    menuDict.init();
                    graphDictionary.init();
                    converterData.init();
                    converterData.request();


                }, 650);

                loadedPage = false;
            }

            tourGraphInit();
        });




    }

    function hideMenu(){
        $("#menu").removeClass('.canvas-slid');

        $('.navmenu').offcanvas('hide');
        $('.offcanvas-clone').remove();
        hideTour();
        $('.popover').fadeOut('slow', function(){
            if(this != undefined)
                $(this).remove();
        });
    }

    // Introduction's messages

    var introMenu = 'Select one or more filters to see the relations between nodes.';
    var introCreate = 'To see how individuals are connected to one another, enter names into the form fields in the tools panel.';
    var introGraph = 'You can explore the graph by clicking, mousing over or dragging any of the objects. Select a dot to learn more.';


    function tourGraphInit(){
        // start the introduction

        // I'm using a timeout function because the menu slider
        // has an animation and those animations were overlaping each other.
        // So I decided to wait a little bit and then trigger this function
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


        // I'm using a timeout function because the menu slider
        // has an animation and those animations were overlaping each other.
        // So I decided to wait a little bit and then trigger this function
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
