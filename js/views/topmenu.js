define(function(require){

    var $ = require('jquery'),  menuTemplate  = require('text!templates/topmenu.html'),
    tcmModel = require('tcmModel'),
    global = require('global'),
    sprint = require('modules/sprint/sprint');

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

        $('.tcm-top-menu-container #logout').live({
            click:function(){
              $.cookie('apiKey', null, { path: '/' });
              $.cookie('projectId', null, { path: '/' });
              $.cookie('usrname', null, { path: '/' });
            }
          });
       	
          tcmModel.project.configuration.fetch().done(function(data){
              if(data.length > 0){

                global.project.config.bug_url = data[0].bugurl;
                global.project.config.springIterations = data[0].springIterations;
                global.project.config.iterationDuration = data[0].iterationDuration;
                global.project.config.id = data[0].id;
                global.project.config.currentrelease = data[0].currentrelease;

                jiraLink = data[0].bugurl;
                currentR = {
                  year:data[0].currentrelease.split('/')[0],
                  month:data[0].currentrelease.split('/')[1],
                  day:data[0].currentrelease.split('/')[2],
                }
                                // console.log(data,currentR)
                sprint.render(sprint.create(data[0].springIterations,data[0].iterationDuration,currentR),'.spring-progress',160,29);
              }
            });

        }
    };

    return TopMenuView;

});