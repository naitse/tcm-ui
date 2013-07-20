define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/ris/ris.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
        global = require('global'),
        // sprint = require('modules/sprint/sprint'),
        styles = require('text!templates/ris/style'),
        pV = "#ReleaseImplementation";
        _ = require('underscore');
        monitoring_interval = 15000;
        var statCheck;
            require('highcharts');
    require('exporting');


    var InteropView = {
        moduleId: "ReleaseImplementation",

        rendered: false,


        render: function(iterId){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);
                var self =this
                self.loadIterations(iterId);
                

                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-interop').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        
        loadIterations: function(iterId){

            // renderProjectBar();
                var self =this
                    tcmModel.ris.fetch(parseInt(iterId)).done(function(data){
                        $(pV + ' .suite-tcs').children().remove();
                        if(data.length > 0){
                        $(data).each(function(){
                            var tc_html = tcsModule.createTcHTML(this,null,false);
                            $(tc_html).find('.btn-group').remove();
                            $(tc_html).find('.tc-suites').remove();
                            $(tc_html).find('.suites-label').remove();
                            tcsModule.renderTC(tc_html, '#ReleaseImplementation',false); //REMOVE THE PARSER
                        })
                        }
                            statCheck=setTimeout(function(){self.loadIterations(iterId);}, monitoring_interval);
                    }).fail(function(){
                        clearTimeout(statCheck)
                    });

                $.when( tcmModel.releases.iterations.metrics_executed(0, iterId)).done(function( metrics ){
                    if(metrics.length > 0){
                        var chartData = new Array();

                        // iterName = data[0].iterName

                        delete metrics[0]['iterName'];
       
                        _.each(metrics[0], function(value, key, list){

                            chartData.push([ key, value]);

                        });

                        $('#ReleaseImplementation #executionContainer').data('data',chartData);

                        renderExecutionPie();
                        adjustChartHeight()
                    }

                });

            // sprint.render(sprint.create(2,1,{"year":2013,"month":5,"day":3}),'#interOp')//,'90%',120);

        },

        attachEvents: function(){
                
        }

    };


    function renderExecutionPie(data){

        var data = $('#ReleaseImplementation #executionContainer').data('data');
        var $this = $('#ReleaseImplementation #executionContainer');
        
        $('#executionContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                // plotBorderWidth: null,
                // plotShadow: false,
                margin: [40, 0, 0, 0],
                animation:false,
                events: {
                    click: function(event) {
                        // toggleChartFocus($this);
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
                    enabled: false,
                            formatter: function () {
                                return Math.round(this.percentage * 100) / 100 + ' %';
                            },
                            color: 'black',
                            distance: -30,
                            style:{
                                fontSize:20
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
    // function renderProjectBar(){
    //         var currentR = {
    //               year:global.project.config.currentrelease.split('/')[0],
    //               month:global.project.config.currentrelease.split('/')[1],
    //               day:global.project.config.currentrelease.split('/')[2],
    //             }

    //         sprint.render(sprint.create(global.project.config.springIterations,global.project.config.iterationDuration,currentR),'#interOp')//,'90%',120);
    // }

    function adjustChartHeight(){

        try{
            $('#ReleaseImplementation').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

            var parentWidth = $('#ReleaseImplementation #metricsContainer').width();
            var parentHeight = $('.tcm-container').height()
            var previewsWidth = 0;
            var currentChartWidth = $('#ReleaseImplementation .graph-container').find('#container').children().width();
            var newChartWidth = parentWidth - previewsWidth;
            var newChartHeight = parentHeight -100;
            $('#ReleaseImplementation .graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
        }catch(err){}
    }

    $(window).resize(adjustChartHeight);

    function attachStyles(){
        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "ReleaseImplementation"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }

    }


    attachStyles();

    return InteropView;

});