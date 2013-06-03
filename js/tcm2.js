define(['jquery', 'chosen', 'bootstrap', 'jqueryui', 'blockui','extendJS','textext','panelsManager'], function ($, chosen,bootstrap,jqueryui,blockui,extendJS,textext) {

  tcmModel = require('tcmModel');
  PM = require('panelsManager');

   var prefix = '';
   var displayed = false;
   var backend = 'http://tcm-backend.cloudhub.io/api/';
   var proposed=0;
   var FuckRequireJS = 0;
    var statCheck;
    var monitoring_interval = 15000;
    var monitoring = false;
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
   $('document').ready(function(){

        getReleases();

        $(window).resize(function() {
            var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100);

            $("#desc-container").css({
              'width' : wc + '%'
            });
            PM.panelRightWidth("#tcViewer")

             
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

                currentSS.featureId = parseInt($(this).attr('feature-id'));
                currentSS.feature = $(this);

                var jiraKey = $(this).find('.jira-key').data('jiraKey');
                var issueTitle = $('<div>').addClass('jira-key').attr('href', jiraLink + jiraKey).text(jiraKey+' - '+$(this).data('summary'))
                $('.desc-header-text').html('').append(issueTitle)
    
                $('.feature').removeClass('active');
                $(this).addClass('active');
                loadFeatureDesc($(this).data('desc'))
                $('.add-tc').attr('disabled',false)
                getTC(currentSS.featureId)
             
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


        $('#tcViewer .tc .dropdown-menu > li').live({
          click: function(e){
            e.stopPropagation();
            $(this).parents('.btn-group').removeClass('open')
            var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
            var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
            var caret = $('<span class="caret"></span>')
            $(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
                return (css.match (/\bddm-\S+/g) || []).join(' ')
            }).addClass($(this).attr('class')).text('').append(newState, caret)

            updateTCstatus($(this).parents('.tc').attr('tc-id'),$(this).data('statusId'),currentSS.feature)
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

        $('.prop-tc').live({
          click: function(e){
            e.stopPropagation();
            updateTCprop($(this).parents('.tc').data('tcObject'))
          }
        });

        $('.edit-tc').live({
          click: function(e){
            e.stopPropagation();
            editTc($(this).parents('.tc').data('tcObject'))
          }
        });

        $('#tcViewer .tc').live({
          click: function(e){
            e.stopPropagation();  
            $(this).find('.detailsIcon').click();
            $('#tcViewer .tc .wrapper').removeClass('active');
            $(this).find('.wrapper').addClass('active');
          }
        });

        $('#tcViewer .tc #tcViewer .tc-steps').live({
          click: function(e){
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



      
   });
 
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
   currentSS.iterationId = iterationId
    var noresult = $('<div>').addClass('noresult').text('No IONs found')
    $('#filter-completed-features').removeClass('enabled').attr('disabled',true);
    $('#tcViewer #feature-container').html('')
    PM.toggleLoading('#tcViewer','#feature-container',true, 'big')
    tcmModel.releases.iterations.features.fetch(currentSS.releaseId, currentSS.iterationId).done(function(data){
      clearData();
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

function getTC(feature_id){
  $('#tcViewer #tc-container').children().remove();
  // var noresult = $('<div>').addClass('noresult').text('No TCs found')
  tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId,currentSS.iterationId, feature_id).done(function(data){
    // if(data.length>0){
      prepareTCs(data,feature_id)
    // } else{
    //   $('#tcViewer #tc-container').html('')
    //   $('#tcViewer #tc-container').append(noresult)
    //   $('#tc-refresh').removeClass('refreshing')
    // }   
  })
}   
function prepareTCs(data,feature_id){
  if($(data).size() >0){
    $('.del-tc-trigger').attr('disabled',false)
  }
  $(data).each(function(){
        
//      {
//            "statusName": "Not RUN",
//            "name": "change regions",
//            "tcId": 1,
//            "description": "first deloy to region A then deploy to region",
//            "lastRun": null,
//            "proposed": false
//        },
    createTcHTML(this,feature_id)

      
    })

    $('#tc-refresh').removeClass('refreshing')
  
}   

function createTcHTML(tcObject,feature_id){
  
  switch(tcObject.statusId)
  {
  case 0:
    statusClass = 'notrun'
    statusIcon = 'icon-off icon-white '
      
    break;
  case 1:
    statusClass = 'inprogress'
      statusIcon = 'icon-hand-right '
    break;
  case 2:
    statusClass = 'block'
      statusIcon = 'icon-exclamation-sign '
    break;
  case 3:
    statusClass = 'failed'
      statusIcon = 'icon-thumbs-down icon-white '
    break;
  case 4:
    statusClass = 'pass'
      statusIcon = 'icon-thumbs-up icon-white '
    break;
  default:
    statusClass = ''
      statusIcon = 'icon-hand-right icon-white '
  }
  var prop_btn = ''

  var proposed_class = '';
  if(tcObject.proposed == 1){
    prop_btn = $('<button type="button" title="accept tc" class="btn btn-mini prop-tc" ><i class="icon-question-sign"></i></button>');
    proposed_class = ' proposed'
  }
  
  var bug_btn = $('<button type="button" title="open jira" class="btn btn-mini bug-tc" ><i class="icon-bug"></i></button>');

  var tc = $('<div>').addClass('tc').attr('tc-id',tcObject.tcId)
  var wrapper = $('<div>').addClass('wrapper' + proposed_class);
  var edit_btn = $('<button type="button" title="edit" class="btn btn-mini edit-tc" ><i class="icon-pencil"></i></button>');
  var delete_btn = $('<button type="button" title="delete" class="btn btn-mini del-tc" ><i class="icon-trash"></i></button>');
  var expander = $('<div>').addClass('tc-expander detailsIcon ds')
  var description = $('<div>').addClass('tc-description ds').text(tcObject.name.trunc(100,false))
  var stats = $('<div>').addClass('tc-stats ds')
    var status_group = $('<div class="btn-group">')
    var toggle = $('<a class="btn dropdown-toggle btn-inverse btn-mini ddm-'+statusClass+'" data-toggle="dropdown" href="#">').append($('<i class="'+statusIcon+'" style="margin-top: 2px;"></i>'),$('<span class="caret"></span>'))
    var list = $('<ul class="dropdown-menu pull-right">')
    var nr = $('<li class="ddm-notrun"><i class="icon-off"></i> Not Run </li>').data('statusId', 0)
    var ip = $('<li class="ddm-inprogress"><i class="icon-hand-right"></i> In Progress </li>').data('statusId',1)
    var bl = $('<li class="ddm-block"><i class="icon-exclamation-sign"></i> Blocked </li>').data('statusId', 2)
    var fa = $('<li class="ddm-failed"><i class="icon-thumbs-down"></i> Fail </li>').data('statusId',3)
    var pa = $('<li class="ddm-pass"><i class="icon-thumbs-up"></i> Pass </li>').data('statusId',4)
  var steps = $('<pre>').addClass('tc-steps').text(tcObject.description)//.css('display','none');
  var stepsWrapper = $('<div class="steps-wrapper">').css('display','none').append($('<ul class="tc-suites"></ul>)'),steps)
  $(list).append(nr,ip,bl,fa,pa)
    var feature_closed = $('.feature[feature-id='+feature_id+']').data('conflict');
    var feature_ready = $('.feature[feature-id='+feature_id+']').hasClass('ready');
    if(feature_closed == 1 || feature_ready == false){
      $(status_group).append(delete_btn, edit_btn, bug_btn, prop_btn, toggle, list)
    }

  $(stats).append(status_group)
  $(wrapper).append(description,expander, stats );
  $(tc).append(wrapper,stepsWrapper).data('tcObject',tcObject)
  
  renderTC(tc)
  
}


function renderTC(tc){
  $('#tcViewer #tc-container').append(tc);
  tcmModel.releases.iterations.features.test_cases.suites.fetch($(tc).data('tcObject').tcId).done(function(data){
    renderTagsContainer($(tc).data('tcObject').tcId,data);
  })
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
            $('.rp-title').text('')
            $('#tcViewer #rp-wrapper .save').text('Add')
            $('.new-tc-title').val('').removeClass('title-error');
            $('.new-tc-desc').val('');
            $('#tcViewer #rp-wrapper .modal-body').data('flag',0);
            $('#tcViewer #rp-wrapper .modal-body').data('tcObject','');
            $('.proposed').attr('checked',false);
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
            createTcHTML(this);
          }
        })
        updateFeatureTestStats(featureReference)
      });

    }).fail(function(){
      $(modal).find('.alert').removeClass('hide')
    })
  }else{

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
            PM.toggleLoading('#tcViewer','#tcViewer .tc[tc-id="'+updateReq.tcId+'"]',false)
      })
    }).fail(function(){
      $(modal).find('.alert').removeClass('hide')
    })
  }
  
  

}

function updateTCstatus(tcId,statusId,feature){

  tcmModel.releases.iterations.features.test_cases.status.updateStatus(currentSS.releaseId, currentSS.iterationId, currentSS.featureId,tcId, statusId).done(function(){
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

});
