// Filename: app.js
define([
    'jquery',
    'views/manager/manager',
    'views/topmenu',
    'views/sync/sync'
], function($, ManagerView, TopMenuView, SyncView ){
    var initialize = function(){
        
        TopMenuView.render();
        ManagerView.render();
        SyncView.render();
        
    }

    return {
        initialize: initialize
    };
});