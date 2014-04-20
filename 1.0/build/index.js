/*
combined files : 

gallery/xlist/1.0/drag
gallery/xlist/1.0/index

*/
/*
	Drag Event for KISSY MINI 
	@author xiaoqi.huxq@alibaba-inc.com
*/
KISSY.add('gallery/xlist/1.0/drag',function(S,Node) {
	var doc = window.document;
	var DRAG_START = 'gestureDragStart',
		DRAG_END = 'gestureDragEnd',
		DRAG = 'gestureDrag',
		MIN_SPEED = 0.35,
		MAX_SPEED = 8;
	var singleTouching = false;
	var $ = S.all;
	var touch, record;

	function touchStartHandler(e) {
		if (e.changedTouches.length > 1) {
			singleTouching = true;
			return;
		}
		record = [];
		touch = {};
		touch.startX = e.changedTouches[0].clientX;
		touch.startY = e.changedTouches[0].clientY;
		touch.deltaX = 0;
		touch.deltaY = 0;
		e.touch = touch;
		record.push({
			deltaX: touch.deltaX,
			deltaY: touch.deltaY,
			timeStamp: e.timeStamp
		});
		//be same to kissy
		e.deltaX = touch.deltaX;
		e.deltaY = touch.deltaY;
		$(e.target).fire(DRAG_START,e);
	}

	function touchMoveHandler(e) {
		if (e.changedTouches.length > 1) return;
		touch.deltaX = e.changedTouches[0].clientX - touch.startX;
		touch.deltaY = e.changedTouches[0].clientY - touch.startY;
		e.touch = touch;
		record.push({
			deltaX: touch.deltaX,
			deltaY: touch.deltaY,
			timeStamp: e.timeStamp
		});

		//be same to kissy
		e.deltaX = touch.deltaX;
		e.deltaY = touch.deltaY;
		$(e.target).fire(DRAG,e);
	}

	function touchEndHandler(e) {
		var flickStartIndex = 0,
			flickStartYIndex = 0,
			flickStartXIndex = 0;
		if (e.changedTouches.length > 1) return;
		touch.deltaX = e.changedTouches[0].clientX - touch.startX;
		touch.deltaY = e.changedTouches[0].clientY - touch.startY;
		//be same to kissy
		e.deltaX = touch.deltaX;
		e.deltaY = touch.deltaY;

		e.touch = touch;
		e.touch.record = record;
		var startX = e.touch.startX;
		var startY = e.touch.startY;
		var len = record.length;
		var startTime = record[0]['timeStamp'];
		if (len < 2) return;
		var duration = record[len - 1]['timeStamp'] - record[0]['timeStamp'];
		for (var i in record) {
			if (i > 0) {
				//速度 标量
				record[i]['velocity'] = distance(record[i]['deltaX'], record[i]['deltaY'], record[i - 1]['deltaX'], record[i - 1]['deltaY']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
				//水平速度 矢量
				record[i]['velocityX'] = (record[i]['deltaX'] - record[i - 1]['deltaX']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
				//垂直速度 矢量
				record[i]['velocityY'] = (record[i]['deltaY'] - record[i - 1]['deltaY']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
			} else {
				record[i]['velocity'] = 0;
				record[i]['velocityX'] = 0;
				record[i]['velocityY'] = 0;
			}
		}
		//第一个速度的矢量方向
		var flagX = record[0]['velocityX'] / Math.abs(record[0]['velocityX']);
		for (var i in record) {
			//计算正负极性
			if (record[i]['velocityX'] / Math.abs(record[i]['velocityX']) != flagX) {
				flagX = record[i]['velocityX'] / Math.abs(record[i]['velocityX']);
				//如果方向发生变化 则新起点
				flickStartXIndex = i;
			}
		}

		//第一个速度的矢量方向
		var flagY = record[0]['velocityY'] / Math.abs(record[0]['velocityY']);
		for (var i in record) {
			//计算正负极性
			if (record[i]['velocityY'] / Math.abs(record[i]['velocityY']) != flagY) {
				flagY = record[i]['velocityY'] / Math.abs(record[i]['velocityY']);
				//如果方向发生变化 则新起点
				flickStartYIndex = i;
			}
		}

		flickStartIndex = Math.max(flickStartXIndex, flickStartYIndex);
		//起点
		var flickStartRecord = record[flickStartIndex];
		//移除前面没有用的点
		e.touch.record = e.touch.record.splice(flickStartIndex - 1);
		var velocityObj = getAverageSpeed(e.touch.record);
		e.velocityX = Math.abs(velocityObj.velocityX) > MAX_SPEED ? velocityObj.velocityX / Math.abs(velocityObj.velocityX) * MAX_SPEED : velocityObj.velocityX;
		e.velocityY = Math.abs(velocityObj.velocityY) > MAX_SPEED ? velocityObj.velocityY / Math.abs(velocityObj.velocityY) * MAX_SPEED : velocityObj.velocityY;
		e.velocity = Math.sqrt(Math.pow(e.velocityX, 2) + Math.pow(e.velocityY, 2))
		$(e.target).fire(DRAG_END,e);
	}

	function distance(x, y, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
	}

	function getAverageSpeed(record) {
		var velocityY = 0;
		var velocityX = 0;
		var len = record.length;
		for (var i = 0; i < len; i++) {
			velocityY += record[i]['velocityY'];
			velocityX += record[i]['velocityX'];
		}
		velocityY /= len;
		velocityX /= len;
		return {
			velocityY: velocityY,
			velocityX: velocityX
		}
	}

	S.each([DRAG], function(evt) {
		S.Event.Special[evt] = {
			setup: function() {
				$(this).on('touchstart', touchStartHandler);
				$(this).on('touchmove', touchMoveHandler);
				$(this).on('touchend', touchEndHandler);
			},
			teardown: function() {
				$(this).detach('touchstart', touchStartHandler);
				$(this).detach('touchmove', touchMoveHandler);
				$(this).detach('touchend', touchEndHandler);
			}
		}
	});

	//枚举
	return {
		DRAG_START:DRAG_START,
		DRAG:DRAG,
		DRAG_END:DRAG_END
	};

},{requires:['node']});
/**
 * @fileoverview 
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @module xlist
 **/
KISSY.add('gallery/xlist/1.0/index',function(S, N, E, Base, Template, Drag) {
    var $ = S.all;
    var clsPrefix = "ks-xlist-";
    var containerClsName = clsPrefix + "container";
    var containerClsReg = new RegExp(containerClsName);

    var SCROLL_END = "scrollEnd";
    var SCROLL = "scroll";
    var DRAG_END = "dragEnd";
    var DRAG_START = "dragStart";
    var DRAG = "drag";
    var SROLL_ACCELERATION = 0.002;

    //boundry checked bounce effect
    var BOUNDRY_CHECK_DURATION = 0.4;
    var BOUNDRY_CHECK_EASING = "ease-in-out";
    var BOUNDRY_CHECK_ACCELERATION = 0.1;

    /*
        vendors
        @example webkit|moz|ms|O 
    */   
    var vendor =  (function () {
        var el = document.createElement('div').style;
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;
        for ( ; i < l; i++ ) {
            transform = vendors[i] + 'ransform';
            if ( transform in el ) return vendors[i].substr(0, vendors[i].length-1);
        }
        return false;
    })();

    //transform
    var transform = prefixStyle("transform");
    //transition webkitTransition MozTransition OTransition msTtransition
    var transition = prefixStyle("transition"); 
    /**
    *  attrs with vendor
    *  @return { String } 
    **/
    function prefixStyle (style) {
        if ( vendor === false ) return false;
        if ( vendor === '' ) return style;
        return vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }


    function quadratic2cubicBezier(a, b) {
        return [
        [(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)], 
        [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]
        ];
    }
   

    var XList = Base.extend({
        initializer: function() {
            var self = this;
            var userConfig = self.userConfig = S.mix({
                data: [],
                translate3D: false,
                autoRender: true,
                itemHeight: 30
            }, self.userConfig, undefined, undefined, true);
            self.$renderTo = $(userConfig.renderTo).css({
                overflowY: "hidden"
            });
            var height = self.height = userConfig.height || self.$renderTo.height();
            self.visibleIndex = {};
            self.__renderIdRecord = {};
            self.__boundryCheckEnabled = true;
            self.initItemPool();
            userConfig.autoRender && self.render();
        },
        translateY: function(el, y) {
            var self = this;
            el.style[transform] = self.userConfig.translate3D ? "translate3D(0," + y + "px,0)" : "translateY(" + y + "px)";
            return;
        },
        removeData: function() {
            var self = this;
            self.userConfig.data = [];
        },
        setData: function(data) {
            var self = this;
            for (var i = 0, len = data.length; i < len; i++) {
                self.userConfig.data.push(data[i]);
            }
        },
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
        getItemObj: function(offsetTop, height, data) {
            var self = this;
            var velocityY = self.velocityY || 0;
            var height = self.height;
            var userConfig = self.userConfig;
            var itemHeight = self.userConfig.itemHeight;
            var maxBufferedNum = userConfig.maxBufferedNum || Math.ceil(self.height / itemHeight);
            var posTop = offsetTop - maxBufferedNum * itemHeight;
            if (posTop < 0) {
                posTop = 0;
            }
            var tmp = {}, item;
            for (var i = 0,len = data.length;i<len;i++) {
                item = data[i];
                if (item['top'] >= posTop && item['top'] <= posTop + 2 * maxBufferedNum * itemHeight + height) {
                    tmp[i] = item
                }
            }
            return tmp
        },
        getOffsetTop: function() {
            var self = this;
            if (self.$ctn && self.$ctn[0]) {
                return Number(window.getComputedStyle(self.$ctn[0])[transform].match(/[-\d]+/g)[5])
            } else {
                return 0;
            }
        },
        update: function() {
            var self = this;
            var userConfig = self.userConfig;
            var container = self.$ctn[0];
            var itemPool = self.itemPool;
            var itemHeight = userConfig.itemHeight;
            var height = self.height;
            var offset = -self.getOffsetTop();
            var itemList = self.getItemObj(offset, height, self.domInfo);
            for (var i in itemList) {
                var item = null;
                if (!self.visibleIndex[i] && itemList[i]['type'] != 2) {
                    item = itemPool.getItem(itemList[i]);
                    item.element.style.position = "absolute";
                    item.element.style.height = itemList[i]['height'] + "px";
                    self.translateY(item.element, itemList[i]['top']);
                    self.visibleIndex[i] = item;
                }
            }
            for (var i in self.visibleIndex) {
                if (!self.hasKey(itemList, i)) {
                    itemPool.returnItem(self.visibleIndex[i]);
                    delete self.visibleIndex[i];
                }
            }
            if (self.isScrolling) {
                self.updateItv = setTimeout(function() {
                    self.update();
                    self.fire(SCROLL,{
                        offsetTop:-offset
                    })
                }, 0);

            }

        },
        clear: function() {
            var self = this;
            for (var i in self.__renderDomRecord) {
                self.__renderDomRecord[i].remove()
            }
            self.visibleIndex = {}
            self.__renderIdRecord = {}
        },
        hasKey: function(obj, key) {
            for (var i in obj) {
                if (i === key) return true;
            }
            return false;
        },
        initItemPool: function() {
            var self = this;
            self.__renderDomRecord = [];
            var userConfig = self.userConfig;
            var itemPool = self.itemPool = {
                items: [],
                getItem: function(itemObj) {
                    var item;
                    if (this.items.length) {
                        item = this.items.pop();
                        if (S.isFunction(userConfig.renderHook)) {
                            item.element.innerHTML = userConfig.renderHook({
                                item: item,
                                data: itemObj['data']
                            }).innerHTML;
                        } else {
                            item.element.innerHTML = $(Template(itemObj.template).render(itemObj.data)).html()
                        }
                    } else {
                        item = {
                            template: itemObj.template
                        }
                        if (S.isFunction(userConfig.renderHook)) {
                            item.element = userConfig.renderHook({
                                item: item,
                                data: itemObj.data
                            });
                        } else {
                            item.element = $(Template(itemObj.template).render(itemObj.data))[0]
                        }
                        self.__renderDomRecord.push($(item.element).appendTo(self.$ctn))
                    }
                    return item;
                },
                returnItem: function(item) {
                    this.items.push(item);
                }
            }
        },
        enableBoundryCheck: function() {
            var self = this;
            self.__boundryCheckEnabled = true;
            self._boundrycheck();
        },
        disableBoundryCheck: function() {
            var self = this;
            self.__boundryCheckEnabled = false;
        },
        scrollTo: function(offset, duration,easing) {
            var self = this;
            var duration = duration || 0;
            if (duration > 1) {
                duration = duration / 1000;
            }
            var container = self.$ctn[0];
            self.translateY(container, (-offset).toFixed(0));
            container.style[transition] = ["-",vendor,"-transform ",duration,"s ",easing," 0s"].join("");
            self.isScrolling = true;
            self.update();
        },
        _boundryCheck: function() {
            var self = this;
            if (!self.__boundryCheckEnabled) return;
            var pos = self.getOffsetTop();
            var height = self.height;
            if (pos > 0) {
                self.scrollTo(0,BOUNDRY_CHECK_DURATION,BOUNDRY_CHECK_EASING);
            }
            if (pos < height - self.containerHeight) {
                self.scrollTo(self.containerHeight - height,BOUNDRY_CHECK_DURATION,BOUNDRY_CHECK_EASING);
            }
            self.update();
        },
        _createContainer: function() {
            var self = this;
            if (self.__isContainerCreated) return;
            var container;
            var $renderTo = self.$renderTo;
            //support sync rendering
            if ($("." + containerClsName, self.$renderTo)[0]) {
                container = $("." + containerClsName, self.$renderTo)[0];
            } else {
                container = document.createElement("div");
                container.className = containerClsName;
                $renderTo[0].appendChild(container);
            }
            container.style.background = "#fff";
            container.style.width = "100%";
            container.style.position = "relative";
            container.style['z-index'] = 1;
            container.style[prefixStyle("backfaceVisibility")] = "hidden";
            container.style[prefixStyle("perspective")] = 0;
            self.translateY(container, 0);
            self.$ctn = $(container);
            self.__isContainerCreated = true;
        },
        sync: function() {
            var self = this;
            var userConfig = self.userConfig;
            var height = self.height = userConfig.height || self.$renderTo.height();
            self.render();
        },
        render: function() {
            var self = this;
            self.getDomInfo();
            self._createContainer();
            var userConfig = self.userConfig;
            var len = self.domInfo.length;
            var lastItem = self.domInfo[len - 1];
            var $renderTo = self.$renderTo;
            var $ctn = self.$ctn;
            var container = $ctn[0];
            self.containerHeight = (lastItem && lastItem['top']) ? lastItem['top'] + lastItem['height'] : self.height;
            if (self.containerHeight < self.height) {
                self.containerHeight = self.height;
            }
            for (var i = 0, l = self.domInfo.length; i < l; i++) {
                if (self.domInfo[i]['type'] == 2 && !self.__renderIdRecord[self.domInfo[i]['row']]) {
                    var itemNode = document.createElement("div");
                    itemNode.style.top = 0;
                    itemNode.style.width = "100%";
                    itemNode.style.height = self.domInfo[i]['height'];
                    itemNode.style.position = 'absolute';
                    self.translateY(itemNode, self.domInfo[i]['top']);
                    itemNode.innerHTML = self.domInfo[i]['template'] || "";
                    container.appendChild(itemNode)
                    self.__renderIdRecord[self.domInfo[i]['row']] = 1;
                }
            }
            $ctn.height(self.containerHeight);
            self._bindEvt();
            self.update();
        },
        _bindEvt: function() {
            var self = this;
            if (self.__isEvtBind) return;
            self.__isEvtBind = true;
            var startPos;
            var screenY;
            var _v = null;
            var userConfig = self.userConfig;
            var $ctn = self.$ctn;
            var container = $ctn[0];
            var $renderTo = self.$renderTo;
            var height = self.height;

            $renderTo.on(Drag.DRAG_START, function(e) {
                e.preventDefault();
                if (e.changedTouches.length > 1) return;
                startPos = self.getOffsetTop();
                if(self.isScrolling){
                    self.fire(SCROLL_END,{offsetTop:startPos});
                }
                self.isScrolling = false;
                screenY = e.changedTouches[0].screenY;
                self.translateY(container, startPos);
                container.style[transition] = "";
                self.fire(DRAG_START);
            }).on(Drag.DRAG, function(e) {
                e.preventDefault();
                if (e.changedTouches.length > 1) return;
                var pos = startPos / 1 + e.changedTouches[0].screenY / 1 - screenY;
                if (pos > 0) { //overtop 
                    pos = pos / 2;
                }
                if (pos < height - self.containerHeight) { //overbottom 
                    pos = pos + (height - self.containerHeight - pos) / 2;
                }
                self.translateY(container, pos.toFixed(0));
                container.style[transition] = "";
                self.isScrolling = false;
                self.fire(DRAG);
                self.fire(SCROLL,{offsetTop:Number(pos.toFixed(0))})
            }).on(Drag.DRAG_END, function(e) {
                dragEndHandler(e)
            })

            function dragEndHandler(e) {
                var v = e.velocityY;
                self.velocityY = v;
                self.fire(DRAG_END, {
                    velocityY: e.velocityY
                })
                if(Math.abs(v) < 0.5){
                    self.fire(SCROLL_END, {
                        offsetTop:self.getOffsetTop()
                    })
                    self._boundrycheck();
                    return;
                }
                var height = self.height;
                var s0 = self.getOffsetTop();
                var maxSpeed = userConfig.maxSpeed > 0 && userConfig.maxSpeed < 6 ? userConfig.maxSpeed : 3;
                if (v > maxSpeed) {
                    v = maxSpeed;
                }
                if (v < -maxSpeed) {
                    v = -maxSpeed;
                }

                self.direction = e.velocityY < 0 ? "up" : "down";
                
                if (s0 > 0 || s0 < height - self.containerHeight) {
                    var a = BOUNDRY_CHECK_ACCELERATION * (v / Math.abs(v));
                    var t = v / a;
                    var s0 = self.getOffsetTop();
                    var s = s0 + t * v / 2;
                    self.scrollTo(-s,t,"cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ")");
                    return;
                }

                var a = SROLL_ACCELERATION * (v / Math.abs(v));
                var t = v / a;
                var s = s0 + t * v / 2;
                if (s > 0) {
                    var _s = 0 - s0;
                    var _t = (v - Math.sqrt(-2 * a * _s + v * v)) / a;
                    self.scrollTo(0,_t,"cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ")");
                    _v = v - a * _t;
                } else if (s < height - self.containerHeight) {
                    var _s = (height - self.containerHeight) - s0;
                    var _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
                    self.scrollTo(self.containerHeight - height,_t,"cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ")");
                    _v = v - a * _t;
                } else {
                     self.scrollTo(-s,t,"cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ")");
                }
                self.isScrolling = true;
                setTimeout(function(){
                    self.update();
                },10)
                
            }

            function transitionEndHandler(e) {
                if (containerClsReg.test(e.target.className)) {
                    self.isScrolling = false;
                    if (_v) {
                        var v = _v;
                        var a = 0.04 * (v / Math.abs(v));
                        var t = v / a;
                        var s0 = self.getOffsetTop();
                        var s = s0 + t * v / 2;
                        self.scrollTo(-s,t,"cubic-bezier(" + quadratic2cubicBezier(-t, 0)+")");
                        _v = 0;
                    } else {
                        self._boundrycheck();
                    }
                    self.fire(SCROLL_END,{offsetTop:self.getOffsetTop()});
                }
            }

            container.addEventListener("transitionend", transitionEndHandler, false);

            container.addEventListener("webkitTransitionEnd", transitionEndHandler, false);

            container.addEventListener("oTransitionEnd", transitionEndHandler, false);

            container.addEventListener("MSTransitionEnd", transitionEndHandler, false);

        }
    },{
        ATTRS:{

        }
    })

    return XList

}, {
    requires: ["node", "event", "base", "gallery/template/1.0/", "./drag"]
})




