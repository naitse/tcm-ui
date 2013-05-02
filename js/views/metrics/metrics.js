define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    require('highcharts');
    require('exporting');

    var MetricsView = {
        moduleId: "Metrics",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);

                this.loadIterations();
                this.attachEvents();
                this.rendered = true;
            }
        },

        loadIterations: function(){

            tcmModel.releases.fetch().done(function(data){

                $('#metrics-release-select').find('optgroup').remove();

                $(data).each(function(){
                    var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id)
                    $(this.iterations).each(function(){
                        var option = $('<option>').attr('value', this.id).text( this.name);
                        $(optionG).append(option);
                    });
                    $('#metrics-release-select').append(optionG)
                });
            });

            //$('#metrics-release-select').chosen();

        },

        attachEvents: function(){
            var btnGetMetrics = $('#btnGetMetrics');

            btnGetMetrics.on('click', function(){
                var iterId =  $("#metrics-release-select option:selected").val();
                var rlsId =  $("#metrics-release-select option:selected").parents('optgroup').attr('rel-id');

                btnGetMetrics.button('loading');
                $("#alertNoMetrics").addClass('hide');
                $("#metricsContainer").hide();

                $("#metricsProgressBar").show();
                $("#metricsProgressBar").find(".bar").css("width","10%");

                $.when( tcmModel.releases.iterations.metrics_executed(rlsId, iterId)).done(function( metrics ){
                    if(metrics.length > 0){
                        var chartData = new Array();

                        _.each(metrics[0], function(value, key, list){


                            chartData.push([ key, value]);

                        });

                        renderExecutionPie(chartData);
                    }

                });

                $("#metricsProgressBar").find(".bar").css("width","50%");


                //$.when(
                    renderDailyExec(['04-30', '05-02'], [17, 24]);
                    renderIterationsTrend();
                //);
                $('.carousel').each(function(){
                    $(this).carousel({
                        interval: false
                    });
                });

                $("#metricsProgressBar").hide();
                btnGetMetrics.button('reset');
                $("#metricsContainer").show();
            });
        }

    };

    function renderIterationsTrend(){
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

    function renderExecutionPie(data){
        $('#executionContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                margin: [40, 0, 0, 0]
            },
            title: {
                text: 'Test plan execution'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Test Cases',
                data: data
            }]
        });
    }

    function renderDailyExec(categories, data){
        $('#dailyExecutionContainer').highcharts({
            chart: {
                type: 'line',
                margin: [40, 0, 0, 0]

            },
            title: {
                text: 'Daily Execution',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Test Cases'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100,
                borderWidth: 0
            },
            series: [{
                name: 'Amount',
                data: data
            }]
        });
    }

    return MetricsView;

});