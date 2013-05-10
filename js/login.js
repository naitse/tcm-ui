require.config({
    paths: {
        jquery: "libs/jquery/jQuery-1.8.3",
        bootstrap: "libs/bootstrap/js/bootstrap.min",
       'jquery.cookie': 'libs/jquerycookie/jquery.cookie',
       'tcm_model': 'models/tcmmodel',
       'jquery.base64': 'libs/jquery.base64/jquery.base64'
    },

    shim: {
        'jquery.cookie':{
            deps: ['jquery']
        }
    }
});

require(['jquery', 'tcm_model', 'jquery.cookie', 'jquery.base64','bootstrap'],
    function ($, tcm_model) {


        if ($.cookie('loginfailed') === 'true') {
            console.log("Your username or password was entered incorrectly");
            $.cookie('loginfailed', null);
        } else if ($.cookie('sessionexpired') === 'true') {
            console.log("Your session has expired. Please login again.");
            $.cookie('sessionexpired', null);
        } else if ($.cookie('accountdisabled') === 'true') {
            console.log("Your account is disabled. Please contact your organization administrator.");
            $.cookie('accountdisabled', null);
        }

        $('#login-button').on('click', function(){
            $("#projects_dd").empty();
            $('#login-button').button('loading');
            $.when(tcm_model.login($('#username').val(), $('#password').val())).done(function(data){

                $.cookie('apiKey', data.apiKey, { expires:1, path: '/' });

                $.when(tcm_model.users.projects.fetch('cloudhub-rest')).done(function(projects){

                    if(projects.length > 0){

                     $(projects).each(function(){
                         $("#projects_dd").append('<option value="' + this.id+ '">' + this.name + '</option>')
                     });

                     $('#projectsContainer').show();
                     $('#login-form').hide();
                    }else{
                        alert("no projects");
                    }

                    $('#login-button').button('reset');
                });


            }).fail(function(){
                console.log("fallo login");
                $('#login-button').button('reset');
            });

        });

        $('#project-button').on('click', function(){

            $.cookie('projectId', $('#projects_dd option:selected').val());

            window.location.href = window.location.href.replace('login.html','');
        });

        $("body").append("<div id='loaded'></div>");
    });