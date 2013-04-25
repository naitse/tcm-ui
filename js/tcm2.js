   var it_select;
   var prefix = '';
   var displayed = false;
   var backend = 'http://tcm-backend.cloudhub.io/api/';
   var proposed=0;
   String.prototype.trunc = 
	   function(n,useWordBoundary){
       var toLong = this.length>n,
           s_ = toLong ? this.substr(0,n-1) : this;
       s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
       return  toLong ? s_ + '...' : s_;
    };

    
    (function($){
    	  $.event.special.destroyed = {
    	    remove: function(o) {
    	      if (o.handler) {
    	        o.handler()
    	      }
    	    }
    	  }
    	})(jQuery)
    
    	
    var features = {
    	    url: backend +'features?itId=',  
    	  
    	    fetch: function (iterationid) {
    	      return $.ajax({
    					type: "GET",
    					cache:false,
    					url: this.url + iterationid,
    					dataType: "json"
    				});
    	    }
    	  };
    	   
    	   var test_cases = {
    			    url: {
    			    	get:backend +'testcases?ftId=',
    			    	add:backend +'testcases',
    			    },  
    			  
    			    fetch: function (feature_id) {
    			      return $.ajax({
    							type: "GET",
    							cache:false,
    							url: this.url.get + feature_id,
    							dataType: "json"
    						});
    			    },
    			    add: function (req) {
      			      return $.ajax({
      							type: "POST",
      							cache:false,
      							url: this.url.add,
      							data:JSON.stringify(req),
      							contentType: "application/json",
      							dataType: "json"
      						});
      			    }
    	   };

    	   var feature_teststats ={
    			    url: backend +'features/executedtestcases?ftId=',  
    				  
    			    fetch: function (feature_id) {
    			      return $.ajax({
    							type: "GET",
    							cache:false,
    							url: this.url + feature_id,
    							dataType: "json"
    						});
    			    }   
    	  
    	   }    
    
    
   $("document").ready(function(){
	   console.log("readddyyyyy");
	   it_select = $('#release-select').chosen()
	   
	   $('.modal').modal({
		   show:false
	   });
	   
	   getReleases();
	   
	   makeResizable()
	   colapseExpandRightPanel('none')
	   
	  $(window).resize(function() {
		  
		  
			var wc = 100 - ((($('#desc-wrapper').outerWidth() * 100) / ($('#description').outerWidth() - 20)) - 100)
			
			$("#desc-container").css({
				'width' : wc + '%'  //'100%'
			})

			panelRightWidth()
		});	
	   
	   
       $('#release-select').live({
          change: function(){
              itSelected($(this).find('option:selected'))
          }
        })
        
        $('.feature').live({
          click: function(){
        	  $('.feature').removeClass('active');
        	  $(this).addClass('active');
        	  loadFeatureDesc($(this).data('desc'))
        	  $('.add-tc').attr('disabled',false)
              getTC($(this).attr('feature-id'))
     		 
              $('#desc-wrapper').css({
				   'height':100
				   })
		      $( ".right-pannel" ).css({
					   'padding-bottom':29
				   })
				   
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
        })

        $('.desc-expander').live({
          click: function(){
        	  if($('.feature').size() != 0){
        		  $(this).addClass('detailsOpen')
            	  expandIssueDescription();
            	  }
          }
        })
        $('.desc-collapser').live({
          click: function(){
        	  $(this).removeClass('detailsOpen')
        	  collapsIssueDescription();
        	  
          }
        })
        $('.icon-refresh').live({
          click: function(){
        	  $(this).addClass('refreshing');
        	  clearData()
        	  collapsIssueDescription();
        	  getReleases();
          }
        })
        
        $('.tc-expander').live({
          click: function(){
        	  $(this).parents('.tc').find('.tc-steps').show('fast')
        	  $(this).removeClass('tc-expander').addClass('tc-collapse detailsOpen');
          }
        })
        
        $('.tc-collapse').live({
          click: function(){
        	  $(this).parents('.tc').find('.tc-steps').hide('fast')
        	  $(this).removeClass('tc-collapse detailsOpen').addClass('tc-expander');
          }
        })
        
        $('.dropdown-menu > li').live({
        	click: function(){
        		var icon_white = ($(this).children('i').attr('class') == 'icon-off')?' icon-white':'';
        		var newState = $('<i class="'+$(this).children('i').attr('class')+icon_white+'" style="margin-top: 2px;"></i>')
        		var caret = $('<span class="caret"></span>')
        		$(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
        		    return (css.match (/\bddm-\S+/g) || []).join(' ')
        		}).addClass($(this).attr('class')).text('').append(newState, caret)
        	}
        })

		 $('.proposed').live('change', function(){
		    if($(this).is(':checked')){
		        proposed=1;
		    } else {
		    	proposed=0;
		    }
		});
        
        $('#rp-wrapper .cancel').live({
        	click: function(){
        		hideRightPanel()
//        		$(this).parents('#rp-wrapper').find('.close-modal').click()
//        		$(this).parents('#rp-wrapper').find('.alert').addClass('hide')
        	}
        })
        
         $('#rp-wrapper .save').live({
        	click: function(){
        		saveTc($(this).parents('#rp-wrapper'))
        	}
        })
        
         $('.add-tc').live({
        	click: function(){
        		colapseExpandRightPanel('block')
        		tri()
        	}
        })
        
        $('.del-tc-t.active').live({
        	click: function(){
        		$('.del-tc').hide('fast')
        		$(this).addClass('del-tc-trigger')
        	}
        })
        
                $('.del-tc-trigger').live({
        	click: function(){
        		$('.del-tc').show('fast')
        		$(this).removeClass('del-tc-trigger')
        	}
        })
        
        $('.del-tc').live({
        	click: function(){
        	}
        })
        
       
   })

