define(function(require){

    var $ = require('jquery'),  menuTemplate  = require('text!templates/topmenu.html');
    var syncView = require('views/sync/sync');
    var managerView = require('views/manager/manager');

    var TopMenuView = {
        render: function(){

            $(".tcm-top-menu-container").empty();
            $(".tcm-top-menu-container").append(menuTemplate);

            $("#tm-manager").on("click", function(){ managerView.render(); } );
            $("#tm-sync").on("click", function(){ syncView.render(); } );
            $("#tm-metrics").on("click", function(){ console.log("soon"); } );
        }
    };

    return TopMenuView;

});