define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');
    var dd = require('releases_iterations_dd');
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

           $('#metrics-release-select').releases_iterations_dd();

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

                        $('#executionContainer').data('data',chartData);

                        renderExecutionPie();
                    }

                });

                $("#metricsProgressBar").find(".bar").css("width","50%");

                $.when( tcmModel.releases.iterations.metrics_dailyexecuted(rlsId, iterId)).done(function( metrics ){
                    if(metrics.length > 0){
                        var days = new Array();
                        var testcases = new Array();


                        _.each(metrics, function(value, key, list){
                            days.push(value.day);
                            testcases.push(value.testcases);
                        });

                        $('#dailyExecutionContainer').data('data',[days,testcases]);
                        // $('#dailyExecutionContainer').data('testcases',testcases);

                        renderDailyExec();
                    }

                });

                $.when(tcmModel.releases.metrics_iter_trend('4')).done(function(metrics){

                    var data = {
                        categories: new Array(),
                        blocked: new Array(),
                        failed: new Array(),
                        passed: new Array(),
                        notrun: new Array(),
                        inprogress: new Array()
                    }

                    _.each(metrics, function(value, key, list){
                        data.categories.push(value.name);
                        data.blocked.push(value.Blocked);
                        data.failed.push(value.Failed);
                        data.passed.push(value.Passed);
                        data.notrun.push(value.notrun);
                        data.inprogress.push(value.inprogress);
                    });

                    $('#iterationsTrendContainer').data('data', data);
                    renderIterationsTrend();
                });

                $("#metricsProgressBar").hide();
                btnGetMetrics.button('reset');
                $("#metricsContainer").show();
            });
        }

    };

    function renderExecutionPie(data){

        var data = $('#executionContainer').data('data');
        var $this = $('#executionContainer');
        
        $('#executionContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                // plotBorderWidth: null,
                // plotShadow: false,
                margin: [40, 0, 0, 0],
                events: {
                    click: function(event) {
                        toggleChartFocus($this);
                    }
                }    
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
        
        adjustChartHeight()

    }

    function renderDailyExec(days, tcs){

        var $this = $('#dailyExecutionContainer');
        var days = $this.data('data')[0];
        var tcs = $this.data('data')[1];

        $('#dailyExecutionContainer').highcharts({
            chart: {
                events: {
                    click: function(event) {
                        toggleChartFocus($this);
                    }
                }      
            },
             title: {
                text: 'Daily Execution',
                x: -20 //center
            },
            xAxis: {
                categories: days,
                title: {
                    text: 'Days'
                }
            },
            yAxis: {
                title: {
                    text: 'Test Cases'
                }
            },
            series: [{
                showInLegend: false,
                data: tcs
            }]
        });
    }

    function renderIterationsTrend(){

        var $this = $('#iterationsTrendContainer');
        var data = $this.data('data')

        $('#iterationsTrendContainer').highcharts({
            chart: {
                type: 'column',
                events: {
                click: function(event) {
                    toggleChartFocus($this);
                    }
                }
            },
            title: {
                text: 'Iterations Test Case Execution Trend'
            },
            subtitle: {
                text: 'by status'
            },
            xAxis: {
                categories: data.categories
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
                data: data.blocked

            }, {
                name: 'Failed',
                data: data.failed

            }, {
                name: 'Passed',
                data: data.passed

            }, {
                name: 'Not Run',
                data: data.notrun

            },
                {
                    name: 'In Progress',
                    data: data.inprogress

                }
            ]
        });

    }

    function toggleChartFocus(chartDiv){

        var main_graph = $('.graph-container').find('#container');
        var current_graph = main_graph.children();
        if( $('.graph-previews').find(chartDiv).size() == 1 ){
            var preview_graph = $('.graph-previews').find(chartDiv);
            current_graph.html('');
            preview_graph.html('');
            main_graph.append(preview_graph)
            $('.graph-previews').prepend(current_graph);
            renderDailyExec();
            renderIterationsTrend();
            renderExecutionPie();
        }else{
            //to prevent focused graph to be removed
        }
    }

    function adjustChartHeight(){

        $('#tcMetrics').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

        var parentWidth = $('#metricsContainer').width();
        var parentHeight = $('.tcm-container').height()
        var metrics_controls = $('#metrics-controls').height();
        var previewsWidth = 420;
        var currentChartWidth = $('.graph-container').find('#container').children().width();
        var newChartWidth = parentWidth - previewsWidth;
        var newChartHeight = parentHeight - metrics_controls -100;
        $('.graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
    }

    $(window).resize(function(){

        try{
            $('#tcMetrics').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

        var parentWidth = $('#metricsContainer').width();
        var parentHeight = $('.tcm-container').height()
        var metrics_controls = $('#metrics-controls').height();
        var previewsWidth = 420;
        var currentChartWidth = $('.graph-container').find('#container').children().width();
        var newChartWidth = parentWidth - previewsWidth;
        var newChartHeight = parentHeight - metrics_controls -100;
        $('.graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
    }catch(err){}
    });

    return MetricsView;

});

