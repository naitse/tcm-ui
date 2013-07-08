define(function(require){
    require('pusher');
    require('PusherNotifier');
    
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
        },
        channelSubscribe:function(channelName){
        
            this.channels[channelName] = (pusher.subscribe(channelName));

        },
        channelBind:function(channel, evnt, action){
            this.channels[channel].bind(evnt,action);
        }
    }


    return global;
})