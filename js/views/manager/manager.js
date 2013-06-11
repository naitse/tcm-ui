define(function(require){

    var $ = require('jquery'),
        managerTemplate = require('text!templates/manager/manager.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
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
    var monitoring = true;
    var jiraLink = 'http://www.mulesoft.org/jira/browse/';

   var currentSS = {
        releaseName:'',
        releaseId:0,
        iterationName:'',
        iterationId:0,
        featureId:0,
        feature:'',
        tcId:0
   }

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
              currentSS ={
                    releaseName:'',
                    releaseId:0,
                    iterationName:'',
                    iterationId:0,
                    featureId:0,
                    feature:'',
                    tcId:0
               }
            currentSS.releaseId = $(this).find('option:selected').parents('optgroup').attr('rel-id');
            currentSS.iterationId = $(this).find('option:selected').val()
              itSelected(currentSS.iterationId)
          }
        });
        
        $('.feature').live({
          click: function(e){
                e.stopPropagation();
                PM.colapseExpandRightPanel('#tcViewer','none');
                currentSS.featureId = parseInt($(this).attr('feature-id'));
                currentSS.feature = $(this);

                var jiraKey = $(this).find('.jira-key').data('jiraKey');
                var issueTitle = $('<div>').addClass('jira-key').attr('href', jiraLink + jiraKey).text(jiraKey+' - '+$(this).data('summary'))
                $('.desc-header-text').html('').append(issueTitle)
    
                $('.feature').removeClass('active');
                $(this).addClass('active');
                loadFeatureDesc($(this).data('desc'))
                $('.add-tc').attr('disabled',false)
                getTests(currentSS.featureId);
             
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
            itSelected(currentSS.iterationId);
          }
        });

        $('#tc-refresh').live({
          click: function(e){
            e.stopPropagation();
            if (currentSS.featureId != 0){
              $(this).addClass('refreshing');
              clearTCs()
              getTC(currentSS.featureId);
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
            $(this).parents('.btn-group').removeClass('open')

            if($(this).hasClass('ddm-failed') ||  $(this).hasClass('ddm-block')){
              $(this).parents('.tc').find('.wrapper').addClass('active')
              runTC($(this).parents('.tc').data('tcObject'),this);
            }else{

            var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
            var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
            var caret = $('<span class="caret"></span>')
            $(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
                return (css.match (/\bddm-\S+/g) || []).join(' ')
            }).addClass($(this).attr('class')).text('').append(newState, caret).attr('status-id',$(this).attr('status-id'))

              updateTCstatus($(this).parents('.tc').attr('tc-id'),$(this).attr('status-id'),currentSS.feature)
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
            saveTc($(this).parents('#rp-wrapper'), $('#tcViewer #rp-wrapper .modal-body').data('flag'), $('#tcViewer #rp-wrapper .modal-body').data('tcObject'),currentSS.feature)
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

        $('.del-tc').live({
          click: function(e){
            e.stopPropagation();
            $('#delete-tc-alert').data('tcId',$(this).parents('.tc').attr('tc-id'));
            $('#delete-tc-alert').data('feature',currentSS.feature);
            $('#delete-tc-alert').modal()
            //removeTestCase($(this).parents('.tc').attr('tc-id'),$('.feature.active'));
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
            window.open('http://www.mulesoft.org/jira/secure/CreateIssue.jspa?pid=10462&issuetype=1','_blank');
          }
        });

        $('.close-jira-btn  .open').live({
          click: function(e){
            e.stopPropagation();
            deleteFeatureInterceptor($(this).parents('.feature'));
          }
        });

        $('.close-jira-btn').live({
          click: function(e){
            e.stopPropagation();
          }
        });

        $('#close-feature-btn').live({
            click: function(e){
              e.stopPropagation();
              closeJira($(this).parents('#close-feature-alert').data('feature'));
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
  tcmModel.releases.fetch().done(function(data){
    //[{"releaseName":"27","iterationName":"16,18,19,20,21,22"},{"releaseName":"28","iterationName":"23,24,25"}]
    if(FuckRequireJS == 0){
      $('#release-select').chosen()
      PM.makeResizable("#tcViewer",[550,100,313,700]);
      PM.colapseExpandRightPanel('#tcViewer','none');
    $('#tcViewer').css('height',(($('#tcViewer .tcm-container').height() - 20)*100)/$('#tcViewer .tcm-container').height()+'%')
    adjustTabHeight()
    }
    $('#release-select').find('optgroup').remove();
    $(data).each(function(){
      var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id)
       $(this.iterations).each(function(){
        var option = $('<option>').attr('value', this.id).text(prefix + this.name);
        $(optionG).append(option);
      })
      $('#release-select').append(optionG)
    })
     
    $('#release-select').trigger("liszt:updated")
    FuckRequireJS = 1
  });
} 

//######################################### releases ops end

//######################################### iteration ops

function itSelected(iterationId){
    PM.toggleLoading('#tcViewer','#feature-container',true, 'big')
  PM.colapseExpandRightPanel('#tcViewer','none');
  clearData();
   currentSS.iterationId = iterationId
    var noresult = $('<div>').addClass('noresult').text('No IONs found')
    $('#filter-completed-features').removeClass('enabled').attr('disabled',true);
    $('#tcViewer #feature-container').html('')
    tcmModel.releases.iterations.features.fetch(currentSS.releaseId, currentSS.iterationId).done(function(data){
      if (data.length > 0){
        prepareFeatures(data)
        if (monitoring==true){
          clearTimeout(statCheck)
          statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
        }
      }else{

        $('#tcViewer #feature-container').append(noresult)
      }
      PM.toggleLoading('#tcViewer','#feature-container',false)
      $('#filter-completed-features').addClass('enabled').attr("disabled",false);
      $('#feature-refresh').removeClass('refreshing')

    });

}

//######################################### iteration ops end

//######################################### feature ops

function prepareFeatures(data){ 
    $(data).each(function(){
      //[{"jiraKey":"ION-2333","featureName":"Enable global deployment","featureDescription":"hay que hacer muchas cosas locas","featureId":1}]
      var feature = $('<div>').addClass('feature').attr('feature-id',this.featureId).data('desc', this.featureDescription).data('summary',this.featureName).data('state',this.state).data('conflict',0);
      var title_bar = $('<div>').addClass('title-bar')
      var jiraKey = $('<a target="_blank">').addClass('jira-key').attr('href', jiraLink + this.jiraKey).text(this.jiraKey).data('jiraKey',this.jiraKey)
      var summary = $('<div>').addClass('summary').text(this.featureName).attr('title',this.featureName)
      var stats = $('<div>').addClass('stats')
      var count = $('<div>').addClass('count')
      var bar = $('<div>').addClass('bar')
      var display = '';

      if(this.state == 2){
        var close_jira_icon = 'icon-ok-circle open';
      }else{
        var close_jira_icon = 'icon-thumbs-up closed';
      }

      var close_jira = $('<button type="button" class="btn btn-mini close-jira-btn "><i class="'+close_jira_icon+'"></i></button>')//icon-thumbs-up
      
      $(stats).append(count)
      $(title_bar).append(jiraKey,stats);
      $(feature).append(title_bar,summary,close_jira);
      
      renderFeature(feature)
      
    })
}


function renderFeature(feature){
  var feature_id = $(feature).attr('feature-id');
  $('#tcViewer #feature-container').append(feature);
  if ($.browser.mozilla ) {
    $(feature).find('.summary').css({
      'margin-right': $(feature).find('.title-bar').width() + 2,
      'top':'2px'
    });
  }
  $(feature).find('.stats').addClass('loading-small');
  updateFeatureTestStats(feature)
}

function getFeatureTestStats(feature){
  var feature_id = $(feature).attr('feature-id');
  tcmModel.releases.iterations.features.executedTestCases.fetch(currentSS.releaseId,currentSS.iterationId,feature_id).done(function(data){
    renderStatsCount(feature, data)
    renderFeatureBar(feature);
    $(feature).find('.stats').removeClass('loading-small');
    $(feature).find('.bar').show()
  })
}

function renderStatsCount(feature,data){
  data = data[0]
  $(feature).find('.count').text(data.run+'/'+data.total);
  
}

function renderFeatureBar(feature){
     var prob = $(feature).find('.bar');
     var current_max = $(feature).find('.count').text().split('/')
     var current_value = parseInt(current_max[0]); 
     var maximun = parseInt(current_max[1])
     
     prob.progressbar({
          value: current_value,
          max:maximun,
          change: function() {
            
          },
          complete: function() {
            
          }
        });
     prob.css({
       'width': '40px',
       'height': '12',
       'border': '1px solid #6C7885'
     }).find('.ui-progressbar-value').css({
       'border-color': '#8695A8',
       'background':'#B1BBC8'
     })
     
  }

function resetFeatureTestStats(feature){

  $(feature).find('.progress').remove()
  $(feature).find('.count').text('')

}


function updateFeatureTestStats(feature, singleData){

  resetFeatureTestStats(feature)
  $(feature).find('.stats').addClass('loading-small');

if (typeof singleData === 'undefined') {
    var feature_id = $(feature).attr('feature-id');
  tcmModel.releases.iterations.features.executedTestCases.fetch(currentSS.releaseId, currentSS.iterationId, feature_id).done(function(data){
    data = data[0]
    processStats(feature, data)
  })
}
else {
    processStats(feature, singleData);
}

}

function processStats(feature, data){
    var cellWidth = 100 / parseInt(data.total);
    var propgressBar = $('<div class="progress" style="width: 40px; height: 12px; border: 1px solid rgb(108, 120, 133);">')
    for(var i=0; i<parseInt(data.pass);i++){
      var node = $('<div class="bar bar-success" style="width: '+cellWidth+'%;"></div>')
      $(propgressBar).append(node)
    }
    for(var i=0; i<parseInt(data.blocked);i++){
      var node = $('<div class="bar bar-warning" style="width: '+cellWidth+'%;"></div>')
      $(propgressBar).append(node)
    }
    for(var i=0; i<parseInt(data.failed);i++){
      var node = $('<div class="bar bar-danger" style="width: '+cellWidth+'%;"></div>')
      $(propgressBar).append(node)
    }
    for(var i=0; i<parseInt(data.inprogress);i++){
      var node = $('<div class="bar bar-info" style="width: '+cellWidth+'%;"></div>')
      $(propgressBar).append(node)
    }
    for(var i=0; i<parseInt(data.notrun);i++){
      var node = $('<div class="bar bar-notrun" style="width: '+cellWidth+'%;"></div>')
      $(propgressBar).append(node)
    }

    if(data.total != 0 && data.total == data.pass){
      $(feature).find('.close-jira-btn').show();
      $(feature).find('.summary').css('margin-right','30px');
      if(data.state !=2){
          $(feature).data('state',data.state);
          updateFeatureState(feature);
      }
    }else if(data.total != 0 && data.state == 0){
        $(feature).data('conflict', 1);
        $(feature).find('.close-jira-btn').show().attr('disabled',true);
        $(feature).find('.close-jira-btn > i').removeClass('icon-thumbs-up').addClass('icon-warning-sign closed');
    }else{
      $(feature).find('.close-jira-btn').hide();
      $(feature).find('.summary').css('margin-right','0px');
    }

    var runned = data.pass + data.failed + data.blocked
    $(feature).find('.stats').append(propgressBar)

    if(data.total == 0 && data.state == 0){
        $(feature).addClass('ready');
        $(feature).find('.progress').addClass('no-tc-feature-done');
        $(feature).find('.close-jira-btn').show().attr('disabled',true);
        $(feature).find('.close-jira-btn > i').addClass('icon-thumbs-up closed');
    }

    $(feature).find('.count').text(runned +'/'+data.total)
    $(feature).data('tcStats',data);
    $(feature).find('.stats').removeClass('loading-small');

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
          $(data).each(function(){
          var tc_html = tcsModule.createTcHTML(this,featureId);
          tcsModule.renderTC(tc_html, view_container)
      })
  }
  tcsModule.getTC(currentSS.releaseId, currentSS.iterationId,featureId,on_complete);
  
}   
   

function clearData(){
  clearTimeout(statCheck);
   $('#filter-completed-features').removeClass('enabled').attr("disabled",true);
  $('#tcViewer #feature-container').children().remove()
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
  var feature= currentSS.featureId//$('.active').attr('feature-id')
  
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
      tcmModel.releases.iterations.features.test_cases.add(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, req).done(function(data){
      
      tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId, currentSS.iterationId, currentSS.featureId).done(function(data){
        $(data).each(function(){
          if($('#tcViewer .tc[tc-id="'+this.tcId+'"]').size() == 0){
            var tc_html = tcsModule.createTcHTML(this,currentSS.featureId);
            tcsModule.renderTC(tc_html, view_container)
          }
        })
        updateFeatureTestStats(featureReference)
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

    tcmModel.releases.iterations.features.test_cases.update(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, updateReq).done(function(){

      tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId,currentSS.iterationId, currentSS.featureId).done(function(data){
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
      updateTCstatusNotPass(tcObject.tcId,statusId,currentSS.feature,modal);

  }
  
  

}

function updateTCstatusNotPass(tcId,statusId,feature,modal){

  var actualResult = $(modal).find('.actual-result').val();
  tcmModel.releases.iterations.features.test_cases.status.updateStatus(currentSS.releaseId, currentSS.iterationId, currentSS.featureId,tcId, statusId, actualResult).done(function(){
    //if(statusId >=1){
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
      updateFeatureTestStats(feature);
    //}
  })
}

function updateTCstatus(tcId,statusId,feature){

              // $('#tcViewer .tc[tc-id='+tcId+']').find('.edit-tc').hide();
              // $('#tcViewer .tc[tc-id='+tcId+']').find('.del-tc').hide();
              // $('#tcViewer .tc[tc-id='+tcId+']').find('.bug-tc').hide();
  tcmModel.releases.iterations.features.test_cases.status.updateStatus(currentSS.releaseId, currentSS.iterationId, currentSS.featureId,tcId, statusId, '').done(function(){
    //if(statusId >=1){
      updateFeatureTestStats(feature);
    //}
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

  PM.toggleLoading('#tcViewer','#tcViewer .tc[tc-id="'+tcId+'"]', true)
  tcmModel.releases.iterations.features.test_cases.del(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, tcId).done(function(){
    $('#tcViewer .tc[tc-id="'+tcId+'"]').remove();
    updateFeatureTestStats(feature)
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
                issueKey:$(this).find('.jira-key').text()
            }

            features_array.push(feature_object);
        }
      }catch(e){

      }
    });

        tcmModel.releases.iterations.monitoringExecutedTestCases.fetch(currentSS.releaseId, currentSS.iterationId, features_array).done(function(data){
            if(data.length > 0){
              $(data).each(function(){
                updateFeatureTestStats($('.feature[feature-id='+data[0].featureId+']'), data[0].states);
              });
            }
            statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
        }).fail(function(){
          statCheck=setTimeout(function(){statsMonitoring(iterationId)}, monitoring_interval);
        });

   }

   function closeJira(feature){

      $('#close-feature-alert').modal('hide');
      var jiraKey = $(feature).find('.jira-key').data('jiraKey').trim();
      var featureId = $(feature).attr('feature-id');
      $(feature).find('.close-jira-btn > i').removeClass('icon-ok-circle icon-remove-circle open').addClass('icon-time');
      tcmModel.releases.iterations.features.close(featureId, jiraKey).done(function(data,statusText,response){
        if (data != false){
        $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-thumbs-up closed');
          updateFeatureState(feature);
        }else{
          $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-remove-circle open');
          $(feature).data('conflict',0);
        }
      }).fail(function(data,statusText,response){
        $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass('icon-remove-circle open');
      });

    }

    function updateFeatureState(feature){
        var iconClass = 'icon-thumbs-up closed';
        $(feature).find('.close-jira-btn').attr('disabled',true);
        $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass(iconClass);
        $(feature).addClass('ready');
          if($(feature).hasClass('active')){
            $('#tcViewer #tc-container').children('#tcViewer .tc').each(function(){
                $(this).find('.btn-group').remove();
            })
          }
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
        $('.feature.ready').toggle('fast',function(){
          $('#filter-completed-features').addClass('enabled').attr("disabled",false);
        });

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