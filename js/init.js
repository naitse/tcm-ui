//define('init',['jquery', 'bindings','makeResizable','chosen'], function ($,bindings,makeResizable,chosen) {
define('init',['jquery', 'bindings','chosen','mr'], function ($) {
	var mr = require('mr')
//	
	$("document").ready(function(){
	   
//		bindings()
		$('#release-select').chosen()
//	   
////	   getReleases();
//	   
//	   
		mr.mr()
//	   liveBindings()
	         
   })
	
});