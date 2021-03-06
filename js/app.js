// Filename: app.js
define([
    'jquery',
    'underscore',
    'views/topmenu',
    'views/manager/manager',
    'views/sync/sync',
    'views/plan/plan',
    'views/metrics/metrics',
    'views/metrics/release_metrics',
    'views/metrics/interop_metrics',
    'views/suites/suites',
    'views/plugins/plugins-settings',
    'views/interop/interop',
    'views/project/project',
    'views/ris/ris', //release state, hotlik page to show the curren implementation qa progress
    'notificator',
    'backbone',
    'jquery.cookie',
    'PusherNotifier',
    'gritter'
], function($, _, TopMenuView, managerView, syncView, planView, MetricsView, RlsMetricsView, InteropMetricsView, SuitesView, PluginsSettingsView, InteropView, ProjectView,ReleaseImplementationView, notificator){

    var modules = [
        {
        'id': 'Sync',
         'divContainer':'#tcSync'
        },
        {
            'id': 'Plan',
            'divContainer':'#tcPlan'
        },
        {
            'id': 'Viewer',
            'divContainer':'#tcViewer'
        },
        {
            'id': 'Metrics',
            'divContainer':'#tcMetrics'
        },
        {
            'id': 'RlsMetrics',
            'divContainer': '#tcRlsMetrics'
        },        
        {
            'id': 'InteropMetrics',
            'divContainer': '#InteropMetrics'
        },
        {
            'id': 'Suites',
            'divContainer': '#suitesViewer'
        },
        {
            'id': 'plugins-settings',
            'divContainer': '#plugins-settings'
        },
        {
            'id': 'Interop',
            'divContainer': '#interOp'
        },
        {
            'id': 'Project',
            'divContainer': '#projectView'
        },
        {
            'id': 'ReleaseImplementation',
            'divContainer': '#ReleaseImplementation'
        }

    ];

    function loadModule(module, queryParam){
        if(window.location.hash.indexOf('itmhl') >= 0 || window.location.hash.indexOf('ris') >= 0 || window.location.hash.indexOf('planhl') >= 0){

        }else if(window.location.hash.indexOf('iometricshl') < 0 && (typeof $.cookie("usrname") === 'undefined' || $.cookie("usrname") === 'null')){
            window.location = "login.html" + window.location.hash;
        }else if($.cookie('apiKey') && $.cookie('apiKey') != null && $.cookie('apiKey') != "null"){

            PusherNotifier(new notificator('releases-updates'), {
                eventName: 'release-updates',
                titleEventProperty: 'title',
                gritterOptions: {sticky:true}
            });

        }else{
            window.location = "login.html" + window.location.hash;
        }



        if( window.location.hash.indexOf('itmhl') >= 0 || window.location.hash.indexOf('ris') >= 0 || window.location.hash.indexOf('planhl') >= 0 || ($.cookie('apiKey') && $.cookie('apiKey') != null && $.cookie('apiKey') != "null")){

            _.each(modules, function(moduleItem){

                if( moduleItem.id == module.moduleId  ){

                    module.checkJQ = function(){
                        if ($){
                            // console.log('cargo')
                        }else{
                            document.location.reload(true);
                        }
                    }

                    if(!module.rendered){
                            module.checkJQ();
                            module.render(queryParam);
                    }else{
                        try{//in case the function refreshRender does not exist at the module
                            module.refreshRender();
                        }catch(e){
                            // console.log(e)
                        }
                    }


                    $(moduleItem.divContainer).show();


                }else{

                    $(moduleItem.divContainer).hide();

                }

            });
        }else{
            window.location = "login.html" + window.location.hash;
        }

    }

    var App = {

        initialize: function(){
            TopMenuView.hotLink = window.location.hash.indexOf('planhl') >= 0 || window.location.hash.indexOf('itmhl') >= 0 || window.location.hash.indexOf('ris') >= 0 ;
            TopMenuView.render();

            this.routePaths();


        },

        routePaths: function(){

            var AppRouter = Backbone.Router.extend({
                routes: {
                    "viewer": "viewer",
                    "sync": "sync",
                    "plan": "plan",
                    "planhl/:iterId": "planhl",
                    "metrics": "metrics",
                    "itmhl/:iterId": "metricshl",
                    "rlsmetrics": "rlsmetrics",
                    "iometricshl/:iterId": "iometricshl",
                    "iometrics": "iometrics",
                    "iometrics/:rlsId": "iometricshl",
                    "suites": "suites",
                    "plugins-settings": "plugins-settings",
                    "interop":"interop",
                    "project":"project",
                    "ris/:iterId":"ris",
                    "*actions": "defaultRoute"
                }
            });

            var app_router = new AppRouter;

            window.App_router = app_router;

            app_router.on('route:defaultRoute', function(actions) {
                loadModule(managerView);
            });

            app_router.on('route:viewer', function(actions) {
                loadModule(managerView);
            });

            app_router.on('route:sync', function(actions) {
                loadModule(syncView);
            });

            app_router.on('route:planhl', function( iterId) {
                loadModule(planView,iterId);
            });

            app_router.on('route:plan', function( actions) {
                loadModule(planView);
            });

            app_router.on('route:metrics', function(actions) {
                loadModule(MetricsView);
            });

            app_router.on('route:metricshl', function(iterId) {
                loadModule(MetricsView,iterId);
            });

            app_router.on('route:iometrics', function(actions) {
                loadModule(InteropMetricsView);
            });
            
            app_router.on('route:iometricshl', function(iterId) {
                loadModule(InteropMetricsView, iterId);
            });

            app_router.on('route:rlsmetrics', function(actions) {
                loadModule(RlsMetricsView);
            });

            app_router.on('route:suites', function(actions) {
                loadModule(SuitesView);
            });

            app_router.on('route:plugins-settings', function(actions) {
                loadModule(PluginsSettingsView);
            });

            app_router.on('route:interop', function(actions) {
                loadModule(InteropView);
            });

            app_router.on('route:project', function(actions) {
                loadModule(ProjectView);
            });

            app_router.on('route:ris', function(iterId) {
                loadModule(ReleaseImplementationView,iterId);
            });

            Backbone.history.start();

        }
    };

    return App;
});