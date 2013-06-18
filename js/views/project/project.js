define(function(require){

    var $ = require('jquery-plugins'),
        projectTemplate = require('text!templates/project/project.html'),
        styles = require('text!templates/project/style'),
        tcmModel = require('tcmModel'),
        pV = '#projectView ',
        _ = require('underscore');

    var ProjectView = {
        moduleId: "Project",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(projectTemplate);
                this.attachEvents();
                adjustHeight();
                attachObjects();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-project').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
        },

        attachEvents: function(){

			tcmModel.project.configuration.fetch().done(function(data){
					$(pV + ' input').attr('disabled', false);
                if(data.length > 0){
					$(pV).find('.project-cofig').attr('project-id',data[0].id);
					$(pV + ' input.new-bug-url').val(data[0].bugurl);
                    $(pV + ' input.iter-per-spring').val(data[0].springIterations);
					$(pV + ' input.iter-duration').val(data[0].iterationDuration);
				}
			});


        	$(pV + " .projec-config-save").live({
        		click:function(e){
        			e.stopPropagation();

        			if (jQuery.trim($(pV + ' input.iter-per-spring').val()).length > 0 && jQuery.trim($(pV + ' input.iter-duration').val()).length > 0){
        				sI = $(pV + ' input.iter-per-spring').val();
        				iD = $(pV + ' input.iter-duration').val();
                        nbu = $(pV + ' input.new-bug-url').val();

        			}

        			cId = 0

        			if($(pV).find('.project-cofig').attr('project-id') == ""){
        			}else{
        				cId = $(pV).find('.project-cofig').attr('project-id')
        			}

        			req = {
        				configId:parseInt(cId),
        				springIterations:parseInt(sI),
        				iterationDuration:parseInt(iD),
                        bugurl:nbu
        			}

        			// console.log(JSON.stringify(req))

        			$(this).button('loading')
        			var self = this;
        			tcmModel.project.configuration.add(req).done(function(data){
        				$(pV).find('.project-cofig').attr('project-id',data[0].configId);
        				$(self).button('reset');
        			});
        		}
        	})
    
        }

    };

    function attachObjects(){
    }

    function adjustHeight(){

        // $("#suitesViewer .right-pannel").css({
        //       'height' : '100%'
        //   });

        //  $("#suitesViewer .lp-wrapper").css({
        //       'height' : '100%'
        //   });

        //  $("#suitesViewer .left-center-panel").css({
        //       'height' : '100%'
        //   });

        // $('#suitesViewer').css('height',(($('.tcm-container').height() - 20)*100)/$('.tcm-container').height()+'%')
    }

    $(window).resize(function(){


    });


	function attachStyles(){

		$('body').append($(styles));

	}

	attachStyles();

    return ProjectView;

});