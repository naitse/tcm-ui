require.config({
    paths: {
        jquery: "libs/jquery/jQuery-1.8.3",
       'jquery.cookie': 'libs/jquerycookie/jquery.cookie'
    },

    shim: {
        'jquery.cookie':{
            deps: ['jquery']
        }
    }
});

require(['jquery', 'jquery.cookie'],
    function ($) {

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
            $.cookie('loggedIn', true, { path: '/' });

            window.location.href = window.location.href.replace('login.html','');
        });

        $("body").append("<div id='loaded'></div>");
    });