define(function(require){

    var global = {
        channels:{},
        users:{},
        currentSS: {
            releaseName:'',
            releaseId:0,
            iterationName:'',
            iterationId:0,
            featureId:0,
            feature:'',
            tcId:0
        },
        project: {
            config:{
                bug_url:'',
                springIterations:'',
                iterationDuration:'',
                id:'',
                currentrelease:''
            }
        },
        toggleLoading: function(container, toggle, size){
            if (size != 'big'){
                size = 'small';
            }
            if (toggle == true){
                $(container).block({
                    message:'<div class="loading-'+size+'-block"></div>',
                    overlayCSS:  { 
                        backgroundColor: '#000', 
                        opacity:         0.2, 
                        cursor:          'wait' 
                    },
                    fadeIn:0,
                    fadeOut:0
                })
            }else{
                $(container).unblock()
            }
        }

    }
    return global;
})