define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        itemTemplate = require('text!templates/modules/item/item.html'),
        styles = require('text!templates/modules/item/style'),
        _ = require('underscore');

    var itemsModule = {
    	createItem: function(name,id,count){
    		var item = $(itemTemplate);
    		$(item).attr('item-id', id);
    		$(item).find('.summary').text(name);
    		$(item).find('.count').text(count);
    		return item;
    	},
    	renderItem: function(container,item){
    		$(container).append(item);
    	}
    }

	function attachStyles(){

		$('body').append($(styles));

	}

	attachStyles();

    return itemsModule;
})