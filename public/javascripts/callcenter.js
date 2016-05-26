var Map = null;
var LOCAL_STATE = [];
var LOCAL_STATE_CONTROL = {
    remove: function(data) {
        LOCAL_STATE = LOCAL_STATE.filter(function(task) {
            return task.id !== data.id;
        });
    }
};


var CONSTRAINTS = {
    daterangepicker: {
        options: {
            opens: "left",
            timePicker: false,
            autoApply: false,
            locale: {
                "format": "DD/MM/YYYY HH:mm",
                "separator": " - ",
                "applyLabel": "ตกลง",
                "cancelLabel": "ยกเลิก",
                "fromLabel": "จาก",
                "toLabel": "ถึง",
                "customRangeLabel": "กำหนดเอง",
                "daysOfWeek": [
                "อ.",
                "จ.",
                "อ.",
                "พ.",
                "พฤ.",
                "ศ.",
                "ส."
                ],
                "monthNames": [
                "มกราคม",
                "กุมภาพันธ์",
                "มีนาคม",
                "เมษายน",
                "พฤษภาคม",
                "มิถุนายน",
                "กรกฎาคม",
                "สิงหาคม",
                "กันยายน",
                "ตุลาคม",
                "พฤศจิกายน",
                "ธันวาคม"
                ],
                "firstDay": 1
            },
            alwaysShowCalendars: false,
            ranges: {
                'วันนี้': [moment(), moment()],
                'เมื่อวาน': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '7 วันที่แล้ว': [moment().subtract(6, 'days'), moment()],
                '30 วันที่แล้ว': [moment().subtract(29, 'days'), moment()],
                'เดือนนี้': [moment().startOf('month'), moment().endOf('month')],
                'เดือนที่แล้ว': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }
    }
};


var App = {
    init: function () {

        App.show();
        Preloader.show();

        Sound.initial();
        Socket.initial();
        App.createMap();
        Taxi.initial();
        Loader.initial();
        HotKey.initial();
        Report.initial();
        LandMark.initial();
        Bootstrap.initial();
        JQuery.NumberOnlyInit();
        DateTimePicker.initial();
        iOSwitchery.initial();

        Monitoring.initial();

        Form.announceForm.initial();
        Form.createTaskForm.initial();
        Form.assignTaskForm.initial();
        Form.announceEditForm.initial();
        Form.searchFinishedTaskForm.initial();
        Form.assignTaskSearchTaxiForm.initial();
        Form.assignedTaskEditableForm.initial();
        Form.searchTaxiBeforeAssignForm.initial();

        Modal.initial();
        Modal.reportModal.initial();
        Modal.confirmModal.initial();
        Modal.successModal.initial();
        Modal.areaSuggestion.initial();
        Modal.createTaskModal.initial();
        Modal.assignTaskModal.initial();
        Modal.assignedTaskModal.initial();
        Modal.announcementModal.initial();
        Modal.assignTaskByLineModal.initial();
        Modal.announcementEditModal.initial();
        Modal.searchTaskWithResultListModal.initial();
        Modal.confirmNoneRegisterDriverModal.initial();

        DataTable.searchTaskResultTable.initial();

        LiveCall.initial();
        LiveBeam.initial();
        ChatControl.initial();
    },
    show: function() {
        setTimeout(function() {
            $(".intial-app-loading").find('.loader, .text').fadeOut('fast');
            setTimeout(function() {
                $(".intial-app-loading").fadeOut('normal');
                setTimeout(function() {

                    $("body > .container-fluid.app").fadeIn(700);
                    $("body > .navbar").fadeIn(700);

                    setTimeout(function() {
                        DataTable.queueTaskTable.initial(true);
                        DataTable.taxiReportTable.initial();
                        DataTable.advanceTaskTable.initial(true);
                        DataTable.pendingTaskTable.initial(true);
                        DataTable.assignedTaskTable.initial(true);

                        window.screen.availWidth <= 414 && App.layout.setMobileLayout();

                        Socket.emit('update state', { user: USER_DATA });
                    }, 700);

                    setTimeout(function() {
                        $("body").removeClass("loading");
                        $(".intial-app-loading").remove();
                    }, 700);

                }, 700);
            }, 700)
        }, 1000);
    },
    createMap: function () {

        Map = H.map('map');

        Map.setBasemap(3)
        Map.toggle3D();
        Map.setMaxZoom(18);
        Map.setLanguage("TH");

        //Map.control.zoom.disable();
        //Map.control.menu.disable();
        Map.control.locate.disable();
        //Map.control.mapSource.disable();
    },
    setDefaultPosition: function () {
        Map.setView(USER_CURRENT_LOCATION, 12);
    },
    setCurrentPosition: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                Map.setView([position.coords.latitude, position.coords.longitude], 13);
            });
        }
    },
    toggleSidebar: function () {
        $('#st-container').toggleClass('st-menu-open');
        $('.hb-locator_search').toggleClass('relative-sidebar');
    },
    hideSidebar: function () {
        $('#st-container').removeClass('st-menu-open');
        $('.hb-locator_search').removeClass('relative-sidebar');
    },
    intervalManager: function (flag, action, time) {
        // http://stackoverflow.com/a/10935062
        if (flag) {
            return setInterval(action, time);
        }
        else {
            typeof action !== 'undefined' && clearInterval(action);
        }
    },
    layout: {
        setToRowAlign: function() {
            var layout = $(".container-fluid.app").find(">.row > .col-lg-6");
            layout.removeClass("col-lg-6");
            layout.addClass("col-lg-12");
            setTimeout(function() {
                DataTable.queueTaskTable.datatable.draw();
                DataTable.advanceTaskTable.datatable.draw();
                DataTable.pendingTaskTable.datatable.draw();
                DataTable.assignedTaskTable.datatable.draw();
            }, 500);
        },
        setToColumnAlign: function() {
            var layout = $(".container-fluid.app").find(">.row > .col-lg-12");
            layout.removeClass("col-lg-12");
            layout.addClass("col-lg-6");
            setTimeout(function() {
                DataTable.queueTaskTable.datatable.draw();
                DataTable.advanceTaskTable.datatable.draw();
                DataTable.pendingTaskTable.datatable.draw();
                DataTable.assignedTaskTable.datatable.draw();
            }, 500);
        },
        setMobileLayout: function () {

            $("#table-pending-tab").detach().appendTo("#leftTabContent");
            $("#table-assigned-tab").detach().appendTo("#leftTabContent");

            $("#table-pending-tab").removeClass("active");

            $("#rightTabList, #rightTabContent").css({ display: "none" });

            $("body .app .tab-bottom").show();

            DataTable.queueTaskTable.datatable.draw();
            DataTable.pendingTaskTable.datatable.draw();
            DataTable.assignedTaskTable.datatable.draw();
            DataTable.advanceTaskTable.datatable.draw();

            $(".tab-bottom").find(".nav.nav-tabs").on('shown.bs.tab', function (e) {
                switch (e.target.hash) {
                    case "#table-queue-tab":
                    DataTable.queueTaskTable.datatable.draw();
                    break;
                    case "#table-advance-tab":
                    DataTable.advanceTaskTable.datatable.draw();
                    break;
                    case "#table-pending-tab":
                    DataTable.pendingTaskTable.datatable.draw();
                    break;
                    case "#table-assigned-tab":
                    DataTable.assignedTaskTable.datatable.draw();
                    break;
                }
            });
        }
    }
};


var Announcement = {
    getAll: function () {
        Http.post('service/ubeam/announcement/all', {
            onSuccess: function (response) {
                if (response.status) {
                    Modal.announcementModal.modal.find(".modal-body").empty();
                    $(response.data).each(function (index, announce) {
                        var HTMLMedia = '<div class="media" data-ref="' + announce._id + '">';
                        HTMLMedia += '<div class="media-left">';
                        HTMLMedia += '<a href="#">'
                        HTMLMedia += '<img class="media-object img-circle" src="assets/img/callcenter-profile-sample-face.png" style="width: 64px; height: 64px;">';
                        HTMLMedia += '</a>';
                        HTMLMedia += '</div>';
                        HTMLMedia += '<div class="media-body">';
                        HTMLMedia += '<h4 class="media-heading">' + announce.topic + '</h4>';
                        HTMLMedia += announce.detail;
                        if (announce.createdby === USER_DATA.username) {
                            HTMLMedia += '<a href="#" class="btn btn-link" onclick="Announcement.showEditModal(this);"><span class="glyphicon glyphicon-pencil edit" aria-hidden="true"></span> แก้ไบ</a>';
                            HTMLMedia += '<a href="#" class="btn btn-link" onclick="Announcement.showConfirmRemoveModal(\'' + announce._id + '\');"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> ลบทิ้ง</a>';
                        }
                        HTMLMedia += '</div>';
                        HTMLMedia += '</div>';

                        Modal.announcementModal.modal.find(".modal-body").append(HTMLMedia);
                        Modal.announcementModal.modal.find(".modal-body [data-ref='" + announce._id + "']").data(announce);
                    });
                }
                else {
                    Modal.announcementModal.modal.find(".modal-body").empty();
                }
            }
        });
    },
    remove: function (id) {
        Preloader.show();
        Http.post('/service/ubeam/announcement/delete', {
            data: {
                "user_id": USER_DATA._id,
                "ann_id": id
            },
            onSuccess: function (response) {
                if (response.status) {
                    Notification.defaultSuccess();
                    Modal.announcementModal.modal.find(".modal-body [data-ref='" + id + "']").remove();
                    Modal.confirmModal.modal.modal("hide");
                }
                else {
                    Notification.defaultError();
                }
            }
        });
    },
    showEditModal: function (elem) {
        var announce = $(elem).closest('.media').data();
        Modal.announcementEditModal.modal.find('[name="ann_id"]').val(announce._id);
        Modal.announcementEditModal.modal.find('[name="topic"]').val(announce.topic);
        Modal.announcementEditModal.modal.find('[name="detail"]').val(announce.detail);

        Modal.announcementEditModal.open();
    },
    showConfirmRemoveModal: function (id) {

        var onShow = function (event) {
            Modal.confirmModal.modal.find('[data-dismiss="modal"]').focus();
            Modal.confirmModal.modal.find('.confirm').on("click", function () { window["Announcement"]["remove"](id) });
        }

        var onClose = function (event) {
            Modal.confirmModal.modal.find('.confirm').unbind();

            Modal.confirmModal.modal.unbind('shown.bs.modal', onShow);
            Modal.confirmModal.modal.unbind('hidden.bs.modal', onClose);
        }

        Modal.confirmModal.modal.on('shown.bs.modal', { modal: this }, onShow);

        Modal.confirmModal.modal.on('hidden.bs.modal', { modal: this }, onClose);
        
        Modal.confirmModal.modal.find(".modal-body > .message").html("ต้องลบประกาศนี้ใช่มั้ย?");
        Modal.confirmModal.open();
    }
};


var Bootstrap = {
    initial: function () {
        $(".modal").modal({
            show: false,
            keyboard: true
        });

        $('[data-toggle="tooltip"]').tooltip({ animation: false });

        $('.user-profile-tab .dropdown-menu li:first').on("click", function (e) {
            e.stopPropagation();
        });

        $('#leftTabList, #rightTabList').find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.hash == "#table-queue-tab") {
                DataTable.queueTaskTable.datatable.draw(false);
            }
            else if (e.target.hash == "#table-advance-tab") {
                DataTable.advanceTaskTable.datatable.order(2, "desc").draw(false);
            }
            else if (e.target.hash == "#table-pending-tab") {
                DataTable.pendingTaskTable.datatable.order(2, "desc").draw(false);
            }
            else if (e.target.hash == "#table-assigned-tab") {
                DataTable.assignedTaskTable.datatable.order(2, "desc").draw(false);
            }
        });
    },
};


var Chat = {
    $this: $("#chat-board"),
    $caller: $("#navbar .chat-tab"),
    open: function () {
        Chat.$this.addClass('open');
    },
    toggle: function () {
        Chat.$this.toggleClass('open');
    },
    close: function () {
        Chat.$this.removeClass('open');
    },
    popOut: function () {
        this.close();
        Chat.$caller.hide();
        setTimeout(function () {
            window.open(window.location.origin + "/chat_box", "_blank", "toolbar=yes, scrollbars=no, resizable=yes, top=100, left=500, width=400, height=760");
        }, 300);
    }
};


var ChatControl = {
    timeoutId: null,
    record: $("#liveChatModal").find(".controller .record"),
    cancel: $("#liveChatModal").find(".controller .cancel"),
    initial: function() {
        ChatControl.record.on("click", function() {

            // On Stop
            if(ChatControl.record.hasClass('active')) {

                clearTimeout(ChatControl.timeoutId);

                ChatControl.record.removeClass("active");
                ChatControl.cancel.hide();

                ChatControl.record.disabled = true;
                mediaRecorder.state == "recording" && mediaRecorder.stop();
                Notification.defaultSuccess();

                setTimeout(function() {
                    Socket.emit('radio', LiveCall.voice);
                    ChatControl.record.disabled = false;
                }, 1000);

            }
            // On Start
            else {
                ChatControl.record.addClass("active");
                ChatControl.cancel.show();

                mediaRecorder.state == "inactive" && mediaRecorder.start();

                ChatControl.timeoutId = setTimeout(function() {
                    ChatControl.record.disabled = false;
                    ChatControl.record.removeClass("active");
                    ChatControl.cancel.hide();

                    mediaRecorder.state == "recording" && mediaRecorder.stop();
                }, 15000);
            }
        });

        ChatControl.cancel.on("click", function() {

            clearTimeout(ChatControl.timeoutId);

            mediaRecorder.state == "recording" && mediaRecorder.stop();
            ChatControl.record.removeClass("active");
            ChatControl.cancel.hide();

        });
    }
};


var LiveBeam = {
    drivers: [],
    listView: $("#driverListChatModal").find(".driver-list"),
    initial: function() {
        LiveBeam.update();
    },
    update: function() {
        Http.post("socket/getDriverOnline", {
            loader: false,
            onSuccess: function (response) {
                if (response.status) {
                    LiveBeam.listView.empty();
                    response.data.filter(function(driver) {
                        LiveBeam.toListView(driver);
                    });
                }
            }
        });
    },
    toListView: function(driver) {

        Modal.driverListChatModal.modal.find("[data-ref='" + driver.socketId + "']").remove();

        var html = '<button data-ref="' + driver.socketId + '" type="button" class="list-group-item" ';
        html += 'onclick="Modal.liveChatModal.open(this);">' + driver._driver.fname + ' ' + driver._driver.lname + '</button>';
        LiveBeam.listView.append(html);
        Modal.driverListChatModal.modal.find("[data-ref='" + driver.socketId + "']").data(driver);
    }
};


var DateTimePicker = {
    minHour: 3,
    picker: $('#createdjob'),
    initial: function () {

        var minDate = new Date().getTime() + (DateTimePicker.minHour * 60 * 60 * 1000);

        DateTimePicker.picker.datetimepicker({
            inline: true,
            format: "MM/dd/YYYY HH:mm",
            minDate: new Date(minDate)
        });
    },
    setMinDate: function () {
        var minDate = new Date().getTime() + (DateTimePicker.minHour * 60 * 60 * 1000);
        DateTimePicker.picker.data("DateTimePicker").minDate(new Date(minDate));
    }
};


