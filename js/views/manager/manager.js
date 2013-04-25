define([
  'jquery',
  'text!templates/manager/manager.html',
    'chosen',
    'bootstrap',
    'jqueryui',
    'tcm'
], function($, managerTemplate){

    var ManagerView = {
        render: function(){
            $("#pannel-wrapper").append(managerTemplate);
        }
    };

    return ManagerView;

});