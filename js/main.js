require.config({
  paths: {
    jquery: "libs/jquery/jQuery-1.8.3",
    bootstrap: "libs/bootstrap/js/bootstrap.min",
    chosen: "libs/chosen/chosen.jquery.min",
    jqueryui: "libs/jqueryui/jquery-ui-1.10.2.custom.min",
    underscore: "libs/underscore/underscore-min",
    history: 'https://raw.github.com/balupton/history.js/master/scripts/bundled/html4+html5/jquery.history',
    routerjs: "libs/routerjs/Router",
    jiraModel: 'models/jira',
    tcmModel: 'models/tcmModel',
    blockui: 'libs/blockui/jquery.blockUI',
    raphael: 'libs/graphael/raphael-min',
    graphael: 'libs/graphael/g.raphael-min',
    pie_min: 'libs/graphael/g.pie-min'
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
    routerjs:{
        deps: ['jquery', 'history']
    },
    raphael:{
        exports: 'Raphael'
    },
    graphael:{
        deps: ['raphael']
    },
    pie_min:{
        deps:['raphael']
    }
  }
});

require(['app'], function(App){
  App.initialize();
});