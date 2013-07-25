define(function(require){

    var $ = require('jquery-plugins'),
        global = require('global'),
        managerTemplate = require('text!templates/manager/manager.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
        sprint = require('modules/sprint/sprint'),
        itemsModule = require('modules/item/item'),
        featuresModule = require('modules/feature/feature'),
        PM = require('panelsManager'),
        _ = require('underscore'),
        jquerycookie = require('jquery.cookie'),
        notificator = require('notificator'),
        tcEditor = require('tcEditor');

        var view_container = "#tcViewer";
   var prefix = '';
   var displayed = false;
   var backend = 'http://tcm-backend.cloudhub.io/api/';
   var proposed=0;
   var FuckRequireJS = 0;
    var statCheck;
    var monitoring_interval = 15000;
    var monitoring = false;
    var newBug = '';
    var jiraLink = 'http://www.mulesoft.org/jira/browse/';//http://www.mulesoft.org/jira/secure/CreateIssue.jspa?pid=10462&issuetype=1

    var channel;
    var channel_monitoring;


    var ManagerView = {

        moduleId: "Viewer",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(managerTemplate);
                channel = new notificator('features-position-tracking');
                channel_monitoring = new notificator('features-position-tracking');
                channel_monitoring.debug = true;
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('.brand').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');

            this.attachEvents();
            newBug = global.project.config.bug_url;

            PM.makeResizable("#tcViewer",[550,100,313,700]);
              PM.colapseExpandRightPanel('#tcViewer','none');
            $('#tcViewer').css('height',(($('#tcViewer .tcm-container').height() - 20)*100)/$('#tcViewer .tcm-container').height()+'%')
            adjustTabHeight()

            getReleases();
        },

        refreshRender:function(){
          newBug = global.project.config.bug_url;
          
          $("#tcViewer #feature-container").css({
              'height' : '100%',
              'width' : '100%'
            });
          console.log($('#tcViewer #feature-container').height())
          getReleases();
        },

        expose:{
          newfeature:function(data){prepareFeatures(data)},
          expandrightpanel:function(){PM.colapseExpandRightPanel('#tcViewer','block')}
        },


        attachEvents: function(){


            channel_monitoring.onMessageReceived = function(message){

                if(message.event.indexOf("feature-tcs-state-updated") >=0){
                    featuresModule.updateFeatureTestStats($('.left-pannel .feature[feature-id='+message.data.featureId+']'), message.data.states);
                }


            }


            channel.onMessageReceived = function(mensaje){

                if(mensaje.event.indexOf("leaves-channel") >=0){
                    $('.feature').each(function(){
                        if($(this).data('users').length > 0){

                            for (var i = 0; i < $(this).data('users').length; i++) {
                                if( $(this).data('users')[i].indexOf(mensaje.data.user) >= 0  ){
                                    $(this).data('users').shift(mensaje.data.user);
                                    if($(this).data('users').length ==0){
                                        $(this).find('.icon-user').css('visibility','hidden');
                                    }
                                }
                            }
                        }
                    });
                }

                if(mensaje.event.indexOf("set-position") >=0){
                    //console.log('Removing');
                    $('.feature').each(function(){
                        if($(this).data('users').length > 0){

                            for (var i = 0; i < $(this).data('users').length; i++) {
                                if( $(this).data('users')[i].indexOf(mensaje.data.user) >= 0  ){
                                    $(this).data('users').shift(mensaje.data.user);
                                    if($(this).data('users').length ==0){
                                      $(this).find('.icon-user').css('visibility','hidden');
                                    }
                                }
                            }
                        }
                    });

                    //console.log('adding');
                    if($('.feature[feature-id='+mensaje.data.itemId+']').data('users') == null){
                        var users = new Array();
                        users.push(mensaje.data.user);
                        $('.feature[feature-id='+mensaje.data.itemId+']').data('users', users);
                    }else{
                        $('.feature[feature-id='+mensaje.data.itemId+']').data('users').push(mensaje.data.user);
                    }

                    $('.feature[feature-id='+mensaje.data.itemId+ '] .icon-user').css('visibility','visible');

                //     .popover({animation: true,
                //             trigger:'click',
                //             placement:'top',
                //             title:'Present in Iterations',
                //             content: $(this).parents('.feature').data('users')});

                }


            }

        $(window).resize(function() {
            var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100);

            $("#desc-container").css({
              'width' : wc + '%'
            });
            PM.panelRightWidth(view_container)

             
            adjustTabHeight()

        });
 
        $('#release-select').live({
          change: function(){
              global.currentSS ={
                    releaseName:'',
                    releaseId:0,
                    iterationName:'',
                    iterationId:0,
                    featureId:0,
                    feature:'',
                    tcId:0
               }
            global.currentSS.releaseId = $(this).find('option:selected').parents('optgroup').attr('rel-id');
            global.currentSS.iterationId = $(this).find('option:selected').val()
              itSelected(global.currentSS.iterationId)
          }
        });
        
        $('#tcViewer .left-pannel .feature').live({
          click: function(e){
                e.stopPropagation();
                PM.colapseExpandRightPanel('#tcViewer','none');
                global.currentSS.featureId = parseInt($(this).attr('feature-id'));
                global.currentSS.feature = $(this);
                $('.desc-collapser').click()
                var jiraKey = $(this).find('.jira-key').data('jiraKey');

                if(jiraKey != "N0k31" && jiraKey != "suite" ){
                  var issueTitle = $('<div>').addClass('jira-key').attr('href', jiraLink + jiraKey).text(jiraKey+' - '+$(this).data('summary'))
                }else{
                  var issueTitle = $('<div>').text(' '+$(this).data('summary')).css({'text-decoration': 'inherit','cursor':'default','margin-left':'20px'});
                }
                  $('.desc-header-text').html('').append(issueTitle)

                $(' .left-pannel .feature').removeClass('active');
                $(this).addClass('active');
                loadFeatureDesc($(this).data('desc'))
                $('#tcViewer .add-tc').attr('disabled',false)
                getTests(global.currentSS.featureId);
             
                $('#desc-wrapper').css({
                  'height':100
                });
                $( "#tcViewer .right-pannel" ).css({
                 'padding-bottom':29
                });
               
               var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100)
           
                $("#desc-container").css({
                 'width' : wc + '%',  //'100%'
                 'height' : '80'
                })
                    
                if($('.desc-expander').size() == 1 && jiraKey != "suite"){
                  $('#desc-expander').click()  
                }

                displayed = true

                channel.sendMessage("set-position", {"user":$.cookie('usrname'), "itemId":parseInt($(this).attr('feature-id'))})



            }
          // mouseenter: function(e){
          //   e.stopPropagation();
          //     $(this).find('.summary').css('margin-right','45px');
          //     // $(this).find('.remove-feature').stop(true,true).show(0);
          // },
          // mouseleave: function(e){
          //   e.stopPropagation();
          //   $(this).find('.summary').css('margin-right','0px');
          //     // $(this).find('.remove-feature').stop(true,true).hide(0);
          // }
        });


        $(' .left-pannel .feature .bt-ctrl.open').live({
                click:function(e){
                   e.stopPropagation();
                   $(this).removeClass('open').addClass('close')
                   var self = this;
                   $(this).parents('.item-control-buttons').find('.wrapper').stop(true,true).hide("slide", { direction: "right"},100,function(){
                    $(self).parents('.feature').find('.summary').css('margin-right','0px');
                    $(self).parents('.feature').find('.icon-user').css('margin-right','0px');
                   })
                   // $(this).parents('.item-control-buttons').stop(true, true).animate({"width":"-=55"});
                }
            })


            $(" .left-pannel .feature .item-control-buttons").live({
                mouseleave:function(){
                    $(this).find('.bt-ctrl.open').click();
                }
            });

            $(' .left-pannel .feature .bt-ctrl.close').live({
                click:function(e){
                   e.stopPropagation();

                    var self = this;

                   $(this).removeClass('close').addClass('open')
                   $(self).parents('.feature').find('.summary').css('margin-right','30px');
                   $(self).parents('.feature').find('.icon-user').css('margin-right','24px');
                   $(this).parents('.item-control-buttons').find('.wrapper').stop(true,true).show("slide", { direction: "right"},100,function(){
                   })
                }
            })



        $('.desc-expander').live({
          click: function(e){
            e.stopPropagation();
            if($('.feature.active').size() != 0){
              $(this).addClass('detailsOpen')
                PM.expandIssueDescription("#tcViewer");
            }
          }
        });

        $('.desc-collapser').live({
          click: function(e){
            e.stopPropagation();
            $(this).removeClass('detailsOpen')
            PM.collapsIssueDescription("#tcViewer");
          }
        });

        $('#feature-refresh').live({
          click: function(e){
            e.stopPropagation();
            $(this).addClass('refreshing');
            clearData();
            PM.collapsIssueDescription("#tcViewer");
            itSelected(global.currentSS.iterationId);
          }
        });

        $('#tc-refresh').live({
          click: function(e){
            e.stopPropagation();
            if (global.currentSS.featureId != 0){
              $(this).addClass('refreshing');
              clearTCs()
              getTC(global.currentSS.featureId);
            }
          }
        });
        

        $('#tcViewer .run-tc-modal .dropdown-menu > li').live({
          click: function(e){
            e.stopPropagation();
            $(this).parents('.btn-group').removeClass('open')
            var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
            var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
            var caret = $('<span class="caret"></span>')
            $(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
                return (css.match (/\bddm-\S+/g) || []).join(' ')
            }).addClass($(this).attr('class')).text('').append(newState,' '+$(this).text()+' ', caret).attr('status-id',$(this).attr('status-id'))
          }
        });

        $('#tcViewer .tc .dropdown-menu > li').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('ddm-failed') ||  $(this).hasClass('ddm-block')){
              tcEditor.render({run:true}, global.currentSS, {runStatusElement: this, data: $(this).parents('.tc').data('tcObject')})

            }else{
              updateTCstatus($(this).parents('.tc').attr('tc-id'),$(this).attr('status-id'),global.currentSS.feature)
            }
          }
        });


         $('#tcViewer .add-tc').live({
          click: function(e){
            e.stopPropagation();
            if($('#tcViewer .feature.active').size() == 0){
              return false;
            }

            tcEditor.render({create:true}, global.currentSS);

              tcEditor.afterCreate = function(context){

                tcmModel.releases.iterations.features.test_cases.fetch(context.releaseId, context.iterationId, context.featureId).done(function(data){
                    $(data).each(function(){
                        if($('#tcViewer .tc[tc-id="'+this.tcId+'"]').size() == 0){
                            var tc_html = tcsModule.createTcHTML(this,context.feature);
                            tcsModule.renderTC(tc_html, view_container)
                        }
                    })
                    featuresModule.updateFeatureTestStats(global.currentSS.feature)

                });
            }
          }
        });

        $('.del-tc-t.active').live({
          click: function(e){
            e.stopPropagation();
            $('.del-tc').hide('fast')
            $(this).addClass('del-tc-trigger')
          }
        });
        
        $('.del-tc-trigger').live({
          click: function(e){
            e.stopPropagation();
            $('.del-tc').show('fast')
            $(this).removeClass('del-tc-trigger')
          }
        });

        $('#tcViewer .del-tc').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              deleteInterceptor($(this).parents('.tc').attr('tc-id'),global.currentSS.feature)
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"+=20"});
              $(this).find('i').hide();
              $(this).find('.del-confirm-label').show();
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
              $(this).stop(true, true).animate({"width":"-=20"});
              $(this).find('.del-confirm-label').hide();
              $(this).find('i').show();
            }
          }
        });

        $('#delete-tc-btn').live({
          click: function(e){
            e.stopPropagation();
            deleteInterceptor($(this).parents('#delete-tc-alert').data('tcId'),$(this).parents('#delete-tc-alert').data('feature'));
          }
        });

        $('#tcViewer .tc').live({
          mouseenter: function(e){
            e.stopPropagation();
              $(this).find('.edit-tc').show(0);
              $(this).find('.del-tc').show(0);
              $(this).find('.bug-tc').show(0);
          },
          mouseleave: function(e){
            e.stopPropagation();
              $(this).find('.edit-tc').hide(0);
              $(this).find('.del-tc').hide(0);
              $(this).find('.bug-tc').hide(0);
          }
        });

        $('#tcViewer .run-tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).parents('.wrapper').addClass('active');

            tcEditor({run:true}, global.currentSS, $(this).parents('.tc').data('tcObject'))

          }    
        });

        $('#tcViewer .run-status-tc').live({
          click: function(e){
            e.stopPropagation();
          }    
        });
        

        $('.prop-tc').live({
          click: function(e){
            e.stopPropagation();
            updateTCprop($(this).parents('.tc').data('tcObject'))
          }
        });

        $('#tcViewer .edit-tc').live({
          click: function(e){
            e.stopPropagation();

            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).parents('.wrapper').addClass('active');

            tcEditor.render({update:true}, global.currentSS, $(this).parents('.tc').data('tcObject'));

            tcEditor.afterUpdate = function(data){

                $('#tcViewer .tc[tc-id="'+data.tcId+'"]').data('tcObject',data);
                $('#tcViewer .tc[tc-id="'+data.tcId+'"]').find('.tc-description').text(data.name);
                $('#tcViewer .tc[tc-id="'+data.tcId+'"]').find('.tc-steps').text(data.description);
                PM.toggleLoading('#tcViewer',' .tc[tc-id="'+data.tcId+'"]',false)
            };
          }
        });

        $('#tcViewer .tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');  
          }
        });

          $('#tcViewer .tc .dropdown-menu').live({
                mouseleave: function(){
                      $(this).parents('.btn-group').removeClass('open')
                }
            });


        $('.bug-tc').live({
          click: function(e){
            e.stopPropagation();
            window.open(global.project.config.bug_url,'_blank');
          }
        });

        $('#tcViewer  .left-pannel .feature .close-jira-btn').live({
          // click: function(e){
          //   e.stopPropagation();
          //   deleteFeatureInterceptor($(this).parents('.feature'));
          // }
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              closeJira($(this).parents('.feature'));
              // deleteInterceptor($(this).parents('.tc').attr('tc-id'),global.currentSS.feature)
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"+=20"});
              $(this).find('i').hide();
              $(this).append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">Close?</span>'))
              $(this).find('.del-feature-confirm-label').show();
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
              $(this).stop(true, true).animate({"width":"-=20"});
              $(this).find('.del-feature-confirm-label').remove();
              $(this).find('i').show();
            }
          }
        });

        $('#tcViewer  .left-pannel .feature .remove-feature').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              featuresModule.deleteFeature($(this).parents('.feature').attr('feature-id'))
              // deleteInterceptor($(this).parents('.tc').attr('tc-id'),global.currentSS.feature)
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"+=20"});
              $(this).find('i').hide(0);
              $(this).append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">Sure?</span>'))
              $(this).find('.del-feature-confirm-label').show();
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
              $(this).stop(true, true).animate({"width":"-=20"});
              $(this).find('.del-feature-confirm-label').remove();
              $(this).find('i').show(0);
            }
          }
        });



        $(' .left-pannel .close-jira-btn').live({
          click: function(e){
            e.stopPropagation();
          }
        });


        $('.desc-header-text .jira-key').live({
          click: function(e){
            e.stopPropagation();
            window.open($(this).attr('href'),'_blank');
          }
        });

        $(' .left-pannel #feature-filter').live({
          keyup:function() {
            filterFeatures($(this).val());
          }
        });

        $('#filter-completed-features.enabled').live({
          click:function(e){
            e.stopPropagation();
            $('#filter-completed-features').removeClass('enabled').attr('disabled',true);
            filterCompletedFeatures();
          }
        })

        $('.text-arrow').live({
          click:function(e){
            e.stopPropagation();
          }
        })

        $('#tcViewer  .left-pannel .item.release').live({
          click:function(e){
            e.stopPropagation();
            global.currentSS.releaseId = $(this).attr('item-id');
            global.currentSS.releaseName = $(this).find('.summary').text();
            $('#tcViewer .item.release').removeClass('active');
            $(this).addClass('active');
            $('#tcViewer #releases-container .iteration-holder').hide(0);
            $('#tcViewer #releases-container .iteration-holder[rlsid='+global.currentSS.releaseId+']').show(100);

          }
        });

        $('#tcViewer  .left-pannel .item.iteration').live({
          click:function(e){
            e.stopPropagation();
            global.currentSS.iterationId = $(this).attr('item-id');
             // $('#tcViewer #holder').attr('class', 'features').find('.iteration-holder-name').text(global.currentSS.releaseName+' / '+$(this).find('.summary').text());
              $('#tcViewer #holder i').css('visibility','visible');
            itSelected(global.currentSS.iterationId, $(this).find('.summary').text());
          }
        });

        $('#tcViewer  .left-pannel #feature-container').scroll(function(){
           $('.feature-holder').position({
            my:        "left top",
            at:        "left top",
            of:        $('#tcViewer #feature-container'), // or $("#otherdiv)
            collision: "fit"
          })
        })

        $(' .left-pannel #holder.features i').live({
          click:function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
              clearTimeout(statCheck);
              $('.noresult').remove();
              $('#tcViewer .feature.active').removeClass('active')
             $('#filter-completed-features').removeClass('enabled').attr("disabled",true);
            $('#tcViewer .add-tc').attr('disabled',true)
            $('#desc-container').children().remove()
            $('#desc-container').text('');
            $('#desc-wrapper').hide()
            $('.desc-header-text').html('')
            $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
            clearTCs() 
            $('#feature-container').stop(true,true).hide("slide", { direction: "right"},100,function(){
                $('#releases-container').stop(true,true).show("slide", { direction: "left"},100,function(){
                    $('#tcViewer #holder').attr('class', 'releases').find('.iteration-holder-name').text("Releases");
                    $('#tcViewer #holder i').css('visibility','hidden');
                });
              })
          }
        });

        $('#tcViewer  .left-pannel #add-feature.enabled').live({
          click:function(){
            $('#new-feature-modal').modal();
          }
        })

        // $('#tcViewer  .panels #add-feature.enabled').live({
        //   click:function(){
        //     $('#new-feature-modal').modal();
        //   }
        // })

        $('#tcViewer #new-feature-modal .cancel').click(function(){
          $('#new-feature-modal').modal('hide');
        })

        $('#tcViewer #new-feature-modal .save-feature').click(function(){
            saveFeature();
        })



        //////////COPY MODAL
        $('#tcViewer #copy-tc-modal #tc-container .tc').live({
            click:function(e){
              e.stopPropagation();
              $(this).find('.wrapper').removeClass('active');
              $(this).toggleClass('multi-active').find('.wrapper').toggleClass('multi-active');

            }
         })

        $('#tcViewer .copy-tc').live({
          click: function(e){
            e.stopPropagation();
            if($('#tcViewer .feature.active').size() == 0 || $('#tcViewer #tc-container .tc').size() == 0){
              return false;
            }
            
            $('#tcViewer .panels #tc-container').children().remove();

            $('#tcViewer #tc-container .tc').each(function(){
                var tc_html = tcsModule.createTcHTML($(this).data('tcObject'),null,false);
                $(tc_html).find('.tc-stats').remove();
                $(tc_html).find('.suites-label').remove();
                $(tc_html).find('.tc-suites').remove();
                $(tc_html).find('.tc-expander').remove();
                tcsModule.renderTC(tc_html, '#tcViewer .panels')
            })

           $('#tcViewer #copy-tc-modal #release-selector').releases_iterations_dd(function(){
                    
              var iterId =  $("#copy-tc-modal #release-selector option:selected").val();
                    // var rlsId =  $("#tcMetrics #metrics-release-select option:selected").parents('optgroup').attr('rel-id');
                 tcmModel.releases.iterations.features.fetch(0, iterId).done(function(data){
                    if (data.length > 0){
                      $('.panels #feature-cont').children().remove();
                      $(data).each(function(){
                          featuresModule.render('.panels #feature-cont',featuresModule.create(this))
                      })
                    }
                })

           },function(){
                // $("#tcMetrics #release-select").css('visibility','visible');
           })
            
            $('#tcViewer #copy-tc-modal').modal();
          }
        });

        $('#tcViewer #copy-tc-modal .save-copy').on({
          click:function(){
            var elements = $('#tcViewer #copy-tc-modal #tc-container .tc.multi-active');

            if($('.panels .feature.active').size() == 0 || $('.panels .tc.multi-active').size() == 0){
              return false;
            }
            var req = {
              featureId:$('.panels .feature.active').attr('feature-id'),
              testcases:[]
            }

            $(elements).each(function(){
                req.testcases.push($(this).attr('tc-id'));
            })
            $('#tcViewer #copy-tc-modal .save-copy').button('loading')
            tcmModel.testcases.clone(req).done(function(){
              $('#tcViewer #copy-tc-modal .save-copy').button('reset')
            })
          }
        })


        $('.panels .feature').live({
          click:function(e){
            e.stopPropagation();
            $('.panels .feature').removeClass('active')
            $(this).addClass('active');
          }
        })

        $('#tcViewer .select-all-tc').on({
          click:function(){
            $('#tcViewer #copy-tc-modal #tc-container .tc').toggleClass('multi-active');
            $('#tcViewer #copy-tc-modal #tc-container .tc .wrapper').toggleClass('multi-active');
          }
        })

        $('#tcViewer #copy-tc-modal .cancel').on({
          click:function(){
            $('#tcViewer #copy-tc-modal').modal('hide');
          }
        })
        //////////

        }
    };

    function adjustTabHeight(){
        $("#tcViewer .right-pannel").css({
                    'height' : '100%'
        });

        $("#tcViewer .lp-wrapper").css({
          'height' : '100%'
        });

        $("#tcViewer .left-center-panel").css({
          'height' : '100%'
        });

        $('#tcViewer').css('height',(($('#tcViewer .tcm-container').height() - 20)*100)/$('#tcViewer .tcm-container').height()+'%')

        $('#tcViewer .left-center-panel').css('height',(($('.tcm-container').height() - 20)*100)/$('.tcm-container').height()+'%')

        

    }


