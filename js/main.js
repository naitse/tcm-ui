require.config({
  paths: {
    jquery: "libs/jquery/jQuery-1.8.3",
    bootstrap: "libs/bootstrap/js/bootstrap.min",
    chosen: "libs/chosen/chosen.jquery.min",
    jqueryui: "libs/jqueryui/jquery-ui-1.10.2.custom.min",
    underscore: "libs/underscore/underscore-min",
    backbone: "libs/backbone/backbone-min",
    jiraModel: 'models/jira',
    tcmModel: 'models/tcmModel',
    blockui: 'libs/blockui/jquery.blockUI',
    exporting: 'libs/highcharts/exporting',
    highcharts: 'libs/highcharts/highcharts',
    releases_iterations_dd: 'widgets/releases_iterations_dd',
    'jquery.cookie': 'libs/jquerycookie/jquery.cookie',
    'jquery.base64': 'libs/jquery.base64/jquery.base64'
  },

  shim: {
  	bootstrap: {
  		deps: ['jqueryui']
  	},
  	jqueryui: {
  		deps: ['jquery']
  	},
  	chosen: {
  		deps: ['jquery']
  	},
    underscore:{
        exports: '_'
    },
    blockui:{
      deps: ['jquery']
    },
    backbone:{
        exports: 'Backbone'
    },
    exporting:{
        deps: ['highcharts']
    },
    releases_iterations_dd:{
        deps: ['chosen']
    },
    'jquery.cookie':{
        deps: ['jquery']
    },
    'jquery.base64':{
        deps: ['jquery']
    }
  }
});

require(['app'], function(App){
  App.initialize();
});