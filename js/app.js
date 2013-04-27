// Filename: app.js
define([
    'jquery',
    'views/manager/manager',
    'views/topmenu',
    'views/sync/sync'
], function($, ManagerView, TopMenuView, SyncView ){
//], function($, TopMenuView ){
    var initialize = function(){
        
        TopMenuView.render();
        ManagerView.render();
        SyncView.render();
        
    }

    return {
        initialize: initialize
    };
});