var DataTable = {
    queueTaskTable: {
        $table: $("#queueTaskTable"),
        datatable: null,
        initial: function (loader) {
            DataTable.queueTaskTable.datatable = DataTable.queueTaskTable.$table.DataTable({
                scrollY: (window.screen.availHeight - (window.screen.availHeight > 414 ? 300 : 132)),
                scrollCollapse: true,
                pageLength: 10,
                paging: true,
                autoWidth: true,
                order: [[ 1, 'asc' ], [ 2, 'asc' ]],
                deferRender: true,
                searching: true,
                keys: true,
                oLanguage: {
                    "sEmptyTable": "ไม่มีข้อมูลให้แสดงผล",
                    "sLengthMenu": " _MENU_ ",
                    "sInfo": "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ"
                },
                columnDefs: [
                {
                    targets: 0,
                    width: "30px",
                    render: function (data, type, row) {
                        return (data == undefined || data == "" ? "-" : data);
                    }
                },
                {
                    targets: 1,
                    width: "30px",
                    visible: window.screen.availWidth > 414,
                    className: "jobtype",
                    render: function (data, type, row) {
                        var tooltipNormal = '<span class="circle-text default" data-toggle="tooltip" title="คิวงานปกติ">N</span>';
                        var tooltipAdvance = '<span class="task-type circle-text orange" data-toggle="tooltip" title="งานจองล่วงหน้า">A</span>';
                        return (data != undefined && data == 'QUEUE' ? tooltipNormal : tooltipAdvance);
                    }
                },
                {
                    targets: 2,
                    width: "50px",
                    render: function (data, type, row) {
                        return (data == undefined ? '' : Util.getCurrentTime(data.toLocaleUpperCase()));
                    }
                },
                {
                    targets: [3, 4, 5],
                    className: "inline-edit",
                    createdCell: function (td, cellData, rowData, row, col) {

                        if (col == 3) {
                            $(td).attr("data-field-name", "curaddr");
                        }
                        else if (col == 4) {
                            $(td).attr("data-field-name", "destination");
                        }
                        else if (col == 5) {
                            $(td).attr("data-field-name", "phone");
                        }

                        $(td).attr({
                            'title': 'ดับเบิ้ลคลิ๊กเพื่อแก้ไข',
                            'data-toggle': 'tooltip'
                        }).on('dblclick', DataTable.inlineEditable);
                    }
                },
                {
                    targets: 5,
                    visible: window.screen.availWidth > 414,
                },
                {
                    targets: 6,
                    width: "60px",
                    visible: window.screen.availWidth > 414,
                    render: function (data, type, row) {

                        var cell = '<span class="status-time ' + Util.getTimeStatus(data) + '">';
                        cell += '<i class="fa fa-bookmark"></i>';
                        var diff = (row[1] != undefined && row[1] == 'QUEUE' ? Util.getDiffTime(row[6]) : { time: 'งานจอง', unit: 'ล่วงหน้า' });
                        cell += '<span class="detail">' + diff.time + '<br><span>' + diff.unit + '</span>';
                        cell += '</span>';

                        return cell;
                    }
                },
                {
                    targets: 7,
                    width: "80px",
                    visible: window.screen.availWidth > 414,
                    render: function (data, type, row) {
                        var cell = '<div class="btn-group" role="group" aria-label="...">';
                        cell += '<button type="button" class="btn btn-default showFindTaxi" data-toggle="tooltip" title="จ่ายงาน" onclick="DataTable.queueTaskTable.callTaxiModal(this);"><i class="fa fa-taxi"></i></button>';
                        cell += '<button type="button" class="btn btn-default removeCurrentPassenger" data-toggle="tooltip" title="ลบออก" onclick="Passenger.showConfirmRemoveModal(\'' + data + '\');"><i class="fa fa-trash-o"></i></button>';
                        cell += '</div>';
                        return cell;
                    }
                }
                ],
                createdRow: function (row, data, index) {

                    $(row).attr("data-ref", data[7]);

                    $(row).find('[data-toggle="tooltip"]')
                    .tooltip({ placement: 'top', container: 'body', animation: false })
                    .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });
                },
                rowCallback: function (row, data, index) {
                    $(row).find(".showFindTaxi").data(data);
                },
                drawCallback: function (settings) {
                    this.api().rows( {page:'current'} ).data().filter(function(data) {
                        if(LOCAL_STATE.length <= 0) {
                            DataTable.unlockLine({
                                id: data[7],
                                table: "queueTaskTable"
                            });
                        } 
                        else {
                            LOCAL_STATE.filter(function(task) {
                                task.id == data[7] ? DataTable.lockLine(task) : DataTable.unlockLine({ id: data[7], table: "queueTaskTable" });
                            });
                        }
                    });
                }
            });
            DataTable.queueTaskTable.update(loader);
        },
        update: function (loader) {
            Http.post("service/ubeam/getinitiatelist", {
                loader: loader,
                onSuccess: function (response) {
                    if (response.status) {
                        DataTable.queueTaskTable.datatable.clear();
                        DataTable.queueTaskTable.create(response.data);
                        DataTable.queueTaskTable.customTableHeader();
                    } else {
                        DataTable.queueTaskTable.datatable.clear().draw(false);
                        DataTable.queueTaskTable.setIndicator();
                        DataTable.queueTaskTable.customTableHeader();
                    }
                }
            });
        },
        create: function (data) {

            if (data == undefined) { return false; }

            $(data).each(function (index, task) {
                DataTable.queueTaskTable.datatable.row.add([
                    task.ccstation,
                    task.jobtype,
                    task.createdjob,
                    task.curaddr,
                    task.destination,
                    task.phone,
                    task.createdjob,
                    task._id
                ]).order( [ 1, 'asc' ], [ 2, 'asc' ] ).draw(false);
            });

            DataTable.queueTaskTable.setIndicator();
        },
        addRow: function (data) {
            if (data == undefined) { return false; }

            DataTable.queueTaskTable.datatable.row.add([
                data.ccstation,
                data.jobtype,
                data.createdjob,
                data.curaddr,
                data.destination,
                data.phone,
                data.createdjob,
                data._id
            ]).draw(false);
            DataTable.queueTaskTable.setIndicator();
        },
        updateRow: function (data) {
            var row = DataTable.queueTaskTable.$table.find('[data-ref="' + data.psg_id + '"]')[0];

            var rowIndex = DataTable.queueTaskTable.datatable.row(row).index();
            DataTable.queueTaskTable.datatable.row(rowIndex).data([
                data.ccstation,
                data.jobtype,
                data.createdjob,
                data.curaddr,
                data.destination,
                data.phone,
                data.createdjob,
                data.psg_id
            ]).draw(false);
        },
        updateTimeStatus: function () {
            if (DataTable.queueTaskTable.datatable != null) {
                DataTable.queueTaskTable.$table.find("tr").each(function (index, row) {
                    if ($(row).is('[data-ref]')) {
                        var html = DataTable.queueTaskTable.datatable.cell(row, 6).render("type");
                        $(row).find("td:eq(6)").html(html);
                        DataTable.queueTaskTable.setIndicator();
                    }
                });
            }
        },
        customTableHeader: function () {
            $(".queues.table-data").find('#searchQueueInput').on('keyup', function () {
                DataTable.queueTaskTable.datatable.search(this.value).draw(false);
            });

            var controls = $(".queues.table-data").find(".paging-length");
            $("#queueTaskTable_length").detach().appendTo(controls);
        },
        setIndicator: function () {
            var count = DataTable.queueTaskTable.$table.find(".status-time.new").size();
            if (count > 0) {
                $('[aria-controls="table-queue-tab"]').find(".indicator").html(count).show();
            }
            else {
                $('[aria-controls="table-queue-tab"]').find(".indicator").hide();
            }
        },
        callTaxiModal: function (button) {
            var data = $(button).data();
            Passenger.getData(data[7], function (response) {

                if (response.status) {

                    var passenger = response.psg_data;

                    Modal.assignTaskModal.modal.find(".text.phone").html(passenger.phone);
                    Modal.assignTaskModal.modal.find(".text.current").html(passenger.curaddr);
                    Modal.assignTaskModal.modal.find(".text.destination").html(passenger.destination);

                    if(passenger.provincearea == undefined) {
                        Modal.assignTaskModal.modal.find(".text.province").html("<i>-</i>");
                    }
                    else {
                        Modal.assignTaskModal.modal.find(".text.province").html(passenger.provincearea.nameTH);
                    }

                    if (passenger.detail == undefined || passenger.detail == "") {
                        Modal.assignTaskModal.modal.find(".text.detail").html("<i>-</i>");
                    }
                    else {
                        Modal.assignTaskModal.modal.find(".text.detail").html(passenger.detail);
                    }

                    Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false).val("");
                    Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);

                    Modal.assignTaskModal.modal.find("#pass_id").val(passenger._id);

                    Modal.assignTaskModal.modal.data({ "passengerData": passenger, "table": "queueTaskTable" });
                    Socket.emit("assigning task", { 'id': passenger._id, 'table': "queueTaskTable", 'user': USER_DATA });

                    Modal.assignTaskModal.open();
                }
                else {
                    Notification.defaultError();
                }
            });
        }
    },
    advanceTaskTable: {
        $table: $("#advanceTaskTable"),
        datatable: null,
        initial: function (loader) {

            DataTable.advanceTaskTable.datatable = DataTable.advanceTaskTable.$table.DataTable({
                "scrollY": (window.screen.availHeight - 250),
                "scrollCollapse": true,
                pageLength: 20,
                "paging": false,
                "autoWidth": false,
                "searching": true,
                deferRender: true,
                "oLanguage": {
                    "sEmptyTable": "ไม่มีข้อมูลให้แสดงผล",
                    "sInfo": "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ"
                },
                "columnDefs": [
                    {
                        targets: 0,
                        width: "30px",
                        render: function (data, type, row) {
                            return (data == undefined || data == "" ? "-" : data);
                        }
                    },
                    {
                        targets: 1,
                        width: "50px",
                        render: function (data, type, row) {
                            return (data == undefined ? '' : '<span class="time">' + Util.getCurrentTime(data) + ' น.</span><br/><span class="date">' + Util.getFullDate(data)) + '</span>';
                        }
                    },
                    {
                        targets: [2, 3, 4],
                        className: "inline-edit",
                        createdCell: function (td, cellData, rowData, row, col) {

                            if (col == 2) {
                                $(td).attr("data-field-name", "curaddr");
                            }
                            else if (col == 3) {
                                $(td).attr("data-field-name", "destination");
                            }
                            else if (col == 4) {
                                $(td).attr("data-field-name", "phone");
                            }

                            $(td).attr({
                                'title': 'ดับเบิ้ลคลิ๊กเพื่อแก้ไข',
                                'data-toggle': 'tooltip'
                            }).on('dblclick', DataTable.inlineEditable);
                        }
                    },
                    {
                        targets: 5,
                        width: "80px",
                        render: function (data, type, row) {
                            var cell = '<div class="btn-group" role="group">';
                            cell += '<button type="button" class="btn btn-default" data-toggle="tooltip" title="ลบออก" onclick="Passenger.showConfirmRemoveModal(\'' + data + '\');"><i class="fa fa-trash-o"></i></button>';
                            cell += '</div>';
                            return cell;
                        }
                    },
                    {
                        targets: [4, 5],
                        visible: window.screen.availWidth > 414,
                    }
                ],
                createdRow: function (row, data, index) {

                    $(row).attr("data-ref", data[5]);

                    $(row).find('[data-toggle="tooltip"]')
                    .tooltip({ placement: 'top', container: 'body', animation: false })
                    .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });
                },
                drawCallback: function (settings) {
                    this.api().rows( {page:'current'} ).data().filter(function(data) {
                        if(LOCAL_STATE.length <= 0) {
                            DataTable.unlockLine({
                                id: data[5],
                                table: "advanceTaskTable"
                            });
                        } 
                        else {
                            LOCAL_STATE.filter(function(task) {
                                task.id == data[5] ? DataTable.lockLine(task) : DataTable.unlockLine({ id: data[5], table: "advanceTaskTable" });
                            });
                        }
                    });
                }
            });

            DataTable.advanceTaskTable.update(loader);
        },
        update: function (loader) {
            Http.post("service/ubeam/getadvancelist", {
                loader: loader,
                onSuccess: function (response) {
                    if (response.status) {
                        DataTable.advanceTaskTable.datatable.clear();
                        DataTable.advanceTaskTable.create(response.data);
                        DataTable.advanceTaskTable.customTableHeader();
                    } else {
                        DataTable.advanceTaskTable.datatable.clear().draw(false);
                    }
                }
            });
        },
        create: function (data) {

            if (data == undefined) { return false; }
            $(data).each(function (index, task) {
                DataTable.advanceTaskTable.datatable.row.add([
                    task.ccstation,
                    task.createdjob,
                    task.curaddr,
                    task.destination,
                    task.phone,
                    task._id
                ]).order(1, "asc").draw(false);
            });
        },
        addRow: function (data) {
            if (data == undefined) { return false; }

            DataTable.advanceTaskTable.datatable.row.add([
                data.ccstation,
                data.createdjob,
                data.curaddr,
                data.destination,
                data.phone,
                data._id
            ]).draw(false);
        },
        updateRow: function (data) {

            var row = DataTable.advanceTaskTable.$table.find('[data-ref="' + data.psg_id + '"]')[0];
            var rowIndex = DataTable.advanceTaskTable.datatable.row(row).index();

            DataTable.advanceTaskTable.datatable.row(rowIndex).data([
                data.ccstation,
                data.createdjob,
                data.curaddr,
                data.destination,
                data.phone,
                data.psg_id
            ]).draw(false);
        },
        customTableHeader: function () {
            $(".advance.table-data").find('#searchAdvanceTaskInput').on('keyup', function () {
                DataTable.advanceTaskTable.datatable.search(this.value).draw(false);
            });
        },
        intervalUpdate: function() {
            setInterval(function() {

                var count = 0;

                DataTable.advanceTaskTable.datatable.data().filter(function(data) { 
                    var currentTime = new Date().getTime();
                    var taskTime = new Date(data[1]).getTime();
                    var diffTime = 10800000;
                    if((taskTime - currentTime) <= diffTime) {
                        count++;
                    }
                });

                if(count > 0) {
                    DataTable.queueTaskTable.update(true);
                    DataTable.advanceTaskTable.update(false);

                    Notification.remove();
                    Notification.show({
                        title: "เตือนงานจองล่วงหน้า",
                        text: "งานจองล่วงหน้าถึงเวลาแล้ว " + count + " งาน",
                        time: 6000,
                        $class: "info"
                    });

                    count = 0;
                }
            }, 15000);
        }
    },
    pendingTaskTable: {
        $table: $("#pendingTaskTable"),
        datatable: null,
        initial: function (loader) {

            DataTable.pendingTaskTable.datatable = DataTable.pendingTaskTable.$table.DataTable({
                "scrollY": (window.screen.availHeight - 250),
                "scrollCollapse": true,
                "paging": false,
                pageLength: 20,
                "autoWidth": false,
                deferRender: true,
                "searching": true,
                "oLanguage": {
                    "sEmptyTable": "ไม่มีข้อมูลให้แสดงผล",
                    "sInfo": "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ"
                },
                "columnDefs": [
                    {
                        targets: 0,
                        width: "30px",
                        render: function (data, type, row) {
                            return (data == undefined || data == "" ? "-" : data);
                        }
                    },
                    {
                        targets: 1,
                        width: "30px",
                        visible: window.screen.availWidth > 414,
                        className: "jobtype",
                        render: function (data, type, row) {
                            var tooltipNormal = '<span class="circle-text default" data-toggle="tooltip" title="คิวงานปกติ">N</span>';
                            var tooltipAdvance = '<span class="task-type circle-text orange" data-toggle="tooltip" title="งานจองล่วงหน้า">A</span>';
                            return (data != undefined && data == 'QUEUE' ? tooltipNormal : tooltipAdvance);
                        }
                    },
                    {
                        targets: 2,
                        width: "40px",
                        render: function (data, type, row) {
                            return (data == undefined ? '' : Util.getCurrentTime(data.toLocaleUpperCase()));
                        }
                    },
                    {
                        targets: 3,
                        width: "50px",
                        render: function (data, type, row) {
                            if (data.createdvia == "LINE") {
                                return '<span data-toggle="tooltip" title="งานนี้ต้องจ่ายผ่าน Line">' + data.drv_carplate + '</span>';
                            } else {
                                return '<span>' + data.drv_carplate + '</span>';
                            }
                        },
                        createdCell: function (td, cellData, rowData, row, col) {

                            $(td).attr("data-field-name", "drv_carplate");

                            cellData.createdvia == "LINE" ?
                                $(td).attr("class", "line-job") : $(td).attr("class", "normal-job");


                            // $(td).on('dblclick', DataTable.inlineEditable);
                        }
                    },
                    {
                        targets: [4, 5, 6],
                        className: "inline-edit",
                        createdCell: function (td, cellData, rowData, row, col) {

                            if (col == 4) {
                                $(td).attr("data-field-name", "curaddr");
                            }
                            else if (col == 5) {
                                $(td).attr("data-field-name", "destination");
                            }
                            else if (col == 6) {
                                $(td).attr("data-field-name", "phone");
                            }

                            $(td).attr({
                                'title': 'ดับเบิ้ลคลิ๊กเพื่อแก้ไข',
                                'data-toggle': 'tooltip'
                            }).on('dblclick', DataTable.inlineEditable);
                        }
                    },
                    {
                        targets: [ 4, 6 ],
                        visible: window.screen.availWidth > 414,
                    },
                    {
                        targets: 6,
                        width: "50px",
                    },
                    {
                        targets: 7,
                        width: "50px",
                        visible: window.screen.availWidth > 414,
                        render: function (data, type, row) {
                            var cell = "";
                            if (data.status == "DEPENDING_REJECT") {
                                cell += '<span class="label-rejected"><i class="fa fa-exclamation"></i> งานถูกปฏิเสธ</span>';
                            } else {
                                cell += '<span class="status-time ' + Util.getTimeStatus(data.createdjob) + '">';
                                cell += '<i class="fa fa-bookmark"></i>';
                                var diff = Util.getDiffTime(data.createdjob);
                                cell += '<span class="detail">' + diff.time + '<br><span>' + diff.unit + '</span>';
                                cell += '</span>';
                            }

                            return cell;
                        }
                    },
                    {
                        targets: 8,
                        width: "70px",
                        visible: window.screen.availWidth > 414,
                        render: function (data, type, row) {

                            var cell = '<div class="btn-group" role="group" aria-label="...">';
                            if (data.status == "DPENDING_LINE") {
                                cell += '<button type="button" class="btn btn-default showAssignLineModal" data-toggle="tooltip" title="จ่ายงานผ่าน Line" onclick="DataTable.pendingTaskTable.callAssignByLineAppModal(this);">';
                                cell += '<i class="material-icons">chat</i>';
                                cell += '</button>';
                            } else {
                                cell += '<button type="button" class="btn btn-default showFindTaxi" data-toggle="tooltip" title="จ่ายงาน" onclick="DataTable.pendingTaskTable.callTaxiModal(this);"><i class="fa fa-taxi"></i></button>';
                            }
                            cell += '<button type="button" class="btn btn-default removeCurrentPassenger" data-toggle="tooltip" title="ลบออก" onclick="Passenger.showConfirmRemoveModal(\'' + data._id + '\');"><i class="fa fa-trash-o"></i></button>';
                            cell += '</div>';
                            return cell;
                        }
                    }
                ],
                createdRow: function (row, data, index) {

                    $(row).attr("data-ref", data[8]._id);
                    $(row).addClass("pending");

                    $(row).find('[data-toggle="tooltip"]')
                    .tooltip({ placement: 'top', container: 'body', animation: false })
                    .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });
                },
                rowCallback: function (row, data, index) {
                    $(row).find(".showFindTaxi").data(data);
                    $(row).find(".showAssignLineModal").data(data);
                },
                drawCallback: function (settings) {
                    this.api().rows( {page:'current'} ).data().filter(function(data) {
                        if(LOCAL_STATE.length <= 0) {
                            DataTable.unlockLine({
                                id: data[8]._id,
                                table: "pendingTaskTable"
                            });
                        } 
                        else {
                            LOCAL_STATE.filter(function(task) {
                                task.id == data[8]._id ? DataTable.lockLine(task) : DataTable.unlockLine({ id: data[8]._id, table: "pendingTaskTable" });
                            });
                        }
                    });
                }
            });

            DataTable.pendingTaskTable.update(loader);
        },
        update: function (loader) {
            // Get Initiate List
            Http.post("service/ubeam/getdpendinglist", {
                loader: loader,
                onSuccess: function (response) {
                    if (response.status) {
                        DataTable.pendingTaskTable.datatable.clear();
                        DataTable.pendingTaskTable.create(response.data);
                        DataTable.pendingTaskTable.customTableHeader();
                    } else {
                        DataTable.pendingTaskTable.datatable.clear().draw(false);
                        DataTable.pendingTaskTable.setIndicator();
                    }
                }
            });
        },
        create: function (data) {
            if (data == undefined) { return false; }
            $(data).each(function (index, task) {
                DataTable.pendingTaskTable.datatable.row.add([
                    task.ccstation,
                    task.jobtype,
                    task.createdjob,
                    { status: task.status, drv_carplate: task.drv_carplate, createdvia: task.createdvia },
                    task.curaddr,
                    task.destination,
                    task.phone,
                    { status: task.status, createdjob: task.createdjob },
                    { _id: task._id, status: task.status }
                ]).draw(false);
            });
            DataTable.pendingTaskTable.setIndicator();
        },
        addRow: function (data) {

            if (data == undefined) { return false; }

            DataTable.pendingTaskTable.datatable.row.add([
                data.ccstation,
                data.jobtype,
                data.createdjob,
                { status: data.status, drv_carplate: data.drv_carplate, createdvia: data.createdvia },
                data.curaddr,
                data.destination,
                data.phone,
                { status: data.status, createdjob: data.createdjob },
                { _id: data._id, status: data.status }
            ]).draw(false);
            DataTable.pendingTaskTable.setIndicator();
        },
        updateRow: function (data) {

            var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            var rowIndex = DataTable.pendingTaskTable.datatable.row(row).index();

            DataTable.pendingTaskTable.datatable.row(rowIndex).data([
                data.ccstation,
                data.jobtype,
                data.createdjob,
                { status: data.status, drv_carplate: data.drv_carplate, createdvia: data.createdvia },
                data.curaddr,
                data.destination,
                data.phone,
                { status: data.status, createdjob: data.createdjob },
                { _id: data._id, status: data.status }
            ]).draw(false);
        },
        updateTimeStatus: function () {
            if (DataTable.pendingTaskTable.datatable != null) {
                DataTable.pendingTaskTable.$table.find("tr").each(function (index, row) {
                    if ($(row).is('[data-ref]')) {
                        var html = DataTable.pendingTaskTable.datatable.cell(row, 7).render("type");
                        $(row).find("td:eq(7)").html(html);
                        DataTable.pendingTaskTable.setIndicator();
                    }
                });
            }
        },
        customTableHeader: function () {
            $(".pending.table-data").find('#searchPendingTaskInput').on('keyup', function () {
                DataTable.pendingTaskTable.datatable.search(this.value).draw(false);
            });
        },
        setIndicator: function () {

            var count = DataTable.pendingTaskTable.datatable.rows()[0].length;
            if (count > 0) {
                $('#leftTabList, #rightTabList').find('[aria-controls="table-pending-tab"]').find(".indicator").html(count).show();
            }
            else {
                $('#leftTabList, #rightTabList').find('[aria-controls="table-pending-tab"]').find(".indicator").hide();
            }
        },
        callTaxiModal: function (button) {
            var data = $(button).data();
            Passenger.getData(data[8]._id, function (response) {

                if (response.status) {

                    var passenger = response.psg_data;

                    Modal.assignTaskModal.modal.find(".text.phone").html(passenger.phone);
                    Modal.assignTaskModal.modal.find(".text.current").html(passenger.curaddr);
                    Modal.assignTaskModal.modal.find(".text.destination").html(passenger.destination);

                    if (passenger.detail == undefined || passenger.detail == "") {
                        Modal.assignTaskModal.modal.find(".text.detail").html("<i>-</i>");
                    }
                    else {
                        Modal.assignTaskModal.modal.find(".text.detail").html(passenger.detail);
                    }
                    Modal.assignTaskModal.modal.find("#car-plate-inp").val(passenger.drv_carplate)[0].setSelectionRange(0, 8);;

                    Modal.assignTaskModal.modal.data({ "passengerData": passenger, "table": "pendingTaskTable" });
                    var data = { 'id': passenger._id, 'table': "queueTaskTable", 'user': USER_DATA };
                    LOCAL_STATE.push(data);
                    Socket.emit("assigning task", data);

                    Modal.assignTaskModal.modal.find("#pass_id").val(passenger._id);
                    Modal.assignTaskModal.open();

                }
                else {
                    Notification.defaultError();
                }
            });
        },
        callAssignByLineAppModal: function (button) {

            var data = $(button).data();
            Passenger.getData(data[8]._id, function (response) {

                if (response.status) {

                    var passenger = response.psg_data;

                    Modal.assignTaskByLineModal.modal.find(".text.phone").html(passenger.phone);
                    Modal.assignTaskByLineModal.modal.find(".text.current").html(passenger.curaddr);
                    Modal.assignTaskByLineModal.modal.find(".text.destination").html(passenger.destination);
                    Modal.assignTaskByLineModal.modal.find(".text.detail").html(passenger.detail);
                    Modal.assignTaskByLineModal.modal.find(".text.carplate").html(passenger.drv_carplate);

                    Modal.assignTaskByLineModal.modal.data({ "passengerData": passenger, "table": "pendingTaskTable" });
                    var data = { 'id': passenger._id, 'table': "pendingTaskTable", 'user': USER_DATA };
                    LOCAL_STATE.push(data);
                    Socket.emit("assigning task", data);

                    Modal.assignTaskByLineModal.modal.data("task", passenger);
                    Modal.assignTaskByLineModal.open();

                }
                else {
                    Notification.defaultError();
                }
            });

        },
    },
    assignedTaskTable: {
        $table: $("#assignedTaskTable"),
        datatable: null,
        initial: function (loader) {

            DataTable.assignedTaskTable.datatable = DataTable.assignedTaskTable.$table.DataTable({
                paging: true,
                autoWidth: false,
                pageLength: 50,
                deferRender: true,
                searching: true,
                scrollCollapse: true,
                scrollY: (window.screen.availHeight - 270),
                oLanguage: {
                    sEmptyTable: "ไม่มีข้อมูลให้แสดงผล",
                    sLengthMenu: " _MENU_ ",
                    sInfo: "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ"
                },
                columnDefs: [
                    {
                        targets: 0,
                        width: "35px",
                        render: function (data, type, row) {
                            return (data == undefined || data == "" ? "-" : data);
                        }
                    },
                    {
                        targets: 1,
                        width: "60px",
                        visible: window.screen.availWidth > 414,
                        render: function (data, type, row) {
                            return (data == undefined ? '' : '<span class="time">' + Util.getCurrentTime(data) + ' น.</span><br/><span class="date">' + Util.getFullDate(data)) + '</span>';
                        },
                        createdCell: function (td, cellData, rowData, row, col) {
                            $(td).attr("data-field-name", "createdjob");
                        }
                    },
                    {
                        targets: 2,
                        width: "60px",
                        render: function (data, type, row) {
                            return (data == undefined ? '' : '<span class="time">' + Util.getCurrentTime(data) + ' น.</span><br/><span class="date">' + Util.getFullDate(data)) + '</span>';
                        },
                        createdCell: function (td, cellData, rowData, row, col) {
                            $(td).attr("data-field-name", "createdjob");
                        }
                    },
                    {
                        targets: 3,
                        render: function (data, type, row) {
                            if (data.createdvia == "LINE") {
                                return '<span data-toggle="tooltip" title="งานนี้ถูกจ่ายผ่าน Line">' + data.drv_carplate + '</span>';
                            } else {
                                return data.drv_carplate;
                            }
                        },
                        createdCell: function (td, cellData, rowData, row, col) {

                            $(td).attr("data-field-name", "drv_carplate");

                            cellData.createdvia == "LINE" ?
                                $(td).attr("class", "line-job") : $(td).attr("class", "inline-edit normal-job");


                            $(td).on('dblclick', DataTable.inlineEditable);
                        }
                    },
                    {
                        targets: [4, 5, 6, 7],
                        className: "inline-edit",
                        createdCell: function (td, cellData, rowData, row, col) {

                            if (col == 4) {
                                $(td).attr("data-field-name", "curaddr");
                            }
                            else if (col == 5) {
                                $(td).attr("data-field-name", "destination");
                            }
                            else if (col == 6) {
                                $(td).attr("data-field-name", "phone");
                            }
                            else if (col == 7) {
                                $(td).attr("data-field-name", "cccomment");
                            }

                            $(td).attr({
                                'title': 'ดับเบิ้ลคลิ๊กเพื่อแก้ไข',
                                'data-toggle': 'tooltip'
                            }).on('dblclick', DataTable.inlineEditable);
                        }
                    },
                    {
                        targets: [4,6],
                        visible: window.screen.availWidth > 414,
                    },
                    {
                        targets: 8,
                        width: "30px",
                        render: function (data, type, row) {
                            var cell = '<div class="btn-group" role="group">';
                            cell += '<button type="button" class="btn showTaskDetail" onclick="DataTable.assignedTaskTable.showTaskDetail(\'' + data + '\');">';
                            cell += '<i class="material-icons">info_outline</i>';
                            cell += '</button>';
                            cell += '</div>';
                            return cell;
                        },
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).find(".showTaskDetail").attr({
                                'title': 'แสดงรายละเอียด',
                                'data-toggle': 'tooltip'
                            });
                        }
                    }
                ],
                createdRow: function (row, data, index) {

                    $(row).attr("data-ref", data[8]);

                    $(row).find('[data-toggle="tooltip"]')
                    .tooltip({ placement: 'top', container: 'body', animation: false })
                    .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });
                },
                rowCallback: function (row, data, index) {
                    $(row).find(".showTaskDetail").data(data);
                    if(data[9].cccomment !== "") {
                        $(row).addClass("has-comment");
                    } else {
                        $(row).removeClass("has-comment");
                    }
                },
                drawCallback: function (settings) {
                    this.api().rows( {page:'current'} ).data().filter(function(data) {
                        if(LOCAL_STATE.length <= 0) {
                            DataTable.unlockLine({
                                id: data[8],
                                table: "assignedTaskTable"
                            });
                        } 
                        else {
                            LOCAL_STATE.filter(function(task) {
                                task.id == data[8] ? DataTable.lockLine(task) : DataTable.unlockLine({ id: data[8], table: "assignedTaskTable" });;
                            });
                        }

                        DataTable.assignedTaskTable.datatable.columns([2]).visible(DataTable.assignedTaskTable.$table.width() >= 850);
                    });
                }
            });

            DataTable.assignedTaskTable.update(loader);
        },
        update: function (loader) {
            Http.post("service/ubeam/getassignlist", {
                loader: loader,
                onSuccess: function (response) {
                    if (response.status) {
                        DataTable.assignedTaskTable.datatable.clear();
                        DataTable.assignedTaskTable.create(response.data);
                        DataTable.assignedTaskTable.customTableHeader();
                        TaskComment.updateAll();
                    } else {
                        DataTable.assignedTaskTable.datatable.clear().draw();
                        DataTable.assignedTaskTable.customTableHeader();
                    }
                }
            });
        },
        updateRow: function (data) {

            var row = DataTable.assignedTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            var rowIndex = DataTable.assignedTaskTable.datatable.row(row).index();

            DataTable.assignedTaskTable.datatable.row(rowIndex).data([
                data.ccstation,
                data.createdjob,
                data.dpendingjob,
                { drv_carplate: data.drv_carplate, createdvia: data.createdvia },
                data.curaddr,
                data.destination,
                data.phone,
                data.cccomment,
                data._id,
                data
            ]).draw();
        },
        create: function (data) {

            if (data == undefined) { return false; }

            $(data).each(function (index, task) {
                DataTable.assignedTaskTable.datatable.row.add([
                    task.ccstation,
                    task.createdjob,
                    task.dpendingjob,
                    { drv_carplate: task.drv_carplate, createdvia: task.createdvia },
                    task.curaddr,
                    task.destination,
                    task.phone,
                    task.cccomment,
                    task._id,
                    task
                ]).order(2, "desc").draw();
            });
        },
        addRow: function (data) {

            if (data == undefined) { return false; }

            DataTable.assignedTaskTable.datatable.row.add([
                data.ccstation,
                data.createdjob,
                data.dpendingjob,
                { drv_carplate: data.drv_carplate, createdvia: data.createdvia },
                data.curaddr,
                data.destination,
                data.phone,
                data.cccomment,
                data._id,
                data
            ]).draw();
        },
        customTableHeader: function () {
            $(".assigned.table-data").find('#searchAssignedTaskInput').on('keyup', function () {
                DataTable.assignedTaskTable.datatable.search(this.value).draw();
            });
            var controls = $(".assigned.table-data").find(".paging-length");
            $("#assignedTaskTable_length").detach().appendTo(controls);
        },
        showTaskDetail: function (pass_id) {

            Http.post('service/ubeam/getreassignjobdetail', {
                loader: false,
                data: { "psg_id": pass_id },
                onSuccess: function (response) {
                    if (response.status) {
                        if (response.drv_register) {

                            var passenger = response.psg_data;
                            var driver = response.drv_data;

                            Modal.assignedTaskModal.modal.find(".text.phone").html(passenger.phone);
                            Modal.assignedTaskModal.modal.find(".text.current").html(passenger.curaddr);
                            Modal.assignedTaskModal.modal.find(".text.destination").html(passenger.destination);

                            if (passenger.detail == undefined || passenger.detail == "") {
                                Modal.assignedTaskModal.modal.find(".text.detail").html("<i>-</i>");
                            }
                            else {
                                Modal.assignedTaskModal.modal.find(".text.detail").html(passenger.detail);
                            }

                            driver.imgface = Taxi.getImageFace(driver.imgface);

                            Modal.assignedTaskModal.modal.find("img.driver-img").attr("src", driver.imgface);
                            Modal.assignedTaskModal.modal.find(".text.driver_fullname").html(driver.fname + " " + driver.lname);
                            Modal.assignedTaskModal.modal.find(".text.driver_carplate").html(driver.carplate);
                            Modal.assignedTaskModal.modal.find(".text.driver_phone").html(driver.phone);
                            Modal.assignedTaskModal.modal.find(".commentForm > input[type=text]").val(driver.cccomment);

                            Modal.assignedTaskModal.modal.find(".reject-btn").prop("disabled", false);
                            Modal.assignedTaskModal.modal.find(".reject-btn").attr("data-ref", passenger._id);

                            Modal.assignedTaskModal.addDriverToMap(driver);
                            Modal.assignedTaskModal.open();
                        }
                        else {

                            var passenger = response.psg_data;

                            Modal.assignedTaskModal.modal.find(".text.phone").html(passenger.phone);
                            Modal.assignedTaskModal.modal.find(".text.current").html(passenger.curaddr);
                            Modal.assignedTaskModal.modal.find(".text.destination").html(passenger.destination);
                            Modal.assignedTaskModal.modal.find(".commentForm > input[type=text]").val(passenger.cccomment);

                            if (passenger.detail == undefined || passenger.detail == "") {
                                Modal.assignedTaskModal.modal.find(".text.detail").html("<i>-</i>");
                            }
                            else {
                                Modal.assignedTaskModal.modal.find(".text.detail").html(passenger.detail);
                            }

                            Modal.assignedTaskModal.modal.find(".reject-btn").prop("disabled", false);
                            Modal.assignedTaskModal.modal.find(".reject-btn").attr("data-ref", passenger._id);

                            Modal.assignedTaskModal.modal.find(".driver-wrap").hide();
                            Modal.assignedTaskModal.modal.find(".alert-missing-driver").html("งานนี้ถูกจ่ายไปยังแท็กซี่นอกระบบ!<br>หมายเลข: " + passenger.drv_carplate).show();

                            Modal.assignedTaskModal.open();
                        }
                    } else {
                        Notification.defaultError();
                    }
                }
            });
        },
    },
    taxiReportTable: {
        $table: $("#taxiReportTable"),
        datatable: null,
        initial: function () {
            DataTable.taxiReportTable.datatable = DataTable.taxiReportTable.$table.DataTable({
                responsive: true,
                deferRender: true,
                "scrollY": "400px",
                "scrollCollapse": true,
                "paging": false,
                "language": {
                    search: "",
                    searchPlaceholder: "ค้นหาแท็กซี่",
                    "sInfo": "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ"
                },
                "footer": false,
                "dom": 'Bfrtip',
                "buttons": [
                    'csv', 'excel', 'pdf'
                ]
            });

            $("#report-date-filter").datetimepicker({
                format: "DD/MM/YYYY",
            });
        },
        update: function (loader) {
            // Http.post("service/ubeam/searchdrv", {            
            Http.post("service/ubeam/CountJobPerDrv", {
                loader: loader,
                data: {
                    "startTime":parseInt(Report.getCurrentDate().getTime() - Report.day),
                    "endTime":parseInt(Report.getCurrentDate().getTime())
                    // "startTime":1459443600000,
                    // "endTime":1459530000000
                    // curlat: USER_CURRENT_LOCATION[0],
                    // curlng: USER_CURRENT_LOCATION[1]
                },
                onSuccess: function (response) {
                    if (response.status) {
                        DataTable.taxiReportTable.create(response.data);
                        DataTable.taxiReportTable.customTableHeader();
                    } else {
                    }
                }
            });
        },
        create: function (taxi_list) {

            if (taxi_list == undefined) { return false; }

            $(taxi_list).each(function (index, taxi) {
                DataTable.taxiReportTable.addRow(index, taxi);
            });
        },
        addRow: function (index, taxi) {
            var amount = Math.floor((Math.random() * 20) + 1);
            DataTable.taxiReportTable.datatable.row.add([
                (index + 1),
                "-", //taxi.fname + " " + taxi.lname,
                taxi._id, //taxi.carplate,
                "-", //taxi.carcolor,
                "-", //taxi.phone,
                taxi.count, //amount,
                "-", //"฿ " + (amount * 20)
            ]).draw(false);
        },
        customTableHeader: function () {
            $(".report-driver.table-data").find('#searchReportDriverInput').on('keyup', function () {
                DataTable.taxiReportTable.datatable.search(this.value).draw(false);
            });
        },
    },
    searchTaskResultTable: {
        $table: $("#searchTaskResultTable"),
        datatable: null,
        initial: function () {
            DataTable.searchTaskResultTable.datatable = DataTable.searchTaskResultTable.$table.dataTable({
                paging: true,
                scrollY: "650px",
                deferRender: true,
                scrollCollapse: true,
                language: {
                    search: "",
                    searchPlaceholder: "ค้นหา",
                    sInfo: "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ",
                },
                columnDefs: [
                {
                    targets: [1, 2, 3, 4, 5],
                    className: "inline-edit",
                    createdCell: function (td, cellData, rowData, row, col) {

                        switch(col) {
                            case 1 : td.setAttribute("data-field-name", "phone");
                            break;
                            case 2 : td.setAttribute("data-field-name", "curaddr");
                            break;
                            case 3 : td.setAttribute("data-field-name", "destination");
                            break;
                            case 4 : td.setAttribute("data-field-name", "drv_carplate");
                            break;
                            case 5 : td.setAttribute("data-field-name", "cccomment");
                            break;
                        }

                        td.setAttribute("title", "ดับเบิ้ลคลิ๊กเพื่อแก้ไข");
                        td.setAttribute("data-toggle", "tooltip");

                        $(td).inlineEditable();
                    }
                },
                {
                    targets: 8,
                    width: "45px"
                }],
                createdRow: function (row, data, index) {

                    row.setAttribute("data-ref", data[9]);

                    $(row).find('[data-toggle="tooltip"]')
                    .tooltip({ placement: 'top', container: 'body', animation: false })
                    .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });
                },
                drawCallback: function (settings) {
                    Preloader.hide(0);
                }
            });
        },
        render: function(data) {

            var tasks = []; 
            data.filter(function(task, index) {
                tasks.push([
                    (index + 1),
                    task.phone,
                    task.curaddr,
                    task.destination,
                    task.drv_carplate,
                    task.cccomment,
                    task.createdvia,
                    task.ccstation,
                    Util.getFullDate(task.createdjob) + " " + Util.getCurrentTime(task.createdjob) + ' น.',
                    task._id
                    ]);
            });

            var oTable = DataTable.searchTaskResultTable.datatable;

            oTable.fnClearTable();
            oTable.fnAddData(tasks);
        },
        clear: function() {
            DataTable.searchTaskResultTable.datatable.fnClearTable();
        },
        getData: function(data) {

            Http.post('service/ubeam/searchFinishList', {
                data: data,
                onSuccess: function (response) {
                    if (response.status) {
                        Notification.remove();
                        DataTable.searchTaskResultTable.render(response.data);
                    }
                    else {
                        DataTable.searchTaskResultTable.clear();
                    }
                }
            });
        }
    },
    inlineEditable: function (event) {

        if ($(event.target).closest("tr").hasClass("lock")) {
            return false;
        }

        var id = $(event.target).closest("tr").attr("data-ref");
        var table = $(event.target).closest('table').prop('id');
        var data = { 'id': id, 'table': table, 'user': USER_DATA };
        LOCAL_STATE.push(data);
        Socket.emit('inline edit', data);

        var inlineEdit = $(this);
        var isLineJob = $(this).hasClass("line-job");
        var originHtml = isLineJob ? $(this).find("span").html() : $(this).html();
        inlineEdit.addClass("active");
        inlineEdit.html('<form><input type="text" value="' + originHtml + '" /></form>');
        inlineEdit.find("form > input").focus();

        inlineEdit.unbind("dblclick", DataTable.inlineEditable);

        //On Document Click
        var onDocumentClick = function (event) {
            if (!$(event.target).parent().parent().hasClass("inline-edit")) {
                $(".inline-edit.active").removeClass("active");
                inlineEdit.on("dblclick", DataTable.inlineEditable);
                $(document).unbind('click', onDocumentClick);

                var id = inlineEdit.closest("tr").attr("data-ref");
                var table = inlineEdit.closest('table').prop('id');
                var data =  { 'id': id, 'table': table };
                LOCAL_STATE_CONTROL.remove(data);
                Socket.emit('unlock line', data);
            }
        };


        $(document).on('click', onDocumentClick);

        // On Form Submit
        inlineEdit.find("form").on("submit", function (event) {
            event.preventDefault();
            var newValue = this.firstElementChild.value.slice(-1) == "+" ? 
                '<span data-toggle="tooltip" title="" data-original-title="งานนี้ต้องจ่ายผ่าน Line">' + this.firstElementChild.value + '</span>' : this.firstElementChild.value;

            inlineEdit.html(newValue);
            inlineEdit.closest(".line-job").removeClass("line-job");

            if (newValue !== originHtml) {

                var id = $(inlineEdit).closest("tr").attr("data-ref");
                var name = $(inlineEdit).attr("data-field-name");
                var data = {};
                $(data).data(name, newValue);
                Passenger.editData(id, $(data).data());
            }

            inlineEdit.on("dblclick", DataTable.inlineEditable);
            $(document).unbind('click', onDocumentClick);
            $("table .inline-edit.active").removeClass("active");

            var id = inlineEdit.closest("tr").attr("data-ref");
            var table = inlineEdit.closest('table').prop('id');
            var data =  { 'id': id, 'table': table };
            LOCAL_STATE_CONTROL.remove(data);
            Socket.emit('unlock line', data);
        });

        // On Input lost focus
        inlineEdit.find("input").on("blur", function (event) {
            var newValue = this.value.slice(-1) == "+" ? 
                '<span data-toggle="tooltip" title="" data-original-title="งานนี้ต้องจ่ายผ่าน Line">' + this.value + '</span>' : this.value;

            inlineEdit.html(newValue);
            this.value.slice(-1) == "+" && inlineEdit.closest(".line-job").removeClass("line-job");

            if (this.value !== originHtml) {

                var id = $(inlineEdit).closest("tr").attr("data-ref");
                var name = $(inlineEdit).attr("data-field-name");
                var data = {};
                $(data).data(name, this.value);
                Passenger.editData(id, $(data).data());
            }

            inlineEdit.on("dblclick", DataTable.inlineEditable);
            $(document).unbind('click', onDocumentClick);
            $("table .inline-edit.active").removeClass("active");

            var id = inlineEdit.closest("tr").attr("data-ref");
            var table = inlineEdit.closest('table').prop('id');
            var data = { 'id': id, 'table': table };
            LOCAL_STATE_CONTROL.remove(data);
            Socket.emit('unlock line', data);
        });
    },
    updateAll: function (immediate) {
        DataTable.queueTaskTable.update(true);
        DataTable.advanceTaskTable.update(true);
        DataTable.pendingTaskTable.update(true);
        DataTable.assignedTaskTable.update(true);
        Socket.emit('update state', { user: USER_DATA });
    },
    lockLine: function (data) {
        var html = '<p class="user-locker">' + data.user.name + '<br>กำลังทำงานนี้อยู่...</p>';
        var row = DataTable[data.table].$table.find('[data-ref="' + data.id + '"]')[0];
        if(row !== undefined) {
            $(row).addClass("lock");
            $(row).find(".user-locker").remove();
            window.screen.availWidth > 414 ? $(row).find("td").last().append(html) : $(row).append(html);
        }
    },
    unlockLine: function (data) {
        var row = DataTable[data.table].$table.find('[data-ref="' + data.id + '"]')[0];
        if(row !== undefined) {
            $(row).removeClass("lock");
            $(row).find(".user-locker").remove();
        }
    }
};


