;
KISSY.add(function(S, Node, Event, XScroll, Util,DataSet) {
	var $ = S.all;
	//transform
	var transform = Util.prefixStyle("transform");
	var XList = XScroll.extend({
		initializer: function() {
			var self = this;
			var userConfig = self.userConfig = S.mix({
				data: [],
				itemHeight: 30,
			}, self.userConfig, undefined, undefined, true);
			clsPrefix = userConfig.clsPrefix || "ks-xlist-";
			self.containerClsName = clsPrefix + "container";
			self.contentClsName = clsPrefix + "content";
			self._initInfinite();
			self.callSuper();
		},
		/**
		 * get all element posInfo such as top,height,template,html
		 * @return {Array}
		 **/
		_getDomInfo: function() {
			var self = this;
			var data = self._formatData();
			var itemHeight = self.userConfig.itemHeight;
			var top = 0;
			var domInfo = [];
			var height = 0;
			self.hasSticky = false;
			for (var i = 0, l = data.length; i < l; i++) {
				var item = data[i];
				height = item.style && item.style.height || itemHeight;
				item._row = i;
				item._top = top;
				item._height = height;
				item.recycled = item.recycled === false ? false : true;
				domInfo.push(item);
				top += height;
				if(!self.hasSticky && item.style && item.style.position == "sticky"){
					self.hasSticky = true;
				}
			}
			self.domInfo = domInfo;
			return domInfo;
		},
		appendDataSet:function(ds){
			var self = this;
			if(!ds instanceof DataSet) return;
			self.datasets.push(ds);
		},
		removeDataSet:function(id){
			var self = this;
			if(!id) return;
			for(var i = 0,l = self.datasets.length;i < l;i++){
				if(id == self.datasets[i].getId()){
					self.datasets[i].splice(i,1);
				}
			}
		},
		getDataSets:function(){
			var self = this;
			return self.datasets;
		},
		_formatData:function(){
			var self = this;
			var data = [];
			for(var i in self.datasets){
				data = data.concat(self.datasets[i].getData());
			}
			return data;
		},
		render: function() {
			var self = this;
			self.callSuper()
			self._getDomInfo();
			self._initSticky();
			var height = self.get("height");
			var lastItem = self.domInfo[self.domInfo.length - 1];
			var containerHeight = (lastItem && lastItem._top) ? lastItem._top + lastItem._height : self.height;
			if (containerHeight < height) {
				containerHeight = height;
			}
			self.set("containerHeight", containerHeight);
			//渲染非回收元素
			self._renderNoRecycledEl();
			//强制刷新
			self._update(0,true);
		},
		//废可回收元素渲染
		_renderNoRecycledEl:function(){
			var self = this;
			for(var i in self.domInfo){
				if(self.domInfo[i]['recycled'] === false){
					if(self.domInfo[i].id){
						var el = document.getElementById(self.domInfo[i].id.replace("#",""));
						if(!el){
							el = document.createElement("div");
							el.id = self.domInfo[i].id;
							self.$content.append(el);
						}
						for (var attrName in self.domInfo[i].style) {
							if (attrName != "height" && attrName != "display" && attrName != "position") {
								el.style[attrName] = self.domInfo[i].style[attrName];
							}
						}
						el.style.position = "absolute";
						el.style.top = 0;
						el.style.display = "block";
						el.style.height = self.domInfo[i]._height + "px";
						el.style[transform] = "translateY(" + self.domInfo[i]._top + "px) translateZ(0)";
						if(self.domInfo[i].className){
							el.className = self.domInfo[i].className;
						}
						self.userConfig.renderHook.call(self, el, self.domInfo[i]);
					}
				}
			}
		},
		_initSticky:function(){
			var self = this;
			if(!self.hasSticky || self._isStickyRendered) return;
			self._isStickyRendered = true;
			var sticky = document.createElement("div");
			sticky.style.position = "absolute";
			sticky.style.top = "0";
			sticky.style.display = "none";
			self.$renderTo.prepend(sticky);
			self.stickyElement = sticky;
			self.stickyDomInfo = [];
			for(var i =0,l = self.domInfo.length;i<l;i++){
				if(self.domInfo[i] && self.domInfo[i].style && "sticky" == self.domInfo[i].style.position){
					self.stickyDomInfo.push(self.domInfo[i]);
				}
			}
			self.stickyDomInfoLength = self.stickyDomInfo.length;
			
		},
		_initInfinite: function() {
			var self = this;
			var el = self.userConfig.infiniteElements;
			self.datasets = [];
			if(self.userConfig.data && self.userConfig.data.length){
				self.datasets.push(new DataSet({data:self.userConfig.data}));
			}
			self.infiniteElements = self.$renderTo[0].querySelectorAll(el);
			self.infiniteLength = self.infiniteElements.length;
			self.infiniteElementsCache = (function() {
				var tmp = []
				for (var i = 0; i < self.infiniteLength; i++) {
					tmp.push({});
					self.infiniteElements[i].style.display = "none";
				}
				return tmp;
			})()
			self.elementsPos = {};
			self.on("scroll", function(e) {
				self._update(e.offset.y);
				self._stickyHandler(e.offset.y);
			})
		},
		_stickyHandler:function(offsetTop){
			var self = this;
			if(!self.stickyDomInfoLength) return;
			if(offsetTop > 0) {
				self.stickyElement.style.display = "none";
				return;
			}
			var offsetTop = Math.abs(offsetTop);
			for(var i = 0;i < self.stickyDomInfoLength;i++){
				if(offsetTop >= self.stickyDomInfo[i]._top){
					self.userConfig.renderHook.call(self, self.stickyElement, self.stickyDomInfo[i]);
					self.stickyElement.style.display = "block";
					self.stickyElement.style.height = self.stickyDomInfo[i].style.height + "px";
					self.stickyElement.className = self.stickyDomInfo[i].className || "";
					for (var attrName in self.stickyDomInfo[i].style) {
						if (attrName != "height" && attrName != "display" && attrName != "position") {
							self.stickyElement.style[attrName] = self.stickyDomInfo[i].style[attrName];
						}
					}
				}else{
					if(i != self.stickyDomInfoLength - 1){
						self.stickyElement.style.display = "none";
					}
				}
			}

		},
		_getElementsPos: function(offsetTop) {
			var self = this;
			var offsetTop = -(offsetTop || self.getOffsetTop());
			var data = self.domInfo;
			var itemHeight = self.userConfig.itemHeight;
			var elementsPerPage = Math.ceil(self.get("height") / itemHeight);
			var maxBufferedNum = Math.max(Math.ceil(elementsPerPage / 3), 0);
			var posTop = Math.max(offsetTop - maxBufferedNum * itemHeight, 0);
			var tmp = {},
				item;
			for (var i = 0, len = data.length; i < len; i++) {
				item = data[i];
				if (item._top >= posTop - itemHeight && item._top <= posTop + 2 * maxBufferedNum * itemHeight + self.get("height")) {
					tmp[item._row] = item;
				}
			}
			return tmp
		},
		_getChangedRows: function(newElementsPos,force) {
			var self = this;
			var changedRows = {};
			for (var i in self.elementsPos) {
				if (!newElementsPos.hasOwnProperty(i)) {
					changedRows[i] = "delete";
				}
			}
			for (var i in newElementsPos) {
				if (newElementsPos[i].recycled && (!self.elementsPos.hasOwnProperty(i) || force)) {
					changedRows[i] = "add";
				}
			}
			
			self.elementsPos = newElementsPos;
			return changedRows;
		},
		_update: function(offset,force) {
			var self = this;
			var offset = offset || self.getOffsetTop();
			var elementsPos = self._getElementsPos(offset);
			var changedRows = self._getChangedRows(elementsPos,force);
			var el = null;
			var getElIndex = function() {
				for (var i = 0; i < self.infiniteLength; i++) {
					if (!self.infiniteElementsCache[i]._visible) {
						self.infiniteElementsCache[i]._visible = true;
						return i;
					}
				}
			}
			var setEl = function(row) {
				for (var i = 0; i < self.infiniteLength; i++) {
					if (self.infiniteElementsCache[i]._row == row) {
						self.infiniteElementsCache[i]._visible = false;
						delete self.infiniteElementsCache[i]._row;
					}
				}
			}
			for (var i in changedRows) {
				if (changedRows[i] == "delete") {
					setEl(i);
				}
				if (changedRows[i] == "add") {
					var index = getElIndex(elementsPos[i]._row);
					el = self.infiniteElements[index];
					if (el) {
						self.infiniteElementsCache[index]._row = elementsPos[i]._row;
						for (var attrName in elementsPos[i].style) {
							if (attrName != "height" && attrName != "display" && attrName != "position") {
								el.style[attrName] = elementsPos[i].style[attrName];
							}
						}
						el.style.position = "absolute";
						el.style.top = 0;
						el.style.display = "block";
						el.style.height = elementsPos[i]._height + "px";
						el.style[transform] = "translateY(" + elementsPos[i]._top + "px) translateZ(0)";
						self.userConfig.renderHook.call(self, el, elementsPos[i]);
					}
				}
			}
		}

	}, {
		ATTRS: {
			lockX: {
				value: true
			}
		}
	});

	XList.DataSet = DataSet;

	return XList;
}, {
	requires: ['node', 'event', 'kg/xscroll/1.1.5/index', 'kg/xscroll/1.1.5/util','./dataset']
})