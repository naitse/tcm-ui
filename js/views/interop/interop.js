define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/interop/interop.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
        sprint = require('modules/sprint/sprint'),
        styles = require('text!templates/interop/style'),
        pV = "#interOp";
        _ = require('underscore');


    var InteropView = {
        moduleId: "Interop",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);

                this.loadIterations();
                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-interop').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        refreshRender:function () {
            $(pV + ' .time-line').remove();

            tcmModel.project.configuration.fetch().done(function(data){
                if(data.length > 0){
                    sprint.render(sprint.create(data[0].springIterations,data[0].iterationDuration,{"year":2013,"month":5,"day":10}),'#interOp')//,'90%',120);
                }
            });

            tcmModel.suites.source(1).done(function(data){
                if(data.length > 0){

                    tcmModel.suites.testcases.fetch(parseInt(data[0].id)).done(function(data){
                        $(pV + ' .suite-tcs').children().remove();
                        $(data).each(function(){
                            var tc_html = tcsModule.createTcHTML(this,null,false);
                            tcsModule.renderTC(tc_html, '#interOp'); //REMOVE THE PARSER
                        })
                    });
                }
            });
        },

        loadIterations: function(){

            tcmModel.project.configuration.fetch().done(function(data){
                if(data.length > 0){
                    sprint.render(sprint.create(data[0].springIterations,data[0].iterationDuration,{"year":2013,"month":5,"day":10}),'#interOp')//,'90%',120);
                }
            });

            tcmModel.suites.source(1).done(function(data){
                if(data.length > 0){

                    tcmModel.suites.testcases.fetch(parseInt(data[0].id)).done(function(data){
                        $(pV + ' .suite-tcs').children().remove();
                        $(data).each(function(){
                            var tc_html = tcsModule.createTcHTML(this,null,false);
                            tcsModule.renderTC(tc_html, '#interOp'); //REMOVE THE PARSER
                        })
                    });
                }
            });
            // sprint.render(sprint.create(2,1,{"year":2013,"month":5,"day":3}),'#interOp')//,'90%',120);

        },

        attachEvents: function(){
                
        }

    };


    function adjustTabtHeight(){

        // $('.tab-content').css('height',(($('.tcm-container').height() - $('#plan-controls').height() - $('#tcPlan .nav-tabs').height() - 70)*100)/$('.tcm-container').height()+'%')
    }

    $(window).resize(function(){

    //     try{
    // $('.tab-content').css('height',(($('.tcm-container').height() - $('#plan-controls').height() - $('#tcPlan .nav-tabs').height() - 70)*100)/$('.tcm-container').height()+'%')
    //     }catch(err){}
    });

    function attachStyles(){

        $('body').append($(styles));

    }


    attachStyles();

    return InteropView;

});