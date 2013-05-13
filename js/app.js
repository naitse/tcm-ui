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
    'views/suites/suites',
    'tcm2',
    'backbone',
    'jquery.cookie'

], function($, _, TopMenuView, managerView, syncView, planView, MetricsView, RlsMetricsView, SuitesView){



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
            'id': 'Suites',
            'divContainer': '#suitesViewer'
        }

    ];

    function loadModule(module){


        if($.cookie('apiKey')){

            _.each(modules, function(moduleItem){

                if( moduleItem.id == module.moduleId  ){

                    if(!module.rendered){
                       module.render();
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

            TopMenuView.render();

            managerView.render();

            this.routePaths();


        },

        routePaths: function(){

            var AppRouter = Backbone.Router.extend({
                routes: {
                    "sync": "sync",
                    "plan": "plan",
                    "metrics": "metrics",
                    "rlsmetrics": "rlsmetrics",
                    "suites": "suites",
                    "*actions": "defaultRoute"
                }
            });

            var app_router = new AppRouter;

            app_router.on('route:defaultRoute', function(actions) {
                loadModule(managerView);
            });

            app_router.on('route:sync', function(actions) {
                loadModule(syncView);
            });

            app_router.on('route:plan', function(actions) {
                loadModule(planView);
            });

            app_router.on('route:metrics', function(actions) {
                loadModule(MetricsView);
            });

            app_router.on('route:rlsmetrics', function(actions) {
                loadModule(RlsMetricsView);
            });

            app_router.on('route:suites', function(actions) {
                loadModule(SuitesView);
            });

            Backbone.history.start();

        }
    };

    return App;
});