define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/release_metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    require('highcharts');
    require('exporting');

    var RlsMetricsView = {
        moduleId: "RlsMetrics",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);


                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-rls-metrics').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        generateGraph: function(){
                console.log("hola");
            $('#iterationsTrendContainer').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Iterations Test Case Execution Tren'
                },
                subtitle: {
                    text: 'by status'
                },
                xAxis: {
                    categories: [
                        'Iter 13',
                        'Iter 14',
                        'Iter 15',
                        'Iter 16'
                    ]
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Test Cases'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Blocked',
                    data: [2, 0, 1, 0]

                }, {
                    name: 'Failed',
                    data: [3,0,6,0]

                }, {
                    name: 'Passed',
                    data: [0,0,19,0]

                }, {
                    name: 'Not Run',
                    data: [1, 0, 59, 0]

                },
                    {
                        name: 'In Progress',
                        data: [3, 0, 0, 0]

                    }
                ]
            });
        }

    };

    return RlsMetricsView;

});