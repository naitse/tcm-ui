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
        _ = require('underscore');

        var view_container = "#tcViewer";
   var prefix = '';
   var displayed = false;
   var backend = 'http://tcm-backend.cloudhub.io/api/';
   var proposed=0;
   var FuckRequireJS = 0;
    var statCheck;
    var monitoring_interval = 15000;
    var monitoring = false//true;
    var newBug = '';
    var jiraLink = 'http://www.mulesoft.org/jira/browse/';//http://www.mulesoft.org/jira/secure/CreateIssue.jspa?pid=10462&issuetype=1

   // window.global.currentSS = {
   //      releaseName:'',
   //      releaseId:0,
   //      iterationName:'',
   //      iterationId:0,
   //      featureId:0,
   //      feature:'',
   //      tcId:0
   // }

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

            this.attachEvents();
            newBug = global.project.config.bug_url;
            // tcmModel.project.configuration.fetch().done(function(data){
            //   if(data.length > 0){
            //     newBug = data[0].bugurl;
            //     // sprint.render(sprint.create(data[0].springIterations,data[0].iterationDuration,{"year":2013,"month":5,"day":10}),'.spring-progress',200,40);
            //   }
            // });

            PM.makeResizable("#tcViewer",[550,100,313,700]);
              PM.colapseExpandRightPanel('#tcViewer','none');
            $('#tcViewer').css('height',(($('#tcViewer .tcm-container').height() - 20)*100)/$('#tcViewer .tcm-container').height()+'%')
            adjustTabHeight()

            getReleases();
        },

        refreshRender:function(){

          console.log('refreshing')
          
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
        
        $('.feature').live({
          click: function(e){
                e.stopPropagation();
                PM.colapseExpandRightPanel('#tcViewer','none');
                global.currentSS.featureId = parseInt($(this).attr('feature-id'));
                global.currentSS.feature = $(this);

                var jiraKey = $(this).find('.jira-key').data('jiraKey');
                if(jiraKey != "N0k31"){
                  var issueTitle = $('<div>').addClass('jira-key').attr('href', jiraLink + jiraKey).text(jiraKey+' - '+$(this).data('summary'))
                  $('.desc-header-text').html('').append(issueTitle)
                }
    
                $('.feature').removeClass('active');
                $(this).addClass('active');
                loadFeatureDesc($(this).data('desc'))
                $('.add-tc').attr('disabled',false)
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
                    
                if($('.desc-expander').size() == 1){
                  $('#desc-expander').click()  
                }

                displayed = true
            },
          mouseenter: function(e){
            e.stopPropagation();
              $(this).find('.summary').css('margin-right','45px');
              $(this).find('.remove-feature').stop(true,true).show();
          },
          mouseleave: function(e){
            e.stopPropagation();
            $(this).find('.summary').css('margin-right','0px');
              $(this).find('.remove-feature').stop(true,true).hide();
          }
        });


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
        
        $('#tcViewer .tc-expander').live({
          click: function(e){
            e.stopPropagation();
            if($(this).parents('.tc').find('.tc-steps').text() == ''){
              $(this).parents('.tc').find('.tc-steps').hide();
            }else{
              $(this).parents('.tc').find('.tc-steps').show();
            }
            $(this).parents('.tc').find('.steps-wrapper').show('fast');
            $(this).removeClass('tc-expander').addClass('tc-collapse detailsOpen');
          }
        });
        
        $('#tcViewer .tc-collapse').live({
          click: function(e){
            e.stopPropagation();
            $(this).parents('.tc').find('.steps-wrapper').hide('fast');
            $(this).removeClass('tc-collapse detailsOpen').addClass('tc-expander');
          }
        });
        
        $('#tcViewer .tc-suites').live({
          click: function(e){
            e.stopPropagation();
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
              runTC($(this).parents('.tc').data('tcObject'),this);
            }else{
              updateTCstatus($(this).parents('.tc').attr('tc-id'),$(this).attr('status-id'),global.currentSS.feature)
            }
          }
        });

         $('.proposed').live('change', function(){
            if($(this).is(':checked')){
                proposed=1;
            } else {
              proposed=0;
            }
        });
        
        $('#tcViewer #rp-wrapper .cancel').live({
          click: function(e){
            e.stopPropagation();
            
            clearTCModal();
            PM.colapseExpandRightPanel('#tcViewer','none')

          }
        });
        
         $('#tcViewer #rp-wrapper .save').live({
          click: function(e){
            e.stopPropagation();
            saveTc($(this).parents('#rp-wrapper'), $('#tcViewer #rp-wrapper .modal-body').data('flag'), $('#tcViewer #rp-wrapper .modal-body').data('tcObject'),global.currentSS.feature)
          }
        });
        
         $('.add-tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
            PM.colapseExpandRightPanel('#tcViewer','block')
            clearTCModal();
            $('.rp-title').text('New Test Case')
            
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
              $(this).find('.edit-tc').show();
              $(this).find('.del-tc').show();
              $(this).find('.bug-tc').show();
          },
          mouseleave: function(e){
            e.stopPropagation();
              $(this).find('.edit-tc').hide();
              $(this).find('.del-tc').hide();
              $(this).find('.bug-tc').hide();
          }
        });

        $('#tcViewer .run-tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).parents('.wrapper').addClass('active');
            runTC($(this).parents('.tc').data('tcObject'))
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

        $('.edit-tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).parents('.wrapper').addClass('active');
            editTc($(this).parents('.tc').data('tcObject'))
          }
        });

        $('#tcViewer .tc').live({
          click: function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');  
            $(this).find('.detailsIcon').click();
            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).find('.wrapper').addClass('active');
          }
        });

        $('#tcViewer .tc #tcViewer .tc-steps').live({
          click: function(e){
            e.stopPropagation();
          }
        });

          $('#tcViewer .tc .dropdown-menu').live({
                mouseleave: function(){
                      $(this).parents('.btn-group').removeClass('open')
                }
            });

      $('#tcViewer .tc .steps-wrapper').live({
        click:function(e){
          e.stopPropagation();
        }
      })

        $('.bug-tc').live({
          click: function(e){
            e.stopPropagation();
            window.open(newBug,'_blank');
          }
        });

        $('#tcViewer .feature .close-jira-btn').live({
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

        $('#tcViewer .feature .remove-feature').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              featuresModule.deleteFeature($(this).parents('.feature').attr('feature-id'))
              // deleteInterceptor($(this).parents('.tc').attr('tc-id'),global.currentSS.feature)
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"+=20"});
              $(this).find('i').hide();
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
              $(this).find('i').show();
            }
          }
        });



        $('.close-jira-btn').live({
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

        $('#feature-filter').live({
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

        $('#tcViewer .item.release').live({
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

        $('#tcViewer .item.iteration').live({
          click:function(e){
            e.stopPropagation();
            global.currentSS.iterationId = $(this).attr('item-id');
             // $('#tcViewer #holder').attr('class', 'features').find('.iteration-holder-name').text(global.currentSS.releaseName+' / '+$(this).find('.summary').text());
              $('#tcViewer #holder i').css('visibility','visible');
            itSelected(global.currentSS.iterationId, $(this).find('.summary').text());
          }
        });

        $('#tcViewer #feature-container').scroll(function(){
           $('.feature-holder').position({
            my:        "left top",
            at:        "left top",
            of:        $('#tcViewer #feature-container'), // or $("#otherdiv)
            collision: "fit"
          })
        })

        $('#holder.features i').live({
          click:function(e){
            e.stopPropagation();
            PM.colapseExpandRightPanel('#tcViewer','none');
              clearTimeout(statCheck);
              $('.noresult').remove();
             $('#filter-completed-features').removeClass('enabled').attr("disabled",true);
            $('.add-tc').attr('disabled',true)
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

        $('#tcViewer #add-feature').click(function(){
          $('#new-feature-modal').modal();
        })

        $('#tcViewer #new-feature-modal .cancel').click(function(){
          $('#new-feature-modal').modal('hide');
        })

        $('#tcViewer #new-feature-modal .save-feature').click(function(){
            saveFeature();
        })

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
      itemsModule.renderItem('#tcViewer  #releases-container .release-iterations-wrapper#' + this.id,itemsModule.createItem("Release "+this.name,this.id,itersCount,false, 'release'));
          var iteration_holder = $('<div class="iteration-holder" style="display:none;"></div>').attr('rlsid',self.id)
          $('#tcViewer  #releases-container .release-iterations-wrapper#' + self.id).append(iteration_holder);
        $(this.iterations).each(function(){
          itemsModule.renderItem('.iteration-holder[rlsid='+self.id+']',itemsModule.createItem(this.name,this.id,0,false,'iteration'));
        })
    })
  })


} 

//######################################### releases ops end

//######################################### iteration ops

function itSelected(iterationId, iterationName) {

                  console.log('HOLA',iterationId,iterationName)
            var releaseName = global.currentSS.releaseName;
                  $('#tcViewer .theFeatures').children().remove();
    $('#releases-container').stop(true,true).hide("slide", { direction: "left"},"fast",function(){
        $('#feature-container').stop(true,true).show("slide", { direction: "right"},100,function(){
                  PM.toggleLoading('#tcViewer','.theFeatures',true,'big');  
                  PM.colapseExpandRightPanel('#tcViewer','none');
                  clearData();
                  $('.noresult').remove();
                  var noresult = $('<div>').addClass('noresult').text('No Items found')
                  $('#filter-completed-features').removeClass('enabled').attr('disabled',true);
                  $('#add-feature').removeClass('enabled').attr('disabled',true);
                  
                 tcmModel.releases.iterations.features.fetch(global.currentSS.releaseId, global.currentSS.iterationId).done(function(data){
                    if (data.length > 0){
                      // $('.theFeatures').css('height',$('#tcViewer #feature-container').height() - 35);
                      $(data).each(function(){
                          featuresModule.render('#tcViewer .theFeatures',featuresModule.create(this))
                      })
                      //prepareFeatures(data)
                      if (monitoring==true){
                        clearTimeout(statCheck)
                        statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
                      }
                    }else{

                      $('#tcViewer #feature-container').append(noresult)
                    }

                    PM.toggleLoading('#tcViewer','.theFeatures',false)
                    $('#filter-completed-features').addClass('enabled').attr("disabled",false);
                     $('#add-feature').addClass('enabled').attr('disabled',false);
                    // $('#feature-refresh').removeClass('refreshing')
                    $('#tcViewer #holder').attr('class', 'features').find('.iteration-holder-name').text(releaseName+'/'+iterationName);
                 
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

function runTC(tcObject,selection){

  var activeTest = $('#tcViewer .tc .wrapper.active').parents('.tc');
  clearTCModal();
  $('#tcViewer .run-tc-modal .run-status .stat').remove();
  $('#tcViewer .proposed').parents('label').hide();
  $('#tcViewer .tc-fields').hide();
  $('#tcViewer .run-tc-modal .run-status').append($('<div class="'+$(selection).attr('class')+' stat round-corner-all" status-id="'+$(selection).attr('status-id')+'"><i class="'+$(selection).find('i').attr('class')+'"></i>'+$(selection).text()+'</div>'));
  PM.colapseExpandRightPanel('#tcViewer','block');
  $('#tcViewer .run-tc-modal').show()
  $('#tcViewer .rp-title').text('Run Test Case')
  $('#tcViewer #rp-wrapper .save').text('Save Run')
  $('.new-tc-title').val(tcObject.name);
  $('.new-tc-desc').val(tcObject.description);
  $('#tcViewer #rp-wrapper .modal-body').data('runId',tcObject.tcId)
  $('#tcViewer #rp-wrapper .modal-body').data('flag',2);
  $('#tcViewer #rp-wrapper .modal-body').data('tcObject',tcObject);

}

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
  $('.add-tc').attr('disabled',true)
  $('#desc-container').children().remove()
  $('#desc-container').text('');
  $('#desc-wrapper').hide()
  $('.desc-header-text').html('')
  $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
  clearTCs()
}

function clearTCs(){
  $('#tcViewer #tc-container').children().remove()
  clearTCModal()
}

function clearTCModal(){

    $('#tcViewer #rp-wrapper').find('.dropdown-toggle').removeClass(function (index, css) {
        return (css.match (/\bddm-\S+/g) || []).join(' ')
    }).addClass('ddm-inprogress').text('').append('<i class="icon-hand-right " style="margin-top: 2px;"></i>',' In Progress ', '<span class="caret"></span>').attr('status-id',1);

            $('#tcViewer .proposed').parents('label').show();
            $('#tcViewer .tc-fields').show();
            $('#tcViewer .rp-title').text('')
            $('#tcViewer #rp-wrapper .save').text('Add')
            $('#tcViewer .new-tc-title').val('').removeClass('title-error');
            $('#tcViewer .new-tc-desc').val('');
            $('#tcViewer #rp-wrapper .modal-body').data('flag',0);
            $('#tcViewer #rp-wrapper .modal-body').data('tcObject','');
            $('#tcViewer .proposed').attr('checked',false);
            proposed = 0;

}

function saveTc(modal, flag, tcObject, featureReference){
  
  $(modal).find('.alert').addClass('hide')
  
  var title = $(modal).find('.new-tc-title').val()
  var desc = $(modal).find('.new-tc-desc').val()
  var feature= global.currentSS.featureId//$('.active').attr('feature-id')
  
  if (jQuery.trim($('#tcViewer #rp-wrapper').find('.new-tc-title').val()).length <= 0){
    $(modal).find('.new-tc-title').addClass('title-error')
    return false
  }else{
    $(modal).find('.new-tc-title').removeClass('title-error')
  }
  
  var req = {
    name:title,
    description:desc,
    proposed:proposed
  }
  
  if (flag == 0){
      tcmModel.releases.iterations.features.test_cases.add(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId, req).done(function(data){
      
      tcmModel.releases.iterations.features.test_cases.fetch(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId).done(function(data){
        $(data).each(function(){
          if($('#tcViewer .tc[tc-id="'+this.tcId+'"]').size() == 0){
            var tc_html = tcsModule.createTcHTML(this,global.currentSS.featureId);
            tcsModule.renderTC(tc_html, view_container)
          }
        })
        featuresModule.updateFeatureTestStats(featureReference)
      });

    }).fail(function(){
      $(modal).find('.alert').removeClass('hide')
    })
  }else if (flag == 1){

  var updateReq = {
    tcId:tcObject.tcId,
    name:title,
    description:desc,
    proposed:proposed
  }
    PM.toggleLoading('#tcViewer','#tcViewer .tc[tc-id="'+updateReq.tcId+'"]',true)

    tcmModel.releases.iterations.features.test_cases.update(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId, updateReq).done(function(){

      tcmModel.releases.iterations.features.test_cases.fetch(global.currentSS.releaseId,global.currentSS.iterationId, global.currentSS.featureId).done(function(data){
            $('#tcViewer .tc[tc-id="'+updateReq.tcId+'"]').data('tcObject',updateReq);
            $('#tcViewer .tc[tc-id="'+updateReq.tcId+'"]').find('.tc-description').text(updateReq.name);
            $('#tcViewer .tc[tc-id="'+updateReq.tcId+'"]').find('.tc-steps').text(updateReq.description);
            PM.toggleLoading('#tcViewer','.tc[tc-id="'+updateReq.tcId+'"]',false)
      })
    }).fail(function(){
      $(modal).find('.alert').removeClass('hide')
    })
  }else if(flag == 2){
      $(modal).find('.save').button('loading');
      var statusId = $(modal).find('.stat').attr('status-id');
      updateTCstatusNotPass(tcObject.tcId,statusId,global.currentSS.feature,modal);

  }
  
  

}

function updateTCstatusNotPass(tcId,statusId,feature,modal){

  var actualResult = $(modal).find('.actual-result').val();
  tcmModel.releases.iterations.features.test_cases.status.updateStatus(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId,tcId, statusId, actualResult).done(function(){
      var caret = $('<span class="caret"></span>')
      var newState = $('<i class="'+$(modal).find('.stat i').attr('class')+'" style="margin-top: 2px;"></i>');
      $('#tcViewer .tc[tc-id='+tcId+']').find('.tc-last-run-results-cont').show();
      $('#tcViewer .tc[tc-id='+tcId+']').find('.tc-last-run-results').text($(modal).find('.actual-result').val());

      $('#tcViewer .tc[tc-id='+tcId+'] .wrapper').find('.btn-group').find('.dropdown-toggle').children().remove();

      $('#tcViewer .tc[tc-id='+tcId+'] .wrapper').find('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
          return (css.match (/\bddm-\S+/g) || []).join(' ')
      }).addClass($(modal).find('.stat').attr('class')).append(newState, caret)

      $('#tcViewer #rp-wrapper').find('.save').button('reset');
      PM.colapseExpandRightPanel('#tcViewer','none');
      clearTCModal();
      featuresModule.updateFeatureTestStats(feature);
  })
}

function updateTCstatus(tcId,statusId,feature){

  tcmModel.releases.iterations.features.test_cases.status.updateStatus(global.currentSS.releaseId, global.currentSS.iterationId, global.currentSS.featureId,tcId, statusId, '').done(function(){
      featuresModule.updateFeatureTestStats(feature);
  })

}

function updateTCprop(tcObject){

  tcObject.proposed = 0
  tcmModel.test_cases.update(tcObject).done(function(){
    $('#tcViewer .tc[tc-id="'+tcObject.tcId+'"]').find('.prop-tc').remove();
    $('#tcViewer .tc[tc-id="'+tcObject.tcId+'"]').find('.wrapper').removeClass('proposed');
  })

}


function editTc(tcObject){
  PM.colapseExpandRightPanel('#tcViewer','block')
  clearTCModal();

  $('.rp-title').text('Update Test Case')
  $('#tcViewer #rp-wrapper .save').text('Update')
  $('.new-tc-title').val(tcObject.name);
  $('.new-tc-desc').val(tcObject.description);

  $('#tcViewer #rp-wrapper .modal-body').data('flag',1);
  $('#tcViewer #rp-wrapper .modal-body').data('tcObject',tcObject);

  if(tcObject.proposed == 1){
    $('.proposed').attr('checked','checked')
  }
  
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
    $('.feature').each(function(){
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
                featuresModule.updateFeatureTestStats($('.feature[feature-id='+this.featureId+']'), this.states);
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
          $('#filter-completed-features').addClass('enabled').removeClass('active').attr("disabled",false);
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

    

    return ManagerView;

});