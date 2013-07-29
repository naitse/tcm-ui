define(function(require){

    var barman = require('barman');
    var $ = require('jquery');
    var styles = require('text!widgets/btnpillstyle');
    var template = $('<div class="btn-pill" style="visibility:hidden">'
                          +'<div id="left-btn" class="active" href="#">General</div>'
                            +'<a id="pill-refresh-graph" disabled><i class="icon-refresh"></i></a>'
                          +'<div id="right-btn" href="#">By Item</div>'
                        +'</div>');


    var btnpill = barman.Class.create({
        container:'',
        widget_id: Math.floor(Math.random()*99999999999999),


        constructor: function (container, args) {

            this.attachStyles();
            this.render(container, args);

        },       

        render:function(container, args){

          $(template).attr('widget-id',this.widget_id);
          $(template).find('div').click(function(e){
                if($(this).hasClass('active')){
                    return false;
                }
                $(this).parent().children('div').toggleClass('active')
          })
          if(typeof args !== 'undefined'){
              if(args.left_btn){
                if(args.left_btn.action){
                  $(template).find('#left-btn').click(args.left_btn.action)
                }
                if(args.left_btn.text){
                  $(template).find('#left-btn').text(args.left_btn.text)
                }
              }              

              if(args.refresh_btn){
                  $(template).find('#pill-refresh-graph').click(args.refresh_btn)
              }
              
              if(args.right_btn){
                if(args.right_btn.action){
                  $(template).find('#right-btn').click(args.right_btn.action)
                }
                if(args.right_btn.text){
                  $(template).find('#right-btn').text(args.right_btn.text)
                }
              }
          }
            this.container = $(container)
            this.container.append(template);
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

    return btnpill;

});

