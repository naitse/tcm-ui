require.config({
    shim: {
    	'jQuery-1.8.3': {
    		exports: 'jquery'
    	},
        'jquery-ui-1.10.2.custom.min': {
            deps: ['jquery'],
            exports: 'jqui'
        },
        'chosen/chosen.jquery.min': {
            deps: ['jquery'],
            exports: 'chosen'
        },
    }
});

require(function (require) {
	var $ = require("jquery");
	require("chosen");
	require("jqui");
	var func = require("bindings");
	require("stuff");
	
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
	$("document").ready(function() {

		func();

		$('#release-select').chosen()

		getReleases();

	});
});


/*
modulo-node.js
var $ = require("jquery"); // CommonJS
if (flag) {
	a = 'pepe'
} else {
	a = 'juan'
}
require(a);
module.exports = {};
d4.js
define(['d1','d2','d3'], function (d1,d2,d3) {
	return 'HOLA';
}); 
define(['d4'], function (d4) {}); // AMD

// ------- CommonJS wrapper
define(function (require, exports, module) {
	var $ = require("jquery"); // CommonJS
	module.exports = {};
});
*/


