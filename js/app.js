// Filename: app.js
define([
    'jquery',
    'views/manager/manager'
], function($, ManagerView){

    var initialize = function(){
        ManagerView.render();
    }

    return {
        initialize: initialize
    };
});