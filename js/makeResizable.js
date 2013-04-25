define('mr',["jquery","ui"], function ($,ui) {
console.log('loaded MR')

  return out = {
	
//	function makeResizable(){
				mr: function(){
					 console.log('exce MR')  

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
						containment : '#pannel-wrapper',
						stop : function() {
							$("#feature-container").css({
								'height' : '100%',
								'width' : '100%'
							})
							$(this).css({
										'height' : '100%',
										'width' : (($(this).width() * 100) / $('.tcm-container').width()) + '%'
							});
						}
					});
				   }
	
}	
});