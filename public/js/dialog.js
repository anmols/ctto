var product_trial_dialog = (function(param){
    var options;
    var dialog_objects =[];
    
    function open(params){
       
        
        init(params);

        let dialog_id = 'ProductTrail_static_dialog_'+rand();
        
        $('body').append('<div id="'+dialog_id+'" title=" dialog"></div>');
        let dialog_selector = $('#'+dialog_id);
        dialog_selector.html(options.content);
        dialog_selector.dialog({
            modal: true,
            open:options.onOpen,
            beforeClose:options.onClose,
            create:function(){
                this.$content = $(this);
            },
            buttons: {
            Ok: function() {
                product_trial_dialog.close();
            }
            }
        });
        dialog_objects.push(dialog_selector);
        console.log('open');

    }

    function init(params){
        options = params;
       
       
    }
    function rand() {
        return Math.random().toString(36).substr(2, 9);
    }
    function close(){
        console.log('close');
        
        dialog_objects.forEach(dialog_object => {
            dialog_object.dialog("destroy");
            dialog_object.remove();
            
        });
        dialog_objects = [];
    }
    return {
        open:open,
        close:close,
        dialog_objects
    }
})();