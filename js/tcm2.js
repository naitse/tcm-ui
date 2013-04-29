define(['jquery', 'chosen', 'bootstrap', 'jqueryui', 'blockui'], function ($, chosen,bootstrap,jqueryui,blockui) {

  tcmModel = require('tcmModel');

   var prefix = '';
   var displayed = false;
   var backend = 'http://tcm-backend.cloudhub.io/api/';
   var proposed=0;
   var FuckRequireJS = 0;

   var currentSS ={
        releaseName:'',
        releaseId:0,
        iterationName:'',
        iterationId:0,
        featureId:0,
        feature:'',
        tcId:0
   }

   String.prototype.trunc = function(n,useWordBoundary){
       var toLong = this.length>n,
           s_ = toLong ? this.substr(0,n-1) : this;
       s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
       return  toLong ? s_ + '...' : s_;
    };
    
   $('document').ready(function(){

        getReleases();

        $(window).resize(function() {
            var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100);

            $("#desc-container").css({
              'width' : wc + '%'
            });
            panelRightWidth()
        });
 
        $('#release-select').live({
          change: function(){
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

                $('.feature').removeClass('active');
                $(this).addClass('active');
                loadFeatureDesc($(this).data('desc'))
                $('.add-tc').attr('disabled',false)
                getTC(currentSS.featureId)
             
                $('#desc-wrapper').css({
                  'height':100
                });
                $( ".right-pannel" ).css({
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

//updateFeatureTestStatsTEST($(this))

                displayed = true
            }
        });

        $('.desc-expander').live({
          click: function(e){
            e.stopPropagation();
            if($('.feature').size() != 0){
              $(this).addClass('detailsOpen')
                expandIssueDescription();
            }
          }
        });

        $('.desc-collapser').live({
          click: function(e){
            e.stopPropagation();
            $(this).removeClass('detailsOpen')
            collapsIssueDescription();
          }
        });

        $('#feature-refresh').live({
          click: function(e){
            e.stopPropagation();
            $(this).addClass('refreshing');
            clearData();
            collapsIssueDescription();
            getReleases();
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
        
        $('.tc-expander').live({
          click: function(e){
            e.stopPropagation();
            $(this).parents('.tc').find('.tc-steps').show('fast');
            $(this).removeClass('tc-expander').addClass('tc-collapse detailsOpen');
          }
        });
        
        $('.tc-collapse').live({
          click: function(e){
            e.stopPropagation();
            $(this).parents('.tc').find('.tc-steps').hide('fast');
            $(this).removeClass('tc-collapse detailsOpen').addClass('tc-expander');
          }
        });
        
        $('.dropdown-menu > li').live({
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
        
        $('#rp-wrapper .cancel').live({
          click: function(e){
            e.stopPropagation();
            
            clearTCModal();
            colapseExpandRightPanel('none')

          }
        });
        
         $('#rp-wrapper .save').live({
          click: function(e){
            e.stopPropagation();
            saveTc($(this).parents('#rp-wrapper'), $('#rp-wrapper .modal-body').data('flag'), $('#rp-wrapper .modal-body').data('tcObject'),currentSS.feature)
          }
        });
        
         $('.add-tc').live({
          click: function(e){
            e.stopPropagation();
            colapseExpandRightPanel('block')
            clearTCModal();
            
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

        $('.tc').live({
          mouseenter: function(e){
            e.stopPropagation();
              $(this).find('.edit-tc').show();
              $(this).find('.del-tc').show();
          },
          mouseleave: function(e){
            e.stopPropagation();
              $(this).find('.edit-tc').hide();
              $(this).find('.del-tc').hide();
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

        $('.tc').live({
          click: function(e){
            e.stopPropagation();  
            $(this).find('.detailsIcon').click();
            $('.tc .wrapper').removeClass('active');
            $(this).find('.wrapper').addClass('active');
          }
        });
      
   });
 
//######################################### releases ops

function getReleases(){
  tcmModel.releases.fetch().done(function(data){
    //[{"releaseName":"27","iterationName":"16,18,19,20,21,22"},{"releaseName":"28","iterationName":"23,24,25"}]
    if(FuckRequireJS == 0){
      $('#release-select').chosen()
      makeResizable();
    colapseExpandRightPanel('none');
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
    $('#feature-refresh').removeClass('refreshing')
    FuckRequireJS = 1
  });
} 

//######################################### releases ops end

//######################################### iteration ops

function itSelected(iterationId){
   //console.log($(selected_node).val())
    var noresult = $('<div>').addClass('noresult').text('No IONs found')
    $('#feature-container').html('')
    toggleLoading('#feature-container',true, 'big')
    tcmModel.releases.iterations.features.fetch(currentSS.releaseId, currentSS.iterationId).done(function(data){
      clearData();
      if (data.length > 0){
        prepareFeatures(data)
      }else{

        $('#feature-container').append(noresult)
      }
      toggleLoading('#feature-container',false)
    });

}

//######################################### iteration ops end

//######################################### feature ops

function prepareFeatures(data){ 
    $(data).each(function(){
    
      //[{"jiraKey":"ION-2333","featureName":"Enable global deployment","featureDescription":"hay que hacer muchas cosas locas","featureId":1}]
      
      var feature = $('<div>').addClass('feature').attr('feature-id',this.featureId).data('desc', this.featureDescription)
      var title_bar = $('<div>').addClass('title-bar')
      var jiraKey = $('<div>').addClass('jira-key').text(this.jiraKey)
      var summary = $('<div>').addClass('summary').text(this.featureName)
      var stats = $('<div>').addClass('stats')
      var count = $('<div>').addClass('count')
      var bar = $('<div>').addClass('bar')
      
      $(stats).append(count)
      $(title_bar).append(jiraKey,stats);
      $(feature).append(title_bar,summary);
      
      renderFeature(feature)
      
    })
}


function renderFeature(feature){
  var feature_id = $(feature).attr('feature-id');
  $('#feature-container').append(feature);
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


function _updateFeatureTestStats(feature){
  $(feature).find('.bar').remove()
  resetFeatureTestStats(feature)
  $(feature).find('.stats').addClass('loading-small');
  updateFeatureTestStats(feature)
}

function updateFeatureTestStats(feature){
  resetFeatureTestStats(feature)
  $(feature).find('.stats').addClass('loading-small');
    var feature_id = $(feature).attr('feature-id');
  tcmModel.releases.iterations.features.executedTestCases.fetch(currentSS.releaseId, currentSS.iterationId, feature_id).done(function(data){
    // var data = {
    //   total:10,
    //   notrun:1,
    //   blocked:1,
    //   inprogress:1,
    //   fail:3,
    //   pass:4
    // }
    data = data[0]
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

    var runned = data.pass + data.failed + data.blocked
    $(feature).find('.stats').append(propgressBar)
    $(feature).find('.count').text(runned +'/'+data.total)
    $(feature).find('.stats').removeClass('loading-small');

  })
}

function loadFeatureDesc(desc){
  
  $('#desc-container').text('');
  $('#desc-container').text(desc);
  
}

//######################################### feature ops end


//######################################### TC ops

function getTC(feature_id){
  var noresult = $('<div>').addClass('noresult').text('No TCs found')
  tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId,currentSS.iterationId, feature_id).done(function(data){
    if(data.length>0){
      prepareTCs(data)
    } else{
      $('#tc-container').html('')
      $('#tc-container').append(noresult)
      $('#tc-refresh').removeClass('refreshing')
    }   
  })
}   
function prepareTCs(data){
  $('#tc-container').children().remove();
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
    createTcHTML(this)

      
    })

    $('#tc-refresh').removeClass('refreshing')
  
}   

function createTcHTML(tcObject){
  
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
//  var status = $('<div>').addClass('tc-status '+ statusClass).attr('status', this.statusId).attr('title', this.statusName)
  var steps = $('<pre>').addClass('tc-steps').text(tcObject.description).css('display','none');
  
  $(list).append(nr,ip,bl,fa,pa)
  $(status_group).append(delete_btn, edit_btn, prop_btn, toggle, list)
  $(stats).append(status_group)
  $(wrapper).append(description,expander, stats );
  $(tc).append(wrapper,steps).data('tcObject',tcObject)
  
  renderTC(tc)
  
}


function renderTC(tc){
  $('#tc-container').append(tc);
  
}

function clearData(){
  currentSS ={
        releaseName:'',
        releaseId:0,
        iterationName:'',
        iterationId:0,
        featureId:0,
        feature:'',
        tcId:0
   }

  $('#feature-container').children().remove()
  $('.add-tc').attr('disabled',true)
  $('#desc-container').children().remove()
  $('#desc-container').text('');
  $('#desc-wrapper').hide()
  $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
  clearTCs()
}

function clearTCs(){
  $('#tc-container').children().remove()
  clearTCModal()
}

function clearTCModal(){

            $('.new-tc-title').val('').removeClass('title-error');
            $('.new-tc-desc').val('');
            $('#rp-wrapper .modal-body').data('flag',0);
            $('#rp-wrapper .modal-body').data('tcObject','');
            $('.proposed').attr('checked',false);
            proposed = 0;

}

function saveTc(modal, flag, tcObject, featureReference){
  
  $(modal).find('.alert').addClass('hide')
  
  var title = $(modal).find('.new-tc-title').val()
  var desc = $(modal).find('.new-tc-desc').val()
  var feature= currentSS.featureId//$('.active').attr('feature-id')
  
  if (jQuery.trim($('#rp-wrapper').find('.new-tc-title').val()).length <= 0){
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
  
  console.log(JSON.stringify(req))
  if (flag == 0){
      tcmModel.releases.iterations.features.test_cases.add(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, req).done(function(data){
      
      tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId, currentSS.iterationId, currentSS.featureId).done(function(data){
        $(data).each(function(){
          if($('.tc[tc-id="'+this.tcId+'"]').size() == 0){
            createTcHTML(this);
          }
        })
        console.log(feature)
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
    toggleLoading('.tc[tc-id="'+updateReq.tcId+'"]',true)

    tcmModel.releases.iterations.features.test_cases.update(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, updateReq).done(function(){

      tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId,currentSS.iterationId, currentSS.featureId).done(function(data){
            $('.tc[tc-id="'+updateReq.tcId+'"]').data('tcObject',updateReq);
            $('.tc[tc-id="'+updateReq.tcId+'"]').find('.tc-description').text(updateReq.name);
            $('.tc[tc-id="'+updateReq.tcId+'"]').find('.tc-steps').text(updateReq.description);
            toggleLoading('.tc[tc-id="'+updateReq.tcId+'"]',false)
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
    $('.tc[tc-id="'+tcObject.tcId+'"]').find('.prop-tc').remove();
    $('.tc[tc-id="'+tcObject.tcId+'"]').find('.wrapper').removeClass('proposed');
  })

}


function editTc(tcObject){
  colapseExpandRightPanel('block')
  clearTCModal();

  $('.new-tc-title').val(tcObject.name);
  $('.new-tc-desc').val(tcObject.description);

  $('#rp-wrapper .modal-body').data('flag',1);
  $('#rp-wrapper .modal-body').data('tcObject',tcObject);

  if(tcObject.proposed == 1){
    $('.proposed').attr('checked','checked')
  }
  
}

function deleteInterceptor(tcId,feature){
    removeTestCase(tcId,feature);
        $('#delete-tc-alert').modal('hide')
}

function removeTestCase(tcId,feature){

  toggleLoading('.tc[tc-id="'+tcId+'"]', true)
  tcmModel.releases.iterations.features.test_cases.del(currentSS.releaseId, currentSS.iterationId, currentSS.featureId, tcId).done(function(){
    $('.tc[tc-id="'+tcId+'"]').remove();
    updateFeatureTestStats(feature)
  })

}  

//######################################### tc ops end


//######################################### UI ops
function toggleLoading(container, toggle, size){

  if (size != 'big'){
    size = 'small';
  }

  if (toggle == true){
    $(container).block({
      message:'<div class="loading-'+size+'-block"></div>',
      overlayCSS:  { 
        backgroundColor: '#000', 
        opacity:         0.2, 
        cursor:          'wait' 
    }
  })
  }else{
    $(container).unblock()
  }

}

});

function colapseExpandRightPanel(state){
  
    if(state == 'block'){
      $('.left-center-panel').css({
        'width':'65%'
      })
      makeResizable()
      panelRightWidth()
       $("#rp-wrapper").show('fast') 
    }else{
      $('.left-center-panel').css({
        'width':'100%'
      })

      $("#rp-wrapper").hide('fast')
     
    }


      $($('.left-center-panel .ui-resizable-e')[1]).css({
        'display':state
      })

      
} 

function panelRightWidth(){
  
    $("#rp-wrapper").css({
        'width' : $('#pannel-wrapper').outerWidth() - $('.left-center-panel').outerWidth() - 9
    });

};

 function makeResizable(){

          console.log($('.left-center-panel'))

           $('.left-center-panel').resizable({
            handles : 'e',
            minWidth : 550,
            resize : function() {
              var por = ((($('#pannel-wrapper').outerWidth() -$(this).outerWidth() -9) * 100) / $('#pannel-wrapper').outerWidth()) + '%'
              $("#rp-wrapper").css({
                    'width' : por
              });
            }
          });

           $('#desc-wrapper').resizable({
              handles : 's',
              minHeight : 100,
              alsoResize : "#desc-container",
              stop : function() {
                var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100)
                $("#desc-container").css({
                  'height' : $('#desc-wrapper').height() - 20,
                  'width' : wc + '%'  //'100%'
                });
                $(".right-pannel").css({
                  'padding-bottom' : $('#desc-wrapper').height() + 29
                });
              }
          });

          $("#desc-container").resizable({
              ghost : true,
              handles : 's'
          });
              
          $("#lp-wrapper").resizable({
              handles : 'e',
              minWidth : 218,
              maxWidth : 430,
              containment : '.left-center-panel',
              stop : function() {
                $("#feature-container").css({
                  'height' : '100%',
                  'width' : '100%'
                });
                var porcentage = (($(this).width() * 100) / $('.left-center-panel').width());
                $(this).css({
                      'height' : '100%',
                      'width' : porcentage + '%'
                });
              }
          });
  }  
   
   
   
  //var domain = window.location.href
function expandIssueDescription(){
  $('#desc-wrapper').show('fast',function(){
     $( ".right-pannel" ).css({
         'padding-bottom':$('#desc-wrapper').height()+29
       })
       var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100)
       
       $("#desc-container").css({
         'width' : wc + '%'  //'100%'
       })
  })
  
  
     $('#desc-expander').removeClass('desc-expander').addClass('desc-collapser')
   }
   
   function collapsIssueDescription(){
     $('#desc-wrapper').hide('fast',function(){
       $( ".right-pannel" ).css({
           'padding-bottom':29
         })
     })
     $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
   }
   



