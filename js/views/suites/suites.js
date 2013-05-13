define(function(require){

    var $ = require('jquery'),
        suitesTemplate = require('text!templates/suites/suites.html'),
        tcmModel = require('tcmModel'),
        PM = require('panelsManager'),
        _ = require('underscore');

    var SuitesView = {
        moduleId: "Suites",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(suitesTemplate);
                this.attachEvents();
                PM.makeResizable("#suitesViewer",[550,100,313,700]);
                PM.colapseExpandRightPanel("#suitesViewer",'none');
                adjustHeight();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-suites').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
        },

        attachEvents: function(){

        }

    };

    function adjustHeight(){

        $("#suitesViewer .right-pannel").css({
              'height' : '100%'
          });

         $("#suitesViewer .lp-wrapper").css({
              'height' : '100%'
          });

         $("#suitesViewer .left-center-panel").css({
              'height' : '100%'
          });

        $('#suitesViewer').css('height',(($('.tcm-container').height() - 20)*100)/$('.tcm-container').height()+'%')
    }

    $(window).resize(function(){

		PM.panelRightWidth("#suitesViewer")

		adjustHeight();
         
    });

    return SuitesView;

});