//######################################### releases ops

function getReleases(){
  tcmModel.releases_iterations.fetch().done(function(data){

    $('#tcViewer #releases-container').children().remove();
    $('#tcViewer  #iterations-container').children().remove();
    $(data).each(function(){

      var itersCount = this.iterations.length;

      var self = this;
      var wrapper = $('<div class="release-iterations-wrapper" id="'+this.id+'">')
      $('#tcViewer  #releases-container').append(wrapper);
      var release = itemsModule.createItem("Release "+this.name,this.id,itersCount,false, 'release');
      $(release).find('.item-control-buttons').remove();
      itemsModule.renderItem('#tcViewer  #releases-container .release-iterations-wrapper#' + this.id,release);
          var iteration_holder = $('<div class="iteration-holder" style="display:none;"></div>').attr('rlsid',self.id)
          $('#tcViewer  #releases-container .release-iterations-wrapper#' + self.id).append(iteration_holder);
        $(this.iterations).each(function(){
          var iterarion = itemsModule.createItem(this.name,this.id,0,false,'iteration');
          $(iterarion).find('.item-control-buttons').remove();
          itemsModule.renderItem('.iteration-holder[rlsid='+self.id+']',iterarion);
        })
    })
  })


} 

//######################################### releases ops end

//######################################### iteration ops

