$(document).ready(function(e) {

  //render all todo list items
  $.ajax({
    type: "GET",
    url: '/db',
    contentType: 'application/json',
    success: function (data) {
      //console.log(data[1])
      data.forEach(row=>{
        var taskName=row.item
        var taskHTML = '<li><span class="done">%</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="edit">+</span>';
        taskHTML += '<span class="task"></span></li>';
        var $newTask = $(taskHTML);
        $newTask.find('.task').text(taskName);

        //is the todo item active or completed?
        if(row.status=='active'){
          $('#todo-list').prepend($newTask);
        } else {
          $('#completed-list').prepend($newTask);
        }
    })
  },
  error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         alert('Error - ' + errorMessage);
     }
});


  $('#add-todo').button({icons: {primary: "ui-icon-circle-plus"}}).click(
    function(){

      $('#new-todo').dialog('open');
    });
  $("#new-todo").dialog({
    modal: true,
    autoOpen: false,
    buttons: {
      "Add task" : function () {
            var taskName = $('#task').val();
            if (taskName === '') { return false; }
            var taskHTML = '<li><span class="done">%</span>';
            taskHTML += '<span class="delete">x</span>';
            taskHTML += '<span class="edit">+</span>';
            taskHTML += '<span class="task"></span></li>';
            var $newTask = $(taskHTML);
            $newTask.find('.task').text(taskName);
            $newTask.hide();
            $('#todo-list').prepend($newTask);
            $newTask.show('clip',250).effect('highlight',1000);

            data = {
              item:taskName,
              status:'active'
            }
            $.ajax({
              type: "POST",
              url: '/addtodo',
              data: JSON.stringify(data),
              contentType: 'application/json',
              success: function (data) {
                console.log("SUCCESSFUL");
              },
              error: function(xhr, status, error){
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alert('Error - ' + errorMessage);
              }
            });

            $(this).dialog('close');
            $('#task').val(''); //clears the dialog box text
          },
      "Cancel": function(){$(this).dialog('close');}
    }
  });

  $('#todo-list').on('click', '.done', function() {
    var $taskItem = $(this).parent('li');
    $taskItem.slideUp(250, function() {
      var $this = $(this);
      $this.detach();
      $('#completed-list').prepend($this);
      $this.slideDown();
    });

    item_val=$taskItem.find(".task").text();
    $.ajax({
      type: "PUT",
      url: '/update-status-to-completed',
      data: JSON.stringify({item:item_val}),
      contentType: 'application/json',
      success: function (data) {
        console.log("SUCCESSFUL");
      },
      error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         alert('Error - ' + errorMessage);
     }
    });
  });

  $('.sortlist').sortable({
    connectWith: '.sortlist',
    cursor: 'pointer',
    placeholder: 'ui-state-highlight',
    cancel: '.delete,.done',
    receive: function(event,ui){
      if (this.id==="completed-list"){
        item_val = ui.item[0].childNodes[3].textContent
        $.ajax({
          type: "PUT",
          url: '/update-status-to-completed',
          data: JSON.stringify({item:item_val}),
          contentType: 'application/json',
          success: function (data) {
            console.log("SUCCESSFUL");
          },
        });
      }else{
        item_val = ui.item[0].childNodes[3].textContent
        $.ajax({
          type: "PUT",
          url: '/update-status-to-active',
          data: JSON.stringify({item:item_val}),
          contentType: 'application/json',
          success: function (data) {
            console.log("SUCCESSFUL");
          },
          error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText
            alert('Error - ' + errorMessage);
          }
        });
      }
    }
  });

  $('.sortlist').on('click','.delete',function() {
    $del=$(this).parent('li');
    $('#confirm-del').data('toDelete',$del);
    $('#confirm-del').dialog('open');
  });

  $('#confirm-del').dialog({
    autoOpen:false,
    modal: true,
    buttons: {
      "Confirm" : function(){
        var $item_to_delete = $("#confirm-del");
        var item_val = $item_to_delete.data('toDelete').find(".task").text();
        $item_to_delete.data('toDelete').effect('puff', function() { $(this).remove();});
        //processResult(true)
        $.ajax({
          type: "PUT",
          url: '/deletetodo',
          data: JSON.stringify({item:item_val}),
          contentType: 'application/json',
          success: function (data) {
            console.log("SUCCESSFUL");
          },
          error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText
            alert('Error - ' + errorMessage);
          }
        });
        $(this).dialog('close');
      },
      "Cancel" : function(){
        $(this).dialog('close');
      }
    }
  });

  $('#todo-list').on('click','.edit',function() {

    var current_text = $(this).parent('li').find(".task").text()
    var $toedit = $(this).parent('li').find(".task")
    $('#edit-box').data('toEdit',$toedit);
    $('#task-edit').val(current_text);
    $('#edit-box').dialog('open');
  });

  $('#edit-box').dialog({
    autoOpen:false,
    modal: true,
    buttons: {
      "Confirm" : function(){
        var new_text = $('#task-edit').val()
        var $item_to_edit = $("#edit-box");
        var old_text=$item_to_edit.data('toEdit').text();
        $item_to_edit.data('toEdit').text(new_text);

        $.ajax({
          type: "PUT",
          url: '/updatetodo',
          data: JSON.stringify({olditem: old_text, newitem: new_text}),
          contentType: 'application/json',
          success: function (data) {
            console.log("SUCCESSFUL");
          },
          error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText
            alert('Error - ' + errorMessage);
          }
        });

        $(this).dialog('close');
      },
      "Cancel" : function(){
        $(this).dialog('close');
      }
    }
  });


}); // end ready
