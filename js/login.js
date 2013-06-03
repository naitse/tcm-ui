require.config({
    paths: {
        jquery: "libs/jquery/jQuery-1.8.3",
        bootstrap: "libs/bootstrap/js/bootstrap.min",
        chosen: "libs/chosen/chosen.jquery.min",
       'jquery.cookie': 'libs/jquerycookie/jquery.cookie',
       'tcm_model': 'models/tcmModel',
       'jquery.base64': 'libs/jquery.base64/jquery.base64'
    },

    shim: {
        'jquery.cookie':{
            deps: ['jquery']
        },
        chosen: {
            deps: ['jquery']
        }

    }
});

require(['jquery', 'tcm_model', 'jquery.cookie', 'jquery.base64','bootstrap','chosen'],
    function ($, tcm_model) {


        if ($.cookie('loginfailed') === 'true') {
            console.log("Your username or password was entered incorrectly");
            $.cookie('loginfailed', null);
        } else if ($.cookie('sessionexpired') === 'true') {
            // console.log("Your session has expired. Please login again.");
            $.cookie('sessionexpired', null);
        } else if ($.cookie('accountdisabled') === 'true') {
            console.log("Your account is disabled. Please contact your organization administrator.");
            $.cookie('accountdisabled', null);
        }

        $("#username").keypress(function(event) {
          if ( event.which == 13 ) {
             event.preventDefault();
             $('#login-button').click();
           }
        });
        $("#password").keypress(function(event) {
          if ( event.which == 13 ) {
             event.preventDefault();
             $('#login-button').click();
           }
        });

        $('#login-button').on('click', function(){
            $("#projects_dd").empty();
            $('#login-button').button('loading');
            $.when(tcm_model.login($('#username').val(), $('#password').val())).done(function(data){

                $.cookie('apiKey', data.apiKey, { expires:1, path: '/' });

                $.when(tcm_model.users.projects.fetch($('#username').val())).done(function(projects){

                    if(projects.length > 0){

                     $(projects).each(function(){
                         $("#projects_dd").append('<option value="' + this.id+ '">' + this.name + '</option>')
                     });

                     $('#login-form #login-button').hide();
                     $('#projectsContainer').show('fast');
                     $("#projects_dd").chosen();
                     afterLogin('User authenticated, Please select a project','alert-success');
                     
                    }else{
                        afterLogin('No projects found for ' + $('#username').val(),'alert-warning')
                    }

                    $('#login-button').button('reset');
                });


            }).fail(function(){
                afterLogin('Authentication error','alert-danger');
                $('#login-button').button('reset');
            });

        });

        $('#project-button').on('click', function(){

            $.cookie('projectId', $('#projects_dd option:selected').val());
            $.cookie('usrname', $('#username').val());

            window.location.href = window.location.href.replace('login.html','');
        });

        $("body").append("<div id='loaded'></div>");

        function afterLogin(message,alertClass){
            $('.login-alert').text(message)
            $('.login-alert').removeClass('hide alert-danger alert-warning alert-success').addClass(alertClass);
        }
    });