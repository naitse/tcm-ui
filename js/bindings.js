define(['jquery'], function ($) {
	function liveBindings(){
		   
	       $('#release-select').live({
	          change: function(){
	              itSelected($(this).find('option:selected'))
	          }
	        })
	        
	        $('.feature').live({
	          click: function(){
	        	  loadFeatureDesc($(this).data('desc'))
	              getTC($(this).attr('feature-id'))
	          }
	        })

	        $('.desc-expander').live({
	          click: function(){
	        	  expandIssueDescription();
	        	  
	          }
	        })
	        $('.desc-collapser').live({
	          click: function(){
	        	  collapsIssueDescription();
	        	  
	          }
	        })
	        $('.refresh-icon').live({
	          click: function(){
	        	  $(this).addClass('refreshing');
	        	  clearData()
	        	  getReleases();
	          }
	        })
	       
};
	

	return liveBindings;
});



