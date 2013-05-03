define(function(require){

    var $ = require('jquery');
    var tcmModel = require('tcmModel');
    var $ = require('jquery');
    var chosen = require('chosen');

    $.fn.extend({
        releases_iterations_dd: function() {

            var $this;
            $this = $(this);

            if (!$this.hasClass("chzn-done")) {
                tcmModel.releases.fetch().done(function(data){

                    $this.find('optgroup').remove();

                    $(data).each(function(){
                        var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id);

                        $(this.iterations).each(function(){
                            var option = $('<option>').attr('value', this.id).text( this.name);
                            $(optionG).append(option);
                        });
                        $this.append(optionG);

                    });


                    $this.chosen();

                });
            }
        }
    });
});