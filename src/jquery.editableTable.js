/**
 * Jquery Editable Table
 * Author : Danish Altaf Satti <dasatti@gmail.com>
 * Version : 0.0.1
 *
 * JQuery Editable tables is a JQuery based javascript library which turns ordinary HTML tables into editable row. It
 * allows users to quickly edit records in the table and save the data into database. It requires JQuery, supports but
 * does not required bootstrap and font-awesome icons and Laravel ErrorBag response for errors.
 *
 */

/**
 *
 * Usage :
 * HTML:
 * <table id="table">
 *     <tr>
 *         <td data-editable="name">Danish</td>
 *         <td data-editable="phone">923125511678</td>
 *         <td data-editable="age" data-editable-type="number">30</td>
 *         <td><!-- Extra column for buttons--></td>
 *     </tr>
 * </table>
 *
 * JS :
 *  $('#table').editableTable({
 *      //configuration variables will go here, all of them are optional
 *      //Update callback
 *      onUpdate : function(data, callback){
 *          //perform ajax or what ever with data
 *          //execute the callback to to inform editable table about update status, For ajax place it in success callback
 *          callback({
 *              success : 1 //1 or 0 | required
 *              error : ["Error 1", "Error 2"] //Put errors here is there was some error in update | optional
 *              errorBag : {
 *                  // Laravel 5 standard ErrorBag response | optional
 *                  field_1_name : ["Error 1", "Error 2"],
 *                  field_2_name : ["Error 1", "Error 2"]
 *              }
 *          })
 *      },
 *      //Delete callback
 *      onDelete : function(recordId, row, callback){
 *          success : 1, //1 or 0 | required
 *          error : ["Error 1", "Error 2"] //Put errors here is there was some error in update | optional
 *          errorBag : {
 *                  // Laravel 5 standard ErrorBag response | optional
 *                  field_1_name : ["Error 1", "Error 2"],
 *                  field_2_name : ["Error 1", "Error 2"]
 *              }
 *      }
 *  });
 *
 *
 */


(function($){

    $.fn.editableTable =    function(options){

        var defaults = {
            labels : false,                 //Enable show labels for edit and delete buttons
            editLabel : 'Edit',             //Edit button label
            editBtnClass : 'btn btn-info',  //Edit button class
            editIcon : 'fa fa-pencil',      //Edit button icon class
            updateLabel : 'Update',         //Update button label
            updateIcon : 'fa fa-save',      //Update button icon class
            deleteLabel : 'Delete',         //Delete button label
            deleteIcon : 'fa fa-trash',     //Delete button icon class
            deleteBtnClass : 'btn btn-danger',  //Delete button class
            editType : 'row',               //Edit mode
            formInputClass : 'form-control',//Inputs class
            deleteMsg : 'Are you sure you want to delete this record?', //On delete confirmation message
            onUpdate : null,                //On update callback
            onDelete : null,                //On delete callback
            errorColor : 'red'              //Error messages text color
        };
        var settings = $.extend({},defaults, options);


        function er(row, id) {
            var tds = $(row).closest('tr').find('td');
            $.each(tds, function(){
                if($(this).attr('data-editable')){
                    var name = $(this).data('editable');
                    var val = $(this).text();
                    var type = $(this).data('editable-type');
                    if( type == undefined) type = 'text';
                    $(this).html('<input type="'+type+'" name="'+name+'" value="'+val+'" class="editable-input '+settings.formInputClass+'"/>');
                }

            });
            $(row).data('editable','true');
            $(row).find('.editable-edit i').removeClass(settings.editIcon).addClass(settings.updateIcon);
        };

        function ur(row, id) {
            var tds = $(row).closest('tr').find('td');
            var data = {};
            $.each(tds, function(){
                if($(this).attr('data-editable')){
                    var name = $(this).data('editable');
                    var val = $(this).find(':input').val();
                    $(this).text(val);
                    data[name] = val;
                }

            });
            $(row).find('input[type=hidden]').each(function(){
                var name = $(this).attr('name');
                var val = $(this).val();
                data[name] = val;
            });
            $(row).removeData('editable');
            $(row).find('.editable-del i').removeClass(settings.updateIcon).addClass(settings.editIcon);
            return {
                id : id,
                fields : data
            };
        }

        function eb(row, errors) {
            $.each(errors, function(key, error){
                $(row).find("td[data-editable='" + key + "']").append('<small style="color:'+settings.errorColor+'">'+error+'</small>');
            });
        }
        
        function err(row, errors) {
            $(row).closest('table').before('<div class="alert-danger"><ul><li>'+errors.join('</li><li></li>')+'</li></ul></div>');
        }

        return this.each(function(){
            var table = $(this);


            $(table).find('tr').each(function (i, row) {
                var recordId = $(row).data('editable-id');
                if(recordId == undefined) return;
                var editLabel = (settings.labels)?settings.editLabel:'';
                var editBtn = $('<button class="editable-edit '+settings.editBtnClass+'"><i class="'+settings.editIcon+'"></i> '+editLabel+'</button>');
                var deleteLabel = (settings.labels)?settings.deleteLabel:'';
                var deleteBtn = $('<button class="editable-del '+settings.deleteBtnClass+'"><i class="'+settings.deleteIcon+'"></i> '+deleteLabel+'</button>');
                $(row).find('td:last').append(editBtn).append(deleteBtn);

                $(editBtn).on("click", function () {
                    var mode = $(row).data('editable');
                    if( mode ==  undefined) mode = 'edit';
                    else mode= 'update';

                    if(mode == 'edit') {
                        er(row, recordId);
                    } else if(mode == 'update') {
                        var data = ur(row, recordId);
                        if ( $.isFunction( settings.onUpdate ) ) {
                            settings.onUpdate.call( this, data , function(res){
                                if(!res.success) {
                                    er(row, recordId);
                                    if(res.errorsBag != undefined) eb(row, res.errorsBag);
                                    if(res.errors != undefined) err(row, res.errors);
                                }
                            });
                        }
                    }
                });

                $(deleteBtn).on('click', function () {
                    if(confirm(settings.deleteMsg)) {
                        if ( $.isFunction( settings.onDelete ) ) {
                            settings.onDelete.call( this, recordId, row , function(res){
                                if(res.success) $(row).hide();
                                if(res.errorsBag != undefined) eb(row, res.errorsBag);
                                if(res.errors != undefined) err(row, res.errors);
                            });
                        }

                    }
                })
            })

        });
    };




}(jQuery));