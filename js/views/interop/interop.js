define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/interop/interop.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
        global = require('global'),
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

            renderProjectBar()

            tcmModel.suites.source(1).done(function(data){
                if(data.length > 0){

                    tcmModel.suites.testcases.fetch(parseInt(data[0].id)).done(function(data){
                        $(pV + ' .suite-tcs').children().remove();
                        $(data).each(function(){
                            var tc_html = tcsModule.createTcHTML(this,null,false);
                            $(tc_html).find('.btn-group').remove();
                            $(tc_html).find('.tc-suites').remove();
                            $(tc_html).find('.suites-label').remove();
                            tcsModule.renderTC(tc_html, '#interOp'); //REMOVE THE PARSER
                        })
                    });
                }
            });
        },

        loadIterations: function(){

            renderProjectBar();

            tcmModel.suites.source(1).done(function(data){
                if(data.length > 0){

                    tcmModel.suites.testcases.fetch(parseInt(data[0].id)).done(function(data){
                        $(pV + ' .suite-tcs').children().remove();
                        $(data).each(function(){
                            var tc_html = tcsModule.createTcHTML(this,null,false);
                            $(tc_html).find('.btn-group').remove();
                            $(tc_html).find('.tc-suites').remove();
                            $(tc_html).find('.suites-label').remove();
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

    function renderProjectBar(){
            var currentR = {
                  year:global.project.config.currentrelease.split('/')[0],
                  month:global.project.config.currentrelease.split('/')[1],
                  day:global.project.config.currentrelease.split('/')[2],
                }

            sprint.render(sprint.create(global.project.config.springIterations,global.project.config.iterationDuration,currentR),'#interOp')//,'90%',120);
    }

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