function itSelected(iterationId, iterationName) {

            var releaseName = global.currentSS.releaseName;
                  $('#tcViewer .theFeatures').children().remove();
                  PM.colapseExpandRightPanel('#tcViewer','none');
                  clearData();
                  $('.noresult').remove();
                  var noresult = $('<div>').addClass('noresult').text('No Items found')
                  
    $('#releases-container').hide("slide", { direction: "left"},100,function(){
        $('#feature-container').show("slide", { direction: "right"},100,function(){
                  $('#filter-completed-features').removeClass('enabled').attr('disabled',true);
                  $('#add-feature').removeClass('enabled').attr('disabled',true);
                  
                 tcmModel.releases.iterations.features.fetch(global.currentSS.releaseId, global.currentSS.iterationId).done(function(data){
                    if (data.length > 0){
                      $(data).each(function(){
                          featuresModule.render('#tcViewer .theFeatures',featuresModule.create(this))
                      })
                      if (monitoring==true){
                        clearTimeout(statCheck)
                        statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
                      }
                    }else{

                      $('#tcViewer #feature-container').append(noresult)
                    }
                    $('#filter-completed-features').addClass('enabled').attr("disabled",false);
                     $('#add-feature').addClass('enabled').attr('disabled',false);
                    $('#tcViewer #holder').attr('class', 'features').find('.iteration-holder-name').text(releaseName+'/'+iterationName);

                     channel.sendMessage("get-history")
              });
        });
    })

}
//######################################### iteration ops end

