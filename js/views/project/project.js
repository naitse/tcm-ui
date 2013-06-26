define(function(require){

    var $ = require('jquery-plugins'),
        projectTemplate = require('text!templates/project/project.html'),
        styles = require('text!templates/project/style'),
        tcmModel = require('tcmModel'),
        global = require('global'),
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

        refreshRender: function(){
            // fetchReleases();
        },

        attachEvents: function(){
            $(pV + ' #release-select-project').chosen()
            
            fetchReleases()
			tcmModel.project.configuration.fetch().done(function(data){
					$(pV + ' input').attr('disabled', false);
                if(data.length > 0){
					$(pV).find('.project-cofig').attr('project-id',data[0].id);
					$(pV + ' input.new-bug-url').val(data[0].bugurl);
                    $(pV + ' input.iter-per-spring').val(data[0].springIterations);
					$(pV + ' input.iter-duration').val(data[0].iterationDuration);
				}

                global.project.config.bug_url = data[0].bugurl;
                global.project.config.springIterations = data[0].springIterations;
                global.project.config.iterationDuration = data[0].iterationDuration;
                global.project.config.id = data[0].id;
                global.project.config.currentrelease = data[0].currentrelease;
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
        	});

        $(pV + " .btn-new-release").live({
                click:function(e){
                    e.stopPropagation();
                    $(pV + ' .new-release-config').show();
                }
        })

         $(pV + " .btn-save-release").live({
                click:function(e){
                    e.stopPropagation();
                    createRelease();
                }
        })

      $(pV + " .btn-save-iter").live({
                click:function(e){
                    e.stopPropagation();
                    createIteration();
                }
        })

        $(pV + " #datepicker" ).datepicker({
              showOn: "button",
              buttonImage: "assets/images/calendar.gif",
              buttonImageOnly: true
        });


        $(pV +'.remove-release-btn').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
                deleteRelease($(this).parents('td').attr('id'));
            }else{
              $(this).addClass('sec-state');
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
            }
          }
        });

    
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

    function fetchReleases(){
          tcmModel.releases.fetch().done(function(data){
                //[{"releaseName":"27","iterationName":"16,18,19,20,21,22"},{"releaseName":"28","iterationName":"23,24,25"}]
                 $('.release-row').remove(); 
                $(pV + ' #release-select-project').find('option').remove();
                $(data).each(function(){
                  var optionG = $('<option>').attr('value', this.id).text( "Release "+this.releaseName);
                  $(pV + ' #release-select-project').append(optionG)
                })
                $(pV + ' #release-select-project').trigger("liszt:updated")


                $(data).each(function(){
                    addReleaseRow(this);
                })


        });
    }

    function addReleaseRow(data){
        var row = $('<tr class="release-row"/>');
        var td = $('<td id="">Release '+data.releaseName+'<i class="remove-release-btn icon-remove-circle"></i></td>');
        $(td).attr('id', data.id);
        $(row).append(td)
        $('#releases-table tbody').append(row);
    }

    function addIterationsRow(data){
        var row = $('<tr class="release-row"/>');
        var td = $('<td/>');
        $(td).text('Release '+ data.releaseName).attr('id', data.id);
        $(row).append(td)
        $('#releases-table tbody').append(row);
    }

    function deleteRelease(rlsid){
        global.toggleLoading($('#'+rlsid),true,'small')
        tcmModel.releases.remove(rlsid).done(function(data){
            fetchReleases();
        })

    }

    function createRelease(){

        tcmModel.releases.create( $("#new-release-name").val() ).done(function(data, segundo, tercero){
            var rlsId = tercero.getResponseHeader('location').toString();
            rlsId = rlsId.substring(rlsId.lastIndexOf('/') +1 , rlsId.length);
            if (rlsId == "false"){
                console.log('Release exists');
            }else{
                fetchReleases();
                // $("#new-release-name").parents('.config').find('input').attr('disable',true);
            }
        });
    }

    function createIteration(){


        var rlsId = $(pV + ' #release-select-project').find('option:selected').val();
        $(pV + " .btn-save-iter").button('loading');
        tcmModel.releases.iterations.create(rlsId, $(pV + " #new-iter-name").val() ).done(function(data, segundo, tercero){

            var iterId = tercero.getResponseHeader('location').toString();
            iterId = iterId.substring(iterId.lastIndexOf('/') +1 , iterId.length);

            $(pV + " #new-iter-name").val('');
            $(pV + " .btn-save-iter").button('reset');
            
            // $("#jiraItems tr input:checked").each(function(){
            //     var issue = $(this).parents('.jiraRow').data('jiraIssue');

            //     deferreds.push( tcmModel.releases.iterations.features.create(0, iterId, issue.key, issue.summary, issue.description) );
            // })

            // $.when.apply($, deferreds).then(syncCompleted);
        });

        
    }
	function attachStyles(){

		$('body').append($(styles));

	}

	attachStyles();

    return ProjectView;

});