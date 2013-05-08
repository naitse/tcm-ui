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
            $('.tcm-top-menu-container a').removeClass('active');
            $('.brand').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
        }
    };

    return ManagerView;

});