var Form = {
    createTaskForm: {
        form: $("#createTaskForm"),
        initial: function () {
            Form.createTaskForm.onSubmit();
            Form.createTaskForm.autocompleteInit();
            Form.createTaskForm.form.find("#pass-phone-inp").ForceNumericOnly();
            Form.createTaskForm.form.find("#taxiAmount").ForceNumericOnly();
        },
        autocompleteInit: function () {
            var options = {
                type: 'POST',
                params: { cgroup: "ccubon" },
                paramName: 'keyword',
                groupBy: "parkinglot",
                preserveInput: true,
                serviceUrl: 'service/ubeam/getpoirecommended',
                transformResult: function (response, originalQuery) {

                    var response = JSON.parse(response);
                    if (response.status) {
                        return {
                            suggestions: $.map(response.data, function (dataItem) {
                                return { value: dataItem.parkingname, data: dataItem, ID: dataItem._id };
                            })
                        };
                    } else {
                        return {
                            suggestions: {}
                        };
                    }
                },
                onSearchStart: function (query) {
                },
                onSelect: function (suggestion) {
                    this.value = suggestion.value;
                }
            };

            Form.createTaskForm.form.find('#pass-from-inp').autocomplete(options);
            Form.createTaskForm.form.find('#pass-dest-inp').autocomplete(options);
        },
        onSubmit: function () {
            Form.createTaskForm.form.validate({
                rules: {
                    phone: {
                        required: true,
                        number: true
                    },
                    current: { required: true },
                    destination: { required: true },
                    taxiAmount: { required: true }
                },
                submitHandler: function (form, event) {

                    event.preventDefault();
                    var form = Form.createTaskForm.form;

                    var data = {};
                    data.phone = form.find("#pass-phone-inp").val();
                    data.curaddr = form.find("#pass-from-inp").val();
                    data.destination = form.find("#pass-dest-inp").val();
                    data.detail = form.find("#pass-desc-txt").val();
                    data.amount = form.find("#taxiAmount").val();
                    data.ccstation = form.find("#ccstation").val();
                    data.isContractJob = form.find("[name='isContractJob']:checked").val();
                    data.provincearea = {
                        code: form.find("#customer-province-list option:selected").val(),
                        nameTH: form.find("#customer-province-list option:selected").html(),
                        LatLng: form.find("#customer-province-list option:selected").attr("data-loc").split(",").map(Number)
                    };
                    data.username = USER_DATA.username;
                    data.cgroup = USER_DATA.group;

                    data.jobtype = form.find("#jobType").is(':checked') ? "ADVANCE" : "QUEUE";
                    if (data.jobtype == "ADVANCE") {
                        data.createdjob = new Date(DateTimePicker.picker.data("DateTimePicker").date()).getTime();
                    }

                    Http.post('service/ubeam/addjoblist', {
                        data: data,
                        onSuccess: function (response) {
                            if (response.status) {
                                Notification.defaultSuccess();
                                Form.createTaskForm.clearFormData();
                            } else {
                                Notification.defaultError();
                            }

                            Form.createTaskForm.form.find("#pass-phone-inp").focus();
                            DateTimePicker.setMinDate();
                        }
                    });
                    return;
                }
            });
        },
        clearFormData: function () {
            var form = Form.createTaskForm.form;
            form.find("#pass-phone-inp").val("");
            form.find("#pass-from-inp").val("");
            form.find("#pass-dest-inp").val("");
            form.find("#pass-desc-txt").val("");
            form.find("#taxiAmount").val("1");
        }
    },
    assignTaskForm: {
        form: $("#assignTaskForm"),
        initial: function () {
            Form.assignTaskForm.onSubmit();
        },
        onSubmit: function () {
            Form.assignTaskForm.form.validate({
                rules: {
                    // carplate: { required: true }
                },
                submitHandler: function (form, event) {

                    event.preventDefault();
                    var form = Form.assignTaskForm.form;

                    var passenger_id = form.find('#pass_id').val();
                    var carplate = Form.searchTaxiBeforeAssignForm.form.find('#car-plate-inp').val();

                    if (carplate != "" || passenger_id != undefined) {

                        Form.assignTaskForm.form.find('button').attr('disabled', true);
                        Form.searchTaxiBeforeAssignForm.form.find('input').attr('disabled', true);

                        var sendJob = function (response) {
                            if (!response.status) {
                                // Modal.confirmNoneRegisterDriverModal.data = { psg_id: this.data.psg_id, carplate: this.data.carplate };
                                // Modal.confirmNoneRegisterDriverModal.open();

                                Passenger.sendToNoneRegisterDriver(this.data.psg_id, this.data.carplate);
                            }
                            else if (response.status && response.data.status == "ON") {
                                Passenger.sendtoRegisterDriver(this.data.psg_id, response.data._id);
                            }
                            else if (response.status && response.data.status == "WAIT") {
                                Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Modal.messageBoxModal.setTitle("คำเตือน!");
                                Modal.messageBoxModal.setMessage("ผู้ใช้งานดังกล่าว กำลังรอตอบกลับจากผู้โดยสาร<br>ไม่สามารถจ่ายงานให้ได้");
                                Modal.messageBoxModal.open();
                            }
                            else if (response.status && response.data.status == "DPENDING") {
                                Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Modal.messageBoxModal.setTitle("คำเตือน!");
                                Modal.messageBoxModal.setMessage("ผู้ใช้งานดังกล่าว กำลังรับงานอื่นจาก Callcenter<br>ไม่สามารถจ่ายงานให้ได้");
                                Modal.messageBoxModal.open();
                            }
                            else if (response.status && response.data.status == "BUSY") {
                                Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Modal.messageBoxModal.setTitle("คำเตือน!");
                                Modal.messageBoxModal.setMessage("ผู้ใช้งานดังกล่าว กำลังไปรับผู้โดยสาร<br>ไม่สามารถจ่ายงานให้ได้");
                                Modal.messageBoxModal.open();
                            }
                            else if (response.status && response.data.status == "PICK") {
                                Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Modal.messageBoxModal.setTitle("คำเตือน!");
                                Modal.messageBoxModal.setMessage("ผู้ใช้งานดังกล่าว กำลังไปส่งผู้โดยสาร<br>ไม่สามารถจ่ายงานให้ได้");
                                Modal.messageBoxModal.open();
                            }
                            else if (response.status && response.data.status == "OFF") {
                                Passenger.sendToNoneRegisterDriver(this.data.psg_id, this.data.carplate);
                            }
                            else if (response.status && response.data.status == "BROKEN") {
                                Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Modal.messageBoxModal.setTitle("คำเตือน!");
                                Modal.messageBoxModal.setMessage("ผู้ใช้งานดังกล่าว รถเสีย<br>ไม่สามารถจ่ายงานให้ได้");
                                Modal.messageBoxModal.open();
                            }
                            else {
                                var input = Modal.assignTaskModal.modal.find("#car-plate-inp").prop("disabled", false)[0];
                                input.focus();
                                input.setSelectionRange(0, 8);
                                Modal.assignTaskModal.modal.find("[type=submit]").prop("disabled", false);
                                Notification.defaultError();
                            }
                        };

                        var data = {
                            "carplate": carplate,
                            "psg_id": passenger_id
                        };

                        Taxi.checkStatus(data, sendJob);
                    }
                    return false;
                }
            });
        },
        autocompleteInit: function () {
            var options = {
                type: 'POST',
                paramName: 'keyword',
                serviceUrl: 'service/ubeam/searchnamecar',
                transformResult: function (response, originalQuery) {

                    var response = JSON.parse(response);
                    if (response.status) {
                        return {
                            suggestions: $.map(response.data, function (dataItem) {
                                return { value: dataItem.carplate, data: dataItem, ID: dataItem._id };
                            })
                        };
                    } else {
                        return {
                            suggestions: {}
                        };
                    }
                },
                onSearchStart: function (query) {
                    Form.assignTaskForm.form.find('#carNumber').removeAttr('data-driver-ref');
                },
                onSelect: function (suggestion) {
                    Form.assignTaskForm.form.find('#carNumber').attr('data-driver-ref', suggestion.data._id);
                }
            };

            Form.assignTaskForm.form.find('#carNumber').autocomplete(options);
        },
        clearFormData: function () {
            Modal.assignTaskModal.modal.find('p.value').text("");
            Form.searchTaxiBeforeAssignForm.form.find('input[type=text]').val("");
        }
    },
    searchTaxiBeforeAssignForm: {
        form: $("#searchTaxiBeforeAssignForm"),
        initial: function() {
            Form.searchTaxiBeforeAssignForm.onSubmit();
        },
        onSubmit: function() {
            Form.searchTaxiBeforeAssignForm.form.validate({
                rules: {
                    carplate: { required: true }
                },
                submitHandler: function (form, event) {

                    event.preventDefault();

                    var carplate = Form.searchTaxiBeforeAssignForm.form.find('#car-plate-inp').val();

                    if( carplate.charAt(carplate.length -1) == "+" ) {
                        Form.assignTaskForm.form.submit();
                    }
                    else {

                        var currentTaxi = null;
                        Taxi.layer.eachLayer(function(taxi) { 
                            if(taxi.options.taxi_info.license_plate == carplate) {
                                currentTaxi = taxi;
                                return false;
                            }
                        });

                        if(currentTaxi !== null) {
                            Notification.remove();
                            Monitoring.toggleFilterControl($(".taxi-counter .puller"));
                            setTimeout(function () {
                                Map.invalidateSize();
                                currentTaxi.openPopup();
                                Map.setView([currentTaxi.options.taxi_info.lat, currentTaxi.options.taxi_info.lng], 17);
                            }, 100);
                        } else {
                            Form.assignTaskForm.form.submit();
                        }
                    }

                    return;
                }
            });
        }
    },
    assignedTaskEditableForm: {
        form: $("#assignedTaskEditableForm"),
        initial: function () {
            Form.assignedTaskEditableForm.onSubmit();
        },
        onSubmit: function () {
            Form.assignedTaskEditableForm.form.validate({
                rules: {
                    phone: { required: true, number: true, maxlength: 10 },
                    curaddr: { required: true, maxlength: 64 },
                    destination: { required: true, maxlength: 64 },
                },
                messages: {
                    phone: {
                        required: "กรุณาระบบข้อมูลนี้",
                        number: "ระบุได้เป็นตัวเลขเท่านั้น",
                        maxlength: "กรอกได้ไม่เกิน 10 ตัว"
                    },
                    curaddr: "กรุณาระบบข้อมูลนี้",
                    destination: "กรุณาระบบข้อมูลนี้",
                },
                submitHandler: function (form, event) {

                    event.preventDefault();
                    var form = Form.assignedTaskEditableForm.form;

                    var data = {
                        psg_id: form.find("#psg_id").val(),
                        phone: form.find("#phone").val(),
                        curaddr: form.find("#curaddr").val(),
                        destination: form.find("#destination").val(),
                        detail: form.find("#detail").val(),
                        cccomment: form.find("#cccomment").val()
                    };

                    Http.post('service/ubeam/editjoblist', {
                        loader: false,
                        data: data,
                        onSuccess: function (response) {
                            if (response.status) {
                                Notification.remove();
                                Notification.defaultSuccess();
                                Modal.assignedTaskEditableModal.close();
                                Modal.assignedTaskEditableModal.clearFormData();
                            } else {
                                Notification.remove();
                                Notification.defaultError();
                            }
                        }
                    });
                }
            });
        }
    },
    announceForm: {
        form: $("#announceForm"),
        initial: function () {
            Form.announceForm.onSubmit();
        },
        onSubmit: function () {
            Form.announceForm.form.validate({
                rules: {
                    topic: { required: true },
                    detail: { required: true }
                },
                submitHandler: function (form, event) {

                    event.preventDefault();

                    var data = {
                        username: USER_DATA.username,
                        topic: $(form).find('[name="topic"]').val(),
                        detail: $(form).find('[name="detail"]').val()
                    }

                    Http.post('service/ubeam/announcement/add', {
                        data: data,
                        onSuccess: function (response) {
                            if (response.status) {
                                Notification.defaultSuccess();
                                $(form).find('[name="topic"]').val("");
                                $(form).find('[name="detail"]').val("");

                                Modal.announcementModal.modal.find(".modal-body").empty();
                                Announcement.getAll()
                            }
                            else {
                                Notification.defaultError();
                            }
                        }
                    });

                }
            });
        }
    },
    announceEditForm: {
        form: $("#announceEditForm"),
        initial: function () {
            Form.announceEditForm.onSubmit();
        },
        onSubmit: function () {
            Form.announceEditForm.form.validate({
                rules: {
                    topic: { required: true },
                    detail: { required: true }
                },
                submitHandler: function (form, event) {

                    event.preventDefault();

                    var data = {
                        user_id: USER_DATA._id,
                        ann_id: $(form).find('[name="ann_id"]').val(),
                        topic: $(form).find('[name="topic"]').val(),
                        detail: $(form).find('[name="detail"]').val()
                    }

                    Http.post('service/ubeam/announcement/edit', {
                        data: data,
                        onSuccess: function (response) {
                            if (response.status) {
                                Notification.defaultSuccess();
                                $(form).find('[name="topic"]').val("");
                                $(form).find('[name="detail"]').val("");

                                Modal.announcementEditModal.close();
                                Announcement.getAll()
                            }
                            else {
                                Notification.defaultError();
                            }
                        }
                    });

                }
            });
        }
    },
    searchFinishedTaskForm: {
        form: $("#searchFinishedTaskForm"),
        initial: function () {
            Form.searchFinishedTaskForm.onSubmit();
        },
        onSubmit: function () {
            Form.searchFinishedTaskForm.form.validate({
                rules: {
                    keyword: { required: true, maxlength: 32, }
                },
                errorPlacement: function(error, element) { },
                submitHandler: function (form, event) {

                    event.preventDefault();
                    var daterange = Modal.searchTaskWithResultListModal.modal.find('.daterange').data('daterangepicker');

                    Http.post('service/ubeam/searchFinishList', {
                        data: {
                            keyword: $(form).find('[name="keyword"]').val(),
                            startTime: new Date(daterange.startDate).getTime(),
                            endTime: new Date(daterange.endDate).getTime(),
                        },
                        onSuccess: function (response) {
                            if (response.status) {
                                Notification.remove();
                                DataTable.searchTaskResultTable.render(response.data);
                            }
                            else {
                                DataTable.searchTaskResultTable.clear();
                                Notification.show({
                                    time: 5000,
                                    title:'ไม่มีข้อมูลที่ค้นห้า',
                                    text: 'ไม่พบข้อมูลที่เกี่ยวข้องกับ "' + $(form).find('[name="keyword"]').val() + '"',
                                    $class: "info"
                                });
                            }
                        }
                    });

                }
            });
        }
    },
    assignTaskSearchTaxiForm: {
        form: $("#assignTaskSearchTaxiForm"),
        initial: function () {
            Form.assignTaskSearchTaxiForm.onSubmit();
        },
        onSubmit: function () {
            Form.assignTaskSearchTaxiForm.form.validate({
                rules: {
                    phoneNumber: { required: true, maxlength: 64, }
                },
                errorPlacement: function(error, element) {},
                submitHandler: function (form, event) {

                    event.preventDefault();

                    var carplate = $(form).find('#map-search-inp').val();
                    Taxi.findByCarplate(carplate);
                }
            });
        }
    }
};


