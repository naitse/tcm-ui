require.config({
  paths: {
    jquery: "libs/jquery/jQuery-1.8.3",
    bootstrap: "libs/bootstrap/js/bootstrap.min",
    chosen: "libs/chosen/chosen.jquery.min",
    jqueryui: "libs/jqueryui/jquery-ui-1.10.2.custom.min",
    underscore: "libs/underscore/underscore-min",
    backbone: "libs/backbone/backbone-min",
    jiraModel: 'models/jira',
    tcsModule: 'models/tcsModule',
    tcmModel: 'models/tcmModel',
    blockui: 'libs/blockui/jquery.blockUI',
    exporting: 'libs/highcharts/exporting',
    highcharts: 'libs/highcharts/highcharts',
    releases_iterations_dd: 'widgets/releases_iterations_dd',
    releases_dd: 'widgets/releases_dd',
    confirm_button: 'widgets/confirm_button',
    'jquery.cookie': 'libs/jquerycookie/jquery.cookie',
    'jquery.base64': 'libs/jquery.base64/jquery.base64',
    'textext':'libs/textext/textext.min',
    'panelsManager':'panelsManager',
    'jquery.grid': 'libs/jquery.grid/jquery.handsontable.full',
    barman: '//cdnjs.cloudflare.com/ajax/libs/barman/0.2.4/barman.min',
    handlebars: '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0/handlebars.min'
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
        deps: ['jquery'],
        exports: 'Backbone'
    },
    exporting:{
        deps: ['highcharts']
    },
    releases_iterations_dd:{
        deps: ['chosen']
    },
    releases_dd:{
        deps: ['chosen']
    },
    confirm_button:{
        deps: ['jquery']
    },
    'jquery.cookie':{
        deps: ['jquery']
    },
    'jquery.base64':{
        deps: ['jquery']
    },
    'textext':{
        deps: ['jquery','jqueryui']
    },
    'panelsManager':{
        deps: ['jquery','jqueryui']
    },
    'jquery.grid':{
        deps: ['jquery']
    },
    handlebars: {
      exports: 'Handlebars'
    }
  }
});

require(['app'], function(App){
  App.initialize();
});