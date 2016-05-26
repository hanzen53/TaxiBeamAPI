// Export EC to global.
var EC = {};
window.EC = EC;



/* --------------------------------- *
	EC.Popup class
 * --------------------------------- */
EC.Popup = function (argument) {
	this.prefix = "ec-popup";
	this._markerArea = [];

	this.mainContainer = this._createMainContainer();
	this.popupList = this._createPopupList(this.mainContainer);
};

EC.Popup.prototype = {

	addPopup: function (data, style) {
		var self = this,
			prefix = this.prefix + "-list_elem";

		var list = document.createElement('li'),
			header = document.createElement('div'),
			close = document.createElement('a'),
			content = document.createElement('div');

		list.className = prefix;
		header.className = prefix + "-header";
		content.className = prefix + "-content";
		close.className = prefix + "-close_button";

		close.href = "#";
		close.innerHTML = "&times;";
		close.onclick = function () {
			self.popupList.removeChild(list);

			//  remove maker
			map.removeLayer(self._markerArea[data.id])
		}

		header.setAttribute("data-type", "header");
		content.setAttribute("data-type", "content");

		this._setPopupTitle(data.title, header);
		this._setPopupContent(data.content, content, style);
		this._setPopupId(data.id, list);
		this._setPopupOptions(data.id, style, list, header);

		// draggable
		if($) 
			$(list).drags();

		header.appendChild(close);
		list.appendChild(header);
		list.appendChild(content);
		this.popupList.appendChild(list);



	},

	setPopupStyle: function (id, style) {
		if(!id) return;

		var list = this.popupList.children;

		for (var i = 0; i < list.length; i++) {
			if(list[i].id == id) {
				var data = this._findChildListAttribute(list[i]);	

				this._setPopupContent(undefined, data.content, style);
				this._setPopupOptions(style, list[i], data.header);
			}
		}
	},

	setPopupTitle: function (id, textTitle) {
		if(!id) return;

		var list = this.popupList.children;

		for (var i = 0; i < list.length; i++) {
			if(list[i].id == id) {
				var data = this._findChildListAttribute(list[i]);	

				this._setPopupTitle(textTitle, data.header);
			}
		}
	},

	setPopupContent: function (id, textContent) {
		if(!id) return;

		var list = this.popupList.children;

		for (var i = 0; i < list.length; i++) {
			if(list[i].id == id) {
				var data = this._findChildListAttribute(list[i]);

				this._setPopupContent(textContent, data.content, data.header);
			}
		}
	},

	getPopupIdList: function () {
		var arr = [],
			list = this.popupList.children;

		for (var i = 0; i < list.length; i++) {
			if(list[i].id) 
				arr.push(list[i].id);
		}

		return arr;
	},

	hasPopup: function (popupId) {
		if(!popupId) return;

		return this.getPopupIdList().indexOf(popupId) === -1 ? false : true;
	},





	/* private method */
	
	_createMainContainer: function () {
		var div = document.createElement('div');
		div.className = this.prefix + "-container";

		this._addToBody(div);

		return div;
	},

	_createPopupList: function (container) {
		var list = document.createElement('ul');
		list.className = this.prefix + "-list";

		container.appendChild(list);

		return list;
	},

	_addToBody: function (elem) {
		document.body.insertBefore(elem, document.body.childNodes[0]);
	},

	_setPopupTitle: function (title, elem) {
		if(!title) return;
		if(!elem) return;

		elem.innerHTML = title;
	},

	_setPopupContent: function (content, elem, style) {
		if(!elem) return;

		if(content)
			elem.innerHTML = content;

		if(style && style.height) 
			elem.style.height = style.height - 37 + "px";
	},

	_setPopupId: function (id, elem) {
		if(!id) return;
		if(!elem) return;

		elem.id = id;
	},

	_setPopupOptions: function (id,style, box, header) {
		if(!style) return;
		if(!box) return;

		if(style.width) box.style.width = style.width + "px";
		if(style.height) box.style.height = style.height + "px";
//		if(style.textColor) header.style.color = style.textColor;
		if(style.popupColor) {
			header.style.backgroundColor = style.popupColor;
			box.style.borderColor = style.popupColor;
		}
		if(style.focus) {
			if (style.focus==0) {	header.style.color = '#000' ; }
			if (style.focus==1) {	header.style.color = '#047A06' ; }
			if (style.focus==2) {	header.style.color = '#F70415' ; }
			if (style.focus==3) {	header.style.color = '#0751FF' ; }
			if (style.focus==4) {	header.style.color = '#A8721C' ; }
			if (style.focus==5) {	header.style.color = '#9D12ED' ; }
			if (style.focus==6) {	header.style.color = '#FFE138' ; }
			if (style.focus==7) {	header.style.color = '#0D7A16' ; }												
			if (style.focus==8) {	header.style.color = '#E24BEA' ; }			
			if (style.focus==9) {	header.style.color = '#267ECA' ; }

	 		var IconX = L.icon({
			    iconUrl: 'http://dev.gisthailand.com/img_sv/focus_'+style.focus+'.png',		    
			    iconSize:     [50, 50], // size of the icon		    
			    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location		    
			});
     //data.id
			this._markerArea[id] = L.marker( [ style.flatlng[0] , style.flatlng[1] ], {icon: IconX} ).addTo(map);

		}

	},

	_findChildListAttribute: function (list) {
		if(!list) return;

		var header, content, child = list.children;

		for (var j = 0; j < child.length; j++) {
			switch (child[j].getAttribute("data-type")) {
				case "header": header = child[j]; break;
				case "content": content = child[j]; break;
			}
		}

		return { header: header, content: content };
	}

};




/* --------------------------------- *
	drags
 * --------------------------------- */
if($) {
	$.fn.drags = function(opt) {
        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).mousedown(function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().mousemove(function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).mouseup(function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).mouseup(function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });
    }
}