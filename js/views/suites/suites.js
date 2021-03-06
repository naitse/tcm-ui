define(function(require){

    var $ = require('jquery-plugins'),
        suitesTemplate = require('text!templates/suites/suites.html'),
        tcmModel = require('tcmModel'),
        PM = require('panelsManager'),
        pV = '#suitesViewer ',
        multi=false,
        tcsModule = require('modules/tc/tc'),
        itemsModule = require('modules/item/item'),
        _ = require('underscore');
        var parentSuiteId;
        var s_channel;
        notificator = require('notificator');

    var SuitesView = {
        moduleId: "Suites",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(suitesTemplate);
                s_channel = new notificator('suites-position-tracking');
                s_channel.debug = true;
                this.attachEvents();
                PM.makeResizable("#suitesViewer",[550,100,313,700]);
                PM.colapseExpandRightPanel("#suitesViewer",'none');
                adjustHeight();
                attachObjects();
                $('.iterdd').releases_iterations_dd();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-suites').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
        },

        refreshRender:function(){
        	$('.iterdd').releases_iterations_dd();
        },

        attachEvents: function(){


            s_channel.onMessageReceived = function(mensaje){

                if(mensaje.event.indexOf("leaves-channel") >=0){
                    $('.item.suite').each(function(){
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
                    $('.item.suite').each(function(){
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
                    if($('.item.suite[item-id='+mensaje.data.itemId+']').data('users') == null){
                        var users = new Array();
                        users.push(mensaje.data.user);
                        $('.item.suite[item-id='+mensaje.data.itemId+']').data('users', users);
                    }else{
                        $('.item.suite[item-id='+mensaje.data.itemId+']').data('users').push(mensaje.data.user);
                    }

                    $('.item.suite[item-id='+mensaje.data.itemId+ '] .icon-user').css('visibility','visible');


                }


            }

   //      	$('#suitesViewer #tags-select').chosen({
   //      		no_results_text: "No results matched"
   //      	}).change(function(e){
   //      		tagsChanged(arguments);
   //      	});
			// $('#suitesViewer #tags_select_chzn').css({
			// 	'width': '100% !important'
			// }).find('.chzn-choices').css({
			// 	'min-height': '29px',
			// 	'border-top': 'none',
			// 	'border-left': 'none'
			// });



			$('#suitesViewer .item').live({
				click: function(e){
					e.stopPropagation();
					if(multi===true){
						if(!$(this).hasClass('selected')){
							$('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',true);
						}else{
							$('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',false);
						}
						$(this).toggleClass('selected');
						$('#suitesViewer #tags-select').trigger("liszt:updated")
						tagsChanged();

					}else{
						if(!$(this).hasClass('selected') && !$(this).hasClass('sub-suite')){
							$('#suitesViewer .item').removeClass('selected');
							$('#suitesViewer .item').parents('.suite-wrapp').find('.sub-suite').hide();
							$(this).toggleClass('selected');
							getSubSuites(this);
							s_channel.sendMessage("set-position", {"user":$.cookie('usrname'), "itemId":parseInt($(this).attr('item-id'))})
							// $(this).parents('.suite-wrapp').find('.sub-suite').show();

						}else if($(this).hasClass('sub-suite')){
							$('#suitesViewer .item').removeClass('selected');
							// $('#suitesViewer .item .sub-suite').removeClass('selected');
							$(this).toggleClass('selected');
							getSubSuites(this);
							// $('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',false);
						}
						$('#suitesViewer #tags-select').trigger("liszt:updated")
						tagsChanged();
					}
				}
			});

	        $('#suitesViewer .tc .edit-tc').live({
	          click: function(e){
	            e.stopPropagation();
	            PM.colapseExpandRightPanel('#suitesViewer','none');
	            $('#suitesViewer .tc .wrapper').removeClass('active');
	            $(this).parents('.wrapper').addClass('active');
	            $('#suitesViewer #suite-tc-save').removeClass('save-new').addClass('update');
	            editTc($(this).parents('.tc').data('tcObject'))
	          }
	        });

			$(pV+' #suite-save').live({
				click:function(){

					if($(pV+'#myModal').data('subsuite') != true){

						tcmModel.suites.add($(pV+ '#suite-name').val(),$.cookie("projectId")).done(function(data){
							if(data[0].FALSE == 0){
								$(pV+ ' #suite-name').parent().addClass('alert-error');
							} else {
								$(pV+ ' #suite-close').click();
								addSuiteToUI(data);
							}
						})

						
					}else{
						tcmModel.suites.subSuites.add($(pV+ '#suite-name').val(),parentSuiteId).done(function(data){
								data = data[0]
								addSubSuiteToUI(data,parentSuiteId);
							
						})

					}


				}
			});

			$(pV+' .add-tc').live({
				click:function(e){
					// e.stopPropagation();
					if($(pV + '.item.selected').size() == 0){
						return false;
					}
					$(pV+' #suite-tc-close').click();
					$('#suitesViewer #suite-tc-save').removeClass('update').addClass('save-new');
					PM.colapseExpandRightPanel(pV,'block');
					$(pV + ' #rp-wrapper').data('item-id',$(pV + '.item.selected').attr('item-id'))
				}
			})

			$(pV+' #suite-tc-close').live({
				click:function(e){
					e.stopPropagation();
					 $('#suite-tc-save').button('reset');
					PM.clearModal($(pV + ' #rp-wrapper'));
					PM.colapseExpandRightPanel(pV,'none');
				}
			})

			$(pV+' #suite-tc-save.save-new').live({
				click:function(e){
					e.stopPropagation();
					var modal = $(pV + ' #rp-wrapper');

					  $(modal).find('.alert').addClass('hide')
					  
					  var title = $(modal).find('.new-tc-title').val()
					  var desc = $(modal).find('.new-tc-desc').val()
					  
					  if (jQuery.trim($(pV +' #rp-wrapper').find('.new-tc-title').val()).length <= 0){
					    $(modal).find('.new-tc-title').addClass('title-error')
					    return false
					  }else{
					    $(modal).find('.new-tc-title').removeClass('title-error')
					  }


					  var req = {
					    name:title,
					    description:desc,
					    proposed:0
					  }
					 $(this).button('loading');
					 var self = this;
					tcmModel.suites.testcases.add($('#suitesViewer .item.selected').attr('item-id'),req).done(function(data){
						
						if(data[0].tcId != ""){

							var suiteId = $(modal).data('item-id');

							var tc_html = tcsModule.createTcHTML(data[0],null,false);
							$(tc_html).find('.bug-tc').remove();
							$(tc_html).find('.dropdown-menu').remove();
							$(tc_html).find('.dropdown-toggle').remove();
							$(tc_html).unbind("click");
				       		tcsModule.renderTC(tc_html, '#suitesViewer'); //REMOVE THE PARSER

							$(pV + '.item[item-id='+suiteId+']').find('.count').text(parseInt($(pV + '.item[item-id='+suiteId+']').find('.count').text()) + 1)
							$(self).button('reset');
						} else {
							$(modal).find('.alert').removeClass('hide');
						}

						 $(self).button('reset');
					})
				}
			});

			$(pV+' #suite-tc-save.update').live({
				click:function(e){
					e.stopPropagation();
					var modal = $(pV + ' #rp-wrapper');

					  $(modal).find('.alert').addClass('hide')
					  
					  var title = $(modal).find('.new-tc-title').val()
					  var desc = $(modal).find('.new-tc-desc').val()
					  
					  if (jQuery.trim($(pV +' #rp-wrapper').find('.new-tc-title').val()).length <= 0){
					    $(modal).find('.new-tc-title').addClass('title-error')
					    return false
					  }else{
					    $(modal).find('.new-tc-title').removeClass('title-error')
					  }
					 
					 $(this).button('loading');
					 var self = this;
						var updateReq = {
						    tcId:($(modal).find('.modal-body').data('tcObject')).tcId,
						    name:title,
						    description:desc,
						    proposed:0
						  }
				    PM.toggleLoading('#suitesViewer',' .tc[tc-id="'+updateReq.tcId+'"]',true)
				    var self =  this;
				    tcmModel.releases.iterations.features.test_cases.update(0, 0, 0, updateReq).done(function(){
				    	 $(self).button('reset');
				            $('#suitesViewer .tc[tc-id="'+updateReq.tcId+'"]').data('tcObject',updateReq);
				            $('#suitesViewer .tc[tc-id="'+updateReq.tcId+'"]').find('.tc-description').text(updateReq.name);
				            $('#suitesViewer .tc[tc-id="'+updateReq.tcId+'"]').find('.tc-steps').text(updateReq.description);
				            PM.toggleLoading('#suitesViewer',' .tc[tc-id="'+updateReq.tcId+'"]',false)
				    }).fail(function(){
				      $(modal).find('.alert').removeClass('hide')
				    })
				}
			})


			$(pV+' .item #item-remove').live({
				click:function(e){
					 e.stopPropagation();
					 var self = this;
		            if($(this).hasClass('sec-state')){
		  					tcmModel.suites.remove($(this).parents('.item').attr('item-id')).done(function(data){
								removeSuiteFromUI($(self).parents('.item'));
							})
		            }else{
		              $(this).addClass('sec-state');
		              $(this).stop(true, true).animate({"width":"+=20"});
		              $(this).find('i').hide(0);
		              $(this).append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">Del?</span>'))
		              $(this).find('.del-feature-confirm-label').show(0);
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
			})


        $(pV + ' .tc').live({
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

   //      $(pV + ' .item').live({
   //        mouseenter: function(e){
   //            $(this).find('#suite-instance').css('visibility','visible');
   //        },
   //        mouseleave: function(e){
			// $(this).find('#suite-instance').css('visibility','hidden');
   //        }
   //      });

        $(pV + ' .item #suite-instance').live({
          click: function(e){
              
			$('.intance-suite').modal()

			// stop(true,true).show(0,function(){

			// }).position({
			// 	my: 'center top',
			// 	at: 'center bottom',
			// 	of: $(this),
			// 	collision: 'fit fit'
			// });
          }
        });

		// $('.intance-suite').live({
		// 	// mouseenter:function(e){
		// 	// 	 e.stopPropagation();
		// 	// },
		// 	mouseleave:function(e){
		//             e.stopPropagation();
		//         if($('.intance-suite').data('clicked') != true){
		//             $('.intance-suite').stop(true,true).hide();
		//         }
		//   }
		// })

		// $('#suitesViewer .intance-suite .active-result').live({
		// 	click: function(){
		// 		$('.intance-suite').data('clicked',true);
		// 		setTimeout(function(){
		// 		    	$('.intance-suite').data('clicked',false);
	 //            },2000)
		// 	}
		// })

		$('#suitesViewer .intance-suite #suite-instance-itration').click(function(e){
			e.stopPropagation();
			var iterationId = $('#suitesViewer .iterdd').find('option:selected').val();
			var suiteId = $('#suitesViewer #feature-container .selected').attr('item-id');
			var instance_name = ($('#suitesViewer #instance-name').val() != '')?$('#suitesViewer #instance-name').val():$('#suitesViewer #feature-container .selected').find('.summary').text();
			$(this).button('loading');

			var self = this;

			tcmModel.suites.instance(iterationId, suiteId, instance_name).done(function(data){
				$(self).button('reset');
			})
		})

           $(pV + ' .tc .steps-wrapper').live({
                click:function(e){
                  e.stopPropagation();  
                }
            })

		$(pV +' #item-add').live({
          click: function(e){
            e.stopPropagation();
            parentSuiteId = $(this).parents('.item').attr('item-id');
            $(pV+' #myModalLabel').text('Add Subsuite');
            $(pV+' #myModal').data('subsuite',true);
            $(pV+' #myModal').modal();
          }
      	})

        $(pV + ' .del-tc').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              deleteTcSuite($(this).parents('.tc').attr('tc-id'))
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"+=20"});
              $(this).find('i').hide(0);
              $(this).find('.del-confirm-label').show(0);
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
              $(this).stop(true, true).animate({"width":"-=20"});
              $(this).find('.del-confirm-label').hide(0);
              $(this).find('i').show(0);
            }
          }
        });

			// tcsModule.attachEvents('#suitesViewer');

			//fetch available tags for project
			fetchTagsForProject($.cookie("projectId"));
    
        }

    };

    function attachObjects(){

		var add_suite = $('<div id="add-suite" type="" title="Add Suite"class="" ><i class="icon-plus-sign icon-white"></i></div>').click(function(e){
			$(pV+' #myModalLabel').text('Add Suite');
			$(pV+'#myModal').data('subsuite',false);
			$(pV+'#myModal').modal();

		});

		// var multi_suite = $('<button id="" type="button" class="btn btn-mini" data-toggle="button"><i class="icon-th-list"></i> Multi-Selec</button>').click(function(e){
			
		// 	if(multi===true){
		// 		multi = false;
		// 		// $(this).removeClass('active');
		// 	}else{
		// 		multi = true;
		// 		// $(this).addClass('active');
		// 	}

		// });


		
		
		$(pV + ' .left-pannel .toolbar').append(add_suite);



    }

function editTc(tcObject){
  PM.colapseExpandRightPanel('#suitesViewer','block')
  PM.clearTCModal('#suitesViewer');

  $('.rp-title').text('Update Test Case')
  $('#suitesViewer #rp-wrapper .save').text('Update')
  $('#suitesViewer .new-tc-title').val(tcObject.name);
  $('#suitesViewer .new-tc-desc').val(tcObject.description);

  $('#suitesViewer #rp-wrapper .modal-body').data('flag',1);
  $('#suitesViewer #rp-wrapper .modal-body').data('tcObject',tcObject);

  if(tcObject.proposed == 1){
    $('.proposed').attr('checked','checked')
  }
  
}

    function adjustHeight(){

        $("#suitesViewer .right-pannel").css({
              'height' : '100%'
          });

         $("#suitesViewer .lp-wrapper").css({
              'height' : '100%'
          });

         $("#suitesViewer .left-center-panel").css({
              'height' : '100%'
          });

        $('#suitesViewer').css('height',(($('.tcm-container').height() - 20)*100)/$('.tcm-container').height()+'%')
    }

    function fetchTagsForProject(projectId){

		tcmModel.suites.source().done(function(data){
			if(data.length > 0){
				renderTagsChosen(data);
			}
		});
    }

	function renderTagsChosen(data){
		$('#suitesViewer #tags-select').find('option').remove();
		$(data).each(function(){
			$(this).each(function(){
				// var option = $('<option>').attr('value', this.name).text(this.name).data('tagId',this.id);
				// $('#suitesViewer #tags-select').append(option)
				var suite = itemsModule.createItem(this.name,this.id,this.count,0,'suite')

				var instance_suite = '<div id="suite-instance" title="Instance suite" type="button" class="" style=""><i class="icon-share-alt"></i></div>';

				$(suite).find('.item-control-buttons .wrapper').prepend(instance_suite);
				suite.data('users',[])
				var suite_wrap = $('<div class="suite-wrapp"/>').attr('suite-id',$(suite).attr('item-id'));
				$(suite_wrap).append(suite);
                itemsModule.renderItem('#suitesViewer  #feature-container',suite_wrap);
			})
		})
		// $('#suitesViewer #tags-select').trigger("liszt:updated")
	}

    function tagsChanged(args){

    	var req = [];

    	$('#suitesViewer #feature-container').find('.selected').each(function(){
    		req.push($(this).attr('item-id'));
    	})

    	if(req.length == 0){
			$('#suitesViewer #tc-container').children().remove();
    	}else{
	    	req = req.toString();

	    	tcmModel.releases.iterations.features.test_cases.suites.getTcsForStuitesByProject(req).done(function(data){
	    		$('#suitesViewer #tc-container').children().remove();
		       	$(data).each(function(){
		       		var tc_html = tcsModule.createTcHTML(this,null,false);
		       		$(tc_html).find('.bug-tc').remove();
							$(tc_html).find('.dropdown-menu').remove();
							$(tc_html).find('.dropdown-toggle').remove();
		       		tcsModule.renderTC(tc_html, '#suitesViewer'); //REMOVE THE PARSER
   				
		       	});

		       	var mylist = $('#suitesViewer #tc-container');
				var listitems = mylist.children(".tc");
				listitems.sort(function(a, b) {
				   var compA = $(a).text().toUpperCase();
				   var compB = $(b).text().toUpperCase();
				   return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
				})
				$(mylist).append(listitems);

	    	});
    	}
    }

    function fetchTcForSuite(tag){
    	return '';
    }

    function createTcsContainer(tag){
    	var tccontainer = $('<div>').addClass(tag.replace(/ /g,'-'))
    	return tccontainer;
    }

    function removeTcForSuite(tag){
    	$('#suitesViewer #tc-container .' + tag.replace(/ /g,'-')).remove();
    }

    function deleteTcSuite(tcId){
    	PM.toggleLoading(pV,' .tc[tc-id="'+tcId+'"]', true);
    	tcmModel.suites.testcases.del(tcId).done(function(data){
    		var suiteToAlter = $(pV + ' .item .summary').filter(function() {
			    return $(this).text() == $(pV + ' .tc[tc-id='+tcId+'] .tagit-label').text();
			});

			$(suiteToAlter).parents('.item').find('.count').text(parseInt($(suiteToAlter).parents('.item').find('.count').text()) - 1)
    		
			$(pV + ' .tc[tc-id='+tcId+']').remove();
    	})

    }


    function addSuiteToUI(data){
    	var data = data[0];

		var suite = itemsModule.createItem(data.name,data.id,0,0,'suite')

		var instance_suite = '<button id="suite-instance" title="Instance suite" type="button" class="btn btn-mini" style=""><i class="icon-share-alt"></i></button>';

		// $(suite).find('#item-add').remove();

		$(suite).find('.item-control-buttons .wrapper').prepend(instance_suite);

        itemsModule.renderItem('#suitesViewer  #feature-container',suite);

		$(suite).wrap('<div class="suite-wrapp"/>').attr('suite-id',$(suite).attr('item-id'));

		var option = $('<option>').attr('value', data.name).text(data.name).data('tagId',data.id,0);
		$('#suitesViewer #tags-select').append(option)
		$('#suitesViewer #tags-select').trigger("liszt:updated")
    }

    function getSubSuites(item){

    	var parentId = $(item).attr('item-id');

    	tcmModel.suites.subSuites.fetch(parentId).done(function(data){
    		if (data.length > 0){

    			$(data).each(function(){
    				// console.log(this)
    				addSubSuiteToUI(this,parentId);
    			})

    		}
    	})


    }

    function addSubSuiteToUI(data,parentSuiteId){

		var suite = itemsModule.createItem(data.name,data.id,0,0,'sub-suite')

		var instance_suite = '<button id="suite-instance" title="Instance suite" type="button" class="btn btn-mini" style=""><i class="icon-share-alt"></i></button>';
		
		$(suite).find('#item-add').remove();

		$(suite).find('.item-control-buttons .wrapper').prepend(instance_suite);

		$('#suitesViewer  #feature-container .sub-suite[item-id='+data.id+']').remove();

        itemsModule.renderItem('#suitesViewer  #feature-container .suite-wrapp[suite-id='+parentSuiteId+']',suite);

    }

    function removeSuiteFromUI(item){
    	
		$('<option[value="'+$(item).find('.summary').text()+'"]>').remove();
		$(item).remove();
		$('#suitesViewer #tags-select').trigger("liszt:updated")
    }

    $(window).resize(function(){

		PM.panelRightWidth("#suitesViewer")

		adjustHeight();
         
    });

    return SuitesView;

});