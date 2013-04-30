define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/plan/plan.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore'),
        ddReleases = require('ddReleases');


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
        },

        loadIterations: function(){

            tcmModel.releases.fetch().done(function(data){

                $('#plan-release-select').find('optgroup').remove();

                $(data).each(function(){
                    var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id)
                    $(this.iterations).each(function(){
                        var option = $('<option>').attr('value', this.id).text( this.name);
                        $(optionG).append(option);
                    });
                    $('#plan-release-select').append(optionG)
                });
            });

            //$('#plan-release-select').chosen();
        },

        attachEvents: function(){

            $("#btnGetPlan").on('click', function(){
                $('#btnGetPlan').button('loading');
                $('#planGridContainer').hide();
                $("#alertNoPlanfound").addClass('hide');

                var iterId =  $("#plan-release-select option:selected").val();
                var rlsId =  $("#plan-release-select option:selected").parents('optgroup').attr('rel-id');
                var planGridContainer  = $('#planGridContainer');

                $.when( tcmModel.releases.iterations.plan(rlsId, iterId) ).done( function(coverageData){

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
                            planGridContainer.append(group);
                            planGridContainer.show();

                    }else{
                        $("#alertNoPlanfound").removeClass('hide');
                    }




                 });

            });

        }

    };

    return PlanView;

});