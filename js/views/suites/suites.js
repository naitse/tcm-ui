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

    var SuitesView = {
        moduleId: "Suites",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(suitesTemplate);
                this.attachEvents();
                PM.makeResizable("#suitesViewer",[550,100,313,700]);
                PM.colapseExpandRightPanel("#suitesViewer",'none');
                adjustHeight();
                attachObjects();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-suites').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
        },

        attachEvents: function(){

        	$('#suitesViewer #tags-select').chosen({
        		no_results_text: "No results matched"
        	}).change(function(e){
        		tagsChanged(arguments);
        	});
			$('#suitesViewer #tags_select_chzn').css({
				'width': '100% !important'
			}).find('.chzn-choices').css({
				'min-height': '29px',
				'border-top': 'none',
				'border-left': 'none'
			});

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
						if(!$(this).hasClass('selected')){
							$('#suitesViewer .item').removeClass('selected');
							$(this).toggleClass('selected');
							$('#suitesViewer #tags-select').find('option').attr('selected',false);
							$('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',true);
						}else{
							// $('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',false);
						}
						$('#suitesViewer #tags-select').trigger("liszt:updated")
						tagsChanged();
					}
				}
			});

			$(pV+' #suite-save').live({
				click:function(){
					tcmModel.suites.add($(pV+ '#suite-name').val(),$.cookie("projectId")).done(function(data){
						if(data[0].FALSE == 0){
							$(pV+ ' #suite-name').parent().addClass('alert-error');
						} else {
							$(pV+ ' #suite-close').click();
							addSuiteToUI(data);
						}
					})
				}
			});

			$(pV+' #item-add').live({
				click:function(e){
					e.stopPropagation();
					PM.colapseExpandRightPanel(pV,'block');
					$(pV + ' #rp-wrapper').data('item-id',$(this).parents('.item').attr('item-id'))
				}
			})

			$(pV+' #suite-tc-close').live({
				click:function(e){
					e.stopPropagation();
					PM.clearModal($(pV + ' #rp-wrapper'));
					PM.colapseExpandRightPanel(pV,'none');
				}
			})

			$(pV+' #suite-tc-save').live({
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
					tcmModel.suites.testcases.add($(modal).data('item-id'),req).done(function(data){
						
						if(data[0].tcId != ""){

							var suiteId = $(modal).data('item-id');

							var tc_html = tcsModule.createTcHTML(data[0],null,false);
				       		tcsModule.renderTC(tc_html, '#suitesViewer'); //REMOVE THE PARSER

							$(pV + '.item[item-id='+suiteId+']').find('.count').text(parseInt($(pV + '.item[item-id='+suiteId+']').find('.count').text()) + 1)
							$(self).button('reset');
						} else {
							$(modal).find('.alert').removeClass('hide');
						}
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
		              $(this).find('i').hide();
		              $(this).append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">Del?</span>'))
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
			})


        $(pV + ' .tc').live({
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


        $(pV + ' .del-tc').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              deleteTcSuite($(this).parents('.tc').attr('tc-id'))
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

			tcsModule.attachEvents('#suitesViewer');

			//fetch available tags for project
			fetchTagsForProject($.cookie("projectId"));
    
        }

    };

    function attachObjects(){

		var add_suite = $('<button id="item-add" type="button" class="btn btn-mini" ><i class="icon-plus-sign"></i> Add Suite</button>').click(function(e){
			
			$(pV+'#myModal').modal();

		});

		var multi_suite = $('<button id="item-add" type="button" class="btn btn-mini" data-toggle="button"><i class="icon-th-list"></i> Multi-Selec</button>').click(function(e){
			
			if(multi===true){
				multi = false;
				// $(this).removeClass('active');
			}else{
				multi = true;
				// $(this).addClass('active');
			}

		});


		
		
		$(pV + ' .left-pannel .toolbar').append(multi_suite,add_suite);



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
				var option = $('<option>').attr('value', this.name).text(this.name).data('tagId',this.id);
				$('#suitesViewer #tags-select').append(option)
                itemsModule.renderItem('#suitesViewer  #feature-container',itemsModule.createItem(this.name,this.id,this.count));
			})
		})
		$('#suitesViewer #tags-select').trigger("liszt:updated")
	}

    function tagsChanged(args){

    	var req = [];

    	$('#suitesViewer #tags-select').find('option:selected').each(function(){
    		req.push($(this).data('tagId'));
    	})

    	if(req.length == 0){
			$('#suitesViewer #tc-container').children().remove();
    	}else{
	    	req = req.toString();

	    	tcmModel.releases.iterations.features.test_cases.suites.getTcsForStuitesByProject(req).done(function(data){
	    		$('#suitesViewer #tc-container').children().remove();
		       	$(data).each(function(){
		       		var tc_html = tcsModule.createTcHTML(this,null,false);
		       		tcsModule.renderTC(tc_html, '#suitesViewer'); //REMOVE THE PARSER
		       	})
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
		itemsModule.renderItem('#suitesViewer  #feature-container',itemsModule.createItem(data.name,data.id));
		var option = $('<option>').attr('value', data.name).text(data.name).data('tagId',data.id,0);
		$('#suitesViewer #tags-select').append(option)
		$('#suitesViewer #tags-select').trigger("liszt:updated")
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