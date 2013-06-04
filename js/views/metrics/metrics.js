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
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-metrics').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active');
            adjustChartHeight()
        },

        loadIterations: function(){

           $('#tcMetrics #metrics-release-select').releases_iterations_dd();

        },

        attachEvents: function(){
            var btnGetMetrics = $('#tcMetrics #btnGetMetrics');

            btnGetMetrics.on('click', function(){
                var iterId =  $("#tcMetrics #metrics-release-select option:selected").val();
                var rlsId =  $("#tcMetrics #metrics-release-select option:selected").parents('optgroup').attr('rel-id');

                btnGetMetrics.button('loading');
                $("#tcMetrics #alertNoMetrics").addClass('hide');
                $("#tcMetrics #metricsContainer").hide();

                $("#tcMetrics #metricsProgressBar").show();
                $("#tcMetrics #metricsProgressBar").find(".bar").css("width","10%");


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

                $("#tcMetrics #metricsProgressBar").find(".bar").css("width","50%");

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


                $("#tcMetrics #metricsProgressBar").hide();
                btnGetMetrics.button('reset');
                $("#tcMetrics #metricsContainer").show();
                fixBorder()
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
            //'[{"Not Run":6,"In Progress":0,"Passed":10,"Failed":0,"Blocked":0}]'
            colors: ['#c6c6c6','#46ACCA', '#5DB95D', '#CD433D', '#FAA328'],
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

    function toggleChartFocus(chartDiv){

        var main_graph = $('#tcMetrics .graph-container').find('#container');
        var current_graph = main_graph.children();
        if( $('#tcMetrics .graph-previews').find(chartDiv).size() == 1 ){
            var preview_graph = $('#tcMetrics .graph-previews').find(chartDiv);
            current_graph.html('');
            preview_graph.html('');
            main_graph.append(preview_graph)
            $('#tcMetrics .graph-previews').prepend(current_graph);
            renderDailyExec();
            renderExecutionPie();

            fixBorder();
        }else{
            //to prevent focused graph to be removed
        }
    }

    function fixBorder(){
        $('#tcMetrics .main-container #container').children().css({
            'border':'none'
        });
        $('#tcMetrics .graph-previews').children().removeClass('span9');
        $('#tcMetrics .graph-previews .graph').css({
            'border':'1px solid #D4D4D4',
            'margin-bottom':'20px'
        });
    }

    function adjustChartHeight(){

        try{
            $('#tcMetrics').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

            var parentWidth = $('#tcMetrics #metricsContainer').width();
            var parentHeight = $('.tcm-container').height()
            var metrics_controls = $('#tcMetrics #metrics-controls').height();
            var previewsWidth = 420;
            var currentChartWidth = $('#tcMetrics .graph-container').find('#container').children().width();
            var newChartWidth = parentWidth - previewsWidth;
            var newChartHeight = parentHeight - metrics_controls -100;
            $('#tcMetrics .graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
        }catch(err){}
    }

    $(window).resize(adjustChartHeight);


    return MetricsView;

});