//######################################### feature ops

function saveFeature(){

    req = {
      jiraKey:"N0k31",
      featureName:$('.new-feature-title').val(),
      featureDescription:$('.new-feature-desc').val()
    }

    $('.save-feature').button('loading')

    tcmModel.releases.iterations.features._create(global.currentSS.releaseId, global.currentSS.iterationId, req.jiraKey, req.featureName, req.featureDescription).done(function(data,segundo,tercero){
        $('.save-feature').button('reset')         
         $('.new-feature-title').val('')
          $('.new-feature-desc').val('')
         var featureId = tercero.getResponseHeader('location').toString();
        featureId = featureId.substring(featureId.lastIndexOf('/') +1 , featureId.length);

        req.featureId = featureId;
        featuresModule.render('#tcViewer .theFeatures',featuresModule.create(req))
        // prepareFeatures(req);
    });


}


function loadFeatureDesc(desc){
  
  $('#desc-container').text('');
  $('#desc-container').text(desc);
  
}

function deleteFeatureInterceptor(feature){
  $('#close-feature-alert').data('feature',feature);
  $('#close-feature-alert').modal()
}

//######################################### feature ops end


//######################################### TC ops

function getTests(featureId){


  $('#tcViewer #tc-container').children().remove();

  on_complete = function(data){
          $('#tcViewer #tc-container').children().remove();
          $(data).each(function(){
          var tc_html = tcsModule.createTcHTML(this,featureId);
          tcsModule.renderTC(tc_html, view_container)
      })
  }
  tcsModule.getTC(global.currentSS.releaseId, global.currentSS.iterationId,featureId,on_complete);
  
}   
   