//   function adjustFF(first){
//	   
//	   var fooNotNull = (first === true) ? 90 : 70;
//	   
//	   var w = $(window).height() - 70;
//   	   
//	   w=(w*100)/$(window).height() + '%'
//	   console.log(w, $('.tcm-container').height())
//	   	   $('html').css('height',w)
//   }
//   function adjustContainers(){
//	   var fc = $('#feature-container').height() -$('.toolbar').height();
//	   fc=(fc*100)/$('.left-pannel').height() + '%'
//	   $('#feature-container').css('height',fc)
//	   var tcc = $('#tc-container').height() - $('.desc-header').height();
//	   $('#tc-container').css('height',tcc)
//	   }
 
 function tri(){
    		   $('.left-center-panel').css({
					'height' : '100%',
					'width' : '65%'
    		   });	
    		   makeResizable()
    		   
    		   panelRightWidth()
    		   $("#rp-wrapper").show('fast')   
    	   }  
   
function panelRightWidth(){
	
    $("#rp-wrapper").css({
//		'height' : '100%',
		'width' : $('#pannel-wrapper').outerWidth() -$('.left-center-panel').outerWidth() -9
});
	
}
function colapseExpandRightPanel(state){
	
	  $($('.left-center-panel .ui-resizable-e')[1]).css({
			'display':state
	  })
	
}    	   

