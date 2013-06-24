define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/plan/plan.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    var PlanView = {
        moduleId: "Plan",

        rendered: false,


        render: function(iterId){
            if(!this.rendered){

                var template = $(planTemplate)

                if (typeof iterId != 'undefined'){
                    $(template).find('#plan-controls').remove();
                    $("#pannel-wrapper").append(template);
                    fetch(0, iterId)
                }else{

                    $("#pannel-wrapper").append(template);
                    this.loadIterations();
                }



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
                
                fetch(rlsId, iterId)

            });

        }

    };

    function fetch(rlsId, iterId){

               
                var planGridContainer  = $('#planGridContainer');
                var planSummaryBody = $("#plan-summary-table-body");

                planGridContainer.empty();
                planSummaryBody.empty();

                $.when( tcmModel.releases.iterations.plan(rlsId, iterId) ).done( function(coverageData){

                    $("#planProgressBar").find(".bar").css("width","30%");

                    if(coverageData.length > 0){
                        var group = $('<div  class="accordion-group"/>');

                        _.each(coverageData, function (ftr) {
                            var row = $('<tr style=" cursor: pointer; "></tr>').attr("feature-id",ftr.jiraKey);

                            row.append("<td>"+ftr.jiraKey+"</td>");
                            row.append("<td>"+ftr.name+"</td>");
                            row.append("<td>"+ftr.testCase.length+"</td>");

                            // Test cases
                            var tcRow = $('<tr style="display:none; "></tr>').addClass('tc-row').attr("feature-id",ftr.jiraKey);
                            var tcTd = $('<td colspan="3" style=" padding-left: 30px; " ></td>').addClass('plan-tc-td');

                            _.each(ftr.testCase, function(testItem){


                                tcTd.append($("<div>" + testItem.name + "</dicv>"));


                            });

                            $(tcRow).append(tcTd);

                            $(row).on({
                                click:function(e){
                                    e.stopPropagation();
                                    if($(this).parents('tbody').find('.tc-row[feature-id='+$(this).attr("feature-id")+']').hasClass('exp')){
                                        $(this).children().first().removeClass('active');
                                        $(this).parents('tbody').find('.tc-row[feature-id='+$(this).attr("feature-id")+']').stop(true,true).hide('fast');
                                        $(this).parents('tbody').find('.tc-row[feature-id='+$(this).attr("feature-id")+']').removeClass('exp')

                                    }else{
                                        $(this).children().first().addClass('active');
                                        $(this).parents('tbody').find('.tc-row[feature-id='+$(this).attr("feature-id")+']').addClass('exp');
                                        $(this).parents('tbody').find('.tc-row[feature-id='+$(this).attr("feature-id")+']').stop(true,true).show('fast');                                        
                                    }
                                }
                            })    

                            planSummaryBody.append(row,tcRow);
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
    }

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