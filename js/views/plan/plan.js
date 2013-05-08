define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/plan/plan.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    var PlanView = {
        moduleId: "Plan",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);

                this.loadIterations();
                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-plan').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        loadIterations: function(){

            $('#plan-release-select').releases_iterations_dd();
        },

        attachEvents: function(){

                $("#btnGetPlan").on('click', function(){
                $('#btnGetPlan').button('loading');
                $("#alertNoPlanfound").addClass('hide');
                $("#planContainer").hide();
                $("#planProgressBar").show()
                $("#planProgressBar").find(".bar").css("width","10%");

                var iterId =  $("#plan-release-select option:selected").val();
                var rlsId =  $("#plan-release-select option:selected").parents('optgroup').attr('rel-id');
                var planGridContainer  = $('#planGridContainer');
                var planSummaryBody = $("#plan-summary-table-body");

                planGridContainer.empty();
                planSummaryBody.empty();

                $.when( tcmModel.releases.iterations.plan(rlsId, iterId) ).done( function(coverageData){

                    $("#planProgressBar").find(".bar").css("width","30%");

                    if(coverageData.length > 0){
                        var group = $('<div  class="accordion-group"/>');

                        // Feature
                        _.each(coverageData, function (ftr) {

                            var groupHeader = $('<div class="accordion-heading"></div>')
                            groupHeader.append($('<a class="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion'+ ftr.jiraKey +'" href="#collapse'+ ftr.jiraKey +'">' + ftr.jiraKey + '</a>'));
                            group.append(groupHeader);

                            var testsCollapsable = $('<div id="collapse' + ftr.jiraKey + '" class="accordion-body collapse"><div class="accordion-inner"/></div></div>');
                            // Test cases
                            _.each(ftr.testCase, function(testItem){


                                testsCollapsable.find(".accordion-inner").append($("<div>" + testItem.name + "</dicv>"));


                            });
                            group.append(testsCollapsable);
                        });

                        $("#planProgressBar").find(".bar").css("width","70%");

                        planGridContainer.append(group);

                        _.each(coverageData, function (ftr) {
                            var row = $("<tr></tr>");

                            row.append("<td>"+ftr.jiraKey+"</td>");
                            row.append("<td>"+ftr.name+"</td>");
                            row.append("<td>"+ftr.testCase.length+"</td>");

                            planSummaryBody.append(row);
                        });

                        $("#planProgressBar").hide();
                        $("#planContainer").show();

                    }else{
                        $("#alertNoPlanfound").removeClass('hide');
                        $("#planProgressBar").hide();
                    }

                    $('#btnGetPlan').button('reset');
                    adjustTabtHeight()
                 });

            });

        }

    };

    function adjustTabtHeight(){

        $('.tab-content').css('height',(($('.tcm-container').height() - $('#plan-controls').height() - $('#tcPlan .nav-tabs').height() - 70)*100)/$('.tcm-container').height()+'%')
    }

    $(window).resize(function(){

        try{
$('.tab-content').css('height',(($('.tcm-container').height() - $('#plan-controls').height() - $('#tcPlan .nav-tabs').height() - 70)*100)/$('.tcm-container').height()+'%')
        }catch(err){}
    });

    return PlanView;

});