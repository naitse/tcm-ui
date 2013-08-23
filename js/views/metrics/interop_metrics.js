define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/interop_metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');
        tcsModule = require('modules/tc/tc');
    require('releases_iterations_dd');
    require('releases_dd');
    require('highcharts');
    require('exporting');
    var permalinkIterId = '';
    var iterName = '';
    var iterId;
    var rlsId;
    var rlsName;
    var monitoring_interval = 60000;
    var monitoring = false;
    var chart;
    var series;
    var globalGraph= true;
    var teamLoaded = false;
    var iterationsArray = [];
    var rlsFeatures = false;
    var rlsGlobalGraph = true;


    var InteropMetricsView = {
        moduleId: "InteropMetrics",

        rendered: false,

        render: function(iterIdR){
            if(!this.rendered){

                 var template = $(planTemplate)

                if (typeof iterIdR != 'undefined'){
                    $.cookie('projectId',6)
                    $(template).find('.ior').css('visibility','hidden');
                    $('.tcm-top-menu-container').hide();
                    $(template).find('.permalink').remove();
                    $("#pannel-wrapper").append(template);
                    rlsId = iterIdR
                    this.initialCall(rlsId);
                    $('#InteropMetrics .graph-previews').css('top','-30px');
                        attachEvents();
                }else{

                    $("#pannel-wrapper").append(template);
                    this.loadRlsIter();
                    // this.loadReleases();


                    attachEvents();
                    $('#InteropMetrics .graph-previews').css('top','-30px');

                }
                $('#InteropMetrics #tc-container').css('visibility','hidden');
                adjustChartHeight()
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-metrics').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active');
            adjustChartHeight()
        },
        loadRlsIter: function(){
          tcmModel.releases_iterations.fetch().done(function(data){
                $(data).each(function(){

                    // $(this.iterations).each(function(){
                        var node = $('<li class=""><a href="" data-toggle="tab" iterid="'+this.id+'">'+this.name+'</a></li>').click(function(){
                            rlsId =  $(this).find('a').attr('iterid');
                            rlsName =  $(this).find('a').text();
                            
                            // if(teamLoaded != iterId){
                        InteropMetricsView.initialCall(rlsId);
                        

                        })
                        $('#InteropMetrics .iorls ul').append(node)
                    // })



                })

            })

        },
        // loadRlsIter: function(){

        //   tcmModel.releases_iterations.fetch().done(function(data){
        //         $(data).each(function(){



        //         })

        //     })

        // },
        initialCall:function(rlsId){
                                            InteropMetricsView.loadRlsMetrics(rlsId);
                                tcmModel.releases_iterations.fetch().done(function(data){
                                    $(data).each(function(){
                                        if(this.id == rlsId){
                                            // console.log(this)
                                            $('#InteropMetrics a[href=#report]').css("visibility","visible");
                                            if(this.iterations.length > 0){
                                                $('#InteropMetrics a[href=#xteams]').css("visibility","visible");
                                            }
                                            $('#InteropMetrics .ioteams ul').children().remove();
                                            $(this.iterations).each(function(){

                                                iterationsArray.push(this);
                                                var node = $('<li class=""><a href="#xteams" data-toggle="tab" iterid="'+this.id+'">'+this.name+'</a></li>').click(function(){
                                                    iterId =  $(this).find('a').attr('iterid');
                                                    iterName =  $(this).find('a').text();
                                                    
                                                    if(teamLoaded != iterId){
                                                        InteropMetricsView.loadIterMetrics(0,iterId);
                                                    }

                                                    $('#xteams .btn-pill').css('visibility','visible');
                                                

                                                })
                                                $('#InteropMetrics .ioteams ul').append(node)
                                            })
                                        }
                                    })
                                })
                            // }
                            $('#rlscontrol .btn-pill').css('visibility','visible');
        },
        fetchTCsbyStatus:function(statusName,chartObject){


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

            featureId= chartObject.attr('id')


            if($('#xteams').hasClass('active')){
                if(globalGraph){
                    tcmModel.metrics.getFBTCS(iterId, statusId).done(function(data){
                            processTCstatusInfo(data)
                        });
                }else{
                    console.log(featureId,statusId)
                    tcmModel.metrics.getTcStatusByFeature(featureId, statusId).done(function(data){
                            processTCstatusInfo(data)
                        });
                }
            }else if($('#rlscontrol').hasClass('active')){
                if(rlsGlobalGraph){
                    var releaseId = $('#rlscontrol .dropdown-menu li.active a').attr('iterid');
                    // console.log(releaseId)
                    tcmModel.metrics.getTcStatusByFeatureByRls(rlsId, statusId).done(function(data){
                            processTCstatusInfo(data)
                        });
                }else{
                    tcmModel.metrics.getTcStatusByFeature(featureId, statusId).done(function(data){
                            processTCstatusInfo(data)
                        });
                }
            }
        },
        loadIterFeatureMetrics:function(iterId){
            $('#InteropMetrics #xteams .graph-feature-cont').remove()
            var maincontainer = $('<div class="graph-feature-cont" style="width=100%; height=100%;" />')
            $('#InteropMetrics #xteams .graph-container').append(maincontainer);
           
           tcmModel.releases.iterations.features.fetch(0,iterId).done(function(data){

                $(data).each(function(){
                        featureId= this.featureId
                        var self = this;

                    tcmModel.metrics.executedbyfeature(featureId).done(function(data){
                        var container = $('<div class="graph-feature" style="width=300px; height=200px;" id="'+self.featureId+'" />')

                        $('#InteropMetrics #xteams .graph-feature-cont').append(container);

                        var chartData = new Array();

                        iterName = data[0].iterName

                        delete data[0]['iterName'];
                        _.each(data[0], function(value, key, list){

                            chartData.push(new Array( key, value));
                        });
                        renderExecutionPie(container,chartData)
                    })


                })

            })

        },
        loadIterMetrics: function(rlsId,iterId,monitoring){
            var self = this;
            teamLoaded = iterId;
            $('#InteropMetrics #xteams #global').click()
            $("#InteropMetrics #xteams #alertNoMetrics").addClass('hide');
            $("#InteropMetrics #xteams #metricsContainer").hide();
            $("#InteropMetrics #xteams #loading-indicator").show();


            $('#InteropMetrics #xteams .link-exposer').text('')

            $.when( tcmModel.releases.iterations.metrics_executed(rlsId, iterId),
                    tcmModel.releases.iterations.metrics_dailyexecuted(rlsId, iterId)).done(function( metricsExecuted, metricsDaily ){


                if(metricsExecuted[0].length > 0){
                    var chartData = new Array();

                    iterName = metricsExecuted[0][0].iterName

                    delete metricsExecuted[0][0]['iterName'];
                    _.each(metricsExecuted[0][0], function(value, key, list){

                        chartData.push(new Array( key, value));
                    });


                    $('#xteams #executionContainerr').data('data',chartData);
                    $('#InteropMetrics #xteams .permalink').attr('disabled',false)
                    permalinkIterId = iterId
                    renderExecutionPie($('#xteams #executionContainerr'));
                    if(monitoring == true ){
                        statCheck=setTimeout(function(){InteropMetricsView.loadMetrics(0,iterId);}, monitoring_interval);
                    }
                }

                if(metricsDaily[0].length > 0){
                    var days = new Array();
                    var testcases = new Array();


                    _.each(metricsDaily[0], function(value, key, list){
                        days.push(value.day);
                        testcases.push(value.testcases);
                    });

                    $('#xteams #dailyExecutionContainerr').data('data',[days,testcases]);
                    // $('#dailyExecutionContainer').data('testcases',testcases);

                    renderDailyExec($('#xteams #dailyExecutionContainerr'));
                }

                $("#InteropMetrics #xteams #loading-indicator").hide();
                $("#InteropMetrics #xteams #metricsContainer").show();

                fixBorder();
                adjustChartHeight();
                showPillRefresh('#xteams')
                $("#InteropMetrics #xteams #global").attr('disabled',false);
                $("#InteropMetrics #xteams #byitem").attr('disabled',false);
                $('#InteropMetrics #xteams').data('globalGraph',true)
                $("#InteropMetrics #xteams #refresh-graph").attr('disabled',false);

                
            });

        },
        loadIterFeatureMetricsRls:function(){
            $('#InteropMetrics #rlscontrol .graph-feature-cont').remove()
            var maincontainer = $('<div class="graph-feature-cont rlscontrol" style="width=100%; height=100%;" />')
            $('#InteropMetrics #rlscontrol .graph-container').append(maincontainer);
           $(iterationsArray).each(function(){
            // console.log(this)

               tcmModel.releases.iterations.features.fetch(0,this.id).done(function(data){

                    $(data).each(function(){
                            var featureId= this.featureId
                            var self = this;

                        tcmModel.metrics.executedbyfeature(featureId).done(function(data){
                            var container = $('<div class="graph-feature rlscontrol" style="width=300px; height=200px;" id="'+self.featureId+'" />')
                            // console.log(self, data)
                            $('#InteropMetrics #rlscontrol .graph-feature-cont').append(container);

                            var chartData = new Array();

                            iterName = data[0].iterName

                            delete data[0]['iterName'];
                            _.each(data[0], function(value, key, list){

                                chartData.push(new Array( key, value));
                            });

                            $(container).data('data',chartData)
                            renderExecutionPie(container,chartData)
                        })
                    })
                })



            })

        },
        loadRlsMetrics: function(rlsId,iterId,monitoring){
            var self = this;
            $("#InteropMetrics #rlscontrol #alertNoMetrics").addClass('hide');
            $("#InteropMetrics #rlscontrol #metricsContainer").hide();
            $("#InteropMetrics #rlscontrol #loading-indicator").show();


            $('#InteropMetrics .link-exposer').text('')

            $.when( tcmModel.metrics.metricsExecutedRls(rlsId)
                    /*, tcmModel.releases.iterations.metrics_dailyexecuted(rlsId, iterId)*/).done(function( metricsExecuted/*, metricsDaily*/ ){


                if(metricsExecuted.length > 0){
                    var chartData = new Array();

                    iterName = metricsExecuted[0].iterName

                    delete metricsExecuted[0]['iterName'];
                    _.each(metricsExecuted[0], function(value, key, list){

                        chartData.push(new Array( key, value));
                    });


                    $('#rlscontrol #executionContainerr').data('data',chartData);
                    $('#InteropMetrics #rlscontrol .permalink').attr('disabled',false)
                    permalinkIterId = rlsId
                    renderExecutionPie($('#rlscontrol #executionContainerr'));
                    if(monitoring == true ){
                        statCheck=setTimeout(function(){InteropMetricsView.loadRlsMetrics(0,iterId);}, monitoring_interval);
                    }
                }

                $("#InteropMetrics #rlscontrol #loading-indicator").hide();
                $("#InteropMetrics #rlscontrol #metricsContainer").show();

                fixBorder();
                adjustChartHeight();
                showPillRefresh('#rlscontrol')
                $("#InteropMetrics #rlscontrol #global").attr('disabled',false);
                $("#InteropMetrics #rlscontrol #byitem").attr('disabled',false);
                $('#InteropMetrics #rlscontrol').data('globalGraph',true)
                $("#InteropMetrics #rlscontrol #refresh-graph").attr('disabled',false);

                
            });


                tcmModel.metrics.metricsDailyExecutedRls(rlsId).done(function(data){
                var metricsDaily = data;
                if(metricsDaily.length > 0){
                    var days = new Array();
                    var testcases = new Array();


                    _.each(metricsDaily, function(value, key, list){
                        days.push(value.day);
                        testcases.push(value.testcases);
                    });

                    $('#rlscontrol #dailyExecutionContainerr').data('data',[days,testcases]);
                    // $('#dailyExecutionContainer').data('testcases',testcases);

                    renderDailyExec($('#rlscontrol #dailyExecutionContainerr'));
                }
                })

        }



    };

    function attachEvents(){

        $('#interopTabs a').click(function (e) {
          e.preventDefault();
          $(this).tab('show');
          adjustChartHeight();
        })

        $('#InteropMetrics a[href=#report]').click(function(){
            if($('#InteropMetrics .teams').children().size() > 0){
                return false;
            }
            fillReport();
        });

        $('#InteropMetrics #report #refresh').click(function(){
            $('#InteropMetrics .teams').children().remove();
            fillReport();
        })

        $('#InteropMetrics .permalink').click(function(){
            var wl = window.location;
             var permalink =  wl.protocol + '//' + wl.hostname + wl.pathname + '#iometricshl/'+ permalinkIterId;
             $('#InteropMetrics .link-exposer').text(permalink);
        })

        $('#InteropMetrics .btn-pill div').live({
            click:function(e){
                e.stopPropagation();
                if($(this).hasClass('active')){
                    return false;
                }
                $(this).parent().children('div').toggleClass('active')
            }
        })

        $('#InteropMetrics #xteams #byitem').live({
            click:function(e){
                e.stopPropagation();
                globalGraph = false;
                $('#InteropMetrics #xteams').data('globalGraph',false)
                $('#InteropMetrics #xteams .main-container').hide()
            $('#InteropMetrics #xteams .graph-previews').hide()
                if($('#InteropMetrics #xteams').data('rendered') != true){
                    $('#InteropMetrics #xteams').data('rendered',true)
                    InteropMetricsView.loadIterFeatureMetrics(iterId);
                }else{
                    $('#InteropMetrics #xteams .graph-feature-cont').show()
                }
            }
        })

        $('#InteropMetrics #xteams #global').live({
            click:function(e){
                e.stopPropagation();
                globalGraph = true;
                $('#InteropMetrics #xteams .graph-feature-cont').hide()
                $('#InteropMetrics #xteams').data('globalGraph',true)
                $('#InteropMetrics #xteams .main-container').show()
                $('#InteropMetrics #xteams .graph-previews').show()
                // $('#InteropMetrics #xteams .graph-feature-cont').remove()
            }
        })


        $('#InteropMetrics #xteams #refresh-graph').click(function(){
            var globalGraph = $('#InteropMetrics #xteams').data('globalGraph')
            if(globalGraph){
                InteropMetricsView.loadIterMetrics(0,iterId);
            }else{
                $('#InteropMetrics #xteams .graph-feature-cont').remove()
               InteropMetricsView.loadIterFeatureMetrics(iterId);
            }
        })

       $('#InteropMetrics #rlscontrol #byitem').live({
            click:function(e){
                e.stopPropagation();
                rlsGlobalGraph = false;
                $('#InteropMetrics #rlscontrol .main-container').hide()
                $('#InteropMetrics #rlscontrol .graph-previews').hide()
                if($('#InteropMetrics #rlscontrol').data('rendered') != true){
                    $('#InteropMetrics #rlscontrol').data('rendered',true)
                    InteropMetricsView.loadIterFeatureMetricsRls();
                }else{
                    $('#InteropMetrics #rlscontrol .graph-feature-cont').show()
                }
            }
        })

        $('#InteropMetrics #rlscontrol #global').live({
            click:function(e){
                e.stopPropagation();
                rlsGlobalGraph = true
                $('#InteropMetrics #rlscontrol').data('globalGraph',true)
                $('#InteropMetrics #rlscontrol .graph-feature-cont').hide()
                $('#InteropMetrics #rlscontrol .main-container').show()
                $('#InteropMetrics #rlscontrol .graph-previews').show()
                // $('#InteropMetrics #rlscontrol .graph-feature-cont').remove()
            }
        })


        $('#InteropMetrics #rlscontrol #refresh-graph').click(function(){
            var globalGraph = $('#InteropMetrics #rlscontrol').data('globalGraph')
            if(globalGraph){
                InteropMetricsView.loadRlsMetrics(rlsId);
            }else{
                $('#InteropMetrics #rlscontrol .graph-feature-cont').remove()
               InteropMetricsView.loadIterFeatureMetricsRls();
            }
        })


        $('#info-tc-modal-io .close-info-tc-modal').live({
            click:function(){
                // console.log('the chart container', chart, chart.attr('id'))
                chart.highcharts().series[0].data[chart.data('series')].firePointEvent('click', event);
                $('#info-tc-modal-io').modal('hide')
            }
        })

        $(' #InteropMetrics #feature-filter').live({
          keyup:function() {
            filterFeatures($(this).val());
          }
        });

    }