function hideRightPanel(){
	colapseExpandRightPanel('none')
	$("#rp-wrapper").hide('fast')
	$('.left-center-panel').css({
		'width':'100%'
	})
}

 function makeResizable(){
    		   $('.left-center-panel').resizable({
    				handles : 'e',
//    				minWidth : 218,
//    				containment : '#pannel-wrapper',
    				resize : function() {
//    					$("#feature-container").css({
//    						'height' : '100%',
//    						'width' : '100%'
//    					})
    					var por = ((($('#pannel-wrapper').outerWidth() -$(this).outerWidth() -9) * 100) / $('#pannel-wrapper').outerWidth()) + '%'
    					$("#rp-wrapper").css({
//    								'height' : '100%',
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
			})
			$(".right-pannel").css({
				'padding-bottom' : $('#desc-wrapper').height() + 29
			})
		}
	})

	$("#desc-container").resizable({
		ghost : true,
		handles : 's'
	});
 		
 		

   $("#lp-wrapper").resizable({
		handles : 'e',
		minWidth : 218,
		containment : '.left-center-panel',
		stop : function() {
			$("#feature-container").css({
				'height' : '100%',
				'width' : '100%'
			})
			
			var porcentage = (($(this).width() * 100) / $('.left-center-panel').width());
			$(this).css({
						'height' : '100%',
						'width' : porcentage + '%'
			});
			
//			var por = ((($('#pannel-wrapper').outerWidth() -$(this).outerWidth() -5) * 100) / $('#pannel-wrapper').outerWidth()) + '%'
//			$(".right-pannel").css({
//						'height' : '100%',
//						'width' : (100 - porcentage) +'%'
//			});
			
//			$('.right-pannel').css({
//				'height' : '100%',
//				'width' : (100 - ((($(this).width() + $('#rp-wrapper').width()) * 100) / $('.left-center-panel').width())) + '%'
//			});
		}
	});
   
   
   }  
   
function _makeResizable(){
	   
 	  $('.handle').draggable({ 
 		  axis: "x",
 			  stop:function(){
 				  var elem = $(this);
 				  var pl = elem.offset().left - elem.parents('body').offset().left - $('.left-pannel').position().left;
 				  //var pl = Math.round((((elem.offset().left - elem.parents('body').offset().left) /*- $('.left-pannel').position().left*/) * 100)/$(document).width()) +'%'
 				  $( ".left-pannel" ).css("width", pl)
 				  $(this).position({
 					  my:        "left",
 					  at:        "right",
 					  of:        $( ".left-pannel" ), // or $("#otherdiv)
 					  collision: "fit"
 				  })
 			  }
 	  });
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
    var releases = {
    url: backend + 'releases_iterations',  
  
    fetch: function () {
      return $.ajax({
				type: "GET",
				url: this.url,
				dataType: "json"
			});
    }
  };
   

   
function getReleases(){
	releases.fetch().done(function(data){
		//[{"releaseName":"27","iterationName":"16,18,19,20,21,22"},{"releaseName":"28","iterationName":"23,24,25"}]
		
		$('#release-select').find('optgroup').remove();
		$(data).each(function(){
			var optionG = $('<optgroup>').attr('label', "Release "+this.releaseName)
			var iterations = this.iterationName.split(',')
			$(iterations).each(function(){
				var option = $('<option>').attr('value', this).text(prefix + this);
				$(optionG).append(option);
			})
			$('#release-select').append(optionG)
		})
		$('#release-select').trigger("liszt:updated")
		$('.icon-refresh').removeClass('refreshing')
	});
}   

function getTC(feature_id){
	
	test_cases.fetch(feature_id).done(function(data){
		prepareTCs(data)
	})
}   
function prepareTCs(data){
	$('#tc-container').children().remove();
	if($(data).size() >0){
		$('.del-tc-trigger').attr('disabled',false)
	}
	$(data).each(function(){
        
//		  {
//		        "statusName": "Not RUN",
//		        "tcName": "change regions",
//		        "tcId": 1,
//		        "tcDescription": "first deloy to region A then deploy to region",
//		        "lastRun": null,
//		        "proposed": false
//		    },
		createTcHTML(this)

    	
    })
	
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
	var statusText = ''
		
	if(tcObject.proposed == 1){
		statusClass = 'proposed'
			statusClass = ''
				statusText = ' Proposed '
			  statusIcon = 'icon-question-sign icon-white '
	}
	
	var tc = $('<div>').addClass('tc').attr('tc-id',tcObject.tcId)
	var wrapper = $('<div>').addClass('wrapper')
	var delete_btn = $('<button type="button" class="btn btn-mini btn-danger del-tc" ><i class="icon-remove icon-white"></i></button>')
	var expander = $('<div>').addClass('tc-expander detailsIcon ds')
	var description = $('<div>').addClass('tc-description ds').text(tcObject.tcName.trunc(100,false))
	var stats = $('<div>').addClass('tc-stats ds')
		var btn_group = $('<div class="btn-group">')
		var toggle = $('<a class="btn dropdown-toggle btn-inverse btn-mini ddm-'+statusClass+'" data-toggle="dropdown" href="#">').append($('<i class="'+statusIcon+'" style="margin-top: 2px;"></i>'),statusText,$('<span class="caret"></span>'))
		var list = $('<ul class="dropdown-menu pull-right">')
		var nodes = $('<li class="ddm-notrun"><i class="icon-off"></i> Not Run </li><li class="ddm-inprogress"><i class="icon-hand-right"></i> In Progress </li><li class="ddm-block"><i class="icon-exclamation-sign"></i> Blocked </li><li class="ddm-failed"><i class="icon-thumbs-down"></i> Fail </li><li class="ddm-pass"><i class="icon-thumbs-up"></i> Pass </li>')
//	var status = $('<div>').addClass('tc-status '+ statusClass).attr('status', this.statusId).attr('title', this.statusName)
	var steps = $('<div>').addClass('tc-steps').text(tcObject.tcDescription).css('display','none');
	
	$(list).append(nodes)
	$(btn_group).append(toggle, list)
	$(stats).append(btn_group)
	$(wrapper).append(description,expander, stats, delete_btn)
	$(tc).append(wrapper,steps)
	
	renderTC(tc)
	
}

function clearData(){
	$('#feature-container').children().remove()
	$('.add-tc').attr('disabled',true)
	$('#desc-container').children().remove()
	$('#desc-container').text('');
	$('#desc-wrapper').hide()
	$('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
	$('#tc-container').children().remove()
}

function itSelected(selected_node){
	 //console.log($(selected_node).val())

	  iteration_name = $(selected_node).val().replace(prefix ,'')
	  
	  features.fetch(iteration_name).done(function(data){
			clearData();
		  prepareFeatures(data)
	  });

}

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
    	
    	$(stats).append(bar,count)
    	$(title_bar).append(jiraKey,stats);
    	$(feature).append(title_bar,summary);
    	
    	renderFeature(feature)
    	
    })
}

