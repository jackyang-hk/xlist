;
KISSY.add(function(S, Node, Event, XScroll,Util) {
	var $ = S.all;
	//transform
    var transform = Util.prefixStyle("transform");

	var XList = XScroll.extend({
		initializer: function() {
			var self = this;

			var userConfig = self.userConfig = S.mix({
				data: [],
				autoRender: false,
				itemHeight: 30,
			}, self.userConfig, undefined, undefined, true);

			self.$renderTo.css({
				overflowY: "hidden"
			});

			clsPrefix = userConfig.clsPrefix || "ks-xlist-";

			self.containerClsName = clsPrefix + "container";

			self.contentClsName = clsPrefix + "content";

			self.visibleIndex = {};

			self.__stickiesRecord = {};

			self.initItemPool();

			userConfig.autoRender && self.render();
		},
		/**
		 * init element-pool for recyclely used
		 * @param getItem {Function} get element from pool
		 * @param setItem {Function} recycle element into pool
		 **/
		initItemPool: function() {
			var self = this;
			self.__renderDomRecord = {};
			var userConfig = self.userConfig;
			var itemPool = self.itemPool = {
				items: [],
				visibleItems: {},
				getItem: function(itemObj, row, visibleItem) {
					var item, type;
					if (visibleItem) {
						item = visibleItem;
						item.element.innerHTML = userConfig.renderHook({
								item: item,
								data: itemObj.data,
								row: Number(row)
							}).innerHTML; 
					} else if (this.items.length) {
						item = this.items.pop();
						item.element.innerHTML = userConfig.renderHook({
								item: item,
								data: itemObj.data,
								row: Number(row)
							}).innerHTML; 
					} else {
						item = {
							template: itemObj.template,
							element:userConfig.renderHook({
								item: item,
								data: itemObj.data,
								row: Number(row)
							})
						}
						self.__renderDomRecord[itemObj.row] = $(item.element).appendTo(self.$ctn);
					}
					this.visibleItems[row] = item;
					return item;
				},
				returnItem: function(item, row) {
					delete this.visibleItems[row];
					this.items.push(item);
				}
			}
		},
		/**
		 * get all element posInfo such as top,height,template,html
		 * @return {Array}
		 **/
		getDomInfo: function() {
			var self = this;
			var userConfig = self.userConfig;
			var stickies = userConfig.stickies || {};
			var data = userConfig.data;
			var itemHeight = userConfig.itemHeight;
			var offsetTop = 0;
			var domInfo = [];
			var len = (function() {
				var l = 0;
				for (var i in stickies) {
					l++;
				}
				return data.length + l;
			})()
			var height = 0,
				ignoreUsed = 0;
			for (var i = 0; i < len; i++) {
				var item = {};
				if (i in stickies) {
					ignoreUsed++;
					height = stickies[i]['height'];
					//copy attrs
					for (var j in stickies[i]) {
						if (i != 'type' && i != 'template') {
							item[j] = stickies[i][j];
						}
					}
					item.type = stickies[i]['type'] || 2;
					item.template = stickies[i]['template'] || "";
				} else {
					height = itemHeight;
					item.data = data[i - ignoreUsed];
					item.template = userConfig.template;
					item.type = 1;
				}
				item.row = i;
				item.top = offsetTop;
				item.height = height;
				domInfo.push(item);
				offsetTop += height;
			}
			self.domInfo = domInfo;
			return domInfo;
		},
		/**
		 * get datas in visible area
		 * @return {Object}
		 **/
		getItemObj: function(offsetTop, height, data) {
			var self = this;
			var velocityY = self.velocityY || 0;
			// var height = self.height;
			var userConfig = self.userConfig;
			var itemHeight = self.userConfig.itemHeight;
			var maxBufferedNum = userConfig.maxBufferedNum >= 0 ? userConfig.maxBufferedNum : 0;
			var posTop = offsetTop - maxBufferedNum * itemHeight;
			if (posTop < 0) {
				posTop = 0;
			}
			var tmp = {},
				item;
			for (var i = 0, len = data.length; i < len; i++) {
				item = data[i];
				if (item['top'] >= posTop - itemHeight && item['top'] <= posTop + 2 * maxBufferedNum * itemHeight + height) {
					tmp[item['row']] = item
				}
			}
			return tmp
		},
		/*
        TODO render
        @param force {boolean} rerender visible dom forcely
        */
		render: function(force) {
			var self = this;
			self.callSuper()
			self.getDomInfo();
			var userConfig = self.userConfig;
			var height = self.get("height");
			var len = self.domInfo.length;
			var lastItem = self.domInfo[len - 1];
			var $renderTo = self.$renderTo;
			var $ctn = self.$ctn;
			var container = $ctn[0];
			var itemList = self.getItemObj(-self.getOffsetTop(), height, self.domInfo);
			var containerHeight = (lastItem && lastItem['top']) ? lastItem['top'] + lastItem['height'] : self.height;
			if (containerHeight < self.height) {
				containerHeight = self.height;
			}
			self.set("containerHeight",containerHeight);
			self.$ctn.height(containerHeight);
			//render stickies
			for (var i = 0, l = self.domInfo.length; i < l; i++) {
				if (self.domInfo[i]['type'] == 2 && !self.__stickiesRecord[self.domInfo[i]['row']]) {
					var itemNode = document.createElement("div");
					itemNode.style.top = 0;
					itemNode.style.width = "100%";
					itemNode.style.height = self.domInfo[i]['height'];
					itemNode.style.position = 'absolute';
					itemNode.style[transform] = self.domInfo[i]['top']
					itemNode.innerHTML = self.domInfo[i]['template'] || "";
					container.appendChild(itemNode)
					self.__stickiesRecord[self.domInfo[i]['row']] = itemNode;
				}
			}
			for (var i in self.itemPool.visibleItems) {
				itemList[i] && self.itemPool.getItem(itemList[i], i, self.itemPool.visibleItems[i]);
			}
			self._bindEvt();
			self.scrollTo({x:0,y:0})
		},
		_bindEvt: function() {
			var self = this;
			self.callSuper();
			self.on("scroll", function(e) {
				self.update(e.offset.y);
			})
		},
		update: function(offset) {
			var self = this;
			var userConfig = self.userConfig;
			var container = self.$ctn[0];
			var itemPool = self.itemPool;
			var itemHeight = userConfig.itemHeight;
			var height = self.get("height");
			var offset = offset || self.getOffsetTop();
			var itemList = self.getItemObj(-offset, height, self.domInfo);
			for (var i in itemList) {
				var item = null;
				if (!self.visibleIndex[i] && itemList[i]['type'] != 2) {
					item = itemPool.getItem(itemList[i], i);
					item.element.style.position = "absolute";
					item.element.style.height = itemList[i]['height'] + "px";
					item.element.style[transform] = "translateY("+itemList[i]['top'] + "px)";
					self.visibleIndex[i] = item;
				}
			}
			for (var i in self.visibleIndex) {
				if (!itemList.hasOwnProperty(i)) {
					itemPool.returnItem(self.visibleIndex[i], i);
					delete self.visibleIndex[i];
				}
			}
		}
	});


	return XList;



}, {
	requires: ['node', 'event', 'kg/xscroll/1.1.0/index','kg/xscroll/1.1.0/util']
})