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
    'routerjs'

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



    var routerjs = new Router();

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

            if(window.location.hash.indexOf("#sync") != -1 ){
                loadModule(syncView);
            }else if(window.location.hash.indexOf("#viewer") != -1){
                loadModule(managerView);
            }else if(window.location.hash.indexOf("#plan") != -1){
                loadModule(planView);
            }else if(window.location.hash.indexOf("#metrics") != -1){
                loadModule(MetricsView);
            }else if(window.location.hash.indexOf("#rlsmetrics") != -1){
                loadModule(RlsMetricsView);
                RlsMetricsView.generateGraph();
            }
        },

        routePaths: function(){

            routerjs.route('/viewer', function(){
                loadModule(managerView);
            });

            routerjs.route('/sync', function(){
                loadModule(syncView);
            });

            routerjs.route('/plan', function(){
                loadModule(planView);
            });

            routerjs.route('/metrics', function(){
                loadModule(MetricsView);
            });

            routerjs.route('/rlsmetrics', function(){
                loadModule(RlsMetricsView);
                RlsMetricsView.generateGraph();
            });
           /*
            routerjs.route('/', function(){
                loadModule(managerView);
            });*/
        }
    };

    return App;
});