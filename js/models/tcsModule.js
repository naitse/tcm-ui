define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        PM = require('panelsManager'),
        _ = require('underscore');

    var tcsModule = {

		getTC: function(feature_id, parent_container){
			$(parent_container + ' #tc-container').children().remove();
			tcmModel.releases.iterations.features.test_cases.fetch(currentSS.releaseId,currentSS.iterationId, feature_id).done(function(data){
				return data; //this.prepareTCs(data,feature_id, parent_container)
			})
		},

		prepareTCs: function (data,feature_id, parent_container){
			if($(data).size() >0){
				$(parent_container + ' .del-tc-trigger').attr('disabled',false)
			}
			$(data).each(function(){
				this.createTcHTML(this,feature_id)
			})

			$(parent_container + ' #tc-refresh').removeClass('refreshing')

		},

		createTcHTML: function(tcObject,feature_id,st){

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

			try{
				var feature_closed = $('.feature[feature-id='+feature_id+']').data('conflict');
				var feature_ready = $('.feature[feature-id='+feature_id+']').hasClass('ready');
				if(feature_closed == 1 || feature_ready == false){
					$(status_group).append(delete_btn, edit_btn, bug_btn, prop_btn, toggle, list)
				}
			}catch(e){}

			if (st === true){
				$(stats).append(status_group)
			}

			$(wrapper).append(description,expander, stats );
			$(tc).append(wrapper,stepsWrapper).data('tcObject',tcObject)
			return tc;

		},

		renderTC: function(tc, view_container){

			var self = this;
			$(view_container + ' #tc-container').append(tc);
				tcmModel.releases.iterations.features.test_cases.suites.fetch($(tc).data('tcObject').tcId).done(function(data){
				self.renderTagsContainer($(tc).data('tcObject').tcId,data, view_container);
			})
		},

		renderTagsContainer: function(tcId,tagsMap,view_container){

			var tags =[];
			try{
				$(tagsMap).each(function(){
					tags.push({label:this.name,value:tcId});
				});
			}catch(e){}

			$(view_container + '  .tc[tc-id='+tcId+']').find('.tc-suites').tagit({
				initialTags:tags,
				triggerKeys:['enter', 'comma', 'tab'],
				tagsChanged:function (label, action,element) {
					if(action == 'added'){
						$($(view_container + ' .tc[tc-id='+$(element).parents('.tc').attr('tc-id')+']').find('.tagit').tagit('tags')).each(function(){
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
		},

		attachEvents: function(view_container){

			$(view_container + ' .tc').live({
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

			$(view_container + ' .tc-expander').live({
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

			$(view_container + ' .tc-collapse').live({
				click: function(e){
				e.stopPropagation();
				$(this).parents('.tc').find('.steps-wrapper').hide('fast');
				$(this).removeClass('tc-collapse detailsOpen').addClass('tc-expander');
				}
			});

			$(view_container + ' .tc-suites').live({
				click: function(e){
					e.stopPropagation();
				}
			});


			$(view_container + ' .tc .dropdown-menu > li').live({
				click: function(e){
					e.stopPropagation();
					$(this).parents('.btn-group').removeClass('open')
					var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
					var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
					var caret = $('<span class="caret"></span>')
					$(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
						return (css.match (/\bddm-\S+/g) || []).join(' ')
					}).addClass($(this).attr('class')).text('').append(newState, caret)

					// updateTCstatus($(this).parents('.tc').attr('tc-id'),$(this).data('statusId'),currentSS.feature)
				}
			});

	        $(view_container + ' .prop-tc').live({
	          click: function(e){
	            e.stopPropagation();
	            // updateTCprop($(this).parents('.tc').data('tcObject'))
	          }
	        });

	        $(view_container + ' .edit-tc').live({
	          click: function(e){
	            e.stopPropagation();
	            // editTc($(this).parents('.tc').data('tcObject'))
	          }
	        });

	        $(view_container + ' .tc').live({
	          click: function(e){
	            e.stopPropagation();  
	            $(this).find('.detailsIcon').click();
	            $(view_container + ' .tc .wrapper').removeClass('active');
	            $(this).find('.wrapper').addClass('active');
	          }
	        });

	        $(view_container + ' .tc #tcViewer .tc-steps').live({
	          click: function(e){
	            e.stopPropagation();
	          }
	        })

	        $(view_container + ' .bug-tc').live({
	          click: function(e){
	            e.stopPropagation();
	            window.open('http://www.mulesoft.org/jira/secure/CreateIssue.jspa?pid=10462&issuetype=1','_blank');
	          }
	        });


		}	   

    };

    return tcsModule;

});






//######################################### TC ops
  
   





/*
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
*/