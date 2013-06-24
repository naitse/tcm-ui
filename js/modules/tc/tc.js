define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        tcTemplate = require('text!templates/modules/tc/tc.html'),
        styles = require('text!templates/modules/tc/style'),
        PM = require('panelsManager'),
        _ = require('underscore');

    var tcsModule = {

		getTC: function(releaseId, iterationId, feature_id,on_complete){

			tcmModel.releases.iterations.features.test_cases.fetch(releaseId, iterationId, feature_id).done(function(data){
				on_complete(data);
			})

		},
		//Deprecate
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
					statusIcon = 'icon-off'
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
			
			var tc = $(tcTemplate);

			$(tc).data('tcObject',tcObject)
			$(tc).attr('tc-id',tcObject.tcId);
			$(tc).find('.tc-description').text(tcObject.name.trunc(100,false));
			// $(tc).find('.run-status-tc').addClass('tc-s-' + statusClass).find('i').addClass(statusIcon);
			$(tc).find('.dropdown-toggle').addClass('ddm-'+statusClass).find('i').addClass(statusIcon);
			$(tc).find('ddm-notrun').data('statusId', 0);
			$(tc).find('ddm-inprogress').data('statusId', 1);
			$(tc).find('ddm-block').data('statusId', 2);
			$(tc).find('ddm-failed').data('statusId', 3);
			$(tc).find('ddm-pass').data('statusId', 4);
			$(tc).find('.tc-steps').text(tcObject.description);
			if(tcObject.actualResult != null){
				if(tcObject.actualResult != ""){
					$(tc).find('.tc-last-run-results').text(tcObject.actualResult);
				}else{
					$(tc).find('.tc-last-run-results-cont').hide();
				}
			}else{
				$(tc).find('.tc-last-run-results-cont').hide();
			}

			// try{
			// 	var feature_closed = $('.feature[feature-id='+feature_id+']').data('conflict');
			// 	var feature_ready = $('.feature[feature-id='+feature_id+']').hasClass('ready');
			// 	if(feature_closed == 1 || feature_ready == false){
			// 		//$(status_group).append(delete_btn, edit_btn, bug_btn, prop_btn, toggle, list)
			// 	}else{$(tc).find('.btn-group').remove();}
			// }catch(e){}

			// if (st === true){
			// 	$(tc).find('.btn-group').hide();
			// 	//$(stats).append(status_group)
			// }

			//$(wrapper).append(description,expander, stats );
			return tc;

		},

		renderTC: function(tc, view_container){

			// this.attachEvents(tc);

			var self = this;


			// $(tc).find('.dropdown-menu > li').live({
			// 	click: function(e){
			// 		// e.stopPropagation();
			// 		$(this).parents('.btn-group').removeClass('open')
			// 		$(view_container + ' .tc .wrapper').removeClass('active');
			// 		$(this).parents('.tc').find('.wrapper').addClass('active')

			// 		if($(this).hasClass('ddm-failed') ||  $(this).hasClass('ddm-block')){
			// 		}else{
			// 			// tcsModule.togleDropState($(this).parents('.tc'))
			// 			var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
			// 			var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
			// 			var caret = $('<span class="caret"></span>')
			// 			$(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
			// 				return (css.match (/\bddm-\S+/g) || []).join(' ')
			// 			}).addClass($(this).attr('class')).text('').append(newState, caret).attr('status-id',$(this).attr('status-id'))

			// 		}
			// 	}
			// });



			$(view_container + ' #tc-container').append(tc);
			tcmModel.releases.iterations.features.test_cases.suites.fetch($(tc).data('tcObject').tcId).done(function(data){
				self.renderTagsContainer($(tc).data('tcObject').tcId,data, view_container);
			})
		},

		togleDropState:function(tc){

			var li = $(tc).find('.dropdown-menu > li');

			var icon_white = ($(li).children('i').attr('class') == 'icon-off')?' icon-white':'';
			var newState = $('<i class="'+$(li).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
			var caret = $('<span class="caret"></span>')
			$(li).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
				return (css.match (/\bddm-\S+/g) || []).join(' ')
			}).addClass($(li).attr('class')).text('').append(newState, caret).attr('status-id',$(li).attr('status-id'))
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

		attachEvents: function(){

			$('.tc').find('.tc-expander').live({
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

			$('.tc').find('.tc-collapse').live({
				click: function(e){
				e.stopPropagation();
				$(this).parents('.tc').find('.steps-wrapper').hide('fast');
				$(this).removeClass('tc-collapse detailsOpen').addClass('tc-expander');
				}
			});

			$('.tc').find('.steps-wrapper').live({
				click: function(e){
					e.stopPropagation();
				}
			});


			$('.tc').find('.dropdown-menu > li').live({
				click: function(e){
					// e.stopPropagation();
					$(this).parents('.btn-group').removeClass('open')
					$(this).parents('#tc-container').find('.wrapper').removeClass('active');
					$(this).parents('.tc').find('.wrapper').addClass('active')

					if($(this).hasClass('ddm-failed') ||  $(this).hasClass('ddm-block')){
					}else{
						// tcsModule.togleDropState($(this).parents('.tc'))
						var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
						var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
						var caret = $('<span class="caret"></span>')
						$(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
							return (css.match (/\bddm-\S+/g) || []).join(' ')
						}).addClass($(this).attr('class')).text('').append(newState, caret).attr('status-id',$(this).attr('status-id'))

					}
				}
			});

	        $('.tc').live({
	          click: function(e){
	            // e.stopPropagation();  
	            $(this).parents('#tc-container').find('.wrapper').removeClass('active');
	            $(this).find('.detailsIcon').click();
	            $(this).find('.wrapper').addClass('active');
	          }
	        });



          $('.tc').find('.dropdown-menu').live({
                mouseleave: function(){
                      $(this).parents('.btn-group').removeClass('open')
                }
            });

		}	   

    };

	function attachStyles(){

		$('body').append($(styles));
        

	}


	attachStyles();

	tcsModule.attachEvents();

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