   var prefix = '';

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
		   'height': '12'
	   }).find('.ui-progressbar-value').css({
		   'border-color': '#8695A8',
		   'background':'#B1BBC8'
	   })
	   
  }

   
   
   
   
  //var domain = window.location.href
function expandIssueDescription(){
	   $('#desc-container').show('fast')
	   $('#desc-expander').removeClass('desc-expander').addClass('desc-collapser')
   }
   
   function collapsIssueDescription(){
	   $('#desc-container').hide('fast')
	   $('#desc-expander').removeClass('desc-collapser').addClass('desc-expander')
   }
    var releases = {
    url: 'http://localhost:8081/getDB',  
  
    fetch: function () {
      return $.ajax({
				type: "GET",
				url: this.url,
				dataType: "json"
			});
    }
  };
   
  var features = {
    url: 'http://localhost:8081/getFeatures?itId=',  
  
    fetch: function (iterationid) {
      return $.ajax({
				type: "GET",
				url: this.url + iterationid,
				dataType: "json"
			});
    }
  };
   
   var test_cases = {
		    url: 'http://localhost:8081/getTcs?ftId=',  
		  
		    fetch: function (feature_id) {
		      return $.ajax({
						type: "GET",
						url: this.url + feature_id,
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
		$('.refresh-icon').removeClass('refreshing')
	});
}   

function getTC(feature_id){
	
	test_cases.fetch(feature_id).done(function(data){
		prepareTCs(data)
		
	})
}   
function prepareTCs(data){
	$('#tc-container').children().remove();
	$(data).each(function(){
        
//		  {
//		        "statusName": "Not RUN",
//		        "tcName": "change regions",
//		        "tcId": 1,
//		        "tcDescription": "first deloy to region A then deploy to region",
//		        "lastRun": null,
//		        "proposed": false
//		    },
		
		switch(this.statusId)
		{
		case 0:
			statusClass = 'notrun'
		  break;
		case 1:
			statusClass = 'inprogress'
		  break;
		case 2:
			statusClass = 'block'
		  break;
		case 3:
			statusClass = 'failed'
		  break;
		case 4:
			statusClass = 'pass'
		  break;
		default:
		  statusClass = ''
		}
		
    	var tc = $('<div>').addClass('tc').attr('tc-id',this.tcId)
    	var tctoolbar = $('<div>').addClass('tc-header')
    	var tcname = $('<div>').addClass('tc-name').text(this.tcName)
    	var tcstatus = $('<div>').addClass('tc-status '+ statusClass).attr('status', this.statusId).attr('title', this.statusName)
    	var tc_description = $('<div>').addClass('tc-description').text(this.tcDescription);
    	$(tctoolbar).append(tcname)
    	$(tctoolbar).append(tcstatus)
    	$(tc).append(tctoolbar)
    	$(tc).append(tc_description)
    	
    	renderTC(tc)
    	
    })
	
}   

function clearData(){
	$('#feature-container').children().remove()
	$('#desc-container').children().remove()
	$('#desc-container').text('');
	$('#desc-container').hide()
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
    	
//    	<div class="feature">
//		<div class="jira-key">ION-2154</div>
//		<div class="summary">Set Up Properties Files for all...</div>
//		<div class="stats">
//			<div class="count">1/5</div>
//			<div class="bar"></div>
//		</div>
//	</div>
    	
    	
    	var feature = $('<div>').addClass('feature').attr('feature-id',this.featureId).text(this.jiraKey +" - "+this.featureName).data('desc', this.featureDescription)
    	renderFeature(feature)
    	
    })
}

function renderFeature(feature){
	
	$('#feature-container').append(feature);
	renderFeatureBar(feature);
	
}

function loadFeatureDesc(desc){
	
	$('#desc-container').text('');
	$('#desc-container').text(desc);
	
}

function renderTC(tc){
	$('#tc-container').append(tc);
	
}
