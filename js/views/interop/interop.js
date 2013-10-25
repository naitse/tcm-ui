define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/interop/interop.html'),
        tcmModel = require('tcmModel'),
        global = require('global'),
        styles = require('text!templates/interop/style'),
        rlsIterWidget = require('views/rlsInter/rlsInter'),
        pV = "#interOp";
        _ = require('underscore');
        var relId;

    var InteropView = {
        moduleId: "Interop",

        rendered: false,


        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);
                var releaseNavigator = new rlsIterWidget("#interOp",{"action":"prepend"},InteropView);
                this.loadData();
                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-interop').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        refreshRender:function () {
            this.loadData();
        },

        loadData: function(){
            tcmModel.releases_iterations.fetch().done(function(data){
            })
        },

        attachEvents: function(){
                
        $('#interOp #sendreport').live({
          click: function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
                sendReport(relId);
            }else{
              $(this).addClass('sec-state');
              $(this).stop(true, true).animate({"width":"-=50"});
              $(this).find('i').hide(0);
              $(this).find('.tex').hide();
              $(this).append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">Sure?</span>'))
              $(this).find('.del-feature-confirm-label').show();
            }
          },
          mouseleave:function(e){
            e.stopPropagation();
            if($(this).hasClass('sec-state')){
              $(this).removeClass('sec-state')
              $(this).stop(true, true).animate({"width":"+=50"},0);
              $(this).find('.del-feature-confirm-label').remove();
              $(this).find('.tex').show();
              $(this).find('i').show(0);
            }
          }
        });




        },
        expose:{
            clear: function(rlsId){
                relId = rlsId;
                $('#interOp #sendreport').hide();
                $('#interOp .teams').children().remove();
            },
            renderTeam: function(rlsId){

                tcmModel.plugins.interop.fetch(rlsId).done(function(data){
                    render(data);
                })

            }
        }

    };


    function adjustTabtHeight(){

    }

    $(window).resize(function(){

    });

    function sendReport(){
        tcmModel.plugins.interop.send(relId).done(function(){
            alert('Email Sent!!');
        })
    }

function render(data){

    var cont = $('#interOp .teams');

    $(data).each(function(){

        var light = ''
        var action = ''
        if(this.state == 0){
            action = ' Green'
            light = 'btn-success'
        }else if(this.state == 1){
            action = ' Yellow'
            light = 'btn-warning'
        }else {
            action = ' OMG!'
            light = 'btn-danger'
        }

        var states = [
            'Green',
            'Yellow',
            'OMG!'
        ]

        var states2 = [
            'btn-success',
            'btn-warning',
            'btn-danger'
        ]

        var drop = $('<div class="btn-group">' +
            '<a class="btn '+light+' dropdown-toggle" data-toggle="dropdown" href="#">'+
            action +
            '<span class="caret"></span>'+
            '</a>'+
          '<ul class="dropdown-menu">'+
          '</ul>'+
        '</div>');

        for (var i = 0; i <3 ;i++){
            var li = $('<li id="'+i+'">'+states[i]+'</li>').click(function(){
                $(this).parents('.team').find('.status').attr('id', $(this).attr('id'));

                $(this).parents('.btn-group').find('.dropdown-toggle').removeClass(function (index, css) {
                    return (css.match (/\bbtn-\S+/g) || []).join(' ')
                })
                 
                $(this).parents('.btn-group').find('.dropdown-toggle').addClass(states2[$(this).attr('id')]).text(states[$(this).attr('id')]).append('<span class="caret"></span>');
            })
            $(drop).find('ul').append(li);
        }

        var team = $('<div class="team">').attr('id',this.id);
        var name = $('<div class="name">').text(this.name)
        var status = $('<div class="status">').attr('id',this.state);
        var risk = $('<textarea class="risk">').text(this.risk)
        var jql = $('<input class="jql">').val(this.jql)
        var save = $('<button type="button" class="btn btn-info" data-loading-text="Saving...">Save</button>').click(function(){

            $(this).button('loading');
            var parent = $(this).parents('.team');
            var id = $(parent).attr('id');
            var status = $(parent).find('.status').attr('id');
            var risk = $(parent).find('.risk').val();
            var jql = $(parent).find('.jql').val();


            req = {
                id:parseInt(id),
                state:parseInt(status),
                risk:risk,
                jql:jql
            }

            var that = this;

            tcmModel.plugins.interop.save(req).done(function(data){
                $(that).button('reset');
            })
        })

        $(team).append(name,status,'Risk:<br />',risk,'JQL:<br />',jql,'<br />','Status:<br />',drop,save)
        cont.append(team);

    })
    $('#interOp #sendreport').show();
}
    function attachStyles(){

        loaded= false;
        
        $('style').each(function(){
            if($(this).attr('sof') == "interop"){
                loaded = true;
            }
        })
        if(!loaded){
            $('body').append($(styles));
        }

    }


    attachStyles();

    return InteropView;

});