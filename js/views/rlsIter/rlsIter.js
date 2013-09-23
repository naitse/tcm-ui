define(function(require){
    
    var barman = require('barman');
    var $ = require('jquery');
    global = require('global');
    var tcmModel = require('tcmModel');
    // var styles = require('text!widgets/btnpillstyle');
    var temp = require('text!templates/rlsIter/html.html');


    var rlsIter = barman.Class.create({
        container:'',
        widget_id: Math.floor(Math.random()*99999999999999),

        constructor: function(container, args, view){
          this.container = $(container);
          this.args = args;
          this.template = $(temp);
          this.render(container, args);
          this.parentView = view;
        },

        render:function(){
          this.getReleases(this.template, this.container, this.args);
        },
         getReleases:function(template, container, args){
          var self = this;
          tcmModel.releases_iterations.fetch().done(function(data){
            $(data).each(function(){
              var rel = this;
              var itersCount = this.iterations.length;
              var widget = $('ul[widget-id='+self.widget_id+']');
              widget.find('#iter li').remove();
              widget.find('#rls li').remove();

              var release = $('<li><a class="rls-item" rls-id="'+this.id+'">'+this.name+'</a></li>').click(function(){
                
              global.currentSS ={
                    releaseName:'',
                    releaseId:0,
                    iterationName:'',
                    iterationId:0,
                    featureId:0,
                    feature:'',
                    tcId:0
               }

               self.parentView.expose.clear()

                var widget = $('ul[widget-id='+self.widget_id+']');
                widget.find('#iter li').hide();
                global.currentSS.releaseId = $(this).find('a').attr('rls-id');
                global.currentSS.releaseName = $(this).find('a').text();

                widget.find('#rls .dropdown-toggle').text('Release ' + global.currentSS.releaseName);
                var clearIter = ($.cookie('projectId') == '6')?'Select a Team':'Select an Iteration';
                widget.find('#iter .dropdown-toggle').text(clearIter);
                widget.find('#iter li[rls-id="'+$(this).find('a').attr('rls-id')+'"]').show();
                widget.find('#iter').show().addClass('open');

              })

              $(this.iterations).each(function(){

                var iteration = $('<li rls-id="'+rel.id+'"><a class="iter-item"  iter-id="'+this.id+'">'+this.name+'</a></li>').click(function(){
                  var widget = $('ul[widget-id='+self.widget_id+']');
                  widget.find('#iter .dropdown-toggle').text($(this).find('a').text());
                  self.parentView.expose.clear()
                  self.parentView.expose.getFeatures($(this).find('a').attr('iter-id'), $(this).find('a').text());
                })

                $(template).find('#iter ul.dropdown-menu').append(iteration);

              })
              $(template).find('#rls ul.dropdown-menu').append(release);
            })
            $(template).attr('widget-id',self.widget_id);
                    $(container).prepend(template);
          })

        },
        showPillRefresh: function (parent){
          var widget = $('.btn-pill[widget-id='+this.widget_id+']');
            widget.last().animate({
                'width': '+=25'
            },function(){
                widget.find('#pill-refresh-graph').show()
            })
        },

        show:function(){
            var widget = $('.btn-pill[widget-id='+this.widget_id+']').css('visibility','visible');
        },

        attachStyles:function(){
          loaded = false;
              $('style').each(function(){
                  if($(this).attr('sof') == "btnpill"){
                      loaded = true;
                  }
              })
              if(!loaded){
                  $('body').append($(styles));
              }
        }

    });

    return rlsIter;

});

