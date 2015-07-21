'use strict';

var menuModal = (function(){

    var selected;

    function createModal(){
        $('.modal-menu').find('.active').removeClass('active');
        $('.modal-menu').find('.all').addClass('active');

        selected = null;

        //displaying all at once
        createContent(converterData.applyFilter('scientists'));


    }

    $('.modal-btn').click(function(){

        if($(this).hasClass('select-btn')){

            if(selected != null)
                menu.updateInput(selected);
        }
        $('#menu').offcanvas('show');



        selected = null;
    });

    $('.modal-see-all').click(function(){

        if($(this).hasClass('active')) return;

        $('.modal-menu').find('.active').removeClass('active');

        var filter = $(this).attr('class').split(' ')[1];

        createsContent(converterData.applyFilter(filter));

        $(this).addClass('active');
    });

    function createContent(content){
        var html = "";

        for(var i = 0; i < content.length; i++){
            html += '<div class=\'col-lg-4 col-md-6 col-sd-6 col-xs-6 modal-item\'>'
            html += '<h5 class=\'modal-see-all\'>' + content[i] + '</h5>';
            html += '</div>'
        }



        $("#modalContent").html(html);

        $('.modal-item').click(function(){

            selected = $(this).children()[0].textContent;

            $('#modalContent').find('.active').removeClass('active');

            $(this).addClass('active');
        });
    }


    return {
        create : createModal
    };

}());
