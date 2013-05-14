define(function(require){

    var $ = require('jquery'),  menuTemplate  = require('text!templates/topmenu.html');


    var TopMenuView = {

        render: function(){

            $(".tcm-top-menu-container").empty();
            $(".tcm-top-menu-container").append(menuTemplate);

            $("#username").text($.cookie('usrname'));

            this.attachEvents();

        },
       	attachEvents: function(){
       		$('.tcm-top-menu-container a').live({
       			click:function(){
       				if(!$(this).hasClass('dropdown-toggle')){
	       				$('.tcm-top-menu-container a').removeClass('active');
    	   				$(this).addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
       				}
       			}
       		});



       	}
    };

    return TopMenuView;

});