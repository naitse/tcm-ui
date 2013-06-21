define(function(require){

    var global = {
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
        }
    }


    return global;
})