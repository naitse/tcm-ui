define(function(require){

    var $ = require('jquery-plugins'),
        suitesTemplate = require('text!templates/suites/suites.html'),
        tcmModel = require('tcmModel'),
        PM = require('panelsManager'),
        tcsModule = require('models/tcsModule'),
        itemsModule = require('modules/item'),
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
				click: function(){
					console.log('click',$(this).find('.summary').text())
					$('#suitesViewer #tags-select').find('option[value="'+$(this).find('.summary').text()+'"]').attr('selected',true);
					$('#suitesViewer #tags-select').trigger("liszt:updated")
					tagsChanged();
				}
			})

			tcsModule.attachEvents('#suitesViewer');

			//fetch available tags for project
			fetchTagsForProject($.cookie("projectId"));
    
        }

    };

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

		tcmModel.releases.iterations.features.test_cases.suites.source(projectId).done(function(data){
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
                itemsModule.renderItem('#suitesViewer  #feature-container',itemsModule.createItem(this.name,this.id));
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
	    	console.log(req);

	    	tcmModel.releases.iterations.features.test_cases.suites.getTcsForStuitesByProject(req).done(function(data){
	    		console.log(data);
	    		$('#suitesViewer #tc-container').children().remove();
		       	$(data).each(function(){
		       		var tc_html = tcsModule.createTcHTML(this);
		       		tcsModule.renderTC(tc_html, '#suitesViewer'); //REMOVE THE PARSER
		       	})
	    	});
    	}


    	// if(!args[1].deselected){
    	// 	var tag = args[1].selected;
	    //    	var tcResponseData = ['{"statusName":"Not Run","tcId":181,"lastRun":1368484682000,"statusId":0,"description":"","name":"verify existence and style of tenant select","proposed":0}']//fetchTcForSuite(tag);
    	// 	//on done ...
    	// 	console.log('before');
    	// 	var tcContainer = createTcsContainer(tag);
	    //    	$('#suitesViewer #tc-container').append(tcContainer);
	    //    	$(tcResponseData).each(function(){
	    //    		$('#suitesViewer #tc-container .' + tag.replace(/ /g,'-')).append(createTCHtml(JSON.parse(this))); //REMOVE THE PARSER
	    //    	});

    	// }else{
    	// 	var tag = args[1].deselected;
		   // 	removeTcForSuite(tag);
    	// }
    }

    function fetchTcForSuite(tag){
    	return '';
    }

    function createTcsContainer(tag){
    	console.log(tag)
    	var tccontainer = $('<div>').addClass(tag.replace(/ /g,'-'))
    	return tccontainer;
    }

    function removeTcForSuite(tag){
    	$('#suitesViewer #tc-container .' + tag.replace(/ /g,'-')).remove();
    }

    $(window).resize(function(){

		PM.panelRightWidth("#suitesViewer")

		adjustHeight();
         
    });

    return SuitesView;

});