function clearData(){
  clearTimeout(statCheck);
   $('#filter-completed-features').removeClass('enabled').attr("disabled",true);
  $('#tcViewer .theFeatures').children().remove()
  $('#tcViewer .add-tc').attr('disabled',true)
  $('#desc-container').children().remove()
  $('#desc-container').text('');
  $('#desc-wrapper').hide()
  $('.desc-header-text').html('')
  $('.actual-result').val('')
  $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
  clearTCs()
}

function clearTCs(){
  $('#tcViewer #tc-container').children().remove()
}

function updateTCstatus(tcId,statusId,feature){

  tcmModel.releases.iterations.features.test_cases.status.updateStatus(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId,tcId, statusId, '').done(function(){
      featuresModule.updateFeatureTestStats(feature, null,channel_monitoring);
      
  })

}

function updateTCprop(tcObject){

  tcObject.proposed = 0
  tcmModel.test_cases.update(tcObject).done(function(){
    $('#tcViewer .tc[tc-id="'+tcObject.tcId+'"]').find('.prop-tc').remove();
    $('#tcViewer .tc[tc-id="'+tcObject.tcId+'"]').find('.wrapper').removeClass('proposed');
  })

}




function deleteInterceptor(tcId,feature){
    removeTestCase(tcId,feature);
        $('#delete-tc-alert').modal('hide')
}

