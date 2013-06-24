define(['jquery', 'chosen', 'bootstrap', 'jqueryui', 'blockui','extendJS','textext'], function ($, chosen,bootstrap,jqueryui,blockui,extendJS,textext) {

	var output = {

		toggleLoading: function(parent_container, container, toggle, size){
			if (size != 'big'){
				size = 'small';
			}
			if (toggle == true){
				$(parent_container +' '+ container).block({
					message:'<div class="loading-'+size+'-block"></div>',
					overlayCSS:  { 
						backgroundColor: '#000', 
						opacity:         0.2, 
						cursor:          'wait' 
					},
					fadeIn:0,
					fadeOut:0
				})
			}else{
				$(parent_container +' '+ container).unblock()
			}
		},

		colapseExpandRightPanel: function(parent_container, state){
		if(state == 'block'){
			$(parent_container + ' .left-center-panel').css({
				'width':'65%'
			})
				this.makeResizable(parent_container,[550,100,313,700])
				this.panelRightWidth(parent_container)
				console.log($(parent_container + " #rp-wrapper"))
				$(parent_container + " #rp-wrapper").stop(true,true).show('fast') 
				$(parent_container + " #lp-wrapper").css({
				'height' : '100%',
				'width' : '313px'//porcentage + '%'
			});
		}else{
			$(parent_container + ' .left-center-panel').css({
				'width':'100%'
			})
			$(parent_container + " #rp-wrapper").stop(true,true).hide('fast')
			}
			$($(parent_container + ' .left-center-panel .ui-resizable-e')[1]).css({
				'display':state
			})
			$(parent_container + ' .run-tc-modal').css({
				'display':'none'
			})
			
		},

		panelRightWidth: function(parent_container){
			$(parent_container + " #rp-wrapper").css({
				'width' : $('#pannel-wrapper').outerWidth() - $(parent_container + ' .left-center-panel').outerWidth() - 9
			});
		},

		makeResizable: function(parent_container, args){

			$(parent_container + ' .left-center-panel').resizable({
				handles : 'e',
				minWidth : args[0], 
				resize : function() {
					this.panelRightWidth(parent_container);
					$(parent_container + " #lp-wrapper").css({
						'width': $(parent_container + " #lp-wrapper").data('width')
					})
				}
			});

			$(parent_container + ' #desc-wrapper').resizable({
				handles : 's',
				minHeight : args[1],
				alsoResize : parent_container + " #desc-container",
				stop : function() {
					var wc = 100 - ((($(parent_container + ' #desc-wrapper').outerWidth() * 100) / ($( parent_container + ' #description').outerWidth() - 20)) - 100)
					$(parent_container + " #desc-container").css({
						'height' : $('#desc-wrapper').height() - 20,
						'width' : wc + '%'  //'100%'
					});
					$(parent_container + " .right-pannel").css({
						'padding-bottom' : $(parent_container + ' #desc-wrapper').height() + 29
					});
				}
			});

			$(parent_container + " #desc-container").resizable({
				ghost : true,
				handles : 's'
			});

			$(parent_container + " #lp-wrapper").resizable({
				handles : 'e',
				minWidth : args[2],
				maxWidth : args[3],
				containment : parent_container + ' .left-center-panel',
				stop : function() {
						$(parent_container + " #feature-container").css({
							'height' : '100%',
							'width' : '100%'
						});
						var porcentage = (($(this).width() * 100) / $(parent_container + ' .left-center-panel').width());
						$(this).css({
							'height' : '100%',
							'width' : $(this).width()//porcentage + '%'
						});
						$(this).data('width',$(this).width())
				}
			});
		},

		expandIssueDescription: function(parent_container){
			$('#desc-wrapper').show('fast',function(){
				$( parent_container + " .right-pannel" ).css({
					'padding-bottom':$('#desc-wrapper').height()+29
				})
				var wc = 100 - ((($(parent_container + ' #desc-wrapper').outerWidth() * 100) / ($(parent_container + ' #description').outerWidth() - 20)) - 100)
				$("#desc-container").css({
					'width' : wc + '%'  //'100%'
				})
			})
			$(parent_container + ' #desc-expander').removeClass(parent_container + ' desc-expander').addClass(parent_container + ' desc-collapser')
		},


		collapsIssueDescription: function(parent_container){
			$(parent_container + ' #desc-wrapper').hide('fast',function(){
				$( parent_container + " .right-pannel" ).css({
					'padding-bottom':29
				})
			})
			$(parent_container + ' #desc-expander').removeClass(parent_container + ' desc-collapser').addClass(parent_container + ' desc-expander')
		},

		clearModal: function(modal){
			$(modal).removeData();
			$(modal).find('input').val('');
			$(modal).find('textarea').val('');

		},

		clearTCModal:function(pV){

    $(pV +' #rp-wrapper').find('.dropdown-toggle').removeClass(function (index, css) {
        return (css.match (/\bddm-\S+/g) || []).join(' ')
    }).addClass('ddm-inprogress').text('').append('<i class="icon-hand-right " style="margin-top: 2px;"></i>',' In Progress ', '<span class="caret"></span>').attr('status-id',1);

            $(pV +' .proposed').parents('label').show();
            $(pV +' .tc-fields').show();
            $(pV +' .rp-title').text('')
            $(pV +' #rp-wrapper .save').text('Add')
            $(pV +' .new-tc-title').val('').removeClass('title-error');
            $(pV +' .new-tc-desc').val('');
            $(pV +' #rp-wrapper .modal-body').data('flag',0);
            $(pV +' #rp-wrapper .modal-body').data('tcObject','');
            $(pV +' .proposed').attr('checked',false);
            proposed = 0;

}
	}

	return output;

});