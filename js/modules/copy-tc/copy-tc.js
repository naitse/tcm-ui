define(function(require){

    var $ = require('jquery-plugins'),
        copyTemplate = require('text!templates/copy-tc/copy-tc.html'),
        tcmModel = require('tcmModel'),
        tcsModule = require('modules/tc/tc'),
        featuresModule = require('modules/feature/feature');

    var CopyView = {

        render: function(){
            if(!this.rendered){
                $("#tcViewer").append(copyTemplate);
                this.attachEvents();
                this.rendered = true;
            }

            this.load();
        },

        load: function(){
            if($('#tcViewer .feature.active').size() == 0 || $('#tcViewer #tc-container .tc').size() == 0){
                return false;
            }

            $('#tcViewer .panels #tc-container').children().remove();

            $('#tcViewer #tc-container .tc').each(function(){
                var tc_html = tcsModule.createTcHTML($(this).data('tcObject'),null,false);
                $(tc_html).find('.tc-stats').remove();
                $(tc_html).find('.suites-label').remove();
                $(tc_html).find('.tc-suites').remove();
                $(tc_html).find('.tc-expander').remove();
                tcsModule.renderTC(tc_html, '#tcViewer .panels')
            })

            $('#tcViewer #copy-tc-modal #release-selector').releases_iterations_dd(function(){

                var iterId =  $("#copy-tc-modal #release-selector option:selected").val();

                tcmModel.releases.iterations.features.fetch(0, iterId).done(function(data){
                    if (data.length > 0){
                        $('.panels #feature-cont').children().remove();
                        $(data).each(function(){
                            featuresModule.render('.panels #feature-cont',featuresModule.create(this))
                        })
                    }
                })

            },function(){

            })

            $('#tcViewer #copy-tc-modal').modal();

        },

        attachEvents: function(){

            $('#tcViewer #copy-tc-modal #tc-container .tc').live({
                click:function(e){
                    e.stopPropagation();
                    $(this).find('.wrapper').removeClass('active');
                    $(this).toggleClass('multi-active').find('.wrapper').toggleClass('multi-active');

                }
            });


            $('#tcViewer #copy-tc-modal .save-copy').on({
                click:function(){
                    var elements = $('#tcViewer #copy-tc-modal #tc-container .tc.multi-active');

                    if($('.panels .feature.active').size() == 0 || $('.panels .tc.multi-active').size() == 0){
                        return false;
                    }
                    var req = {
                        featureId:$('.panels .feature.active').attr('feature-id'),
                        testcases:[]
                    }

                    $(elements).each(function(){
                        req.testcases.push($(this).attr('tc-id'));
                    })
                    $('#tcViewer #copy-tc-modal .save-copy').button('loading')
                    tcmModel.testcases.clone(req).done(function(){
                        $('#tcViewer #copy-tc-modal .save-copy').button('reset')
                    })
                }
            })


            $('.panels .feature').live({
                click:function(e){
                    e.stopPropagation();
                    $('.panels .feature').removeClass('active')
                    $(this).addClass('active');
                }
            })

            $('#tcViewer .select-all-tc').on({
                click:function(){
                    $('#tcViewer #copy-tc-modal #tc-container .tc').toggleClass('multi-active');
                    $('#tcViewer #copy-tc-modal #tc-container .tc .wrapper').toggleClass('multi-active');
                }
            })

            $('#tcViewer #copy-tc-modal .cancel').on({
                click:function(){
                    $('#tcViewer #copy-tc-modal').modal('hide');
                }
            })

        }

    }
    return CopyView
});