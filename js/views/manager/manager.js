define(function(require){

    var $ = require('jquery'),
        managerTemplate = require('text!templates/manager/manager.html');
        


    var ManagerView = {

        moduleId: "Viewer",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(managerTemplate);

                this.rendered = true;
            }
        }
    };

    return ManagerView;

});