define(function(require){

    var $ = require('jquery-plugins'),
        tcmModel = require('tcmModel'),
        featureTemplate = require('text!templates/modules/feature/feature.html'),
        styles = require('text!templates/modules/feature/style'),
        currentSS,
        _ = require('underscore');

        var jiraLink = 'http://www.mulesoft.org/jira/browse/';

    var featuresModule = {
        init:function(currentSS){
            currentSS = currentSS;
        },
    	create: function(object){
    		var feature = $(featureTemplate);
            $(feature).attr('feature-id',object.featureId).data('desc', object.featureDescription).data('summary',object.featureName).data('state',object.state).data('conflict',0);
    		$(feature).find('.jira-key').attr('href', jiraLink + object.jiraKey).text(object.jiraKey).data('jiraKey',object.jiraKey);
            $(feature).find('.summary').text(object.featureName).attr('title',object.featureName);
    		$(feature).find('.count').text(object.count);


            if(object.state == 2){
                var close_jira_icon = 'icon-ok-circle open';
            }else{
                var close_jira_icon = 'icon-thumbs-up closed';
            }

            $(feature).find('.close-jira-btn i').addClass(close_jira_icon);

    		return feature;
    	},
    	render: function(container,feature){
    		$(container).append(feature);
              if ($.browser.mozilla ) {
                $(feature).find('.summary').css({
                    'margin-right': $(feature).find('.title-bar').width() + 2,
                    'top':'2px'
                });
            }
            $(feature).find('.stats').addClass('loading-small');
            this.updateFeatureTestStats(feature)
    	},

        updateFeatureTestStats: function(feature, singleData){

            this.resetFeatureTestStats(feature)
            $(feature).find('.stats').addClass('loading-small');

            if (typeof singleData === 'undefined') {
                var feature_id = $(feature).attr('feature-id');
                tcmModel.releases.iterations.features.executedTestCases.fetch(currentSS.releaseId, currentSS.iterationId, feature_id).done(function(data){
                    data = data[0]
                    this.processStats(feature, data)
                })
            }
            else {
                this.processStats(feature, singleData);
            }

        },
        resetFeatureTestStats: function(feature){
          $(feature).find('.progress').remove()
          $(feature).find('.count').text('')
        },

        processStats: function(feature, data){
            var cellWidth = 100 / parseInt(data.total);

            var propgressBar = $('<div class="progress" style="width: 40px; height: 12px; border: 1px solid rgb(108, 120, 133);">')

            for(var i=0; i<parseInt(data.pass);i++){
                var node = $('<div class="bar bar-success" style="width: '+cellWidth+'%;"></div>')
                $(propgressBar).append(node)
            }
            for(var i=0; i<parseInt(data.blocked);i++){
                var node = $('<div class="bar bar-warning" style="width: '+cellWidth+'%;"></div>')
                $(propgressBar).append(node)
            }
            for(var i=0; i<parseInt(data.failed);i++){
                var node = $('<div class="bar bar-danger" style="width: '+cellWidth+'%;"></div>')
                $(propgressBar).append(node)
            }
            for(var i=0; i<parseInt(data.inprogress);i++){
                var node = $('<div class="bar bar-info" style="width: '+cellWidth+'%;"></div>')
                $(propgressBar).append(node)
            }
            for(var i=0; i<parseInt(data.notrun);i++){
                var node = $('<div class="bar bar-notrun" style="width: '+cellWidth+'%;"></div>')
                $(propgressBar).append(node)
            }

            if(data.total != 0 && data.total == data.pass){
                $(feature).find('.close-jira-btn').show();
                $(feature).find('.summary').css('margin-right','30px');
                if(data.state !=2){
                    $(feature).data('state',data.state);
                    this.updateFeatureState(feature);
                }
            }else if(data.total != 0 && data.state == 0){
                $(feature).data('conflict', 1);
                $(feature).find('.close-jira-btn').show().attr('disabled',true);
                $(feature).find('.close-jira-btn > i').removeClass('icon-thumbs-up').addClass('icon-warning-sign closed');
            }else{
                $(feature).find('.close-jira-btn').hide();
                $(feature).find('.summary').css('margin-right','0px');
            }

            var runned = data.pass + data.failed + data.blocked
            $(feature).find('.stats').append(propgressBar)

            if(data.total == 0 && data.state == 0){
                $(feature).addClass('ready');
                $(feature).find('.progress').addClass('no-tc-feature-done');
                $(feature).find('.close-jira-btn').show().attr('disabled',true);
                $(feature).find('.close-jira-btn > i').addClass('icon-thumbs-up closed');
            }

            $(feature).find('.count').text(runned +'/'+data.total)
            $(feature).data('tcStats',data);
            $(feature).find('.stats').removeClass('loading-small');

        },

        updateFeatureState:function(feature){
            var iconClass = 'icon-thumbs-up closed';
            $(feature).find('.close-jira-btn').attr('disabled',true);
            $(feature).find('.close-jira-btn > i').removeClass('icon-time').addClass(iconClass);
            $(feature).addClass('ready');
            if($(feature).hasClass('active')){
                $('#tcViewer #tc-container').children('#tcViewer .tc').each(function(){
                    $(this).find('.btn-group').remove();
                })
            }
        }

    }

	function attachStyles(){

		$('body').append($(styles));

	}


	attachStyles();

    return featuresModule;
})