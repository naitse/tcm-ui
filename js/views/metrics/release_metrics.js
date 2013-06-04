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

                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-rls-metrics').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')

        },
        attachEvents: function(){
            var btnGetMetrics = $('#btnGetMetrics');



            var rlsId =  $("#metrics-release-select option:selected").parents('optgroup').attr('rel-id');



            $("#tcRlsMetrics #metricsContainer").hide();

            $("#tcRlsMetrics #metricsProgressBar").show();
            $("#tcRlsMetrics #metricsProgressBar").find(".bar").css("width","10%");


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

                $('#tcRlsMetrics #iterationsTrendContainer').data('data', data);
                renderIterationsTrend();
            });


            $.when( tcmModel.releases.metrics_carried_over(rlsId)).done(function( metrics ){
                if(metrics.length > 0){
                    var categories = new Array();
                    var seriesCarriedOver = new Array();
                    var seriesTotal = new Array();
                    var data = {
                        "categories": "",
                        "data": new Array()
                    }

                    _.each(metrics, function(value, key, list){

                        categories.push(value.name);

                        seriesTotal.push(value.total);
                        seriesCarriedOver.push(value.carried_over);


                    });

                    data.categories = categories;
                    var map = {
                        "name": "total",
                        "data": seriesTotal
                    }

                    data.data.push(map);
                    var map = {
                        "name": "carried over",
                        "data": seriesCarriedOver
                    };

                    data.data.push(map);

                    $('#tcRlsMetrics #carriedOverContainer').data('data', data);
                    renderCarriedOverGraph();
                }

            });

            $("#tcRlsMetrics #metricsProgressBar").hide();

            $("#tcRlsMetrics #metricsContainer").show();
            fixBorder()

        }


    };

    function renderIterationsTrend(){

        var $this = $('#tcRlsMetrics #iterationsTrendContainer');
        var data = $this.data('data')

        $('#tcRlsMetrics #iterationsTrendContainer').highcharts({
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

        var main_graph = $('#tcRlsMetrics .graph-container').find('#container');
        var current_graph = main_graph.children();
        if( $('#tcRlsMetrics .graph-previews').find(chartDiv).size() == 1 ){
            var preview_graph = $('#tcRlsMetrics .graph-previews').find(chartDiv);
            current_graph.html('');
            preview_graph.html('');
            main_graph.append(preview_graph)
            $('#tcRlsMetrics .graph-previews').prepend(current_graph);

            renderIterationsTrend();

            renderCarriedOverGraph();
            fixBorder();
        }else{
            //to prevent focused graph to be removed
        }
    }

    function fixBorder(){
        $('#tcRlsMetrics .main-container #container').children().css({
            'border':'none'
        });
        $('#tcRlsMetrics .graph-previews').children().removeClass('span9');
        $('#tcRlsMetrics .graph-previews .graph').css({
            'border':'1px solid #D4D4D4',
            'margin-bottom':'20px'
        });
    }

    function adjustChartHeight(){

        $('#tcRlsMetrics ').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

        var parentWidth = $('#tcRlsMetrics #metricsContainer').width();
        var parentHeight = $('.tcm-container').height()
        var metrics_controls = $('#tcRlsMetrics #metrics-controls').height();
        var previewsWidth = 420;
        var currentChartWidth = $('#tcRlsMetrics .graph-container').find('#container').children().width();
        var newChartWidth = parentWidth - previewsWidth;
        var newChartHeight = parentHeight - metrics_controls -100;
        $('#tcRlsMetrics .graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
    }

    $(window).resize(function(){

        try{
            $('#tcRlsMetrics').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

            var parentWidth = $('#tcRlsMetrics #metricsContainer').width();
            var parentHeight = $('.tcm-container').height()
            var metrics_controls = $('#tcRlsMetrics #metrics-controls').height();
            var previewsWidth = 420;
            var currentChartWidth = $('#tcRlsMetrics .graph-container').find('#container').children().width();
            var newChartWidth = parentWidth - previewsWidth;
            var newChartHeight = parentHeight - metrics_controls -100;
            $('#tcRlsMetrics .graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
        }catch(err){}
    });

    function renderCarriedOverGraph() {

        var $this = $('#carriedOverContainer');
        var data = $this.data('data')

        $('#carriedOverContainer').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Carried over features'
            },
            xAxis: {
                categories: data.categories
            },
            colors: ['#46ACCA',  '#CD433D'],
            yAxis: {
                min: 0,
                title: {
                    text: 'Features Total'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -100,
                verticalAlign: 'top',
                y: 20,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'
                }
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: data.data
        });

        adjustChartHeight();
    }

    return RlsMetricsView;

});