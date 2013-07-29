define(function(require){

    var $ = require('jquery-plugins'),
    editorTemplate = require('text!templates/editor/tc-editor.html'),
    tcmModel = require('tcmModel'),
    PM = require('panelsManager');

    var EditorView = {

        moduleId: "Viewer",

        rendered: false,

        mode: {
          create: false,
          update: false,
          run: false
        },

        context: {
            releaseName:'',
            releaseId:0,
            iterationName:'',
            iterationId:0,
            featureId:0,
            feature:'',
            tcId:0
        },

        inputData: null,

        render: function(editorMode, context, inputData){
            this.data = null;

            this.mode = $.extend({},{create: false, update: false, run: false},  editorMode);
            this.context = $.extend({},{releaseName:'',
                    releaseId:0,
                    iterationName:'',
                    iterationId:0,
                    featureId:0,
                    feature:'',
                    tcId:0
            }, context);

            this.inputData = inputData;

            if(!this.rendered){
                $("#rp-wrapper").append(editorTemplate);
                this.attachEvents();
                this.rendered = true;
            }

            this.clearTCModal();

            PM.colapseExpandRightPanel('#tcViewer','none');
            PM.colapseExpandRightPanel('#tcViewer','block')

            if(editorMode.create){

                $('.rp-title').text('New Test Case');
            }

            if(editorMode.update){

                $('.rp-title').text('Update Test Case')
                $('#tcViewer #rp-wrapper .save').text('Update')
                $('.new-tc-title').val(inputData.name);
                $('.new-tc-desc').val(inputData.description);

                if(inputData.proposed == 1){
                    $('.proposed').attr('checked','checked')
                }
            }

            if(editorMode.run){

                $('#tcViewer .run-tc-modal .run-status .stat').remove();
                $('#tcViewer .proposed').parents('label').hide();
                $('#tcViewer .tc-fields').hide();
                $('#tcViewer .run-tc-modal .run-status').append($('<div class="'+$(inputData.runStatusElement).attr('class')+' stat round-corner-all" status-id="'+$(inputData.runStatusElement).attr('status-id')+'"><i class="'+$(inputData.runStatusElement).find('i').attr('class')+'"></i>'+$(inputData.runStatusElement).text()+'</div>'));
                PM.colapseExpandRightPanel('#tcViewer','block');
                $('#tcViewer .run-tc-modal').show()
                $('#tcViewer .rp-title').text('Run Test Case')
                $('#tcViewer #rp-wrapper .save').text('Save Run')
                $('.new-tc-title').val(inputData.data.name);
                $('.new-tc-desc').val(inputData.data.description);
                $('#tcViewer #rp-wrapper .modal-body').data('runId',inputData.data.tcId)
                $('#tcViewer #rp-wrapper .modal-body').data('tcObject',inputData.data);

            }

        },

        attachEvents: function(){

            var self = this;
            $('#tcViewer #rp-wrapper .cancel').on('click', function(){
                $('#tcViewer #tc-container').find('.wrapper').removeClass('active');
                self.clearTCModal();
                PM.colapseExpandRightPanel('#tcViewer','none')

            });


            $('#tcViewer #rp-wrapper .save').on('click', function(){
                self.save();
                //saveTc($(this).parents('#rp-wrapper'), $('#tcViewer #rp-wrapper .modal-body').data('flag'), $('#tcViewer #rp-wrapper .modal-body').data('tcObject'),self.context.feature)
            });

        },

        clearTCModal: function(){

            $('#tcViewer #rp-wrapper').find('.dropdown-toggle').removeClass(function (index, css) {
                return (css.match (/\bddm-\S+/g) || []).join(' ')
            }).addClass('ddm-inprogress').text('').append('<i class="icon-hand-right " style="margin-top: 2px;"></i>',' In Progress ', '<span class="caret"></span>').attr('status-id',1);

            $('#tcViewer .proposed').parents('label').show();
            $('#tcViewer .tc-fields').show();
            $('#tcViewer .rp-title').text('')
            $('#tcViewer #rp-wrapper .save').text('Add')
            $('#tcViewer .new-tc-title').val('').removeClass('title-error');
            $('#tcViewer .new-tc-desc').val('');
            $('#tcViewer .actual-result').val('')
            $('#tcViewer #rp-wrapper .modal-body').data('flag',0);
            $('#tcViewer #rp-wrapper .modal-body').data('tcObject','');
            $('#tcViewer .proposed').attr('checked',false);
            proposed = 0;

        },

        afterCreate: function(data){
            console.log("default afterCreate");
        },

        afterUpdate: function(data){
            console.log("default afterUpdate");
        },

        afterRun: function(data){
          console.log("default afterRun");
        },

        save: function(){
            var self = this;

            var editorWrapper = $('#rp-wrapper');

            editorWrapper.find('.alert').addClass('hide')

            if (jQuery.trim($('#tcViewer #rp-wrapper').find('.new-tc-title').val()).length <= 0){
                editorWrapper.find('.new-tc-title').addClass('title-error')
                return false
            }else{
                editorWrapper.find('.new-tc-title').removeClass('title-error')
            }


            var objectToSave ={
                tcId: "",
                name: editorWrapper.find('.new-tc-title').val(),
                description: editorWrapper.find('.new-tc-desc').val(),
                proposed: $("#pluginEnabled-jira").prop('checked')
            }



            if(this.mode.create){
                editorWrapper.find('.save').button('loading');
                tcmModel.releases.iterations.features.test_cases.add(self.context.releaseId, self.context.iterationId, self.context.featureId, objectToSave).done(function(data){
                    self.afterCreate(self.context);
                    editorWrapper.find('.save').button('reset');

                }).fail(function(){
                        editorWrapper.find('.alert').removeClass('hide')
                });
            }

            if(this.mode.update){

                objectToSave.tcId = this.inputData.tcId;

                PM.toggleLoading('#tcViewer',' .tc[tc-id="' + objectToSave.tcId + '"]',true)
                editorWrapper.find('.save').button('loading');

                tcmModel.releases.iterations.features.test_cases.update(self.context.releaseId, self.context.iterationId, self.context.featureId, objectToSave).done(function(){

                    self.afterUpdate(objectToSave);

                    editorWrapper.find('.save').button('complete');

                }).fail(function(){
                        editorWrapper.find('.alert').removeClass('hide')
                });

            }

            if(this.mode.run){
                editorWrapper.find('.save').button('loading');
                var statusId = editorWrapper.find('.stat').attr('status-id');
                var actualResult = editorWrapper.find('.actual-result').val();

                tcmModel.releases.iterations.features.test_cases.status.updateStatus(self.context.releaseId, self.context.iterationId, self.context.featureId, this.inputData.data.tcId, statusId, actualResult).done(function(){
                    var caret = $('<span class="caret"></span>')
                    var newState = $('<i class="'+editorWrapper.find('.stat i').attr('class')+'" style="margin-top: 2px;"></i>');
                    $('#tcViewer .tc[tc-id='+self.inputData.data.tcId+']').find('.tc-last-run-results-cont').show();
                    $('#tcViewer .tc[tc-id='+self.inputData.data.tcId+']').find('.tc-last-run-results').text(editorWrapper.find('.actual-result').val());

                    $('#tcViewer .tc[tc-id='+self.inputData.data.tcId+'] .wrapper').find('.btn-group').find('.dropdown-toggle').children().remove();

                    $('#tcViewer .tc[tc-id='+self.inputData.data.tcId+'] .wrapper').find('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
                        return (css.match (/\bddm-\S+/g) || []).join(' ')
                    }).addClass(editorWrapper.find('.stat').attr('class')).append(newState, caret)

                    $('#tcViewer #rp-wrapper').find('.save').button('reset');
                    self.afterRun(self.context);
                    PM.colapseExpandRightPanel('#tcViewer','none');
                    self.clearTCModal();

                })


            }

        }

    }

    return EditorView;

});