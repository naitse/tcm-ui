define(function(require){

    var $ = require('jquery'),
        managerTemplate = require('text!templates/manager/manager.html');

    require('tcm2');

    var ManagerView = {
        render: function(){
            $("#pannel-wrapper").append(managerTemplate);
        }
    };

    return ManagerView;

});