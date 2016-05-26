var Map = null;
var LOCAL_DATA = {};


var Loader = {
	initial: function() {
		Preloader.setOption({
			timeout: 700,
			className: 'la-ball-clip-rotate la-dark',
			color: '#B21616'
		});
	}
};


var App = {
	init: function() {
		Loader.initial();
		Bootstrap.initial();
		DataTimePicker.initial();
		iOSwitchery.initial();

		Form.createCallcenterTaskForm.initSubmit();
		// Form.createCallcenterTaskForm.searchPOIInit()
		// Form.createCallcenterTaskForm.searchPassengerPhoneInit();

		Form.assignTaskForm.initSubmit();
		Form.assignTaskForm.autocompleteInit();

		Modal.assignTaskModal.initial();
		Modal.createTaskModal.initial();
	},
	createMap: function() {

		Map = H.map('map');

		Map.setBasemap(3)
		Map.toggle3D();
		Map.setMaxZoom(18);
		Map.setLanguage("TH");

		Taxi.initial();
	},
	setDefaultPosition: function() {
		// Thailand Country Position
		// Map.setView([13.0108527,96.9950131], 6);
		
		// Amphoe Mueang Ubon Ratchathani
		Map.setView(USER_CURRENT_LOCATION, 12);
	},
	setCurrentPosition: function() {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				Map.setView([position.coords.latitude, position.coords.longitude], 13);
			});
		}
	},
	toggleSidebar: function () {
		$('#st-container').toggleClass('st-menu-open');
		$('.hb-locator_search').toggleClass('relative-sidebar');
	},
	hideSidebar: function() {
		$('#st-container').removeClass('st-menu-open');
		$('.hb-locator_search').removeClass('relative-sidebar');
	},
	intervalManager: function(flag, action, time) {
		http://stackoverflow.com/a/10935062
		if(flag) {
			intervalID =  setInterval(action, time);
		}
		else {
			typeof intervalID !== 'undefined' && clearInterval(intervalID);
		}
	}
};


var Bootstrap = {
	initial: function() { 	
		$('body').on('click', function (e) {
			$('[data-toggle=popover]').each(function () {
				if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
					$(this).popover('hide');
				}
			});
		});


		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			if( $(e.relatedTarget).attr('data-tab-name') == "create-task" ) {
				DataTable.taskTable.update();
				DataTable.assignedTaskTable.update();
			}
			else if ( $(e.relatedTarget).attr('data-tab-name') == "assign-task" ) {
				DataTable.initiateTaskTable.update();
			}

			Taxi.clear();
			Passenger.removeMarker();
		});
	},
	Popover: {
		initial: function() {
			$('[data-toggle=popover]').popover({
				html: true
			});
		}
	}
};


var DataTimePicker = {
	initial: function() {
		$('#datetimepicker12').datetimepicker({
			inline: true,
		});
	}
};


var iOSwitchery = {
	initial: function() {
		this.create();
		this.eventHandler();
	},
	eventHandler: function() {
		$('.js-switch').on('change', function(event) {
			this.checked ? $('.datetime-overlay').fadeOut() : $('.datetime-overlay').fadeIn(); 
		});
	},
	create: function() {

		var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));

		elems.forEach(function(html) {
			var switchery = new Switchery(html);
		});
	}
}