function removeTestCase(tcId,feature){

  PM.toggleLoading('#tcViewer',' .tc[tc-id="'+tcId+'"]', true)
  tcmModel.releases.iterations.features.test_cases.del(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId, tcId).done(function(){
    $('#tcViewer .tc[tc-id="'+tcId+'"]').remove();
    featuresModule.updateFeatureTestStats(feature)
  })

}  

//######################################### tc ops end


  function statsMonitoring(iterationId){
      
      var features_array = [];
    $('.left-pannel .feature').each(function(){
      try{
        if(!$(this).hasClass('ready')){
            var states = $(this).data('tcStats')
            states.state = $(this).data('state')

            var feature_object = {
                featureId:$(this).attr('feature-id'),
                states:states,
                issueKey:$(this).find('.jira-key').data('jiraKey')
            }

            features_array.push(feature_object);
        }
      }catch(e){

      }
    });

        tcmModel.releases.iterations.monitoringExecutedTestCases.fetch(global.currentSS.releaseId, global.currentSS.iterationId, features_array).done(function(data){
            if(data.length > 0){
              $(data).each(function(){
                featuresModule.updateFeatureTestStats($('.left-pannel .feature[feature-id='+this.featureId+']'), this.states);
              });
            }
            statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
        }).fail(function(){
          statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
        });

   }

   function closeJira(feature){
      $(feature).find('.close-jira-btn').removeClass('sec-state')
      $(feature).find('.close-jira-btn').stop(true, true).animate({"width":"-=20"});
      $(feature).find('.close-jira-btn').find('.del-feature-confirm-label').remove();
      $(feature).find('.close-jira-btn').find('i').show();
      var jiraKey = $(feature).find('.jira-key').data('jiraKey').trim();
      var featureId = $(feature).attr('feature-id');
      $(feature).find('.close-jira-btn > i').removeClass('icon-ok-circle icon-remove-circle open').addClass('icon-time');
      $(feature).find('.close-jira-btn').attr('disabled',true)
      tcmModel.releases.iterations.features.close(featureId, jiraKey).done(function(data,statusText,response){
        if (data != false){
        $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-thumbs-up closed');
          featuresModule.updateFeatureState(feature);
        }else{
          $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-remove-circle open');
          $(feature).find('.close-jira-btn').attr('disabled',false)
          $(feature).data('conflict',0);
        }
      }).fail(function(data,statusText,response){
        $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-remove-circle open');
      });

    }


    function filterFeatures(value){
                 $(".feature").each(function() {
                // If the list item does not contain the text phrase fade it out
                if ($(this).find('.jira-key').text().search(new RegExp(value, "i")) < 0 && $(this).find('.summary').text().search(new RegExp(value, "i")) < 0) {
                    // Show the list item if the phrase matches and increase the count by 1
                    $(this).fadeOut();
                } 
                else {
                    $(this).show();
                }
            });
    }

    function filterCompletedFeatures(){
      if($('.feature.ready').size()>0){
        $('.feature.ready').toggle(0,function(){
          var node = $('#filter-completed-features');
          if ($(node).hasClass('active')){
            $('#filter-completed-features').addClass('enabled').removeClass('active').attr("disabled",false);
          }else{
            $('#filter-completed-features').addClass('enabled').addClass('active');
          }
        });
      }else{
        $('#filter-completed-features').addClass('enabled').removeClass('active').attr("disabled",false);
      }

    }

    function renderTagsContainer(tcId,tagsMap){

      var tags =[];
      try{
        $(tagsMap).each(function(){
          tags.push({label:this.name,value:tcId});
        });
      }catch(e){}

       $('#tcViewer .tc[tc-id='+tcId+']').find('.tc-suites').tagit({
          initialTags:tags,
          triggerKeys:['enter', 'comma', 'tab'],
          tagsChanged:function (label, action,element) {
            if(action == 'added'){
              $($('#tcViewer .tc[tc-id='+$(element).parents('.tc').attr('tc-id')+']').find('.tagit').tagit('tags')).each(function(){
                  this.value = parseInt($(element).parents('.tc').attr('tc-id'));
              })
              tcmModel.releases.iterations.features.test_cases.suites.add($(element).parents('.tc').attr('tc-id'),label,$.cookie("projectId")).done(function(data){
              })
            }else if(action == 'popped'){
                tcmModel.releases.iterations.features.test_cases.suites.remove(element.value,element.label).done(function(data){
                })
            }
          },
          tagSource:function( request, response ) {
            tcmModel.releases.iterations.features.test_cases.suites.source($.cookie("projectId")).done(function(data){
                  response( $.map( data, function( item ) {
                    return {
                      label: item.name,
                      value: item.name
                    }
                  }));
            })
            }
      });

      $('#tcViewer .tc[tc-id='+tcId+']').find('.tagit-choice').each(function(){
          $(this).attr('tagvalue',$(this).parents('.tc').attr('tc-id'));
      })

    }

    function getTags(){
      var tags = []
      $('#tcViewer .tc .active').parents('.tc').find('.tc-suites').tagit("tags")
      return tags;
    }

    function loadingOn(){
        $('#tcViewer  #feature-container').append('<div class="loading-big-block"></div>')
    }

    function loadingOff(){
        $('#tcViewer  #feature-container').find('.loading-big-block').remove();
    }

    function beingSeen(element,userName){
        if(element.data('users').length == 0){
            element.find('.icon-user').css('visibility','visible');
        }
        element.data('users').push(userName);

    }
    function notBeingSeen(element,userName){
        element.data('users').shift(userName);
        if(element.data('users').length == 0){
            element.find('.icon-user').css('visibility','hidden');
        }
    }

    return ManagerView;

});