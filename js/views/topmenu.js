define(function(require){

    var $ = require('jquery'),  menuTemplate  = require('text!templates/topmenu.html');


    var TopMenuView = {

        render: function(){

            $(".tcm-top-menu-container").empty();
            $(".tcm-top-menu-container").append(menuTemplate);

        }
    };

    return TopMenuView;

});