var GooglePlacesSearch = {
    input: $('#map-search-inp'),
    initial: function () {

        var infowindow;
        var request = {};

        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(USER_CURRENT_LOCATION[0], USER_CURRENT_LOCATION[1])
        }

        Map = new google.maps.Map(document.getElementById("map"), mapOptions);

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: Map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(Map, this);
            });
        }


        function callback(results, status) {
            Preloader.hide();
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    Taxi.findNearestPassenger(place.geometry.location);
                    //createMarker(results[i]);
                }
            }
        }

        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: Map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(Map, this);
            });

            var center = new google.maps.LatLng(placeLoc.lat(), placeLoc.lng());
            // using global variable:
            Map.panTo(center);
        }

        var form = document.getElementById('form_search_location');
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            Preloader.show();
            request.language = 'th';
            request.query = this.firstElementChild.value

            service.textSearch(request, callback);
        });

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(Map);
    }
};


var HotKey = {
    initial: function () {
        window.addEventListener('keyup', this.doubleCtrl);
        window.addEventListener('keyup', this.F2);
		window.addEventListener('keyup', this.ESC);
    },
    delta: 500,
    lastKeypressTime: 0,
    doubleCtrl: function (event) {
        // http://stackoverflow.com/a/1223775
        if (event.keyCode == 17 || event.which == 17) // Ctrl Key
        {
            var thisKeypressTime = new Date();
            if (thisKeypressTime - HotKey.lastKeypressTime <= HotKey.delta) {
                var visible = Modal.assignTaskModal.modal.is(":visible");
                visible && Modal.assignTaskModal.toggleFullScreen();
                // optional - if we'd rather not detect a triple-press
                // as a second double-press, reset the timestamp
                thisKeypressTime = 0;
            }
            HotKey.lastKeypressTime = thisKeypressTime;
        }
    },
    F2: function (event) {
        if (event.keyCode == 113 || event.which == 113) // F2 key
        {
            if (!$("#createTaskModal").is(":visible")) {
                Modal.createTaskModal.open(event);
            }
        }
    },
	    ESC: function (event) {
        if (event.keyCode == 27 || event.which == 27) // ESC key
        {            
            if ($("#createTaskModal").is(":visible")) {                
                Modal.createTaskModal.modal.modal("hide");
            }
            if ($("#assignTaskModal").is(":visible")) {                
                Modal.assignTaskModal.modal.modal("hide");         
            }            
        }
    }
};


