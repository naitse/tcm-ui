define(function(require){

    var $ = require('jquery');
    var tcmModel = require('tcmModel');
    var $ = require('jquery');
    var chosen = require('chosen');

    $.fn.extend({
        releases_dd: function(onSChange,afterRender) {

            var $this;
            $this = $(this);

            if (!$this.hasClass("chzn-done")) {
                tcmModel.releases.fetch().done(function(data){
                    $this.find('optgroup').remove();
                    $this.find('option').remove();

                    $(data).each(function(){
                        var option = $('<option>').attr('value',this.id ).text("Release " + this.releaseName);
                        $this.append(option);

                    });

                    if(typeof onSChange != 'undefined'){
                        $this.chosen().change(function(){
                            onSChange();
                        });
                    }else{
                        $this.chosen();
                    }

                    if(typeof afterRender != 'undefined'){
                            afterRender();
                    }

                    $this.prepend($('<option value=""/>'));

                });
            }
        }
    });
});