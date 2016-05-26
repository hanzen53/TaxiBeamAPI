var Manage = (function () {
  var init = function(){
    getDataForm();
    selectFormChange();
    eventBtnSave();
  };

  var formData_;

  var getDataForm = function(){
    $.ajax({
      url:  "/service/passengercs/ListDrv",
      dataType: "json",
      type: "get",
      async: false,
      success: function(data) {
        console.log(data)
        formData_ = data;
        var sl = $("#select-form");
        _.each(data, function(item, i){
          var opt = $("<option>",{
            value: item.aid,
            text: item.name
          });
          sl.append(opt);
        });
      },
      error: function (xhr, status, e) {
       // console.log('erroe  '+e );
      }
    });
  };

  var selectFormChange = function(){
    $("#select-form").change(function(){
      if ($("#select-form option:selected").val() == "") {
        $("#tb-detail").empty();
      } else {
        detailGeomType();
      }
    });
  };

  var detailGeomType = function(){
    $.ajax({
      url:  "/manage_data/detail",
      data: {
        aid: $("#select-form option:selected").val()
      },
      dataType: "json",
      type: "post",
      async: false,
      success: function(data) {
        
        data = data.data;
        var items = [];
        var form_tmp = _.find(formData_,{aid: $("#select-form option:selected").val()}).json;
        _.each(form_tmp.rows, function(row){
          _.each(row, function(item){
            items.push(item);
          })
        });
        
        var div = $("#tb-detail");
        div.empty();
        var tb = $("<table>",{
          class: "table table-striped table-bordered table-hover table-condensed"
        });
        var thead = $("<thead>");
        var tbody = $("<tbody>");
        tb.append(thead);
        tb.append(tbody);
        div.append(tb);
        cols_data_table = [];
        var header = [];
        _.each(data, function(row, i){
          if (i == 0) {
            var tr = $("<tr>");
            _.each(_.keys(row.obj_json), function(k){
              if (k != 'table' && k != "subform") {
                header.push(k)
                var str = k;
                var tmp = _.find(items, {name: k})
                if (tmp) {str =tmp.displayName};
                tr.append("<td>"+str+"</td>");
                cols_data_table.push({bSortable: false})
              }
            });
            thead.append(tr);
          }
          var tr = $("<tr>");
          _.each(header, function(k){
            if (k != 'table' && k != "subform") {
              tr.append("<td>"+(row.obj_json[k]||"")+"</td>");
            }
          });
          tr.click(row, function(e){
            rowClick(e.data);
          });
          tbody.append(tr);
        });
        var table = tb.DataTable({
          aaSorting: [],
          // bFilter: false,
          bLengthChange: false,
          // bAutoWidth: false,
          aoColumns: cols_data_table,
          // bProcessing: true,
          // bServerSide: true,
          language: {
            info: "_PAGE_/_PAGES_",
          },
          pagingType: "simple"
        });
      },
      error: function (xhr, status, e) {
        console.log('error  '+e );
      }
    });
  };
  var gid = "";
  var rowClick = function(data){
    gid = data.gid;
    var form = _.find(formData_, {aid: data.dataform_id.toString() });
    formData = form.json;
    var body_preview = $("#body-preview");
    body_preview.empty();    
    formDynamic.renderDynamicForm(form.json, "#body-preview");
    var form = body_preview.find("form[role=main]"),
        obj_json = data.obj_json;
    var keys = _.keys(obj_json);
    setValueFormConfig(keys, form, obj_json);
    $("#modal-preview").modal();
  };

  var eventBtnSave = function(){
    $("#btn_save").click(function(){
      var form = $(this).parent().parent().find("div.modal-body");
      var data = formDynamic.getFormValueJson( form );
      
      // role=main
      $.ajax({
        url:  "/manage_data/update_main",
        dataType: "json",
        type: "post",
        async: false,
        data: {
          main: JSON.stringify(data.main),
          gid: gid
        },
        success: function(data) {},
        error: function (xhr, status, e) {
          console.log('erroe  '+e );
        }
      });

      // Upload
      var files = form.find("input:file")
      var formData = new FormData();
      var check_file = false;
      formData.append("gid", gid)
      $.each(files, function(i, file) {
        if (file.value != "") {
          formData.append(file.name, file.files[0]);
          check_file = true;
        }
      });
      if (check_file) {
        $.ajax({
          url: '/upload_image',
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          async: false,
          success: function(data){}
        });
      }

      // Table
      _.each(data.table, function(item){
        $.ajax({
          url:  "/create_table",
          dataType: "text",
          type: "post",
          async: false,
          data: {
            table: JSON.stringify(item),
            gid: gid
          },
          success: function(data) {
            console.log("table success");
          },
          error: function (xhr, status, e) {
            console.log('erroe  '+e );
          }
        });
      });
      $("#modal-preview").modal('hide');
      $("#select-form").change();
    });
  };


  return {
    init: init
  };
})()