function showPillRefresh(parent){
    $(parent + ' .btn-pill').last().animate({
        'width': '+=25'
    },function(){
        $(parent + ' #refresh-graph').show()
    })

    // $('.btn-pill div').last().animate({
    //     'margin-left':'16px'
    // })
}

    function fillReport(){


           $(iterationsArray).each(function(){
            // console.log(this)
                var team = $('<div class="team"></div>').attr('id',this.id).append('<div class="team-name">'+this.name+'</div>');

               tcmModel.releases.iterations.features.fetch(0,this.id).done(function(data){

                    $(data).each(function(){
                            var featureId= this.featureId
                            var featureName = this.featureName;
                            var self = this;
                            var feature = $('<div class="team-feature well" id="'+featureId+'"></div>')

                            var featureData = $('<div class="feature-Info"></div>').append('<div class="feature-name">'+featureName+'</div>');

                            tcmModel.releases.iterations.features.executedTestCases.fetch(0, 0, featureId).done(function(data){
                                var data = data[0]
                                $(data).each(function(){
                                    var cellWidth = 100 / parseInt(this.total);

                                    var propgressBar = $('<div class="progress" style="width: 100px; height: 12px; border: 1px solid rgb(108, 120, 133);">')

                                    for(var i=0; i<parseInt(this.pass);i++){
                                        var node = $('<div class="bar bar-success" style="width: '+cellWidth+'%;"></div>')
                                        $(propgressBar).append(node)
                                    }
                                    for(var i=0; i<parseInt(this.blocked);i++){
                                        var node = $('<div class="bar bar-warning" style="width: '+cellWidth+'%;"></div>')
                                        $(propgressBar).append(node)
                                    }
                                    for(var i=0; i<parseInt(this.failed);i++){
                                        var node = $('<div class="bar bar-danger" style="width: '+cellWidth+'%;"></div>')
                                        $(propgressBar).append(node)
                                    }
                                    for(var i=0; i<parseInt(this.inprogress);i++){
                                        var node = $('<div class="bar bar-info" style="width: '+cellWidth+'%;"></div>')
                                        $(propgressBar).append(node)
                                    }
                                    for(var i=0; i<parseInt(this.notrun);i++){
                                        var node = $('<div class="bar bar-notrun" style="width: '+cellWidth+'%;"></div>')
                                        $(propgressBar).append(node)
                                    }

                                    $(featureData).append(propgressBar)
                                    $(feature).append(featureData)
                                })
                                
                                var tcs = $('<div class="report-feature-tcs round-corner-all"></div>');
                                
                                tcmModel.releases.iterations.features.test_cases.fetch(0, 0, featureId).done(function(data){
                                     $(data).each(function(index){

                                        switch(this.statusId)
                                        {
                                            case 0:
                                                statusClass = 'label-inverse'
                                                break;
                                            case 1:
                                                statusClass = 'label-info'
                                                break;
                                            case 2:
                                                statusClass = 'label-warning'
                                                break;
                                            case 3:
                                                statusClass = 'label-important'
                                                break;
                                            case 4:
                                                statusClass = 'label-success'
                                                break;
                                            default:
                                                statusClass = ''
                                        }



                                        var tc = $('<div class="report-tc"></div>').append('<div class="report-tc-name">'+this.name+'</div><div class="report-tc-status"><div class="report-tc-status-inner label '+statusClass+'">'+this.statusName+'</div></div>');
                                        $(tcs).append(tc)
                                        
                                     })
                                })
                                $(feature).append(tcs);
                            })

                            $(team).append(feature)
                    })
                })

                $('#report .teams').append(team);



            })











    }
    function renderExecutionPie(container, dataIN){
        var setSize = (typeof dataIN === 'undefined')? false : true;
        var data = (typeof dataIN === 'undefined')? $(container).data('data') : dataIN;
        var $this = $(container);

        container = $this

        $this.highcharts({
            chart: {
                plotBackgroundColor: null,
                // plotBorderWidth: null,
                // plotShadow: false,
                margin: [40, 0, 0, 0],
                animation:true,
                events: {
                    click: function(event) {
                        // toggleChartFocus($this);
                    }
                }    
            },
            //'[{"Not Run":6,"In Progress":0,"Passed":10,"Failed":0,"Blocked":0}]'
            colors: ['#c6c6c6','#46ACCA', '#5DB95D', '#CD433D', '#FAA328'],
            title: {
                text: iterName
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
                            // return InteropMetricsView.fetchTCsbyStatus(this.x);
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
                                $('#InteropMetrics #tc-container').css('visibility','visible');
                                // console.log(this)
                                $(container).data('series',this.x);
                                $(container).data('name',iterName);

                                chart = $(container);
                                
                                // console.log(chart)

                                $('#info-tc-modal-io #tc-container').children().remove();

                                $('#info-tc-modal-io').find('.feature-title').text($(container).find('.highcharts-title tspan').text() +'  - '+ this.name + ' test cases')
                                // console.log(this,$(container))
                                InteropMetricsView.fetchTCsbyStatus(this.x,chart);
                            },
                            unselect: function() {
                                $('#InteropMetrics #tc-container').children().remove();
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
        })

    if(setSize){
        container.highcharts().setSize(400, 300);
    }
        var sor = $(container).parents('.tab-pane.active').find(".graph-feature-cont");
        $(container).parents('.tab-pane.active').find(".graph-feature-cont .graph-feature").sort(asc_sort).appendTo(sor);
        adjustChartHeight()

    }
    
    //$("#debug").text("Output:");
    // accending sort
    function asc_sort(a, b){
        return ($(b).find('.highcharts-title').text()) < ($(a).find('.highcharts-title').text()) ? 1 : -1;    
    }
    function renderDailyExec(container){

        var $this = $(container);
        var days = $this.data('data')[0];
        var tcs = $this.data('data')[1];

        $(container).highcharts({
            chart: {
                events: {
                    click: function(event) {
                        // toggleChartFocus($this);
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

        var main_graph = $('#InteropMetrics .graph-container').find('#container');
        var current_graph = main_graph.children();
        if( $('#InteropMetrics .graph-previews').find(chartDiv).size() == 1 ){
            var preview_graph = $('#InteropMetrics .graph-previews').find(chartDiv);
            current_graph.html('');
            preview_graph.html('');
            main_graph.append(preview_graph)
            $('#InteropMetrics .graph-previews').prepend(current_graph);
            renderDailyExec();
            renderExecutionPie();

            fixBorder();
            adjustChartHeight();
        }else{
            //to prevent focused graph to be removed
        }
    }

function processTCstatusInfo(data){

                    $('#InteropMetrics #tc-container').children().remove();
                            $('#info-tc-modal-io').modal({
                                  keyboard: false
                                })
                        var cont = $('<div class="tc-pop-info" />')
                        if(data.length > 0){
                            $(data).each(function(){
                                var node = $('<div class="tc-node" />').text(this.name);
                                $(cont).append(node);
                                var tc_html = tcsModule.createTcHTML(this,null,false);
                                $(tc_html).find('.btn-group').remove();
                                $(tc_html).find('.tc-suites').remove();
                                $(tc_html).find('.suites-label').remove();
                                $(tc_html).data('sort',this.statusId);
                                $(tc_html).attr('title',this.name)
                                tcsModule.renderTC(tc_html, '#info-tc-modal-io',false); //REMOVE THE PARSER
                            })
                        }


}

    function fixBorder(){
        $('#InteropMetrics .main-container #container').children().css({
            'border':'none'
        });
        $('#InteropMetrics .graph-previews').children().removeClass('span9');
        $('#InteropMetrics .graph-previews .graph').css({
            'border':'1px solid #D4D4D4',
            'margin-bottom':'20px'
        });
    }

    function adjustChartHeight(){
            $('#InteropMetrics').css('height',($('.tcm-container').height() - 0))

            $('#InteropMetrics .tab-pane').each(function(){

            try{
                var parentWidth = $(this).find('#metricsContainer').width();
                var parentHeight = $('.tcm-container').height()
                var metrics_controls = $(this).find('#metrics-controls').height();
                var previewsWidth = 420;
                var currentChartWidth = $(this).find('.graph-container').find('#container').children().width();
                var newChartWidth = parentWidth - previewsWidth;
                var newChartHeight = parentHeight - metrics_controls -60;
                $(this).find('.graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
                $(this).find('.graph-feature-cont').css('max-height', parentHeight - 60)
                $(this).find('.graph-previews').css('height',parentHeight -20);
                $(this).find('#tc-container').css('height',parentHeight - 280)
                $('#InteropMetrics .teams').css('height',parentHeight - 30)
                $('#InteropMetrics .tab-content').css('height',parentHeight - 20 + 'px')
            }catch(err){}
            
            })
    }

    $(window).resize(adjustChartHeight);

    function filterFeatures(value){
                 $(".highcharts-title tspan").each(function() {
                // If the list item does not contain the text phrase fade it out
                if ($(this).text().search(new RegExp(value, "i")) < 0) {
                    // Show the list item if the phrase matches and increase the count by 1
                    $(this).parents('.graph-feature').fadeOut();
                } 
                else {
                    $(this).parents('.graph-feature').show();
                }
            });
    }


    function positionTCs(){
                    $('#InteropMetrics #tc-container').position({
            my:'center top',
            at:'center bottom',
            of: $('#InteropMetrics .graph-previews'),
            collision: 'fit fit'
            })
    }

    return InteropMetricsView;

});

