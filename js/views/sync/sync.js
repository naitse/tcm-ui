define(function(require){

    var $ = require('jquery'),
        syncTemplate = require('text!templates/sync/sync.html');

    var SyncView = {
        render: function(){
            $("#pannel-wrapper").empty();
            $("#pannel-wrapper").append(syncTemplate);
        }
    };

    return SyncView;

});