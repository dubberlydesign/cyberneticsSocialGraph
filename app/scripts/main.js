// $('.navmenu').hide();
$('.navmenu').offcanvas({ autohide: false});

// $('.navmenu').offcanvas('toggle');

window.onload = function(){


    // $('.navmenu').hide();
    setTimeout(function(){
        // $('.navmenu').offcanvas('hide');
        // $('.navmenu').show();
        $('.navmenu').offcanvas('hide');

        menuDict.init();
        graphDictionary.init();
        converterData.init();
        converterData.request();
    }, 650);
    // $('.navmenu').hide();
}


$('svg').click(function(){
    $('.navmenu').offcanvas('hide');
    $('.offcanvas-clone').remove();
});
