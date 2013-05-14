define(function(require){

    var $ = require('jquery-plugins'),
        suitesTemplate = require('text!templates/suites/suites.html'),
        tcmModel = require('tcmModel'),
        PM = require('panelsManager'),
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
				var option = $('<option>').attr('value', this.name).text(this.name);
				$('#suitesViewer #tags-select').append(option)
			})
		})
		$('#suitesViewer #tags-select').trigger("liszt:updated")
	}

    function tagsChanged(args){
    	if(!args[1].deselected){
    		var tag = args[1].selected;
	       	var tcResponseData = ['{"statusName":"Not Run","tcId":181,"lastRun":1368484682000,"statusId":0,"description":"","name":"verify existence and style of tenant select","proposed":0}']//fetchTcForSuite(tag);
    		//on done ...
    		console.log('before');
    		var tcContainer = createTcsContainer(tag);
	       	$('#suitesViewer #tc-container').append(tcContainer);
	       	$(tcResponseData).each(function(){
	       		$('#suitesViewer #tc-container .' + tag.replace(/ /g,'-')).append(createTCHtml(JSON.parse(this))); //REMOVE THE PARSER
	       	});

    	}else{
    		var tag = args[1].deselected;
		   	removeTcForSuite(tag);
    	}
    }

    function fetchTcForSuite(tag){
    	return '';
    }

    function createTcsContainer(tag){
    	console.log(tag)
    	var tccontainer = $('<div>').addClass(tag.replace(/ /g,'-'))
    	return tccontainer;
    }

    function createTCHtml(tcObject){


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
		// var feature_closed = $('.feature[feature-id='+feature_id+']').data('conflict');
		// var feature_ready = $('.feature[feature-id='+feature_id+']').hasClass('ready');
		// if(feature_closed == 1 || feature_ready == false){
		// 	$(status_group).append(delete_btn, edit_btn, bug_btn, prop_btn, toggle, list)
		// }

		$(stats).append(status_group)
		$(wrapper).append(description,expander, stats );
		$(tc).append(wrapper,stepsWrapper).data('tcObject',tcObject)

		return tc;
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