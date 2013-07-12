define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');
        tcsModule = require('modules/tc/tc');
    var dd = require('releases_iterations_dd');
    require('highcharts');
    require('exporting');
    var permalinkIterId = '';
    var iterName = '';
    var monitoring_interval = 60000;
    var monitoring = false;

    var MetricsView = {
        moduleId: "Metrics",

        rendered: false,

        render: function(iterId){
            if(!this.rendered){

                 var template = $(planTemplate)

                if (typeof iterId != 'undefined'){
                    $(template).find('#metrics-controls').hide();
                    $(template).find('.permalink').remove();
                    $("#pannel-wrapper").append(template);
                    $('#tcMetrics #metrics-release-select').releases_iterations_dd(null,function(){
                        iterName = $('#tcMetrics #metrics-release-select option[value='+iterId+']').text();
                        MetricsView.loadMetrics(0,iterId,false);
                        $('#tcMetrics .graph-previews').css('top','-36px');
                    })
                }else{

                    $("#pannel-wrapper").append(template);
                    this.loadIterations();


                    attachEvents();
                    $('#tcMetrics .graph-previews').css('top','-114px');

                }
                $('#tcMetrics #tc-container').css('visibility','hidden');
                adjustChartHeight()
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-metrics').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active');
            adjustChartHeight()
        },

        loadIterations: function(){

           $('#tcMetrics #metrics-release-select').releases_iterations_dd(function(){
                var iterId =  $("#tcMetrics #metrics-release-select option:selected").val();
                iterName =  $("#tcMetrics #metrics-release-select option:selected").text();

                MetricsView.loadMetrics(0,iterId);

           },function(){
                $('#metrics_release_select_chzn .chzn-drop').css('left',0)
                $('#metrics_release_select_chzn .group-result').show()
           })

        },
        fetchTCsbyStatus:function(statusName){


            switch(statusName)
            {
                case 0:
                    statusId = 0
                    break;
                case 1:
                    statusId = 1
                    break;
                case 2:
                    statusId = 4
                    break;
                case 3:
                    statusId = 3
                    break;
                case 4:
                    statusId = 2
                    break;
                default:
                    statusId = 3
            }

            tcmModel.metrics.getFBTCS(permalinkIterId, statusId).done(function(data){
            $('#tcMetrics #tc-container').children().remove();
                if(data.length > 0){
                    $(data).each(function(){
                        var tc_html = tcsModule.createTcHTML(this,null,false);
                        $(tc_html).find('.btn-group').remove();
                        $(tc_html).find('.tc-suites').remove();
                        $(tc_html).find('.suites-label').remove();
                        $(tc_html).data('sort',this.statusId);
                        $(tc_html).attr('title',this.name)
                        // if(this.statusId == 2){
                        //     $(tc_html).find('.detailsIcon').addClass('blocked');
                        // }else {
                        //     $(tc_html).find('.detailsIcon').addClass('fail');
                        // }
                        tcsModule.renderTC(tc_html, '#tcMetrics',false); //REMOVE THE PARSER
                    })
                    $('#tcMetrics #tc-container > div').each(function () {
                        if($(this).data('sort') == 3){
                            $('#tcMetrics #tc-container').prepend(this)}
                    })
                }
            });
        },
        loadMetrics: function(rlsId,iterId,monitoring){
            var self = this;
            $("#tcMetrics #alertNoMetrics").addClass('hide');
            $("#tcMetrics #metricsContainer").hide();
            $("#tcMetrics #loading-indicator").show();

            $('#tcMetrics .link-exposer').text('')

            $.when( tcmModel.releases.iterations.metrics_executed(rlsId, iterId),
                    tcmModel.releases.iterations.metrics_dailyexecuted(rlsId, iterId)).done(function( metricsExecuted, metricsDaily ){


                if(metricsExecuted[0].length > 0){
                    var chartData = new Array();


                    _.each(metricsExecuted[0][0], function(value, key, list){

                        chartData.push(new Array( key, value));
                    });


                    $('#executionContainer').data('data',chartData);
                    $('#tcMetrics .permalink').attr('disabled',false)
                    permalinkIterId = iterId
                    renderExecutionPie();
                    if(monitoring == true ){
                        statCheck=setTimeout(function(){MetricsView.loadMetrics(0,iterId);}, monitoring_interval);
                    }
                }

                if(metricsDaily[0].length > 0){
                    var days = new Array();
                    var testcases = new Array();


                    _.each(metricsDaily[0], function(value, key, list){
                        days.push(value.day);
                        testcases.push(value.testcases);
                    });

                    $('#dailyExecutionContainer').data('data',[days,testcases]);
                    // $('#dailyExecutionContainer').data('testcases',testcases);

                    renderDailyExec();
                }

                $("#tcMetrics #loading-indicator").hide();
                $("#tcMetrics #metricsContainer").show();

                fixBorder();
                adjustChartHeight();
            });

        }
    };

    function attachEvents(){
        $('#tcMetrics .permalink').click(function(){
            var wl = window.location;
             var permalink =  wl.protocol + '//' + wl.hostname + wl.pathname + '#itmhl/'+ permalinkIterId;
             $('#tcMetrics .link-exposer').text(permalink);
        })
    }

    function renderExecutionPie(data){

        var data = $('#executionContainer').data('data');
        var $this = $('#executionContainer');


        $('#executionContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                // plotBorderWidth: null,
                // plotShadow: false,
                margin: [40, 0, 0, 0],
                animation:true,
                events: {
                    click: function(event) {
                        toggleChartFocus($this);
                    }
                }    
            },
            //'[{"Not Run":6,"In Progress":0,"Passed":10,"Failed":0,"Blocked":0}]'
            colors: ['#c6c6c6','#46ACCA', '#5DB95D', '#CD433D', '#FAA328'],
            title: {
                text: 'Test plan execution of ' + iterName
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
                },
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    point: {
                        events: {
                            select: function() {
                                $('#tcMetrics #tc-container').css('visibility','visible');
                                MetricsView.fetchTCsbyStatus(this.x);
                            },
                            unselect: function() {
                                $('#tcMetrics #tc-container').children().remove();
                            }
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
        
        //adjustChartHeight()

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
            adjustChartHeight();
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
            $('#tcMetrics .graph-previews').css('height',parentHeight -20);
            $('#tcMetrics #tc-container').css('height',parentHeight - 280)

        }catch(err){}
    }

    $(window).resize(adjustChartHeight);

    function positionTCs(){
                    $('#tcMetrics #tc-container').position({
            my:'center top',
            at:'center bottom',
            of: $('#tcMetrics .graph-previews'),
            collision: 'fit fit'
            })
    }

    return MetricsView;

});