var Http = {
    connection_error_time: 0,
    getJson: function (url, options) {

        if (options.loader !== undefined && !options.loader) { Preloader.show(); }

        $.getJSON(url, function (data) {
            if (options !== undefined && options.onSuccess !== undefined && typeof options.onSuccess == "function") {
                options.onSuccess(data);
            }
        })
        .fail(function () {
            Notification.defaultError();
        })
        .always(function () {
            Preloader.hide();
        });
    },
    post: function (url, options) {

        if (options.loader || options.loader == undefined) { Preloader.show(); }

        if (options.data == undefined) { options.data = {}; }
        $.post(url, options.data, function (data) {
            if (options !== undefined && options.onSuccess !== undefined && typeof options.onSuccess == "function") {
                options.onSuccess(data);
            }
        })
        .fail(function () {
            if (Http.connection_error_time < 1) {
                Http.connection_error_time++;
            }
            else if (Http.connection_error_time >= 1) {

                Http.connection_error_time = 0;
                Http.onConnectionLost();
            }
        })
        .always(function () {
            Preloader.hide();
        });
    },
    onConnectionLost: function () {

        //var message = '<div class="connect_lost_message"><div class="message">';
        //message += '<i class="fa fa-mixcloud"></i><br><p class="text">การเชื่อมต่อมีปัญหา</p><a href="#" onclick="location.reload();" class="btn btn-link link">โหลดหน้านี้ใหม่อีกครั้ง</a>';
        //message += '</div></div>';
        //$('body').find("> .connect_lost_message").remove();
        //$('body').append(message);
        //$('body').find("> .connect_lost_message").fadeIn('fast');

        var message = '<div class="connect_lost_message"><span class="label label-danger">การเชื่อมต่อมีปัญหา</span></div>';

        $('body').find("> .connect_lost_message").remove();
        $('body').append(message);
        $('body').find("> .connect_lost_message").fadeIn('fast');

        //this.intervalId = setInterval(function () {
        //    $.post('service/ubeam/getPassengerDetail', { "psg_id": "" }, function (data) {
        //        clearInterval(Http.intervalId);
        //        delete Http.intervalId;
        //        Http.connection_error_time = 0;
        //        $('body').find("> .connect_lost_message").remove();
        //    });
        //}, 5000);

        if (this.intervalId == undefined) {
            this.intervalId = App.intervalManager(true, Http.testConnection, 5000);
        }
    },
    testConnection: function () {
        $.post('service/ubeam/getPassengerDetail', { "psg_id": "" }, function (data) {
            clearInterval(Http.intervalId);
            App.intervalManager(false, Http.intervalId);
            delete Http.intervalId;
            Http.connection_error_time = 0;
            $('body').find("> .connect_lost_message").remove();
        });
    }
};


var iOSwitchery = {
    initial: function () {
        this.create();
        this.eventHandler();
    },
    eventHandler: function () {
        $("#createTaskForm").find('.js-switch').on('change', function (event) {
            this.checked ? $('.datetime-overlay').fadeOut() : $('.datetime-overlay').fadeIn();
        });

        $(".taxi-counter").find(".js-switch").on('change', function (event) {
            var button = $(event.target).closest(".list-group-item");
            if (button.hasClass("OFF")) {
                Taxi.toggleStatus("OFF", this.checked);
            }
            else if (button.hasClass("ON")) {
                Taxi.toggleStatus("ON", this.checked);
            }
            else if (button.hasClass("WAIT")) {
                Taxi.toggleStatus("WAIT", this.checked);
            }
            else if (button.hasClass("DPENDING")) {
                Taxi.toggleStatus("DPENDING", this.checked);
            }
            else if (button.hasClass("BUSY")) {
                Taxi.toggleStatus("BUSY", this.checked);
            }
            else if (button.hasClass("PICK")) {
                Taxi.toggleStatus("PICK", this.checked);
            }
            else if (button.hasClass("ASSIGNED")) {
                Taxi.toggleStatus("ASSIGNED", this.checked);
            }
            else if (button.hasClass("BROKEN")) {
                Taxi.toggleStatus("BROKEN", this.checked);
            }
            else if (button.hasClass("PARKING")) {
                LandMark.toggleDisplay(this.checked);
            }
        });
    },
    create: function () {

        var html = $("#createTaskForm").find('.js-switch')[0];
        var switchery = new Switchery(html);

        $(".taxi-counter").find(".js-switch").each(function (i, html) {
            var switchery = new Switchery(html, {
                size: 'small'
            });
        });
    }
};


var JQuery = {
    NumberOnlyInit: function () {
        jQuery.fn.ForceNumericOnly = function () {
            return this.each(function () {
                $(this).keydown(function (e) {
                    var key = e.charCode || e.keyCode || 0 || e.which;
                    // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
                    // home, end, period, and numpad decimal
                    return (
                        key == 8 ||
                        key == 9 ||
                        key == 13 ||
                        key == 27 ||
                        key == 46 ||
                        key == 190 ||
                        (key >= 35 && key <= 40) ||
                        (key >= 48 && key <= 57) ||
                        (key >= 96 && key <= 105));
                });
            });
        };
    }
};


var Loader = {
    initial: function () {
        Preloader.setOption({
            timeout: 700,
            className: 'la-ball-clip-rotate la-dark',
            color: '#B21616'
        });
    }
};


var Modal = {
    initial: function () {
        $(document).on('show.bs.modal', '.modal', function (event) {
            var zIndex = 1040 + (10 * $('.modal:visible').length);
            $(this).css('z-index', zIndex);
            setTimeout(function () {
                $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
            }, 0);
        });
    },
    createTaskModal: {
        modal: $('#createTaskModal'),
        initial: function () {
            Modal.createTaskModal.modal.on('shown.bs.modal', function (e) {
                document.getElementById("pass-phone-inp").focus();
            });
            Modal.createTaskModal.modal.on('hidden.bs.modal', function (e) {
                Form.createTaskForm.form.find("label.error").hide();
            });

            Modal.createTaskModal.modal.find("#pass-from-inp, #pass-dest-inp").on("focusin", function (event) {
                // Modal.createTaskModal.landMarkSuggestion(this);
            }).on("focusout", function (event) {

                // var isSuggesstion = $(event.relatedTarget).is(".land-mark-suggestion .list-group-item");

                // if(isSuggesstion) {
                //     this.value = event.relatedTarget.innerText;
                //     this.focus();
                // }
                // else {
                //     $(this).popover('hide');
                //     $(this).popover('destroy');
                // }
            });
        },
        open: function (event) {
            event !== undefined && event.stopPropagation();
            Modal.createTaskModal.modal.modal("show");
        },
        landMarkSuggestion: function (input) {
            Http.post('service/ubeam/getPOIandParking', {
                loader: false,
                onSuccess: function (response) {
                    if (response.status) {

                        var html = '<div class="land-mark-suggestion">';
                        html += '<div class="list-group">';

                        $(response.data).each(function(index, location) {
                            html += '<a href="#" tabindex="-1" class="list-group-item col-md-6">' + location.name + '</a>';
                        });

                        html += '</div>'
                        html += '</div>';

                        var landMark = $(input).popover({
                            html: true,
                            placement: "right",
                            title: '<i class="material-icons">star_border</i> <span>สถานที่แนะนำ</span>',
                            content: html,
                        }).on("shows.bs.popover", function (event) {
                            if (event.keyCode == 27) {
                                event.preventDefault();
                                $(this).popover('hide');
                                $(this).popover('destroy');
                            }
                            //else if (event.keyCode == "tab") {
                            //    $(this).popover('hide');
                            //    $(this).popover('destroy');

                            //}
                        });
                        
                        landMark.popover("show");
                    }
                }
            });
        }
    },
    assignTaskModal: {
        modal: $('#assignTaskModal'),
        initial: function () {

            // Modal.assignTaskModal.modal.find("#form_search_location").remove();

            Modal.assignTaskModal.modal.on('show.bs.modal', function (e) {
                var mapWrapper = $(this).find(".map-wrap");
                jQuery("#map").detach().appendTo(mapWrapper).removeClass('hide');
                Taxi.clear();
            });

            Modal.assignTaskModal.modal.on('shown.bs.modal', function (e) {

                var psgData = Modal.assignTaskModal.modal.data().passengerData;
                if(psgData.provincearea !== undefined) {
                    Map.setView(psgData.provincearea.LatLng.map(Number), 15);
                }
                else {
                    App.setDefaultPosition();
                }

                document.getElementById("car-plate-inp").focus();
                Taxi.findInCenterMap();

                Map.on("dragend", Taxi.findInCenterMap);
                LandMark.getAll();

                setTimeout(function () {
                    Map.invalidateSize();
                }, 100);
            });

            Modal.assignTaskModal.modal.on('hidden.bs.modal', function (e) {
                Taxi.clear();
                Map.off("dragend", Taxi.findInCenterMap);
                Form.assignTaskForm.form.find('.text').val("");
                Form.assignTaskForm.form.find('button').attr('disabled', false);
                Form.assignTaskForm.form.find('button[type=submit]').show();

                Form.searchTaxiBeforeAssignForm.form.find('input').val("");
                Form.searchTaxiBeforeAssignForm.form.find("label.error").hide();
                Form.searchTaxiBeforeAssignForm.form.find('input').attr('disabled', false);

                var data = { 'id': $(this).data("passengerData")._id, 'table': $(this).data("table") };
                LOCAL_STATE_CONTROL.remove(data);
                Socket.emit('unlock line', data);
                $.removeData(this, ["passengerData", "table"]);
            });
        },
        open: function (event) {
            // event.stopPropagation();
            Modal.assignTaskModal.modal.modal("show");
        },
        close: function (event) {
            Modal.assignTaskModal.modal.modal("hide");
        },
        toggleFullScreen: function () {
            Modal.assignTaskModal.modal.find(".modal-dialog").toggleClass("full-screen");

            if (Modal.assignTaskModal.modal.find(".modal-dialog").hasClass("full-screen")) {
                Modal.assignTaskModal.modal.find(".map-wrap").parent().removeClass("col-md-8 col-lg-8");
                Modal.assignTaskModal.modal.find(".map-wrap").parent().addClass("col-md-9 col-lg-9");

                Modal.assignTaskModal.modal.find(".detail-wrap").parent().removeClass("col-md-4 col-lg-4");
                Modal.assignTaskModal.modal.find(".detail-wrap").parent().addClass("col-md-3 col-lg-3");
            }
            else {
                Modal.assignTaskModal.modal.find(".map-wrap").parent().removeClass("col-md-9 col-lg-9");
                Modal.assignTaskModal.modal.find(".map-wrap").parent().addClass("col-md-8 col-lg-8");

                Modal.assignTaskModal.modal.find(".detail-wrap").parent().removeClass("col-md-3 col-lg-3");
                Modal.assignTaskModal.modal.find(".detail-wrap").parent().addClass("col-md-4 col-lg-4");

                Modal.assignTaskModal.modal.find(".detail-wrap")[0].scrollTop = Modal.assignTaskModal.modal.find(".detail-wrap")[0].scrollHeight;
            }

            setTimeout(function () {
                Map.invalidateSize();
            }, 100);
        }
    },
    assignTaskByLineModal: {
        modal: $("#assignTaskByLineModal"),
        initial: function () {
            Modal.assignTaskByLineModal.modal.on('show.bs.modal', function (event) {
                $(this).find(".modal-footer").show();
                $(this).find("button[type=submit]").on("click", Modal.assignTaskByLineModal.onSubmit);
            });
            Modal.assignTaskByLineModal.modal.on('shown.bs.modal', function (event) {
                $(this).find("button[type='submit']").focus();
            });
            Modal.assignTaskByLineModal.modal.on('hidden.bs.modal', function (event) {
                $.removeData(this, "task");
                $(this).find("p.text").html("");
                $(this).find("button[type=submit]").unbind("click");

                var data = { 'id': $(this).data("passengerData")._id, 'table': $(this).data("table") };
                LOCAL_STATE_CONTROL.remove(data);
                Socket.emit('unlock line', data);
                $.removeData(this, ["passengerData", "table"]);
            });
        },
        open: function (data) {
            Modal.assignTaskByLineModal.modal.modal("show");
        },
        close: function (event) {
            Modal.assignTaskByLineModal.modal.modal("hide");
        },
        onSubmit: function () {
            var data = Modal.assignTaskByLineModal.modal.data("task");
            Taxi.assignByLineApp(data._id, data.drv_carplate);
        }
    },
    assignedTaskModal: {
        modal: $('#assignedTaskModal'),
        layer: L.layerGroup(),
        initial: function () {
            Map && Map.addLayer(this.layer);

            //Prevent error durning load tile layer.
            Modal.assignedTaskModal.modal.on('shown.bs.modal', function (e) {

                var mapWrapper = $(this).find(".map-wrap");
                jQuery("#map").detach().appendTo(mapWrapper).removeClass('hide');

                $(this).find(".reject-btn").focus();

                setTimeout(function () {
                    Map.invalidateSize();
                }, 100);
            });

            Modal.assignedTaskModal.modal.on('hidden.bs.modal', function (e) {
                Map.control.search.enable();
                $(this).find(".text").html("");
                $(this).find("img.driver-img").attr("src", "");
                $(this).find('.ribbon-message').remove();

                $(this).find(".reject-btn").show();
                $(this).find(".reject-btn").prop("disabled", false).attr("data-ref", "");

                $(this).find(".driver-wrap").show();
                $(this).find(".alert-missing-driver").hide();
                Modal.assignedTaskModal.clearMarker();
            });

            Modal.assignedTaskModal.modal.find(".reject-btn").on("click", function (event) {
                $(this).attr("disabled", true);
                var pass_id = $(this).attr("data-ref");
                Passenger.showConfirmRejectModal(pass_id);
            });

            Modal.assignedTaskModal.modal.find(".commentForm").find("button").on("click", function(event) {
                var comment = $(this).closest(".commentForm").find("input[type=text]").val();
                var psg_id = Modal.assignedTaskModal.modal.find(".reject-btn").attr("data-ref");
                Modal.assignedTaskModal.addComment(psg_id, comment);
            });
        },
        open: function () {
            Modal.assignedTaskModal.modal.modal("show");
        },
        close: function () {
            Modal.assignedTaskModal.modal.modal("hide");
        },
        addDriverToMap: function (driver) {

            Modal.assignedTaskModal.clearMarker();

            var taxiMarker = L.marker([driver.curloc[1], driver.curloc[0]], {
                icon: L.icon({
                    iconUrl: '/assets/img/map/tx_PICK@2x.png',
                    iconAnchor: [20, 20],
                    labelAnchor: [10, 0]
                })
            });

            Modal.assignedTaskModal.layer.addLayer(taxiMarker);
            Map.setCenter(taxiMarker.getLatLng());
            //Map.setZoom(12);
        },
        clearMarker: function () {
            Modal.assignedTaskModal.layer.clearLayers();
        },
        addComment: function(psg_id, message) {
            Http.post('service/ubeam/editjoblist', {
                loader: false,
                data: {
                    "psg_id": psg_id,
                    "cccomment": message
                },
                onSuccess: function (response) {
                    if (response.status) {
                        Notification.defaultSuccess();
                        Modal.assignedTaskModal.close();
                    } else {
                        Notification.defaultError();
                    }
                }
            });
        }
    },
    assignedTaskEditableModal: {
        modal: $("#assignedTaskEditableModal"),
        initial: function () {
            Modal.assignedTaskEditableModal.modal.on("shown.modal.bs", function () {
            });
        },
        showDatail: function (id) {
            Passenger.getData(id, function (response) {
                if (response.status) {
                    var form = Modal.assignedTaskEditableModal.modal.find("form");
                    form.find("#psg_id").val(response.psg_data._id);
                    form.find("#phone").val(response.psg_data.phone);
                    form.find("#curaddr").val(response.psg_data.curaddr);
                    form.find("#destination").val(response.psg_data.destination);
                    form.find("#detail").val(response.psg_data.detail);
                    form.find("#cccomment").val(response.psg_data.cccomment);

                    Modal.assignedTaskEditableModal.open();
                }
            });
        },
        open: function () {
            Modal.assignedTaskEditableModal.modal.modal("show");
        },
        close: function () {
            Modal.assignedTaskEditableModal.modal.modal("hide");
        },
        clearFormData: function () {
            Modal.assignedTaskEditableModal.modal.find("form input").val("");
        }
    },
    confirmModal: {
        modal: $("#confirmModal"),
        initial: function () {
            Modal.confirmModal.modal.on("shown.bs.modal", function () {
                $(window).bind("keydown", { modal: Modal.confirmModal.modal }, Modal.navigatingKeyboard);
            });
            Modal.confirmModal.modal.on("hidden.bs.modal", function () {
                $(window).unbind("keydown", Modal.navigatingKeyboard);
            });
        },
        open: function () {
            Modal.confirmModal.modal.modal("show");
        }
    },
    confirmNoneRegisterDriverModal: {
        data: {},
        modal: $("#confirmNoneRegisterDriverModal"),
        initial: function () {

            Modal.confirmNoneRegisterDriverModal.modal.on("shown.bs.modal", function () {
                $(this).find('.btn.confirm').focus();
                $(window).bind("keydown", { modal: Modal.confirmNoneRegisterDriverModal.modal }, Modal.navigatingKeyboard);
            });

            Modal.confirmNoneRegisterDriverModal.modal.on("hidden.bs.modal", function () {
                Modal.confirmNoneRegisterDriverModal.data = {};
                Form.assignTaskForm.form.find("button").prop("disabled", false);
                Form.searchTaxiBeforeAssignForm.form.find("input").prop("disabled", false);
                Form.searchTaxiBeforeAssignForm.form.find("input").focus();

                $(window).unbind("keydown", Modal.navigatingKeyboard);
            });

            Modal.confirmNoneRegisterDriverModal.modal.find('.confirm').on("click", function () {
                if (!$.isEmptyObject(Modal.confirmNoneRegisterDriverModal.data)) {
                    var data = Modal.confirmNoneRegisterDriverModal.data;
                    Passenger.sendToNoneRegisterDriver(data.psg_id, data.carplate);
                }
            });

            Modal.confirmNoneRegisterDriverModal.modal.find(".modal-footer > .btn");
        },
        open: function () {
            Modal.confirmNoneRegisterDriverModal.modal.modal("show");
        },
        close: function () {
            Modal.confirmNoneRegisterDriverModal.modal.modal("hide");
        },
    },
    successModal: {
        modal: $("#successModal"),
        initial: function () {
            Modal.successModal.modal.on("shown.bs.modal", function (event) {
                $(this).find('[data-dismiss="modal"]').focus();
                Modal.successModal.modal.unbind("hidden.bs.modal", Modal.assignTaskModal.close);
            });
            Modal.successModal.modal.on("hidden.bs.modal", function (event) {
                $(this).find(".message").empty();
            });
        },
        open: function () {
            Modal.successModal.modal.modal("show");
        },
        close: function () {
            Modal.successModal.modal.modal("hide");
        },
        setMessage: function (message) {
            Modal.successModal.modal.find(".message").html(message);
        }
    },
    announcementModal: {
        modal: $("#announcementModal"),
        initial: function () {
            Modal.announcementModal.modal.on("show.bs.modal", function (event) {
                Announcement.getAll();
            });

            Modal.announcementModal.modal.on("shown.bs.modal", function (event) {
            });

            Modal.announcementModal.modal.on("hidden.bs.modal", function (event) {
                $(this).find(".modal-body").empty();
                Form.announceForm.form.find("label.error").remove();
            });
        },
        open: function () {
            Modal.announcementModal.modal.modal("show");
        },
        close: function () {
            Modal.announcementModal.modal.modal("hide");
        },
    },
    announcementEditModal: {
        modal: $("#announcementEditModal"),
        initial: function () {
            Modal.announcementEditModal.modal.on("hidden.bs.modal", function (event) {
                $(this).find(".modal-body").find("input[type='text'], input[type='hidden'], textarea").val("");
                Form.announceEditForm.form.find("label.error").remove();
            });
        },
        open: function () {
            Modal.announcementEditModal.modal.modal("show");
        },
        close: function () {
            Modal.announcementEditModal.modal.modal("hide");
        }
    },
    reportModal: {
        modal: $("#reportModal"),
        initial: function () {

            Modal.reportModal.modal.on("hidden.bs.modal", function (event) {
                DataTable.taxiReportTable.datatable.clear().draw(false);
            });

            Modal.reportModal.modal.on("show.bs.modal", function (event) {
                DataTable.taxiReportTable.update();
            });

            Modal.reportModal.modal.on("shown.bs.modal", function (event) {

                Report.setDetail();

                var daterange = {
                    startTime:Report.getCurrentDate().getTime() - Report.day,
                    endTime:Report.getCurrentDate().getTime()
                };

                Report.countJobPerDrv(daterange);
                Report.getMostHitStartPlace(daterange);
                Report.getMostHitDestinationPlace(daterange);
                Report.getMostHitHours(daterange);
            });

            Modal.reportModal.modal.find(".modal-body").find('.nav-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) { 
                if (e.target.hash == "#summary-tab") {  
                }
                else if (e.target.hash == "#taxi-tab") {
                    DataTable.taxiReportTable.datatable.draw(false);
                }
            });
        },
        open: function () {
            Modal.reportModal.modal.modal("show");
        },
        close: function () {
            Modal.reportModal.modal.modal("hide");
        }
    },
    messageBoxModal: {
        modal: $("#messageBoxModal"),
        initial: function () {
            Modal.messageBoxModal.modal.on("hidden.bs.modal", function (event) {
                Modal.messageBoxModal.clearData();
            });
        },
        open: function() {
            Modal.messageBoxModal.modal.modal("show");
        },
        close: function() {
            Modal.messageBoxModal.modal.modal("hide");
        },
        setTitle: function (text) {
            Modal.messageBoxModal.modal.find(".modal-body").find(".title").html(text);
        },
        setMessage: function (text) {
            Modal.messageBoxModal.modal.find(".modal-body").find(".message").html(text);
        },
        clearData: function () {
            Modal.messageBoxModal.modal.find(".modal-body").find(".title").empty();
            Modal.messageBoxModal.modal.find(".modal-body").find(".message").empty();
        }
    },
    searchTaskWithResultListModal: {
        modal: $("#searchTaskWithResultListModal"),
        initial: function() {
            Modal.searchTaskWithResultListModal.setupDateRangePicker();
            Modal.searchTaskWithResultListModal.modal.on("shown.bs.modal", function() {
                DataTable.searchTaskResultTable.datatable.sort([9, "asc"]).fnDraw();

                Form.searchFinishedTaskForm.form.find("[name=keyword]").focus();    
            });

            DataTable.searchTaskResultTable.getData({
                startTime: moment().subtract(1, 'days').toDate().getTime(),
                endTime: moment().toDate().getTime()
            });
        },
        open: function() {
            Modal.searchTaskWithResultListModal.modal.modal("show");
        },
        close: function() {            
            Modal.searchTaskWithResultListModal.modal.modal("hide");
        },
        setupDateRangePicker: function() {

            var daterange = Modal.searchTaskWithResultListModal.modal.find(".daterange");

            function cb(start, end) {
                daterange.find("span").html(start.format('DD/MM/YYYY HH:mm') + ' - ' + end.format('DD/MM/YYYY HH:mm'));
            }

            cb(moment().subtract(1, 'days'), moment());

            daterange.daterangepicker(CONSTRAINTS.daterangepicker.options, cb).on('apply.daterangepicker', function(ev, picker) {

                var message = daterange.find("span").html();
                Modal.reportModal.modal.find(".modal-header > .modal-message .detail").text(message);

                var data = {
                    startTime: new Date(picker.startDate).getTime(),
                    endTime: new Date(picker.endDate).getTime()
                };

                var keyword = Form.searchFinishedTaskForm.form.find('[name="keyword"]').val();
                if(keyword !== "") {
                    data.keyword = keyword;
                }

                Http.post('service/ubeam/searchFinishList', {
                    data: data,
                    onSuccess: function (response) {
                        if (response.status) {
                            Notification.remove();
                            DataTable.searchTaskResultTable.render(response.data);
                        }
                        else {
                            DataTable.searchTaskResultTable.clear();
                            Notification.show({
                                title:'ไม่มีข้อมูลที่ค้นห้า',
                                time: 5000,
                                text: 'ไม่พบข้อมูลที่เกี่ยวข้องกับ "' + Form.searchFinishedTaskForm.form.find('[name="keyword"]').val() + '"',
                                $class: "info"
                            });
                        }
                    }
                });

            }).on('showCalendar.daterangepicker', function(ev, picker) {

            });
        }
    },
    areaSuggestion: {
        modal: $("#areaSuggestion"),
        initial: function() {
            Http.post('service/ubeam/getpoirecommendedgroup', {
                data: {
                    "cgroup": USER_DATA.group
                },
                onSuccess: function (response) {
                    if (response.status) {

                        if(response.data.length > 0) {
                            var row_length = Math.ceil(response.data[0]["parkingCount"] / 4);
                            var html = '<div class="mdl-cell mdl-cell--3-col">';
                            html += '<ul class="mdl-list">';
                            for (var i = 0; i >= row_length; i++) {
                                html += '<li class="mdl-list__item mdl-list__item--two-line">';
                                html += '<span class="mdl-list__item-primary-content">';
                                html += '<i class="material-icons mdl-list__item-icon">store_mall_directory</i>';
                                html += '<span>' + response.data[0]["parkinglist"][i]["parkingname"] + '</span>';
                                html += '<span class="mdl-list__item-sub-title">' + response.data[0]["parkinglist"]["parkinglot"] + '</span>';
                                html += '</span>';
                                html += '</li>'
                            }
                            html += '</ul>';
                            html += '</div>';
                        }
                    }
                }
            });

            Modal.areaSuggestion.modal.on("shown.bs.modal", function (event) {
                $(this).data({ input: $(event.relatedTarget).closest(".input-group").find("input[type=text]") }); 
            });
            
            Modal.areaSuggestion.modal.on("hidden.bs.modal", function(event) {
                // $.removeData(this, ["input"]);
                // console.log($(this).data());
            });

        },
        open: function() {

        },
        close: function() {

        }
    },
    driverListChatModal: {
        modal: $("#driverListChatModal"),
        initial: function() {
            Modal.driverListChatModal.modal.on("shown.bs.modal", function() {

            });
        },
        open: function() {
            Modal.driverListChatModal.modal.modal("show");
        },
        close: function() {            
            Modal.driverListChatModal.modal.modal("hide");
        }
    },
    liveChatModal: {
        modal: $("#liveChatModal"),
        initial: function() {
            Modal.liveChatModal.modal.on("shown.bs.modal", function() {

            });

            Modal.liveChatModal.modal.on("hidden.bs.modal", function() {
                $(this).find(".driver-img-wrapper img").prop("src", "https://placeholdit.imgix.net/~text?txtsize=22&txt=150%C3%97150&w=150&h=150");
                $(this).find(".driver-detail .name").text("");
                $(this).find(".driver-detail .carplate").text("");
            });
        },
        open: function(caller) {

            var driver = $(caller).data()._driver;
            Modal.liveChatModal.modal.find(".driver-img-wrapper img").prop("src", "/image/driver/" + driver.imgface);
            Modal.liveChatModal.modal.find(".driver-detail .name").text(driver.fname);
            Modal.liveChatModal.modal.find(".driver-detail .carplate").text(driver.carplate);

            Modal.liveChatModal.modal.modal("show");
        },
        close: function() {            
            Modal.liveChatModal.modal.modal("hide");
        }
    },
    navigatingKeyboard: function (event) {

        var buttons = $(event.data.modal).find(".modal-footer .btn");
        var activeElem = document.activeElement;

        if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
            if ($(activeElem).closest(".modal-footer").size() <= 0) {
                $(buttons[0]).focus();
                return false;
            }
        }

        if (event.keyCode == 38 || event.keyCode == 39) {
            var index = $(buttons).index(activeElem);
            buttons.length >= (index + 1) ? $(buttons[index + 1]).focus() : $(buttons[buttons.length - 1]).focus();
        }
        else if (event.keyCode == 37 || event.keyCode == 40) {
            var index = $(buttons).index(activeElem);
            index == 0 ? $(buttons[0]).focus() : $(buttons[index - 1]).focus();
        }
    }
};