function renderStatsCount(feature,data){
	data = data[0]
	$(feature).find('.count').text(data.run+'/'+data.total);
	
}

function renderFeature(feature){
	var feature_id = $(feature).attr('feature-id');
	console.log(feature_id)
	$('#feature-container').append(feature);
	$(feature).find('.stats').addClass('loading-small');
	feature_teststats.fetch(feature_id).done(function(data){
		renderStatsCount(feature, data)
		renderFeatureBar(feature);
		$(feature).find('.stats').removeClass('loading-small');
	})
	
}

function loadFeatureDesc(desc){
	
	$('#desc-container').text('');
	$('#desc-container').text(desc);
	
}

function renderTC(tc){
	$('#tc-container').append(tc);
	
}


function saveTc(modal){
	
	$(modal).find('.alert').addClass('hide')
	
	var title = $(modal).find('.new-tc-title').val()
	var desc = $(modal).find('.new-tc-desc').val()
	var feature= $('.active').attr('feature-id')
	
	if (jQuery.trim($('#rp-wrapper').find('.new-tc-title').val()).length <= 0){
		$(modal).find('.new-tc-title').addClass('title-error')
		return false
	}else{
		$(modal).find('.new-tc-title').removeClass('title-error')
	}
	
	var req = {
		featureId:feature,
		name:title,
		description:desc,
		proposed:proposed
	}
	
	console.log(JSON.stringify(req))
	test_cases.add(req).done(function(){
		$(modal).modal('hide')
		test_cases.fetch(feature).done(function(data){
			$(data).each(function(){
				if($('.tc[tc-id="'+this.tcId+'"]').size() == 0){
					createTcHTML(this);
				}
			})
		})
	}).fail(function(){
		$(modal).find('.alert').removeClass('hide')
	})
	

}