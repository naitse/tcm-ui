// Filename: app.js
define([
    'jquery',
    'views/manager/manager',
    'views/topmenu'
], function($, ManagerView, TopMenuView ){
//], function($, TopMenuView ){
    var initialize = function(){
        TopMenuView.render();
        ManagerView.render();
    }

    return {
        initialize: initialize
    };
});