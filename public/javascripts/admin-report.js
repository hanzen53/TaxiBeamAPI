var CONSTRAINTS = {
	serviceURL: {
		psgCallLog: '../../service/ubeam/PsgCallLog',
		joblistLog: '../../service/ubeam/JoblistLog',
	},
    daterangepicker: {
    	displayDate: [
    		new Date().getTime() - (7*24*60*60*1000),
    		new Date().getTime()
    	],
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
	initial: function() {
		TabControl.initial();
		DateRagePicker.initial();
		DataTable.PsgCallLogTable.initial();
		DataTable.JoblistLogTable.initial();
	}
}


var DataTable = {
    PsgCallLogTable: {
        $table: $("#PsgCallLogTable"),
        datatable: null,
        initial: function () {
            DataTable.PsgCallLogTable.datatable = DataTable.PsgCallLogTable.$table.dataTable({
                paging: true,
                scrollY: "650px",
                deferRender: true,
                scrollCollapse: true,
                iDisplayLength: 100,
                language: {
                    search: "",
                    searchPlaceholder: "ค้นหา",
                    sInfo: "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ",
                },
                columns: [
	                { title: "#" },
	                { title: "เบอร์โทรผู้โดยสาร" },
	                { title: "เบอร์โทรคนขับ" },
	                { title: "ทะเบียน" },
	                { title: "ตำแหน่งที่กด" },
	                { title: "เวลาโทร" }
                ],
                createdRow: function (row, data, index) {
                    row.setAttribute("data-ref", data[5]);
                },
                drawCallback: function (settings) {
                    Preloader.hide(0);
                }
            });

            DataTable.PsgCallLogTable.getData({
				startTime: CONSTRAINTS.daterangepicker.displayDate[0],
				endTime: CONSTRAINTS.daterangepicker.displayDate[1]
            });
        },
        render: function(data) {

            var tasks = []; 
            data.filter(function(task, index) {
                tasks.push([
                    (index + 1),
                    task.psg_phone,
                    task.drv_phone,
                    task.drv_carplate,
                    task.callby,
                    Util.getFullDate(task.created) + " " + Util.getCurrentTime(task.created) + ' น.',
                    task._id
                    ]);
            });

            var oTable = DataTable.PsgCallLogTable.datatable;

            oTable.fnClearTable();
            oTable.fnAddData(tasks);
        },
        clear: function() {
            DataTable.PsgCallLogTable.datatable.fnClearTable();
        },
        getData: function(data) {
        	Http.post(CONSTRAINTS.serviceURL.psgCallLog, {
				data: data,
				onSuccess: function (response) {
					if (response.status) {
						Notification.remove();
						DataTable.PsgCallLogTable.render(response.data);
					}
					else {
						DataTable.PsgCallLogTable.clear();
						Notification.show({
							time: 5000,
							title:'ไม่มีข้อมูลที่ค้นห้า',
							text: 'ไม่พบข้อมูลระหว่างช่วงเวลาดังกล่าว',
							$class: "warning"
						});
					}
				}
			});
        }
    },
    JoblistLogTable: {
        $table: $("#JoblistLogTable"),
        datatable: null,
        initial: function () {
            DataTable.JoblistLogTable.datatable = DataTable.JoblistLogTable.$table.dataTable({
                paging: true,
                autoWidth: true,
                scrollY: "650px",
                deferRender: true,
                scrollCollapse: true,
                iDisplayLength: 100,
                language: {
                    search: "",
                    searchPlaceholder: "ค้นหา",
                    sInfo: "กำลังแสดงรายการที่ _START_ ถึง _END_ จากทั้งหมด _TOTAL_ รายการ",
                },
                columns: [
	                { title: "#" },
	                { title: "Psg phone" },
	                { title: "Drv name" },
	                { title: "Drv phone" },
	                { title: "Carplate" },
	                { title: "Start" },
	                { title: "End" },
	                { title: "DatePsgCall" },
	                { title: "DrvWait" },
	                { title: "PsgAccept" },
	                { title: "DrvPick" },
	                { title: "DrvDrop" },
	                { title: "PsgCancel" },
	                { title: "DrvCancel" },
                ],
                columnDefs: [
                {
                    targets: [8,9,10,11,12,13],
                    width: "70px"
                }],
                createdRow: function (row, data, index) {
                    row.setAttribute("data-ref", data[5]);
                },
                drawCallback: function (settings) {
                    Preloader.hide(0);
                }
            });

            DataTable.JoblistLogTable.getData({
				startTime: CONSTRAINTS.daterangepicker.displayDate[0],
				endTime: CONSTRAINTS.daterangepicker.displayDate[1]
            });
        },
        render: function(data) {

        	var datedrvwait = 0;
        	var datepsgaccept = 0;
        	var datedrvpick = 0;
        	var datedrvdrop = 0;
        	var datepsgcancel = 0;
        	var datedrvcancel = 0;

            var tasks = []; 
            data.filter(function(task, index) {
                tasks.push([
                    (index + 1),
                    task.psg_phone,
                    task.drv_name,
                    task.drv_phone,
                    task.drv_carplate,
                    task.curaddr,
                    task.destination,
                    Util.getFullDate(task.datepsgcall) + " " + Util.getCurrentTime(task.datepsgcall) + ' น.',
                    typeof task.datedrvwait != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    typeof task.datepsgaccept != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    typeof task.datedrvpick != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    typeof task.datedrvdrop != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    typeof task.datepsgcancel != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    typeof task.datedrvcancel != 'undefined' ? '<i class="material-icons">check_circle</i>' : "",
                    task._id
                    ]);

                typeof task.datedrvwait != 'undefined' && datedrvwait++;
                typeof task.datepsgaccept != 'undefined' && datepsgaccept++;
                typeof task.datedrvpick != 'undefined' && datedrvpick++;
                typeof task.datedrvdrop != 'undefined' && datedrvdrop++;
                typeof task.datepsgcancel != 'undefined' && datepsgcancel++;
                typeof task.datedrvcancel != 'undefined' && datedrvcancel++;
            });

        	var summaryCircle = $("#JoblistLogTab").find(".summary-circle-group");
        	summaryCircle.find(".datepsgcall").find(".number").text(tasks.length);

        	summaryCircle.find(".datedrvwait").find(".number").text(datedrvwait);
        	summaryCircle.find(".datepsgaccept").find(".number").text(datepsgaccept);
        	summaryCircle.find(".datedrvpick").find(".number").text(datedrvpick);
        	summaryCircle.find(".datedrvdrop").find(".number").text(datedrvdrop);
        	summaryCircle.find(".datepsgcancel").find(".number").text(datepsgcancel);
        	summaryCircle.find(".datedrvcancel").find(".number").text(datedrvcancel);

            var oTable = DataTable.JoblistLogTable.datatable;

            oTable.fnClearTable();
            oTable.fnAddData(tasks);
        },
        clear: function() {
            DataTable.JoblistLogTable.datatable.fnClearTable();
        },
        getData: function(data) {
        	Http.post(CONSTRAINTS.serviceURL.joblistLog, {
				data: data,
				onSuccess: function (response) {
					if (response.status) {
						Notification.remove();
						DataTable.JoblistLogTable.render(response.data);
					}
					else {
						DataTable.JoblistLogTable.clear();
						Notification.show({
							time: 5000,
							title:'ไม่มีข้อมูลที่ค้นห้า',
							text: 'ไม่พบข้อมูลระหว่างช่วงเวลาดังกล่าว',
							$class: "warning"
						});
					}
				}
			});
        }
    },
};


var DateRagePicker = {
	initial: function() {

		var daterange = $(".daterange");

		function cb(start, end) {
			daterange.find("span").html(start.format('DD/MM/YYYY HH:mm') + ' - ' + end.format('DD/MM/YYYY HH:mm'));
		}

		cb(moment().subtract(1, 'days'), moment());

		daterange.daterangepicker(CONSTRAINTS.daterangepicker.options, cb).on('apply.daterangepicker', function(ev, picker) {

			var data = {
				startTime: new Date(picker.startDate).getTime(),
				endTime: new Date(picker.endDate).getTime()
			};

			if(TabControl.activeTab.hash == "#PsgCallLogTab") {
				DataTable.PsgCallLogTable.getData(data);
			}
			else if(TabControl.activeTab.hash == "#JoblistLogTab") {
				DataTable.JoblistLogTable.getData(data);
			}

		}).on('showCalendar.daterangepicker', function(ev, picker) { });
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

        var message = '<div class="connect_lost_message"><span class="label label-danger">การเชื่อมต่อมีปัญหา</span></div>';

        $('body').find("> .connect_lost_message").remove();
        $('body').append(message);
        $('body').find("> .connect_lost_message").fadeIn('fast');

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


var TabControl = {
	activeTab: $("#reportTableControl").find(".active > a")[0],
	initial: function() {
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			TabControl.activeTab = e.target;
			DataTable.PsgCallLogTable.datatable.fnDraw();
			DataTable.JoblistLogTable.datatable.fnDraw();
		});
	}
};


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


$(document).ready(function() {
	App.initial();
});