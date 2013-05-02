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
    'tcm2',
    'backbone'

], function($, _, TopMenuView, managerView, syncView, planView, MetricsView, RlsMetricsView){

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
        }

    ]

    function loadModule(module){

        _.each(modules, function(moduleItem){

            if( moduleItem.id == module.moduleId  ){

                $(moduleItem.divContainer).show();
                //console.log("show", moduleItem);

            }else{
                //console.log("hide", moduleItem);
                $(moduleItem.divContainer).hide();

            }

        });

    }

    var App = {

        initialize: function(){

            TopMenuView.render();

            managerView.render();
            syncView.render();
            planView.render()
            MetricsView.render();
            RlsMetricsView.render();

            this.routePaths();


        },

        routePaths: function(){

            var AppRouter = Backbone.Router.extend({
                routes: {
                    "sync": "sync",
                    "plan": "plan",
                    "metrics": "metrics",
                    "rlsmetrics": "rlsmetrics",
                    "*actions": "defaultRoute"
                }
            });
            // Initiate the router
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


            Backbone.history.start();

        }
    };

    return App;
});