var Monitoring = {
    taxi: null,
    status: {
        OFF: 0, ON: 0, WAIT: 0, DPENDING: 0,
        BUSY: 0, PICK: 0, ASSIGNED: 0, BROKEN: 0
    },
    initial: function () {

        this.updateNotification();

        this.intervalUpdateNotification();

        $(".navbar .navbar-right > .monitoring-tab").find('[data-toggle="tooltip"]').tooltip({ placement: 'bottom', container: 'body', animation: false });

        $(".taxi-counter")
            .find('[data-toggle="tooltip"]').tooltip({ placement: 'left', container: 'body', animation: false })
            .on('show.bs.tooltip', function () { $('body').find('.tooltip.in').remove(); });

        $(".container-fluid.monitoring").find('form.find-taxi').on("submit", function(event) {
            event.preventDefault();
            var carplate = $(this).find("#taxi-carplate").val();
            Taxi.findByCarplate(carplate);
        });

        var navbarMenuInitial = function() {
            $("#sound-switch").on("change", function(event) {
                var checked = $(this).is(":checked");

                if(checked && !Sound.control.is(":checked")) {
                    Sound.control.parent().find(".switchery").click();
                }
                else if(!checked && Sound.control.is(":checked")) {
                    Sound.control.parent().find(".switchery").click();
                }
            });
        }

        navbarMenuInitial();
    },
    isActive: false,
    toggle: function (event) {
        this.isActive ? this.hide(event) : this.show(event);
    },
    show: function (event) {

        // event.preventDefault();
        if (this.isActive) { return false; }
        Preloader.show();

        $(".navbar .navbar-right > .monitoring-tab").find('.counter-wrapper').hide();

        $(".navbar .navbar-right > .monitoring-tab").addClass("active");
        $(".navbar .navbar-right > .callcenter-tab").removeClass("active");
        var mapWrapper = $(".container-fluid.monitoring");

        var isVisible = $("#map").is(":visible");
        var inMonitoring = $("#map").parent().is(".monitoring");
        if (!inMonitoring) {
            jQuery("#map").detach().appendTo(mapWrapper);
        }

        mapWrapper.show();
        $("#map").removeClass('hide');
        $(".container-fluid.app").hide();

        //Map.control.zoom.enable();
        //Map.control.menu.enable();
        Map.control.locate.enable();
        //Map.control.mapSource.enable();
        //Map.control.threeDimension.enable();

        App.setDefaultPosition();

        setTimeout(function () {
            Map.invalidateSize();
        }, 100);

        this.intervalUpdateTaxiPosition();
        LandMark.getAll();

        this.isActive = true;
    },
    hide: function (event) {

        if (!this.isActive) { return false; }

        $(".navbar .navbar-right > .monitoring-tab").find('.counter-wrapper').show();

        $(".navbar .navbar-right > .monitoring-tab").removeClass("active");
        $(".navbar .navbar-right > .callcenter-tab").addClass("active");
        $(".container-fluid.monitoring").hide();
        $(".container-fluid.app").show();

        //Map.control.zoom.disable();
        //Map.control.menu.disable();
        Map.control.locate.disable();
        //Map.control.mapSource.disable();
        //Map.control.threeDimension.disable();

        this.isActive = false;
        Monitoring.taxi = null;
        clearInterval(this.showTaxiIntervalId);
        Taxi.clear();
    },
    showTaxi: function() {
        
        Http.post('service/ubeam/searchdrv', {
            loader: false,
            data: {
                // "status": "ON",
                "curlat": USER_CURRENT_LOCATION[0],
                "curlng": USER_CURRENT_LOCATION[1]
            },
            onSuccess: function (response) {
                if (response.status) {

                    Monitoring.taxi = [];
                    Monitoring.clearCounter();

                    $(response.data).each(function (index, driver) {

                        switch (driver.status) {
                            case "OFF":
                                Monitoring.status.OFF++;
                                break;
                            case "ON":
                                Monitoring.status.ON++;
                                break;
                            case "WAIT":
                                Monitoring.status.WAIT++;
                                break;
                            case "BUSY":
                                Monitoring.status.BUSY++;
                                break;
                            case "PICK":
                                Monitoring.status.PICK++;
                                break;
                            case "BROKEN":
                                Monitoring.status.BROKEN++;
                                break;
                        }

                        Monitoring.taxi.push({
                            "_id": driver._id,
                            "license_plate": driver.carplate,
                            "lat": driver.curloc[1],
                            "lng": driver.curloc[0],
                            "status": driver.status,
                            "imgface": driver.imgface,
                            "full_name": driver.fname + ' ' + driver.lname,
                            "tel": driver.phone,
                            "brokendetail": driver.brokendetail,
                            "brokenname": driver.brokenname
                        });
                    });

                    Taxi.clear();
                    Monitoring.taxi.filter(function (taxi) {
                        if (!$(".taxi-counter").find(".list-group-item." + taxi.status).find(".js-switch").is(":checked")) {
                            return false;
                        }
                        Taxi.addToMap(taxi, { monitoring: true }, false);
                    });
                    Monitoring.adjustCounter();
                } else {
                    Taxi.clear();
                }

                Preloader.hide();
            }
        });
    },
    toggleFilterControl: function (control) {
        $(control).parent().toggleClass('open');
        var icon = $(control).find("i");
        icon.text() == "chevron_left" ? icon.text("clear") : icon.text("chevron_left");
    },
    clearCounter: function () {
        this.status.OFF = 0;
        this.status.ON = 0;
        this.status.WAIT = 0;
        this.status.DPENDING = 0;
        this.status.BUSY = 0;
        this.status.PICK = 0;
        this.status.ASSIGNED = 0;
        this.status.BROKEN = 0;
    },
    updateNotification: function () {
        Http.post('service/ubeam/countTaxi', {
            loader: false,
            data: {
                "curlat": USER_CURRENT_LOCATION[0],
                "curlng": USER_CURRENT_LOCATION[1]
            },
            onSuccess: function (response) {
                if (response.status) {
                    Monitoring.clearCounter();
                    $(response.data).each(function (index, driver) {
                        switch (driver.status) {
                            case "OFF":
                                Monitoring.status.OFF++;
                                break;
                            case "ON":
                                Monitoring.status.ON++;
                                break;
                            case "WAIT":
                                Monitoring.status.WAIT++;
                                break;
                            case "DPENDING":
                                Monitoring.status.DPENDING++;
                                break;
                            case "BUSY":
                                Monitoring.status.BUSY++;
                                break;
                            case "PICK":
                                Monitoring.status.PICK++;
                                break;
                            case "ASSIGNED":
                                Monitoring.status.ASSIGNED++;
                                break;
                            case "BROKEN":
                                Monitoring.status.BROKEN++;
                                break;
                        }
                    });
                    Monitoring.adjustCounter();
                }
            }
        });
    },
    adjustCounter: function () {
        var counter = $('.monitoring').find(".taxi-counter");
        counter.find(".OFF .badge").text(this.status.OFF);
        counter.find(".ON .badge").text(this.status.ON);
        counter.find(".WAIT .badge").text(this.status.WAIT);
        counter.find(".DPENDING .badge").text(this.status.DPENDING);
        counter.find(".BUSY .badge").text(this.status.BUSY);
        counter.find(".PICK .badge").text(this.status.PICK);
        counter.find(".ASSIGNED .badge").text(this.status.ASSIGNED);
        counter.find(".BROKEN .badge").text(this.status.BROKEN);

        var notification = $(".navbar .navbar-right > .monitoring-tab").find('.counter-wrapper');
        notification.find(".off").text(this.status.OFF);
        notification.find(".on").text(this.status.ON);
        notification.find(".pick").text(this.status.PICK);
        notification.find(".broken").text(this.status.BROKEN);
    },
    intervalUpdateNotification: function () {
        //this.intervalId = App.intervalManager(true, this.updateNotification, 5000);
    },
    intervalUpdateTaxiPosition: function () {
        this.showTaxiIntervalId = App.intervalManager(true, this.showTaxi, 5000);
    }
};


var Notification = {
    show: function (message) {
        options = {
            title: message.title,
            text: message.text,
            sticky: message.sticky ? message.sticky : false,
            time: message.time ? message.time : 2000,
            class_name: 'gritter-' + (!message.$class ? 'warning' : message.$class),
            position: message.position ? message.position : 'bottom-right'
        };

        $.gritter.add(options);
    },
    defaultSuccess: function (title, text) {
        Notification.remove();
        $.gritter.add({
            title: !title ? 'Success!' : title,
            text: !text ? 'คำสั่ง ทำงานเรียบร้อย' : text,
            sticky: false,
            time: 1500,
            class_name: 'gritter-success',
            position: 'bottom-right'
        });
    },
    defaultError: function (title, text) {
        Notification.remove();
        $.gritter.add({
            title: !title ? 'Server Error!' : title,
            text: !text ? 'Pls. refresh page and then try it again.' : text,
            sticky: false,
            time: 2500,
            class_name: 'gritter-danger',
            position: 'bottom-right'
        });
    },
    removeAll: function () {
        $.gritter.removeAll({
            time: 0,
            before_close: function (e) {
            },
            after_close: function () {
            }
        });
    },
    remove: function () {
        $("#gritter-notice-wrapper").remove();
    }
};


