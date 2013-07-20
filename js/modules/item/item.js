define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        itemTemplate = require('text!templates/modules/item/item.html'),
        styles = require('text!templates/modules/item/style'),
        _ = require('underscore');

    var itemsModule = {
    	createItem: function(name,id,count,buttonsFlag,customClass){

            var customClass = (customClass != "undefined")? customClass : "" ;

    		var item = $(itemTemplate);
            $(item).addClass(customClass);
    		$(item).attr('item-id', id);
    		$(item).find('.summary').text(name);
    		$(item).find('.count').text(count);

            if (buttonsFlag != false){
                item.on({
                    mouseenter: function(e){
                        // e.stopPropagation();
                        
                        $(this).find('.icon-adjust').css('visibility','visible');
                        // $(this).find('#item-add').css('visibility','visible');
                        // $(this).find('#item-remove').css('visibility','visible');
                    },
                    mouseleave: function(e){
                        // e.stopPropagation();
                        $(this).find('.icon-adjust').css('visibility','hidden');
                        // $(this).find('#item-add').css('visibility','hidden');
                        // $(this).find('#item-remove').css('visibility','hidden');
                    }
                });
            }else{
                $(item).find('button').remove();
            }

            $(item).find('.tc-steps').on({
                click:function(e){
                  e.stopPropagation();  
                }
            });

            $('.item .bt-ctrl.open').live({
                click:function(e){
                   e.stopPropagation();
                   $(this).removeClass('open').addClass('close')

                   $(this).parents('.item-control-buttons').find('.wrapper').stop(true,true).hide("slide", { direction: "right"},100,function(){

                    
                   })
                   // $(this).parents('.item-control-buttons').stop(true, true).animate({"width":"-=55"});
                }
            })


            $(".item-control-buttons").on({
                mouseleave:function(){
                    $(this).find('.bt-ctrl.open').click();
                }
            });

            $('.item .bt-ctrl.close').live({
                click:function(e){
                   e.stopPropagation();

                    var self = this;

                   $(this).removeClass('close').addClass('open')
                   $(this).parents('.item-control-buttons').find('.wrapper').stop(true,true).show("slide", { direction: "right"},100,function(){
                   })
                }
            })

            $(item).find('.steps-wrapper').on({
                click:function(e){
                  e.stopPropagation();  
                }
            })
            $(item).find('.tc-last-run-results-cont').on({
                click:function(e){
                  e.stopPropagation();  
                }
            })

    		return item;
    	},
    	renderItem: function(container,item){
    		$(container).append(item);
    	}
    }

	function attachStyles(){
        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "items"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }

	}


	attachStyles();

    return itemsModule;
})