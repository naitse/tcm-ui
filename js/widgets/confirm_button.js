define(function(require){

    var $ = require('jquery');

    $.fn.extend({
        confirm_button: function(onConfirm,text) {

            var $this;
            $this = $(this);

            $this.live({
                click: function(e){
                        e.stopPropagation();
                        if($this.hasClass('sec-state')){
                            onConfirm();
                        }else{
                            $this.addClass('sec-state');
                            $this.stop(true, true).animate({"width":"+=20"});
                            $this.find('i').hide();
                            $this.append($('<span class="del-feature-confirm-label" style="display:none; position: relative; top: -2; color: red; ">'+text+'</span>'))
                            $this.find('.del-feature-confirm-label').show();
                        }
                    },
                mouseleave:function(e){
                        e.stopPropagation();
                        if($this.hasClass('sec-state')){
                        $this.removeClass('sec-state')
                        $this.stop(true, true).animate({"width":"-=20"});
                        $this.find('.del-feature-confirm-label').remove();
                        $this.find('i').show();
                    }
                }
            });
        }
    });
});