var Parking = {
    openReportWindow: function() {
        var left = (window.screen.availWidth - 1400) / 2;
        window.open("./callcenter/parking-system", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=" + left + ",width=1400,height=800");
    }
};


var Passenger = {
    marker: {},
    getData: function (id, callback) {
        Http.post('service/ubeam/getPassengerDetail', {
            loader: false,
            data: { "psg_id": id },
            onSuccess: callback
        });
    },
    editData: function (id, data) {
        var data = jQuery.extend({ "psg_id": id }, data);
        Http.post('service/ubeam/editjoblist', {
            loader: false,
            data: data,
            onSuccess: function (response) {
                if (response.status) {
                    Notification.remove();
                    Notification.defaultSuccess();
                } else {
                    Notification.remove();
                    Notification.defaultError();
                }
            }
        });
    },
    addToMap: function (latlng, passenger_info) {

        this.removeMarker();

        this.marker = L.marker(latlng, {
            icon: L.icon({
                iconUrl: '/assets/img/map/psg_pin.png',
                iconAnchor: [12, 20],
                labelAnchor: [10, 0]
            })
        });

        var HTMLPopup = '<div class="row">';
        HTMLPopup += '<div class="passenger-info">';

        HTMLPopup += '<div class="col-md-12">';
        HTMLPopup += '<p class="caption">เบอร์โทรติดต่อ</p>';
        HTMLPopup += '<p class="tel value">' + passenger_info.phone + '</p>';
        HTMLPopup += '</div>';

        HTMLPopup += '<div class="col-md-12">';
        HTMLPopup += '<p class="caption">จาก</p>';
        HTMLPopup += '<p class="license_plate value">' + passenger_info.curaddr + '</p>';
        HTMLPopup += '</div>';

        HTMLPopup += '<div class="col-md-12">';
        HTMLPopup += '<p class="caption">ไปยัง</p>';
        HTMLPopup += '<p class="status value">' + passenger_info.destination + '</p>';
        HTMLPopup += '</div>';

        HTMLPopup += '<div class="col-md-12">';
        HTMLPopup += '<p class="caption">รายละเอียด</p>';
        HTMLPopup += '<p class="detail value">' + passenger_info.detail + '</p>';
        HTMLPopup += '</div>';

        HTMLPopup += '</div>';
        HTMLPopup += '</div>';

        this.marker.bindPopup(HTMLPopup, {
            offset: L.point(0, -18),
            className: 'passenger-popup'
        });

        this.marker.options.passenger_info = passenger_info;
        this.marker.addTo(Map);
    },
    showConfirmRejectModal: function (id) {

        var onShow = function (event) {
            Modal.confirmModal.modal.find('.confirm').on("click", function () { window["Passenger"]["rejectTask"](id) });

            setTimeout(function () {
                $(".modal-backdrop.in.modal-stack").css("opacity", 0.5);
            }, 0);
        }

        var onClose = function (event) {
            Modal.confirmModal.modal.find('.confirm').unbind();
            Modal.confirmModal.modal.off('show.bs.modal');
            $(".modal-backdrop.in.modal-stack").css("opacity", 0.1);

            Modal.assignedTaskModal.modal.find(".reject-btn").prop("disabled", false);
            Modal.confirmModal.modal.unbind('shown.bs.modal', onShow);
            Modal.confirmModal.modal.unbind('hidden.bs.modal', onClose);
        }

        Modal.confirmModal.modal.on('shown.bs.modal', { modal: this }, onShow);

        Modal.confirmModal.modal.on('hidden.bs.modal', { modal: this }, onClose);

        Modal.confirmModal.modal.find(".modal-body > .message").html("ต้องยกเลิกรายการนี้ใช่มั้ย?");

        Modal.confirmModal.open();
    },
    showConfirmRemoveModal: function (id) {

        var onShow = function (event) {
            Modal.confirmModal.modal.find('[data-dismiss="modal"]').focus();
            Modal.confirmModal.modal.find('.confirm').on("click", function () { window["Passenger"]["cancelTask"](id) });
        }

        var onClose = function (event) {
            Modal.confirmModal.modal.find('.confirm').unbind();
            Modal.confirmModal.modal.unbind('shown.bs.modal', onShow);
            Modal.confirmModal.modal.unbind('hidden.bs.modal', onClose);
        }

        Modal.confirmModal.modal.on('shown.bs.modal', { modal: this }, onShow);
        Modal.confirmModal.modal.on('hidden.bs.modal', { modal: this }, onClose);

        Modal.confirmModal.modal.find(".modal-body > .message").html("ต้องการลบรายการนี้ใช่มั้ย?");
        Modal.confirmModal.open();
    },
    sendtoRegisterDriver: function (psg_id, drv_id) {

        Http.post('service/ubeam/assigndrvtopsg', {
            data: {
                "psg_id": psg_id,
                "drv_id": drv_id,
                "username": USER_DATA.username
            },
            onSuccess: function (response) {

                if (response.status) {

                    Notification.defaultSuccess();

                    var driver = response.drv_data;
                    var taxi_list = [];

                    taxi_list.push({
                        "_id": driver._id,
                        "license_plate": driver.carplate,
                        "lat": driver.curloc[1],
                        "lng": driver.curloc[0],
                        "status": "ON",
                        "imgface": driver.imgface,
                        "full_name": driver.fname + ' ' + driver.lname,
                    });

                    Taxi.addToMap(taxi_list, { active: false });

                    Form.assignTaskForm.form.find("button[type=submit]").hide();
                    Form.searchTaxiBeforeAssignForm.form.find("input[type=text]").prop('disabled', true);

                    Passenger.onAssignTaskSuccess();
                } else {
                    Notification.defaultError();
                }
            }
        });
    },
    sendToNoneRegisterDriver: function (psg_id, carplate) {
        Http.post('service/ubeam/assigndrvtopsg', {
            data: {
                "psg_id": psg_id,
                "drv_carplate": carplate,
                "username": USER_DATA.username
            },
            onSuccess: function (response) {
                if (response.status) {
                    Taxi.clear();
                    Notification.defaultSuccess();
                    Modal.confirmNoneRegisterDriverModal.close();

                    Form.assignTaskForm.form.find("button[type=submit]").hide();
                    Form.searchTaxiBeforeAssignForm.form.find("input[type=text]").prop('disabled', true);
                    Passenger.onAssignTaskSuccess();
                } else {
                    Notification.defaultError();
                }
            }
        });
    },
    cancelTask: function (pass_id) {
        Http.post('service/ubeam/deletejob', {
            data: { "psg_id": pass_id },
            onSuccess: function (response) {
                if (response.status) {
                    Modal.confirmModal.modal.modal("hide");
                    Notification.defaultSuccess();
                } else {
                    Notification.defaultError();
                }
            }
        });
    },
    rejectTask: function (pass_id) {
        Http.post('service/ubeam/cancelpsgdrv', {
            data: { "psg_id": pass_id },
            onSuccess: function (response) {
                if (response.status) {
                    Modal.confirmModal.modal.modal("hide");
                    Notification.defaultSuccess();

                    Modal.assignedTaskModal.modal.find(".reject-btn").hide().attr("data-ref", "");
                    Modal.assignedTaskModal.modal.find(".modal-body > .content").find(".ribbon-message").remove();

                    Modal.assignedTaskModal.close();
                    
                    // Modal.assignedTaskModal.modal.find(".modal-body > .content").prepend('<div class="ribbon-message error"><p class="message">งานนี้ถูกยกเลิกเรียบร้อย</p></div>');
                    // Modal.assignedTaskModal.modal.find(".ribbon-message").fadeIn('fast');
                } else {
                    Notification.defaultError();
                    Modal.assignedTaskModal.modal.find(".reject-btn").prop("disabled", true).attr("data-ref", "");
                }
            }
        });
    },
    removeMarker: function () {
        Map.removeLayer(this.marker);
        this.marker = {};
    },
    onAssignTaskSuccess: function () {
        Map.off("dragend", Taxi.findInCenterMap);
        Modal.assignTaskModal.close();
        Modal.assignTaskByLineModal.close();

        // Modal.successModal.setMessage("จ่ายงานเรียบร้อยแล้ว");
        // Modal.successModal.open();

        // Modal.successModal.modal.on("hidden.bs.modal", Modal.assignTaskModal.close);
        // Modal.successModal.modal.on("hidden.bs.modal", Modal.assignTaskByLineModal.close);
    }
};


var Report = {
    day: 1000*60*60*24,
    initial: function() {
        this.summaryReportInit();
    },
    summaryReportInit: function() {

        function cb(start, end) {
            $('#summary-reportrange span').html(start.format('DD/MM/YYYY HH:mm') + ' - ' + end.format('DD/MM/YYYY HH:mm'));
        }

        cb(moment().subtract(1, 'days'), moment());

        $('#summary-reportrange').daterangepicker(CONSTRAINTS.daterangepicker.options, cb).on('apply.daterangepicker', function(ev, picker) {

            var message = $('#summary-reportrange span').html();
            Modal.reportModal.modal.find(".modal-header > .modal-message .detail").text(message);

            var daterange = {
                startTime: new Date(picker.startDate).getTime(),
                endTime: new Date(picker.endDate).getTime(),
                cgroup: USER_DATA.group
            };

            Report.countJobPerDrv(daterange);
            Report.getMostHitStartPlace(daterange);
            Report.getMostHitDestinationPlace(daterange);
            Report.getMostHitHours(daterange);
        }).on('showCalendar.daterangepicker', function(ev, picker) {
            
            var userAgent = window.navigator.userAgent;

            if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
                $(".daterangepicker.dropdown-menu").find(".ranges li:last-child").css({
                    display: "none"
                });
                $(".daterangepicker.dropdown-menu").find(".calendar").css({
                    display: "none"
                });
            }
        });
    },
    getCurrentDate: function() {
        return new Date();
    },
    pastDayStart: function() {
        return new Date(Report.getCurrentDate().getMonth() + 1 + "-" + Report.getCurrentDate().getDate() + "-" + Report.getCurrentDate().getFullYear()).getTime() - Report.day;
    },
    pastDayEnd: function() {
        return new Date(Report.getCurrentDate().getMonth() + 1 + "-" + Report.getCurrentDate().getDate() + "-" + Report.getCurrentDate().getFullYear()).getTime();
    },
    setDetail: function() {
        var time = Report.getCurrentDate().getHours() + ":" + (Report.getCurrentDate().getMinutes() < 10 ? '0' : '') + Report.getCurrentDate().getMinutes();
        Modal.reportModal.modal.find(".modal-header > .modal-message .detail").text(Report.getCurrentDate());
    },
    countJobPerDrv: function(daterange) {
        Http.post('service/ubeam/CountJobPerDrv', {
            loader: false,
            data: daterange,
            onSuccess: function (response) {

                var modal = Modal.reportModal.modal;

                if(response.status) {
                    modal.find("#summary-tab .jobPerDay .number").text(response.data.length);
                    modal.find("#summary-tab .jobPerHour .number").text((response.data.length / 24).toFixed(0));
                    modal.find("#summary-tab .jobPerMinute .number").text((response.data.length / 24 / 60).toFixed(2));
                    modal.find("#summary-tab .jobPerDriver .number").text((response.data.length / 150).toFixed(0));
                    modal.find("#summary-tab .jobPerCallcenter .number").text((response.data.length / 4).toFixed(0));
                } else {
                    modal.find("#summary-tab .jobPerDay .number").text(0);
                    modal.find("#summary-tab .jobPerHour .number").text(0);
                    modal.find("#summary-tab .jobPerMinute .number").text(0);
                    modal.find("#summary-tab .jobPerDriver .number").text(0);
                    modal.find("#summary-tab .jobPerCallcenter .number").text(0);
                }
            }
        });
    },
    getMostHitStartPlace: function(daterange) {
        Http.post('service/ubeam/MostHitStartPlace', {
            loader: false,
            data: daterange,
            onSuccess: function (response) {
                if(response.status && response.data[0] !== undefined) {
                    var place = response.data[0]._id;
                    var count = response.data[0].count;
                    Modal.reportModal.modal.find("#summary-tab .most-pick .title-badge").text(place);
                    Modal.reportModal.modal.find("#summary-tab .most-pick .detail .counter").text(count);
                } else {
                    Modal.reportModal.modal.find("#summary-tab .most-pick .title-badge").text("-");
                    Modal.reportModal.modal.find("#summary-tab .most-pick .detail .counter").text("-");
                }
            }
        });
    },
    getMostHitDestinationPlace: function(daterange) {
        Http.post('service/ubeam/MostHitDestinationPlace', {
            loader: false,
            data: daterange,
            onSuccess: function (response) {
                if(response.status && response.data[0] !== undefined) {
                    var place = response.data[0]._id;
                    var count = response.data[0].count;
                    Modal.reportModal.modal.find("#summary-tab .most-destination .title-badge").text(place == "-" ? "ไม่ระบุ" : place);
                    Modal.reportModal.modal.find("#summary-tab .most-destination .detail .counter").text(count);
                } else {
                    Modal.reportModal.modal.find("#summary-tab .most-destination .title-badge").text("-");
                    Modal.reportModal.modal.find("#summary-tab .most-destination .detail .counter").text("-");
                }
            }
        });
    },
    getMostHitHours: function(daterange) {
        Http.post('service/ubeam/MostHitHours', {
            loader: false,
            data: daterange,
            onSuccess: function (response) {
                if(response.status && response.data[0] !== undefined) {
                    var diffTime = 7;
                    var hour = response.data[0]._id.hour + diffTime;
                    var total = response.data[0].total;

                    Modal.reportModal.modal.find("#summary-tab .peak-hour .title-badge").text(hour + ":00 - " + (hour + 1) + ":00");
                    Modal.reportModal.modal.find("#summary-tab .peak-hour .detail .counter").text(total);
                } else {
                    Modal.reportModal.modal.find("#summary-tab .peak-hour .title-badge").text("-");
                    Modal.reportModal.modal.find("#summary-tab .peak-hour .detail .counter").text("-");
                }
            }
        });
    },
    getSearchFinishList: function(daterange) {
        Http.post('service/ubeam/searchFinishList', {
            loader: false,
            data: {
                "keyword":"สุนี"
            },
            onSuccess: function (response) {
                console.log(response);
            }
        });
    },
    openReportWindow: function() {
        var left = (window.screen.availWidth - 1400) / 2;
        window.open("./callcenter/report", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=" + left + ",width=1400,height=800");
    }
};


var Socket = {
    initial: function () {
        
        Socket.validate();

        Socket = io("/" + USER_DATA.group);
        // Socket = io();

        Socket.on("message", function(data) {
            console.log(data.name);
         });

        Socket.on("addjoblist", function (data) {
            if (data.jobtype == "QUEUE") {
                DataTable.queueTaskTable.addRow(data);
            }
            else if (data.jobtype == "ADVANCE") {
                DataTable.advanceTaskTable.addRow(data);
            }

            Sound.play("sounds-incoming-call");
        });

        Socket.on("deletejob", function (data) {

            if ($.inArray(data.status, ["DPENDING", "DEPENDING_REJECT", "DPENDING_LINE"]) > -1) {
                var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.pendingTaskTable.datatable.row(row).remove().draw(false);
                DataTable.pendingTaskTable.setIndicator();
            }
            else if (data.jobtype == "QUEUE") {
                var row = DataTable.queueTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.queueTaskTable.datatable.row(row).remove().draw(false);
                DataTable.queueTaskTable.setIndicator();
            }
            else if (data.jobtype == "ADVANCE") {
                var row = DataTable.advanceTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.advanceTaskTable.datatable.row(row).remove().draw(false);
                
                var row = DataTable.queueTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.queueTaskTable.datatable.row(row).remove().draw(false);
            }
        });

        Socket.on("inline edit", function (data) {
            LOCAL_STATE.push(data);
            DataTable.lockLine(data);
        });

        Socket.on("unlock line", function (data) {
            LOCAL_STATE_CONTROL.remove(data);
            DataTable.unlockLine(data);
        });

        Socket.on("editjoblist", function (data) {

            if ($.inArray(data.status, ["DPENDING", "DEPENDING_REJECT", "DPENDING_LINE"]) > -1) {
                Passenger.getData(data.psg_id, function (response) {
                    if (response.status) {
                        DataTable.pendingTaskTable.updateRow(response.psg_data);
                        DataTable.pendingTaskTable.setIndicator();
                    }
                });
            }
            else if (data.status == "ASSIGNED") {
                Passenger.getData(data.psg_id, function (response) {
                    if (response.status) {
                        DataTable.assignedTaskTable.updateRow(response.psg_data);

                        if (response.psg_data.cccomment !== "") {
                            TaskComment.add(response.psg_data);
                        }
                        else {
                            TaskComment.remove(response.psg_data);
                        }
                    }
                });
            }
            else if (data.jobtype == "QUEUE") {
                DataTable.queueTaskTable.updateRow(data);
            }
            else if (data.jobtype == "ADVANCE") {
                DataTable.advanceTaskTable.updateRow(data);
            }
        });

        Socket.on("assigning task", function (data) {
            LOCAL_STATE.push(data);
            DataTable.lockLine(data);
        });

        Socket.on("assigndrvtopsg", function (data) {

            if ($.inArray(data.status, ["DPENDING", "DEPENDING_REJECT", "DPENDING_LINE"]) > -1) {

                var row = DataTable.queueTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.queueTaskTable.datatable.row(row).remove().draw(false);
                
                var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                row !== undefined && DataTable.pendingTaskTable.datatable.row(row).remove().draw(false);

                DataTable.pendingTaskTable.addRow(data);
                DataTable.pendingTaskTable.setIndicator();
            }
            else if (data.status == "ASSIGNED") {

                if (data.drv_carplate.slice(-1) == "+") {
                    var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                    row !== undefined && DataTable.pendingTaskTable.datatable.row(row).remove().draw(false);
                    DataTable.pendingTaskTable.setIndicator();
                }
                else if (data.drv_carplate.slice(-1) != "+") {
                    var row = DataTable.queueTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                    row !== undefined && DataTable.queueTaskTable.datatable.row(row).remove().draw(false);
                    DataTable.pendingTaskTable.setIndicator();

                    var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
                    row !== undefined && DataTable.pendingTaskTable.datatable.row(row).remove().draw(false);
                    DataTable.pendingTaskTable.setIndicator();
                }

                DataTable.assignedTaskTable.addRow(data);
            }
        });

        Socket.on("cancelpsgdrv", function (data) {

            var row = DataTable.assignedTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            row !== undefined && DataTable.assignedTaskTable.datatable.row(row).remove().draw();

            DataTable.queueTaskTable.addRow(data);
            DataTable.queueTaskTable.setIndicator();
        });

        Socket.on("gotdispatchaction", function (data) {
            Passenger.getData(data.psg_data._id, function (response) {
                if (response.status) {
                    if (response.psg_data.status == "ASSIGNED") {

                        var row = DataTable.pendingTaskTable.$table.find('[data-ref="' + response.psg_data._id + '"]')[0];
                        row !== undefined && DataTable.pendingTaskTable.datatable.row(row).remove().draw(false);
                        DataTable.pendingTaskTable.setIndicator();

                        DataTable.assignedTaskTable.addRow(response.psg_data);
                    }
                    else if (response.psg_data.status == "DEPENDING_REJECT") {
                        DataTable.pendingTaskTable.updateRow(response.psg_data);
                        DataTable.pendingTaskTable.setIndicator();
                    }

                }
            });
        });

        Socket.on("driverCancelCallCenter", function (data) {

            var row = DataTable.assignedTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            row !== undefined && DataTable.assignedTaskTable.datatable.row(row).remove().draw();

            Passenger.getData(data._id, function (response) {
                if (response.status) {
                    DataTable.pendingTaskTable.addRow(response.psg_data);
                    DataTable.pendingTaskTable.setIndicator();
                }
            });
        });

        Socket.on("driverEndTask", function (data) {
            var row = DataTable.assignedTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            row !== undefined && DataTable.assignedTaskTable.datatable.row(row).remove().draw();
        });

        Socket.on("closeCallcenterJob", function (data) {
            var row = DataTable.assignedTaskTable.$table.find('[data-ref="' + data._id + '"]')[0];
            row !== undefined && DataTable.assignedTaskTable.datatable.row(row).remove().draw();
        });

        Socket.on("update state", function(data) {
            data.filter(function(task) {
                LOCAL_STATE.push(task);
                DataTable.lockLine(task);
            });
        });

        Socket.on('voice', function (data) {
            var blob = new Blob([data], { 'type': 'audio/ogg; codecs=opus' });
            var audio = document.createElement('audio');
            audio.src = window.URL.createObjectURL(blob);
            audio.play();
        });

        Socket.on('driver logged in', function (data) {
            LiveBeam.toListView(data);
        });

        Socket.on('driver logged out', function (data) {
            Modal.driverListChatModal.modal.find("[data-ref='" + data + "']").remove();
        });

        return Socket;
    },
    validate: function () {
        window.addEventListener("beforeunload", function (e) {
            Socket.emit('window beforeunload', USER_DATA);
        }, false);
    }
}


var Sound = {
    initial: function () {
        var html = $(".sound-notification-tab").find(".js-switch")[0];
        var s = new Switchery(html, {
            size: "small"
        });

        $(html).on("click", function() {
            var checked = Sound.control.is(":checked");

            if(checked && !Sound.control.is(":checked")) {
                Sound.control.parent().find(".switchery").click();
            }
            else if(!checked && Sound.control.is(":checked")) {
                Sound.control.parent().find(".switchery").click();
            }
        });
    },
    control: $(".sound-notification-tab").find(".js-switch"),
    play: function (soundName) {
        var sound = document.getElementById(soundName);
        this.control.is(":checked") && sound.play();
    }
}


var TaskComment = {
    updateAll: function () {

        var AlertContainer = $("#navbar .alert-tab").find(".panel-body .list-group");
        AlertContainer.empty();

        var oTable = DataTable.assignedTaskTable.datatable;
        for (var i = 0; i < oTable.rows()[0].length; i++) {
            if (oTable.rows(i).data()[0][9] !== undefined && oTable.rows(i).data()[0][9].cccomment != "") {
                var taskData = oTable.rows(i).data()[0][9];

                var html = '<li class="list-group-item" data-ref="' + taskData._id + '" onclick="Modal.assignedTaskEditableModal.showDatail(\'' + taskData._id + '\');">';
                html += '<p class="message">' + taskData.cccomment + '</p>';
                html += '<div class="pull-left">';
                html += '<span class="datetime">' + Util.getCurrentTime( taskData.dassignedjob ) + ' น.</span>';
                html += '<span class="detail">';
                html += '' + taskData.curaddr + ' <i>ไป</i> ' + taskData.destination + '';
                html += '</span>';
                html += '</div>';
                html += '<div class="pull-right">';
                html += '<span class="sender">' + taskData.assigningby + '</span>';
                html += '</div>';
                html += '<div class="clearfix"></div>';
                html += '</li>';

                AlertContainer.append(html);
            }
        }

        $("#navbar .alert-tab").find(".dropdown-toggle .label").text(AlertContainer.find(".list-group-item").size());
    },
    add: function (data) {

        var AlertContainer = $("#navbar .alert-tab").find(".panel-body .list-group");
        if (AlertContainer.find("[data-ref='" + data._id + "']").find(".message").html() == data.cccomment) {
            return false;
        }

        var html = '<li class="list-group-item" data-ref="' + data._id + '" onclick="Modal.assignedTaskEditableModal.showDatail(\'' + data._id + '\');">';
        html += '<p class="message">' + data.cccomment + '</p>';
        html += '<div class="pull-left">';
        html += '<span class="datetime">' + Util.getCurrentTime(data.dassignedjob) + ' น.</span>';
        html += '<span class="detail">';
        html += '' + data.curaddr + ' <i>ไป</i> ' + data.destination + '';
        html += '</span>';
        html += '</div>';
        html += '<div class="pull-right">';
        html += '<span class="sender">' + data.assigningby + '</span>';
        html += '</div>';
        html += '<div class="clearfix"></div>';
        html += '</li>';

        AlertContainer.find("[data-ref='" + data._id + "']").remove();
        AlertContainer.append(html);

        $("#navbar .alert-tab").find(".dropdown-toggle .label").text(AlertContainer.find(".list-group-item").size());

        Sound.play("sounds-925-hand-bell");
    },
    remove: function (data) {
        var AlertContainer = $("#navbar .alert-tab").find(".panel-body .list-group");
        AlertContainer.find("[data-ref='" + data._id + "']").remove();
        $("#navbar .alert-tab").find(".dropdown-toggle .label").text(AlertContainer.find(".list-group-item").size());
    }
};


var Taxi = {
    initial: function () {
        Map && Map.addLayer(this.layer);
    },
    line: {},
    active: {},
    circle: L.circle(),
    layer: L.layerGroup(),
    addToMap: function (TaxiList, options, clear) {

        if (clear == undefined || clear) {
            Taxi.clear();
        }

        $(TaxiList).each(function (index, taxi) {

            if (taxi.lat == undefined || taxi.lng == undefined) {
                return;
            }

            //var taxiMarker = L.marker([taxi.lat, taxi.lng], {
            //    icon: L.icon({
            //        iconUrl: '/assets/img/map/tx_' + taxi.status + '.png',
            //        iconAnchor: [20, 20],
            //        labelAnchor: [10, 0]
            //    })
            //});

            var carplateStyle = L.divIcon({
                className: 'carplate-pin ' + taxi.status.toLocaleLowerCase(),
                html: '<div class="message"><img src="/assets/img/map/tx_' + taxi.status.toLocaleUpperCase() + '.png">' + taxi.license_plate + '<div class="arrow"></div></div>',
                iconAnchor: [35, 55]
            });

            var taxiMarker = L.marker([taxi.lat, taxi.lng], {
                riseOnHover: true,
                icon: carplateStyle
            });

            taxi.imgface = Taxi.getImageFace(taxi.imgface);

            var HTMLPopup = '<div class="row">';
            HTMLPopup += '<div class="col-md-6">';
            HTMLPopup += '<img class="driver-img" src="' + taxi.imgface + '" />';
            if (options == undefined && taxi.status.toLocaleUpperCase() == "ON") {
                HTMLPopup += '<button class="btn choose" onclick="Taxi.goToPassenger();">เลือกคนนี้</button>';
            }
            HTMLPopup += '</div>';
            HTMLPopup += '<div class="driver-info col-md-6">';
            HTMLPopup += '<p class="full_name value">' + taxi.full_name + '</p>';
            HTMLPopup += '<p class="caption">เบอร์โทรติดต่อ</p>';
            HTMLPopup += '<p class="tel value">' + taxi.tel + '</p>';
            HTMLPopup += '<div class="pull-left">';
            HTMLPopup += '<p class="caption">ทะเบียน</p>';
            HTMLPopup += '<p class="license_plate value">' + taxi.license_plate + '</p>';
            HTMLPopup += '</div>';
            HTMLPopup += '<div class="pull-left">';
            HTMLPopup += '<p class="caption">สถานะ</p>';
            HTMLPopup += '<p class="status value">' + taxi.status + '</p>';
            HTMLPopup += '</div>';
            HTMLPopup += '</div>';
            HTMLPopup += '</div>';
            if (taxi.status.toLocaleUpperCase() == "BROKEN") {
                var label = '<div class="label-message-status"><h3 class="title">รถเสีย</h3><a class="call-message" href="#" onclick="Taxi.toggleBrokenDetail(this);">';
                label += '<span class="txt-show">แสดง</span><span class="txt-hide">ซ่อน</span>รายละเอียด';
                label += '</a>';
                if (Object.prototype.toString.call(taxi.brokenname) === '[object Array]') {
                    label += '<p class="list"><i>อาการ</i><br>' + taxi.brokenname.toString() + '</p>';
                }
                label += '<p class="detail"><i>รายละเอียด</i><br>' + taxi.brokendetail + '</p>';
                label += '</div>';
                HTMLPopup += label;
            }

            taxiMarker.bindPopup(HTMLPopup, {
                offset: L.point(0, -18),
                className: 'driver-popup'
            }).on('popupopen', function (e) {
                Taxi.active = taxiMarker;
            }).on('popupclose', function () {
                Taxi.active = {};
            });

            taxiMarker.options.taxi_info = taxi;
            Taxi.layer.addLayer(taxiMarker);
        });
    },
    getImageFace: function (imgface) {
        if (imgface == undefined || imgface == "") {
            imgface = "assets/img/thumbnail_photo.jpg";
        } else {
            imgface = "/image/driver/" + imgface;
        }

        return imgface;
    },
    filter: function (status) {

        var taxi_list = LOCAL_DATA.taxi;
        if (status !== 'all' && LOCAL_DATA.taxi !== undefined) {
            taxi_list = LOCAL_DATA.taxi.filter(function (taxi) {
                return taxi.status.toLocaleLowerCase() == status.toLocaleLowerCase();
            });
        }

        this.addToMap(taxi_list);
    },
    onFilterClick: function (filter, event) {

        var isActive = $(filter).hasClass('active');
        $('.filter-marker.active').removeClass('active');

        !isActive && $(filter).addClass('active');

        var status = $(filter).attr('data-status');
        var count = $('.filter-marker.active').size();

        if (count == 0) { status = "all"; }
        this.filter(status);
    },
    findNearestPassenger: function (pass_latlng, pass_info) {

        if (pass_latlng.length > 0) {

            Notification.removeAll();

            this.circle.setLatLng(pass_latlng).setRadius(5000);
            Map.fitBounds(this.circle.getBounds());
            Passenger.addToMap(pass_latlng, pass_info);

            var data = {
                "curlat": pass_info.curloc[0],
                "curlng": pass_info.curloc[1],
                "status": "ON",
                "radian": 5000
            };

            var actionFind = function () {
                Http.post('service/ubeam/searchdrv', {
                    loader: false,
                    data: data,
                    onSuccess: function (response) {
                        if (response.status) {

                            var taxi_list = [];

                            $(response.data).each(function (index, driver) {
                                taxi_list.push({
                                    "_id": driver._id,
                                    "license_plate": driver.carplate,
                                    "lat": driver.curlat,
                                    "lng": driver.curlng,
                                    "status": "ON",
                                    "imgface": driver.imgface,
                                    "full_name": driver.fname + ' ' + driver.lname,
                                    "tel": driver.phone,
                                    "rating": "5"
                                });
                            });

                            Taxi.addToMap(taxi_list);
                        } else {
                            Taxi.clear();
                        }
                    }
                });
            };

            actionFind();
        }
        else {
            Notification.removeAll();
            this.layer.clearLayers();
            Passenger.removeMarker();
            App.setDefaultPosition();
            setTimeout(function () {
                Notification.show({
                    sticky: false,
                    $class: "primary",
                    title: "ไม่ทราบตำแหน่งที่แน่นอนของผู้โดยสาร",
                    text: '',
                    position: "bottom-center"
                });
            }, 700);
        }
    },
    findInCenterMap: function () {

        var center = Map.getCenter();

        Http.post('service/ubeam/searchdrv', {
            loader: false,
            data: {
                "status": "ON",
                "curlat": center.lat,
                "curlng": center.lng
            },
            onSuccess: function (response) {
                if (response.status) {

                    var taxi_list = [];

                    $(response.data).each(function (index, driver) {
                        taxi_list.push({
                            "_id": driver._id,
                            "license_plate": driver.carplate,
                            "lat": driver.curlat,
                            "lng": driver.curlng,
                            "status": "ON",
                            "imgface": driver.imgface,
                            "full_name": driver.fname + ' ' + driver.lname,
                            "tel": driver.phone,
                            "rating": "5"
                        });
                    });

                    Taxi.addToMap(taxi_list);
                } else {
                    Taxi.clear();
                }
            }
        });
    },
    findByCarplate: function(plateNumber) {
        var currentTaxi = null;
        Taxi.layer.eachLayer(function(taxi) { 
            if(taxi.options.taxi_info.license_plate == plateNumber) {
                currentTaxi = taxi;
                return false;
            }
        });

        if(currentTaxi !== null) {
            Notification.remove();
            Monitoring.toggleFilterControl($(".taxi-counter .puller"));
            setTimeout(function () {
                Map.invalidateSize();
                currentTaxi.openPopup();
                Map.setView([currentTaxi.options.taxi_info.lat, currentTaxi.options.taxi_info.lng], 17);
            }, 100);
        } else {
            Notification.remove();
            Notification.show({
                className:"warning",
                title:'ไม่พบแท็กซี่ดังกล่าว',
            });
        }
    },
    goToPassenger: function () {

        var driver = Taxi.active.options.taxi_info;
        var passenger_id = Modal.assignTaskModal.modal.find("#pass_id").val();
        var data = {
            "psg_id": passenger_id,
            "drv_id": driver._id,
            "username": USER_DATA.username
        };

        Http.post('service/ubeam/assigndrvtopsg', {
            data: data,
            onSuccess: function (response) {
                if (response.status) {

                    Preloader.show();
                    setTimeout(function () {

                        var html = Taxi.active.getPopup().getContent();
                        html = html.replace("choose", "choose hide");
                        Taxi.active.setPopupContent(html);
                        $(html).find(".btn.choose").hide();

                        Taxi.layer.eachLayer(function (marker) {
                            if (marker._leaflet_id != Taxi.active._leaflet_id && !(marker instanceof L.Polyline)) {
                                Taxi.layer.removeLayer(marker);
                            }
                        });

                        Modal.assignTaskModal.modal.focus();
                        Map.off("dragend", Taxi.findInCenterMap);
                        Form.assignTaskForm.form.find("input[type=hidden]").val("");
                        Form.assignTaskForm.form.find("button[type=submit]").hide();
                        Form.searchTaxiBeforeAssignForm.form.find("#car-plate-inp").prop("disabled", true);
                        Form.searchTaxiBeforeAssignForm.form.find("#car-plate-inp").val(response.drv_data.carplate);

                        Preloader.hide();
                        Notification.remove();
                        Notification.defaultSuccess();
                        Passenger.onAssignTaskSuccess();
                    }, 700);
                } else {
                    Notification.defaultError();
                }
            }
        });
    },
    assignByLineApp: function (passenger_id, drv_carplate) {

        Preloader.show();

        var data = {
            "psg_id": passenger_id,
            "drv_carplate": drv_carplate,
            "lineconfirm": "Y",
            "username": USER_DATA.username
        };

        Http.post('service/ubeam/assigndrvtopsg', {
            data: data,
            onSuccess: function (response) {
                if (response.status) {
                    Preloader.hide();
                    Notification.remove();
                    Notification.defaultSuccess();
                    Passenger.onAssignTaskSuccess();
                    Modal.assignTaskByLineModal.modal.find(".modal-footer").hide();
                } else {
                    Notification.defaultError();
                }
            }
        });
    },
    checkStatus: function (data, callback) {
        Http.post('service/ubeam/checkdrvstatus', {
            loader: false,
            data: data,
            onSuccess: callback
        });
    },
    cancelFind: function () {
        Map.removeLayer(this.circle);
    },
    clear: function () {
        this.layer.clearLayers();
    },
    toggleStatus: function (status, show) {
        if (show) {
            var taxi = Monitoring.taxi.filter(function (taxi) {
                return taxi.status == status;
            });
            taxi.length > 0 && Taxi.addToMap(taxi, { monitoring: true }, false);
        }
        else {
            Taxi.layer.eachLayer(function (taxi) {
                if (taxi.options.taxi_info.status == status) {
                    Taxi.layer.removeLayer(taxi);
                }
            });
        }
    },
    ghostTaxi: function (number) {

        var taxi_list = [];
        var bounds = this.circle.getBounds();

        if (number === undefined || number == 0) {
            number = 1;
        }

        for (var i = 1; i <= number; i++) {
            var latlng = Taxi.getRandomLatLng(bounds);

            taxi_list.push({
                "_id": new Date().getTime(),
                "license_plate": "1กล 2254",
                "lat": latlng.lat,
                "lng": latlng.lng,
                "status": "ON",
                "image_driver": "",
                "full_name": "กนกกร",
                "tel": "082-456-8899",
                "rating": "5"
            });
        };

        return taxi_list;
    },
    getRandomLatLng: function (bounds) {
        southWest = bounds.getSouthWest(),
        northEast = bounds.getNorthEast(),
        lngSpan = northEast.lng - southWest.lng,
        latSpan = northEast.lat - southWest.lat;

        return new L.LatLng(
            southWest.lat + latSpan * Math.random(),
            southWest.lng + lngSpan * Math.random());
    },
    toggleBrokenDetail: function (elem) {
        $(elem).closest('.label-message-status').toggleClass('open');
    }
};


var LandMark = {
    initial: function () {
        Map && Map.addLayer(this.layer);
    },
    getAll: function () {
        Http.post('service/ubeam/getPOIandParking', {
            onSuccess: function (response) {
                if (response.status) {
                    LandMark.addToMap(response.data);
                } else {
                    //Notification.defaultError();
                }
            }
        });
    },
    layer: L.layerGroup(),
    clear: function () {
        this.layer.clearLayers();
    },
    addToMap: function (locations) {

        LandMark.clear();

        $(locations).each(function (index, location) {

            var icon = "";
            var className = "";
            if (location.poitype == 1) {
                className = "landmark";
                icon = '<i class="material-icons">star</i>';
            }
            else if (location.poitype) {
                className = "parking";
                icon = '<i class="material-icons">local_parking</i>';
            }

            var positionStyle = L.divIcon({
                className: 'position-pin ' + className,
                html: '<div class="wrapper"><div class="icon">' + icon + '</div><div class="text">' + location.name + '</div><div class="arrow"></div></div>',
                // iconAnchor: [35, 55]
            });

            var landMarker = L.marker([location.curloc[1], location.curloc[0]], {
                riseOnHover: true,
                icon: positionStyle
            });

            landMarker.options.landMarkerInfo = location;
            LandMark.layer.addLayer(landMarker);
        });
    },
    toggleDisplay: function(display) {
        display ? this.getAll() : this.clear();
    }
}


var Util = {
    getCurrentTime: function (date_string) {

        var addZero = function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }

        var d = date_string == undefined ? new Date() : new Date(date_string);
        var h = addZero(d.getHours());
        var m = addZero(d.getMinutes());
        var s = addZero(d.getSeconds());

        return h + ":" + m; // + ":" + s;
    },
    getFullDate: function (time) {
        var d = new Date(time);         //timestamp
        var da = d.getDate();       //day
        var mon = d.getMonth() + 1; //month
        var yr = d.getFullYear();   //year
        return da + "/" + mon + "/" + yr;
    },
    diffTime: function (pass, future) {
        return (future - pass) / 1000 / 60
    },
    executeFunctionByName: function (functionName, context /*, args */) {
        var args = [].slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    },
    getTimeStatus: function (time) {
        var diff = Util.diffTime(new Date(time).getTime(), new Date().getTime());
        // defaut "new" status
        var status = "new";
        if (diff < -1) {
            status = "book";
        }
        else if (diff > 0 && diff <= 1) {
            status = "new";
        }
        else if (diff > 1 && diff <= 5) {
            status = "normal";
        }
        else if (diff > 5) {
            status = "long";
        }
        return status;
    },
    getDiffTime: function (time) {
        // diff in minute time.

        var diff = Util.diffTime(new Date(time).getTime(), new Date().getTime());
        var status = {};
        // less than 1 hour.
        if (diff < 60) {
            var result = Math.floor(diff);
            status.time = (result == 0 || result < 0) ? "นาที" : result + " น.";
            status.unit = "ที่แล้ว";
        }
            // within 24 hour or 1 day
        else if (diff >= 60 && diff <= 1440) {
            //status.time = "+" + (diff / 60).toFixed(2);
            status.time = Math.floor((Math.abs(new Date(time).getTime() - new Date().getTime()) / 36e5).toFixed(2)) + " ชม.";
            status.unit = "ที่แล้ว";
        }
            // more than 1440 minute or 24 hour or 1 day
        else if (diff > 1440) {
            status.time = "นานมาก";
            status.unit = "แล้ว";
        }
        return status;
    }
};


