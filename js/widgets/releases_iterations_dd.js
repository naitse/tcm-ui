define(function(require){

    var $ = require('jquery');
    var tcmModel = require('tcmModel');
    var objeto;

    var ddReleasesIteration = {


        render: function(container, prefix){

            $(container).empty();

            objeto = $('<select data-placeholder="Choose an Iteration..." id="'  + prefix + '-release-select" tabindex="3"><<option/>');
            $(container).append(objeto);


            this.load();
            console.log(objeto);
            objeto.chosen();
            console.log(objeto);


        },

        load: function(){
                tcmModel.releases.fetch().done(function(data){

                objeto.find('optgroup').remove();

                $(data).each(function(){
                    var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id)
                    $(this.iterations).each(function(){
                        var option = $('<option>').attr('value', this.id).text( this.name);
                        $(optionG).append(option);
                    });
                    objeto.append(optionG)
                });

            });
        }
    };

    return ddReleasesIteration;

});