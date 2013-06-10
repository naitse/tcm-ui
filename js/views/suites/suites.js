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
			})


			$(pV+' .item #item-remove').live({
				click:function(e){
					 e.stopPropagation();
					 var self = this;
					tcmModel.suites.remove($(this).parents('.item').attr('item-id')).done(function(data){

						removeSuiteFromUI($(self).parents('.item'));

					})
				}
			})

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