var Passenger = {
	marker: {},
	addToMap: function(latlng, passenger_info) {

		this.removeMarker();

		this.marker = L.marker(latlng, {
			icon: L.icon({
				iconUrl: '/assets/img/map/psg_pin.png',
				iconAnchor: [12, 20],
				labelAnchor:[10,0]
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
	cancelJob: function(pass_id) {

		Http.post('service/ubeam/deletejob', {
			data: { "psg_id": pass_id },
			onSuccess: function(response) {
				if(response.status) {
					DataTable.taskTable.update();
				}
			}
		});
	},
	removeMarker: function() {
		Map.removeLayer(this.marker);
		this.marker = {};
	}
};


var Taxi = {
	initial: function() {
		Map.addLayer(this.layer);
	},
	line: {},
	layer: L.layerGroup(),
	circle: L.circle(),
	active: {},
	addToMap: function(TaxiList, options) {

		Taxi.clear();

		$(TaxiList).each(function(index, taxi) {

			var taxiMarker = L.marker([taxi.lat, taxi.lng], {
				icon: L.icon({
					iconUrl: '/assets/img/map/pin-taxi-' + taxi.status + '.png',
					iconAnchor: [20, 20],
					labelAnchor:[10,0]
				})
			});

			var HTMLPopup = '<div class="row">';
			HTMLPopup += '<div class="col-md-6">';
			HTMLPopup += '<img class="driver-img" src="assets/data/image/4.jpg" />';
			if(options == undefined && taxi.status.toLocaleLowerCase() == "on") {
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

			taxiMarker.bindPopup(HTMLPopup, {
				offset: L.point(0, -18),
				className: 'driver-popup'
			}).on('popupopen', function(e) {
				Taxi.active = taxiMarker;
				App.intervalManager(false);
			}).on('popupclose', function() {
				// var passenger = DataTable.taskTable.table.find("tr.active").data();
				// Taxi.findNearestPassenger(passenger.curloc, passenger);
				Taxi.active = {};
			});

			taxiMarker.options.taxi_info = taxi;
			Taxi.layer.addLayer(taxiMarker);
		});
	},
	filter: function(status) {

		var taxi_list = LOCAL_DATA.taxi;
		if(status !== 'all' && LOCAL_DATA.taxi !== undefined) {
			taxi_list = LOCAL_DATA.taxi.filter(function(taxi) {
				return taxi.status.toLocaleLowerCase() == status.toLocaleLowerCase();
			});
		}

		this.addToMap(taxi_list);
	},
	onFilterClick: function(filter, event) {


		var isActive = $(filter).hasClass('active');
		$('.filter-marker.active').removeClass('active');

		!isActive && $(filter).addClass('active');

		var status = $(filter).attr('data-status');
		var count = $('.filter-marker.active').size();

		if(count == 0) { status = "all"; }
		this.filter(status);
	},
	findNearestPassenger: function(pass_latlng, pass_info) {

		if(pass_latlng.length > 0) {

			Notification.removeAll();

			this.circle.setLatLng(pass_latlng).setRadius(5000);
			Map.fitBounds(this.circle.getBounds());
			Passenger.addToMap(pass_latlng, pass_info);

			var data = {
				"curlat": pass_info.curloc[0],
				"curlng":pass_info.curloc[1],
				"status":"ON",
				"radian": 5000
			};

			var actionFind = function() {
				Http.post('service/ubeam/searchdrv', {
					loader: false,
					data,
					onSuccess: function(response) {
						if(response.status) {

							var taxi_list = [];

							$(response.data).each(function(index, driver) {
								taxi_list.push({
									"_id": driver._id,
									"license_plate":driver.carplate,
									"lat":driver.curlat,
									"lng":driver.curlng,
									"status":"ON",
									"image_driver":"",
									"full_name":driver.fname + ' ' + driver.lname,
									"tel": driver.phone,
									"rating":"5"
								});
							});

							Taxi.addToMap(taxi_list);
						} else {
							Taxi.clear();
								App.intervalManager(false);  // for clearInterval
							}
						}
					});
				};

			App.intervalManager(false);
			actionFind();
		}
		else {
			App.intervalManager(false);  // for clearInterval
			Notification.removeAll();
			this.layer.clearLayers();
			Passenger.removeMarker();
			App.setDefaultPosition();
			setTimeout(function() {
				Notification.show({
					sticky: false,
					$class: "primary",
					title: "ไม่ทราบตำแหน่งที่แน่นอนของผู้โดยสาร",
					text: '', 
					position: "bottom-center"
				});				
			},700);
		}
	},
	ghostTaxi: function(number) {

		var taxi_list = [];
		var bounds = this.circle.getBounds();

		if(number === undefined || number == 0) {
			number = 1;
		}

		for (var i = 0; i <= number; i++) {
			var latlng = Taxi.getRandomLatLng(bounds);

			taxi_list.push({
				"_id":new Date().getTime(),
				"license_plate":"1กล 2254",
				"lat":latlng.lat,
				"lng":latlng.lng,
				"status":"ON",
				"image_driver":"",
				"full_name":"กนกกร",
				"tel": "082-456-8899",
				"rating":"5"
			});
		};

		return taxi_list;
	},
	getRandomLatLng: function(bounds) {
		southWest = bounds.getSouthWest(),
		northEast = bounds.getNorthEast(),
		lngSpan = northEast.lng - southWest.lng,
		latSpan = northEast.lat - southWest.lat;

		return new L.LatLng(
			southWest.lat + latSpan * Math.random(),
			southWest.lng + lngSpan * Math.random());
	},
	goToPassenger: function() {

		var driver = Taxi.active.options.taxi_info;
		var passenger = Passenger.marker.options.passenger_info;
		var data = {
			"psg_id": passenger._id,
			"drv_id": driver._id
		};

		Http.post('service/ubeam/assigndrvtopsg', {
			data,
			onSuccess: function(response) {
				if(response.status) {

					Taxi.line = L.polyline([[driver.lat, driver.lng], passenger.curloc]).addTo(Taxi.layer);

					DataTable.taskTable.update();
					DataTable.assignedTaskTable.update();

					Preloader.show();
					setTimeout(function() {

						var popup = Taxi.active.getPopup();
						var html = popup.getContent();
						html = html.replace("choose", "choose hide");
						Taxi.active.setPopupContent(html);
						$(html).find(".btn.choose").hide();

						Taxi.layer.eachLayer(function(marker) {
							if(marker._leaflet_id != Taxi.active._leaflet_id && !(marker instanceof L.Polyline) ) {
								Taxi.layer.removeLayer(marker);
							}
						});

						Preloader.hide();
						Notification.defaultSuccess();
					}, 1500);
				} else {
					Notification.defaultError();
				}
			}
		});
	},
	checkStatus: function(data, callback) {

		Http.post('service/ubeam/checkdrvstatus', {
			data,
			onSuccess: callback
		});
	},
	monitoring: function(event) {

		event.preventDefault();

		App.hideSidebar();
		App.setDefaultPosition();
		Passenger.removeMarker();

		Http.post('service/ubeam/searchdrv', {
			data: { 
				"status": "ON",
				"curlat": USER_CURRENT_LOCATION[0],
				"curlng": USER_CURRENT_LOCATION[1] 
			},
			onSuccess: function(response) {
				if(response.status) {

					var taxi_list = [];
					
					$(response.data).each(function(index, driver) {
						taxi_list.push({
							"_id": driver._id,
							"license_plate":driver.carplate,
							"lat":driver.curlat,
							"lng":driver.curlng,
							"status":"ON",
							"image_driver":"",
							"full_name":driver.fname + ' ' + driver.lname,
							"tel": driver.phone,
							"rating":"5"
						});
					});

					Taxi.addToMap(taxi_list, {
						monitoring: true
					});
				} else {
					Taxi.clear();
				}
			}
		});
	},
	cancelFind: function() {
		Map.removeLayer(this.circle);
	},
	clear: function() {
		this.layer.clearLayers();
	}
};


var Http = {
	getJson: function(url, options) {

		if(options.loader !== undefined && !options.loader) { Preloader.show(); }

		$.getJSON( url, function( data ) {
			if(options !== undefined && options.onSuccess !== undefined && typeof options.onSuccess == "function") {
				options.onSuccess(data);
			}
		})
		.fail(function() {
			Notification.defaultError();
		})
		.always(function() {
			Preloader.hide();
		});
	},
	post: function(url, options) {

		if( options.loader || options.loader == undefined ) { Preloader.show(); }

		if( options.data == undefined ) { options.data = {}; }

		$.post( url, options.data, function( data ) {
			if(options !== undefined && options.onSuccess !== undefined && typeof options.onSuccess == "function") {
				options.onSuccess(data);
			}
		})
		.fail(function() {
			Notification.defaultError();
		})
		.always(function() {
			Preloader.hide();
		});
	}
};


var Form = {
	createTaskForm: {
		form: $("#createTaskForm"),
		initial: function() {},
		onSubmit: function() {},
	},
	createCallcenterTaskForm: {
		form: $("#createCallcenterTaskForm"),
		initSubmit: function() {
			this.form.on('submit', function(event) {
				event.preventDefault();

				var count = 0;

				$(this).find('input[type=text]').each(function() {
					$(this).val() == "" && count++;
				});

				if(count == 0) {

					var data = {};

					data.phone = Form.createCallcenterTaskForm.form.find("#passTel").val();

					if( $.isEmptyObject(Form.createCallcenterTaskForm.form.find("#fromPos").data()) ) {
						data.curaddr = Form.createCallcenterTaskForm.form.find("#fromPos").val();
					} else {
						data.curaddr = Form.createCallcenterTaskForm.form.find("#fromPos").data().Name;
						data.curlat = Form.createCallcenterTaskForm.form.find("#fromPos").data().Lat;
						data.curlng = Form.createCallcenterTaskForm.form.find("#fromPos").data().Long;
					}

					if( $.isEmptyObject(Form.createCallcenterTaskForm.form.find("#toPos").data()) ) {
						data.destination = Form.createCallcenterTaskForm.form.find("#toPos").val();
					} else {
						data.destination = Form.createCallcenterTaskForm.form.find("#toPos").data().Name;
						data.deslat = Form.createCallcenterTaskForm.form.find("#toPos").data().Lat;
						data.deslng = Form.createCallcenterTaskForm.form.find("#toPos").data().Long;
					}

					data.detail = Form.createCallcenterTaskForm.form.find("#detail").val();

					Http.post('service/ubeam/addjoblist', {
						data,
						onSuccess: function(response) {
							if(response.status) {
								DataTable.initiateTaskTable.update();
								Form.createCallcenterTaskForm.clearFormData();
							} else {
								Notification.defaultError();
							}

							Form.createCallcenterTaskForm.form.find("#passTel").focus();
						}
					});
				}
			});
	},
	searchPOIInit: function() {
		var options = {
			type: 'POST',
			paramName: 'Name',
			params: { 'Language': 'TH' },
			serviceUrl: 'https://locator.ecartmap.com/locator/poi',
			preventBadQueries: true,
			transformResult: function(response, originalQuery) {

				var response = JSON.parse(response);
				return {
					suggestions: $.map(response, function (dataItem) {
						return { value: dataItem.Name, data: dataItem };
					})
				};
			},
			formatResult: function (suggestion, currentValue) {

				var HTML = '<div class="presentation">';
				HTML += '<div class="icon"><i class="fa fa-map-marker"></i></div>';
				HTML += '<div class="detail">';
				HTML += '<div class="name">' + suggestion.data.Name + '</div>';
				HTML += '<div class="sub-district inline">' + suggestion.data.SubdistrictName + '</div>';
				HTML += '<div class="district inline">' + suggestion.data.DistrictName + '</div>';
				HTML += '<div class="province inline">' + suggestion.data.ProvinceName + '</div>';
				HTML += '</div>';
				HTML += '</div>';


				return 	HTML;
			},
			onSearchStart: function (query) {
				$(this).removeData();
			},
			onSearchError: function (query, jqXHR, textStatus, errorThrown) {
				return false;
			},
			onSelect: function (suggestion) {
				$(this).data(suggestion.data);
			}
		};

		Form.createCallcenterTaskForm.form.find('#fromPos').autocomplete(options);
		Form.createCallcenterTaskForm.form.find('#toPos').autocomplete(options);
	},
	searchPassengerPhoneInit: function() {
		var options = {
			type: 'POST',
			paramName: 'phone',
			serviceUrl: 'service/ubeam/getpsgsphonelist',
			transformResult: function(response, originalQuery) {

				var response = JSON.parse(response);
				if( response.status ) {
					return {
						suggestions: $.map(response.data, function (dataItem) {
							return { value: dataItem.phone, data: dataItem, ID: dataItem._id };
						})
					};
				} else {
					return {
						suggestions: {}
					};
				}
			},
			formatResult: function (suggestion, currentValue) {
				return suggestion.value;
			},
			onSearchStart: function (query) {
				$(this).removeData();
			},
			onSearchError: function (query, jqXHR, textStatus, errorThrown) {
				return false;
			},
			onSelect: function (suggestion) {
				$(this).data(suggestion.data);
			}
		};

		Form.createCallcenterTaskForm.form.find('#passTel').autocomplete(options);
	},
	clearFormData: function() {
		Form.createCallcenterTaskForm.form.find('input[type=text]').val("");
		Form.createCallcenterTaskForm.form.find('textarea').val("");
	}
	},
	assignTaskForm: {
		form: $("#assignTaskForm"),
		initSubmit: function() {
			this.form.on('submit', function(event) {

				event.preventDefault();

				var carplate = Form.assignTaskForm.form.find('#carNumber').val();
				var passenger_id = Modal.assignTaskModal.modal.attr('data-passenger-ref');
				var driver_id = Form.assignTaskForm.form.find('#carNumber').attr('data-driver-ref');

				var count = 0;

				$(this).find('input[type=text]').each(function() {
					$(this).val() == "" && count++;
				});

				if(count == 0 && passenger_id != undefined) {

					Form.assignTaskForm.form.find('input, button').attr('disabled', 'disabled');

					var addJob = function(response) {

						if(!response.status || response.data.drv.status == "ON") {

							Http.post('service/ubeam/assigndrvtopsg', {
								data: {
									"psg_id": Modal.assignTaskModal.modal.attr('data-passenger-ref'),
									"drv_id": Form.assignTaskForm.form.find('#carNumber').attr('data-driver-ref')
								},
								onSuccess: function(response) {

									if(response.status) {

										DataTable.taskTable.update();
										DataTable.assignedTaskTable.update();
										Form.assignTaskForm.clearFormData();

										setTimeout(function() {
											Modal.assignTaskModal.modal.modal('hide');
										}, 1500);

									} else {
										Notification.defaultError();
									}
								}
							});
						}
					};

					var data = {
						"carplate": carplate
					};

					if(driver_id != undefined) { data.drv_id = driver_id; }
						Taxi.checkStatus(data, addJob);
					}
				});
	},
	autocompleteInit: function() {
		var options = {
			type: 'POST',
			paramName: 'keyword',
			serviceUrl: 'service/ubeam/searchnamecar',
			transformResult: function(response, originalQuery) {

				var response = JSON.parse(response);
				if( response.status ) {
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
			onSearchStart: function(query) {
				Form.assignTaskForm.form.find('#carNumber').removeAttr('data-driver-ref');
			},
			onSelect: function (suggestion) {
				Form.assignTaskForm.form.find('#carNumber').attr('data-driver-ref', suggestion.data._id);
			}
		};

		Form.assignTaskForm.form.find('#carNumber').autocomplete(options);
	},
	clearFormData: function() {
		Modal.assignTaskModal.modal.find('p.value').text("");
		Form.assignTaskForm.form.find('input[type=text]').val("");
	}
	}
};


var Modal = {
	assignTaskModal: {
		initial: function() {
			this.onModalClose();
		},
		modal: $('#assignTaskModal'),
		open: function(id, event) {

			event.stopPropagation();

			Modal.assignTaskModal.modal.attr('data-passenger-ref', id);

			var selected_row = DataTable.taskTable.table.find("tr[data-ref=" + id + "]");
			var task = {
				curaddr: selected_row.find("td").eq(1).text(),
				destination: selected_row.find("td").eq(2).text(),
				phone: selected_row.find("td").eq(3).text()
			}

			Modal.assignTaskModal.modal.find('p.from.value').text(task.curaddr);
			Modal.assignTaskModal.modal.find('p.to.value').text(task.destination);
			Modal.assignTaskModal.modal.find('p.passTel.value').text(task.phone);

			Modal.assignTaskModal.modal.modal("show");
		},
		onModalClose: function() {
			Modal.assignTaskModal.modal.on('hidden.bs.modal', function () {
				Taxi.cancelFind();
				Form.assignTaskForm.form.find('input, button').removeAttr('disabled');
			});
		}
	},
	createTaskModal: {
		initial: function() {
			Modal.createTaskModal.modal.on('shown.bs.modal', function(e) {
				document.getElementById("pass-phone-inp").focus();
			});
		},
		modal: $('#createTaskModal'),
		open: function(event) {
			event.stopPropagation();
			Modal.createTaskModal.modal.modal("show");
		}
	}
};


var Notification = {
	show: function (message) {
		options = {
			title: message.title,
			text: message.text,
			sticky: message.sticky ? message.sticky : false,
			time: '',
			class_name: 'gritter-' + (!message.$class ? 'warning' : message.$class),
			position: message.position ? message.position : 'bottom-center'
		};

		$.gritter.add(options);
	},
	defaultSuccess: function (title, text) {
		$.gritter.add({
			title: !title ? 'Success!' : title,
			text: !text ? 'คำสั่ง ทำงานเรียบร้อย' : text,
			sticky: false,
			time: '',
			class_name: 'gritter-success',
			position: 'bottom-right'
		});
	},
	defaultError: function (title, text) {
		$.gritter.add({
			title: !title ? 'Server Error!' : title,
			text: !text ? 'Pls. refresh page and then try it again.' : text,
			sticky: false,
			time: '',
			class_name: 'gritter-danger',
			position: 'bottom-right'
		});
	},
	removeAll: function () {
		$.gritter.removeAll({
			before_close: function (e) {
			},
			after_close: function () {
			}
		});
	}
};


var DataTable = {
	taskTable: {
		table: $("#taskTable"),
		update: function() {
			// Get Initiate List
			Http.post("service/ubeam/getsendjoblist", {
				onSuccess: function(response) {
					if(response.status) {
						DataTable.taskTable.create(response.data);
					} else {						
						DataTable.taskTable.table.find("tbody").empty();
					}
				}
			});
		},
		create: function(tasks) {

			if( tasks == undefined ) {
				return false;
			}

			DataTable.taskTable.table.find("tbody").empty();

			var passenger = tasks;

			$(passenger).each(function(index, passenger) {

				var row_status = "";
				if(passenger.status.toLocaleLowerCase() == "timeout") { row_status = "data-status=\"time-out\""; }

				var row = '<tr data-ref="' + passenger._id + '" ' + row_status + ' onclick="DataTable.taskTable.onRowClick(this)">';
				row += '<th scope="row">' + (index + 1) + '</th>'; 
				row += '<td>' + Util.getCurrentTime(passenger.createdjob.toLocaleUpperCase()) + '</td>'; 
				row += '<td>' + passenger.curaddr + '</td>'; 
				row += '<td>' + passenger.destination + '</td>'; 
				row += '<td>' + passenger.phone + '</td>';
				row += '<td>';
				row += '<div class="dropdown">';
				row += '<button class="btn btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">คำสั่ง <span class="caret"></span></button>';
				row += '<ul class="dropdown-menu">';
				row += '<li><a href="#" data-toggle="modal" onclick="Modal.assignTaskModal.open(\'' + passenger._id + '\', event);" data-target="#assignTaskModal"><i class="fa fa-car"></i> จ่ายงาน</a></li>';
				row += '<li><a href="#" onclick="Passenger.cancelJob(\'' + passenger._id + '\');"><i class="fa fa-trash-o"></i> ยกเลิก</a></li>';
				row += '</ul>';
				row += '</div></td>';
				row += '</tr>';
				DataTable.taskTable.table.find("tbody").append(row);

				passenger.curloc.reverse();
				DataTable.taskTable.table.find('[data-ref="'+passenger._id+'"]').data(passenger);
				DataTable.taskTable.table.find('.dropdown-menu').on('click', 'li', function(event) { event.stopPropagation(); });
			});
	},
	onRowClick: function(tr) {

		DataTable.taskTable.table.find("tr.active").removeClass("active");
		$(tr).addClass('active');
		Taxi.findNearestPassenger($(tr).data().curloc, $(tr).data());
	}
	},
	initiateTaskTable: {
		table: $("#callcenterTaskTable"),
		update: function() {
				// Get Initiate List
				Http.post("service/ubeam/getinitiatelist", {
					onSuccess: function(response) {
						if(response.status) {
							DataTable.initiateTaskTable.create(response.data);
						}
					}
				});
			},
			create: function(initiate_task) {

				if( initiate_task == undefined ) {
					return false;
				}

				DataTable.initiateTaskTable.table.find("tbody").empty();

				$(initiate_task).each(function(index, task) {
					var row = '<tr data-ref="' + task._id + '">';
					row += '<th scope="row">' + (index + 1) + '</th>'; 
					row += '<td>' + Util.getCurrentTime(task.createdjob.toLocaleUpperCase()) + '</td>'; 
					row += '<td>' + task.curaddr + '</td>'; 
					row += '<td>' + task.destination + '</td>'; 
					row += '<td>' + task.phone + '</td>';
					row += '</tr>';
					DataTable.initiateTaskTable.table.find("tbody").append(row);
				});
			}
		},
		assignedTaskTable: {
			table: $("#assignedTaskTable"),
			update: function() {
				// Get Initiate List
				Http.post("service/ubeam/getassignlist", {
					onSuccess: function(response) {
						if(response.status) {
							DataTable.assignedTaskTable.create(response.data);
						} else {
							DataTable.assignedTaskTable.table.find("tbody").empty();
						}
					}
				});
			},
			create: function(assigned_tasks) {

				if( assigned_tasks == undefined ) {
					return false;
				}

				DataTable.assignedTaskTable.table.find("tbody").empty();

				$(assigned_tasks).each(function(index, task) {

					var row_status = "";
					if(task.status.toLocaleLowerCase() == "timeout") { row_status = "data-status=\"time-out\""; }

					var row = '<tr data-ref="' + task._id + '" ' + row_status + '>';
					row += '<th scope="row">' + (index + 1) + '</th>'; 
					row += '<td>' + Util.getCurrentTime(task.updated.toLocaleUpperCase()) + '</td>'; 
					row += '<td>' + task.curaddr + '</td>'; 
					row += '<td>' + task.destination + '</td>'; 
					row += '<td>' + task.phone + '</td>';
					row += '<td><button tabindex="0" class="btn btn-danger" role="button" data-toggle="popover" ';
					row += 'data-trigger="focus" title="ต้องการยกเลิกใช่มั้ย?" data-placement="left" ';
					row += 'data-content="<button class=\'btn btn-default btn-block\' data-passenger-ref=\'' + task._id + '\' onclick=\'DataTable.assignedTaskTable.restore(this);\'>ยืนยัน</button>">';
					row += '<i class="fa fa-angle-double-up"></i></button></td>';
					row += '</tr>';
					DataTable.assignedTaskTable.table.find("tbody").append(row);
				});

	Bootstrap.Popover.initial();
	},
	restore: function(id) {

		if( typeof id == 'object' ) { id = $(id).attr('data-passenger-ref'); }

		Http.post("service/ubeam/cancelpsgdrv", {
			data: {
				"psg_id": id
			},
			onSuccess: function(response) {
				if(response.status) {
					DataTable.taskTable.update();
					DataTable.assignedTaskTable.update();
				}
			}
		});
	}
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
    }
};


(function() {

	App.init();


	setTimeout(function() {
		//Create Map.
		App.createMap();
		//set current position
		App.setCurrentPosition();
	}, 1000);



	setTimeout(function() {
		DataTable.initiateTaskTable.update();
		setTimeout(App.toggleSidebar, 2000);
	}, 1000);



	// assets/javascripts/data.json
	// Http.getJson("assets/javascripts/data.json", {
	// 	onSuccess: function(data) {

	// 		LOCAL_DATA = data;

	// 		setTimeout(function(){
	// 			Taxi.addToMap(LOCAL_DATA.taxi);
	// 		}, 4000);
	// 	}
	// });
})();