(function () {

    App.init();

    setInterval(function () {
        DataTable.queueTaskTable.updateTimeStatus();
        DataTable.pendingTaskTable.updateTimeStatus();
    }, 5000);

    DataTable.advanceTaskTable.intervalUpdate();
})();


(function( $ ) {
    jQuery.fn.inlineEditable = function(data) {

        var defaults = {};

        var settings = $.extend({}, defaults, data);

        initialize(this);

        function initialize (target) {
            target[0].addEventListener("dblclick", ondblclick);
        }

        function ondblclick() {

            var form = document.createElement('form');
            var input = document.createElement('input');
            var td = this;
            input.setAttribute("type", "text");
            input.setAttribute("originText", td.innerText)
            input.value = td.innerText;
            input.addEventListener('blur', function() { onblur(td, form, this) }, false );

            form.appendChild(input);
            form.addEventListener('submit', function() { onsubmit(td, this) }, false );

            while(td.firstElementChild) {
                td.removeChild(td.firstElementChild);
            }
            td.innerText = "";

            td.appendChild(form);
            td.removeEventListener('dblclick', ondblclick, false);

            input.focus();
        }

        function onblur(td, form, input) {

            var value = input.value;
            var originText = input.getAttribute("originText");

            if(originText !== value) {

                var data = {};
                var value = input.value;
                var name = td.getAttribute('data-field-name');
                var id = td.parentNode.getAttribute("data-ref");

                data[name] = value;
                Passenger.editData(id, data);
            }

            while(td.firstElementChild) {
                td.removeChild(td.firstElementChild);
            }

            td.innerText = value;
            td.addEventListener('dblclick', ondblclick);
        }

        function onsubmit(td, form) {

            event.preventDefault();
            form.firstChild.blur();
        }

        function isFunction(func) {
            return this.settings !== undefined 
                && func !== undefined 
                && typeof func == "function";
        }
    }
})( jQuery );