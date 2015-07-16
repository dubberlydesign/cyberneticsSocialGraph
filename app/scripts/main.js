'use strict';

var main = (function(){

    var tour = null;

    $('.navmenu').offcanvas({ autohide: false});
    window.onload = function(){

        // $('.navmenu').hide();
        setTimeout(function(){
            // $('.navmenu').offcanvas('hide');
            // $('.navmenu').show();
            // $('.navmenu').offcanvas('hide');

            menuDict.init();
            graphDictionary.init();
            converterData.init();
            converterData.request();


        }, 650);
        // $('.navmenu').hide();
    }


    $('svg').click(hideMenu);

    function hideMenu(){

        $('.navmenu').offcanvas('hide');
        $('.offcanvas-clone').remove();
        tour.end();
    }

    // Introduction's messages

    var introHeader = 'Cybernetics is "deep intro-twingled" (to borrow Ted Nelson\'s magical phrase) with the early development of personal computers, the 1960s counter-culture, and the rise of the design methods movement (which ejoyed  arecent rebranding as "design thinking").'
    // var introMenu = 'This interactive social graph illustrates connections between people, institutions and ideas of the time.';
    var introMenu = 'Select one or more filters to see the relations between nodes.';
    var introCreate = 'To see how individuals are connected to one another, enter names into the form fields in the tools panel.';
    var introGraph = 'You can explore the graph by clicking and dragging any of the objects. Select a dot to learn more.';
    var introZoom = 'You can zoom in and zoom out the graph to have a better view.';


    function introInit(){
        // start the introduction
        // $.cookie("current_tour", "undefined");

        tour = new Tour({
            steps: [
                {
                    element: ".navbar-brand",
                    content: introHeader,
                    placement: 'bottom'
                },
                {
                    element: ".navmenu-nav",
                    content: introMenu,
                },
                {
                    element: "#form",
                    content: introCreate
                },

                {
                    element: ".zoom-in",
                    content: introZoom,
                    placement: 'left'
                }
                ,
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

                        console.log("***", root, rootX, rootY, window.innerWidth, window.innerHeight , ' --> ' , place);

                        return place;
                    }
                }],
            storage: false});

        // Initialize the tour
        tour.init();

        // Start the tour
        tour.start();
    }

    $('.help-btn').click(function(){
        introInit();
    });

    return {
        introInit : introInit
    };

}());
