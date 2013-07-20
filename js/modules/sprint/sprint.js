define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        configPanelTemplate = require('text!templates/modules/sprint/configPanel.html'),
        styles = require('text!templates/modules/sprint/style'),
        _ = require('underscore');

    var sprint = {

	   biz_days:5,
        iteration_duration:1,
        iterations_per_spring:4,
        iteration_start:{},//{"year":2013,"month":5,"day":10};
        current_date:{},
        active_iteration:1,
        days_per_iteration:null,
        GUID:null,

        create:function(iterationsPerSpring, iterationDurationInWeeks, iterationStartDate){

            this.iterations_per_spring = iterationsPerSpring;
            this.iteration_duration = iterationDurationInWeeks;
            this.iteration_start = iterationStartDate;
            
            var currentDate = new Date();
            
            this.current_date = {
                "year":currentDate.getFullYear(),
                "month":currentDate.getMonth(),
                "day":currentDate.getDate()
            }

            var startD = new Date(this.iteration_start.year,this.iteration_start.month,this.iteration_start.day);

            var today = new Date(this.current_date.year,this.current_date.month,this.current_date.day);

            var days = Date.bizdays(startD, today);
            this.days_per_iteration = days;
            var dateDiff = days / this.biz_days ;
            
            
            var porcentage = (dateDiff != Math.floor(dateDiff))? dateDiff.toString().split('.'):dateDiff;

            if(dateDiff < this.iteration_duration){
            }else if(dateDiff > this.iteration_duration){
                this.active_iteration = Math.ceil(dateDiff / this.iteration_duration)
            }else{
                this.active_iteration = Math.ceil(dateDiff / this.iteration_duration)
            }

            // console.log(Date.bizdays(startD, today),dateDiff,this.iteration_duration,this.active_iteration)

            var section_width = (100 / this.iterations_per_spring)-1;

            var GUID = String.guidGenerator();
            this.GUID = GUID;

            var _timeline = $('<div class="time-line" style="width: 500px;height: 105px;"></div>').attr('time-line-id',this.GUID);

            for(var i=0; i < this.iterations_per_spring;i++){

                var day_width = 100/(this.iteration_duration*this.biz_days);

                var iteration_section = $('<div class="progress" style="width: '+section_width+'%;"></div>');

                for(var z=0; z < this.iteration_duration*this.biz_days;z++){
                    var section_progress = $('<div class="bar" style="width: '+day_width+'%;"></div>');
                    $(iteration_section).append(section_progress);

                }                
                
                var iter_action = $('<span class="iter-action round-corner-all"></span>')
                $(iteration_section).append(iter_action);

                $(_timeline).append($(iteration_section));

            };

            var config_icon = $('<i class="toggle-config-panel icon-cog"></i>').on({
            	click:function(e){
            		e.stopPropagation();
            		$(this).parents('.time-line').find('.config-panel').toggleClass('visible');
            	}
            })
            $(_timeline).append(config_icon).addClass('round-corner-all');
            return _timeline;

        },

        render:function(timeline,container,width,height){
            if(width != 'undefined' && height != 'undefined'){
                $(timeline).css({
                    width:width,
                    height:height
                });
            }
            $(container).append(timeline);
            var self = this;
            $(timeline).find('.bar').each(function(index){
                if(index < self.days_per_iteration){
                    $(this).addClass('bar-success');
                }else if(index == self.days_per_iteration){
                    $(this).addClass('bar-warning');
                    $(this).parents('.progress').addClass('progress-striped active');
                }else if(index > self.days_per_iteration){
                    $(this).addClass('bar-notrun');
                }
            });
            $(timeline).append(this.configPanel.create())     

        },

        destroy:function(){
            $(this).remove();
        },

        configPanel:{

            create:function(){

            	var config_panel = $(configPanelTemplate);
            	for(var i=0;i<sprint.iterations_per_spring;i++){
            		var alert_flag = $('<i class="icon-flag"></i>').on({
            			click:function(e){
            				e.stopPropagation();
            				if($(this).hasClass('icon-flag')){
            					$(this).removeClass('icon-flag').addClass('icon-ban-circle');
            				}else{
								$(this).removeClass('icon-ban-circle').addClass('icon-flag');
            				}
            			}
            		});
            		var iteration_label_input = $('<div class="iterarion-label" iter="'+i+'">Iteration '+(i+1)+':<input type="text"/></div>');
            		$(iteration_label_input).append(alert_flag);
            		$(config_panel).find('.config-body').append(iteration_label_input);
            	}

            	sprint.configPanel.attachEvents(config_panel);

            	return config_panel;
            	//this.render(config_panel, $('.time-line[time-line-id="'+this.self.GUID+'"]'));
               // $(this.object).datepicker({
               //    showOn: "button",
               //    buttonImage: "images/calendar.gif",
               //    buttonImageOnly: true,
               //    onSelect:function(date,object){
               //      console.log(date)
               //    }
               //  });
            },

            attachEvents:function(config_panel){
            	$(config_panel).find('.config-save').on({
            		click:function(e){
            			e.stopPropagation();
            			var iters_config = $(config_panel).find('.config-body .iterarion-label');
            			$(iters_config).each(function(index){
	            				var iter_identifier = $(this).attr('iter');
	            				var progress_container = $($(config_panel).parents('.time-line').find('.progress').get(iter_identifier));
	            				var iter_text = $(this).find('input').val();
	            				
            				if(iter_text != ""){
            					$(progress_container).find('.iter-action').text(iter_text);
	            				// $(progress_container).addClass('progress-striped');
            				}else{
            					$(progress_container).find('.iter-action').text('');
            					// $(progress_container).removeClass('progress-striped');
            				}
            			});
						$(this).parents('.config-panel').removeClass('visible');
            		}
            	});

				$(config_panel).find('.config-cancel').on({
            		click:function(e){
            			e.stopPropagation();
						$(this).parents('.config-panel').removeClass('visible');
            		}
            	})



            }
        }

    };

	function attachStyles(){

		        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "sprint"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }

	}


	attachStyles();

    return sprint;

});