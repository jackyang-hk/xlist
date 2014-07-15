/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @module xlist
 **/
KISSY.add("gallery/xlist/1.0/index",function(S, N, E, Base, Template, Drag) {
    var $ = S.all;
    var clsPrefix,
        containerClsName,
        containerClsReg;
    //event names
    var SCROLL_END = "scrollEnd";
    var SCROLL = "scroll";
    var DRAG_END = "dragEnd";
    var DRAG_START = "dragStart";
    var DRAG = "drag";
    var AFTER_RENDER = "afterRender";
    var SYNC = "sync";
    //constant acceleration for scrolling
    var SROLL_ACCELERATION = 0.002;

    //boundry checked bounce effect
    var BOUNDRY_CHECK_DURATION = 0.4;
    var BOUNDRY_CHECK_EASING = "ease-in-out";
    var BOUNDRY_CHECK_ACCELERATION = 0.1;

    /*
        vendors
        @example webkit|moz|ms|O 
    */
    var vendor = (function() {
        var el = document.createElement('div').style;
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;
        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in el) return vendors[i].substr(0, vendors[i].length - 1);
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
    function prefixStyle(style) {
        if (vendor === false) return false;
        if (vendor === '') return style;
        return vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    function quadratic2cubicBezier(a, b) {
        return [
            [(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
            [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]
        ];
    }
    /**
        * constructor for XList
        * @param renderTo {String|KISSY.Node} root element
        * @param data {Array} data for initial
        * @param autoRender {Boolean} choose if render automatically
        * @param itemHeight {Number} height for each row
        * @param translate3D {Boolean} choose if use 3D translate to animate
        * @param clsPrefix {String} prefix for className
        * @param stickies {Object} sticky element with three types : 
            1.normal item 
            2.sticky with no dom-recycling 
            3.sticky with dom-recycling
        * @param SROLL_ACCELERATION {Float} acceleration for scrolling
        **/
    var XList = Base.extend({
        initializer: function() {
            var self = this;
            var userConfig = self.userConfig = S.mix({
                data: [],
                translate3D: false,
                autoRender: true,
                itemHeight: 30,
                useTransition: true
            }, self.userConfig, undefined, undefined, true);
            self.$renderTo = $(userConfig.renderTo).css({
                overflowY: "hidden"
            });
            window.xlist = self;

            clsPrefix = userConfig.clsPrefix || "ks-xlist-";

            self.SROLL_ACCELERATION = userConfig.SROLL_ACCELERATION || SROLL_ACCELERATION;

            containerClsName = clsPrefix + "container";

            containerClsReg = new RegExp(containerClsName);

            var height = self.height = userConfig.height || self.$renderTo.height();

            self.visibleIndex = {};

            self.__stickiesRecord = {};

            self.__boundryCheckEnabled = true;

            self.initItemPool();

            userConfig.autoRender && self.render();

        },
        //translate a element vertically
        translateY: function(el, y) {
            var self = this;
            el.style[transform] = "translate(0," + y + "px) translateZ(0)";
            return;
        },
        //remove data
        removeData: function() {
            var self = this;
            self.userConfig.data = [];
        },
        //append new data
        setData: function(data) {
            var self = this;
            for (var i = 0, len = data.length; i < len; i++) {
                self.userConfig.data.push(data[i]);
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
            var height = self.height;
            var userConfig = self.userConfig;
            var itemHeight = self.userConfig.itemHeight;
            var maxBufferedNum = userConfig.maxBufferedNum || Math.ceil(self.height / itemHeight);
            maxBufferedNum = 0;
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
        /**
         * get container offsetTop
         * @return offsetTop{Number}
         **/
        getOffsetTop: function() {
            var self = this;
            if (self.$ctn && self.$ctn[0]) {
                return Number(window.getComputedStyle(self.$ctn[0])[transform].match(/[-\d]+/g)[5])
            } else {
                return 0;
            }
        },
        getVisibleItems: function() {
            var self = this;
            var tmp = {};
            for (var i in self.visibleIndex) {
                tmp[i] = self.domInfo[i];
            }
            return tmp;
        },
        //clear doms
        clear: function() {
            var self = this;
            for (var i in self.__renderDomRecord) {
                self.__renderDomRecord[i].remove()
            }
            self.visibleIndex = {}
            self.__stickiesRecord = {}
        },
        /**
         * judge object has key
         * @example hasKey({a:1},"a") => true
         * @return {Boolean}
         **/
        hasKey: function(obj, key) {
            for (var i in obj) {
                if (i == key) return true;
            }
            return false;
        },
        /**
         * async update data and render doms inside of view
         **/
        update: function() {
            var self = this;
            clearInterval(self.updateItv)
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
                    item = itemPool.getItem(itemList[i], i);
                    item.element.style.position = "absolute";
                    item.element.style.height = itemList[i]['height'] + "px";
                    self.translateY(item.element, itemList[i]['top']);
                    self.visibleIndex[i] = item;
                    self.update();
                    break;
                }
            }
            for (var i in self.visibleIndex) {
                if (!self.hasKey(itemList, i)) {
                    itemPool.returnItem(self.visibleIndex[i], i);
                    delete self.visibleIndex[i];
                }
            }
            if (self.isScrolling) {
                self.updateItv = setTimeout(function() {
                    self.update();
                    self.fire(SCROLL, {
                        offsetTop: -offset
                    })
                }, 0);
            }
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
                    var item;
                    if (visibleItem) {
                        item = visibleItem;
                        if (S.isFunction(userConfig.renderHook)) {
                            item.element.innerHTML = userConfig.renderHook({
                                item: item,
                                data: itemObj['data'],
                                row: Number(row)
                            }).innerHTML;
                        } else {
                            item.element.innerHTML = $(Template(itemObj && itemObj.template).render(itemObj.data)).html()
                        }
                    } else if (this.items.length) {
                        
                        item = this.items.pop();
                        if (S.isFunction(userConfig.renderHook)) {
                            item.element.innerHTML = userConfig.renderHook({
                                item: item,
                                data: itemObj['data'],
                                row: Number(row)
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
                                data: itemObj.data,
                                row: Number(row)
                            });
                        } else {
                            item.element = $(Template(itemObj.template).render(itemObj.data))[0]
                        }
                        self.__renderDomRecord[itemObj.row] = $(item.element).appendTo(self.$ctn);
                    }
                    item.element.style.display = "block";
                    this.visibleItems[row] = item;
                    return item;
                },
                returnItem: function(item, row) {
                    delete this.visibleItems[row];
                    item.element.style.display = "none";
                    this.items.push(item);
                }
            }
        },
        /**
         * enable the switch for boundry back bounce
         **/
        enableBoundryCheck: function() {
            var self = this;
            self.__boundryCheckEnabled = true;
            self._boundryCheck();
        },
        /**
         * disable the switch for boundry back bounce
         **/
        disableBoundryCheck: function() {
            var self = this;
            self.__boundryCheckEnabled = false;
        },
        /**
         * scroll the root element with an animate
         * @param offset {Number} scrollTop
         * @param duration {Number} duration for animte
         * @param easing {Number} easing functio for animate : ease-in | ease-in-out | ease | bezier
         **/
        scrollTo: function(offset, duration, easing) {
            var self = this;
            var duration = duration || 20;
            if (self.getOffsetTop() == (-offset).toFixed(0)) {
                return;
            }
            if (duration > 1) {
                duration = duration / 1000;
            }
            var container = self.$ctn[0];
            self.translateY(container, (-offset).toFixed(0));
            var transitionStr = "";
            if (self.userConfig.useTransition) {
                transitionStr = ["-", vendor, "-transform ", duration, "s ", easing, " 0s"].join("");
                container.style[transition] = transitionStr;
            }
            self.isScrolling = true;
            self.update();
            self.fire("scrollTo", {
                transition: transitionStr,
                offsetTop: offset,
                duration: duration,
                easing: easing
            })
        },
        /**
         * scroll relative
         * @param offset {Number} scrollTop
         * @param duration {Number} duration for animte
         * @param easing {Number} easing functio for animate : ease-in | ease-in-out | ease | bezier
         **/
        scrollBy: function(offset, duration, easing) {
            var self = this;
            var offsetTop = self.getOffsetTop();
            self.scrollTo(Number(offsetTop) + Number(offset), duration, easing);
        },
        //boundry back bounce
        _boundryCheck: function() {
            var self = this;
            if (!self.__boundryCheckEnabled) return;
            var pos = self.getOffsetTop();
            var height = self.height;
            if (pos > 0) {
                self.scrollTo(0, BOUNDRY_CHECK_DURATION, BOUNDRY_CHECK_EASING);
            }
            if (pos < height - self.containerHeight) {
                self.scrollTo(self.containerHeight - height, BOUNDRY_CHECK_DURATION, BOUNDRY_CHECK_EASING);
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
            self.translateY(container, 0);
            self.$ctn = $(container);
            self.__isContainerCreated = true;
            self.fire(AFTER_RENDER);
        },
        //update height & render
        sync: function() {
            this.render();
        },
        isInSideOfBoundry: function() {
            var self = this;
            var pos = self.getOffsetTop();
            var height = self.height;
            return pos <= 0 && pos >= height - self.containerHeight
        },
        //judge inside of viewport
        isVisible: function(top) {
            var self = this;
            var _top = top + self.getOffsetTop();
            return (_top >= 0 && _top <= self.height) ? true : false;
        },
        /*
        TODO render
        @param force {boolean} rerender visible dom forcely
        */
        render: function(force) {
            var self = this;
            self.getDomInfo();
            self._createContainer();
            var userConfig = self.userConfig;
            var height = self.height = userConfig.height || self.$renderTo.height();
            var len = self.domInfo.length;
            var lastItem = self.domInfo[len - 1];
            var $renderTo = self.$renderTo;
            var $ctn = self.$ctn;
            var container = $ctn[0];
            var itemList = self.getItemObj(-self.getOffsetTop(), height, self.domInfo);
            self.containerHeight = (lastItem && lastItem['top']) ? lastItem['top'] + lastItem['height'] : self.height;
            if (self.containerHeight < self.height) {
                self.containerHeight = self.height;
            }
            //render stickies
            for (var i = 0, l = self.domInfo.length; i < l; i++) {
                if (self.domInfo[i]['type'] == 2 && !self.__stickiesRecord[self.domInfo[i]['row']]) {
                    var itemNode = document.createElement("div");
                    itemNode.style.top = 0;
                    itemNode.style.width = "100%";
                    itemNode.style.height = self.domInfo[i]['height'];
                    itemNode.style.position = 'absolute';
                    self.translateY(itemNode, self.domInfo[i]['top']);
                    itemNode.innerHTML = self.domInfo[i]['template'] || "";
                    container.appendChild(itemNode)
                    self.__stickiesRecord[self.domInfo[i]['row']] = itemNode;
                }
            }
            for (var i in self.itemPool.visibleItems) {
                itemList[i] && self.itemPool.getItem(itemList[i], i, self.itemPool.visibleItems[i]);
            }
            $ctn.height(self.containerHeight);
            self._bindEvt();
            self.update();
            self.fire(SYNC)
        },
        //simulateMouseEvent
        simulateMouseEvent: function(event, type) {
            if (event.touches.length > 1) {
                return;
            }
            var touches = event.changedTouches,
                first = touches[0],
                simulatedEvent = document.createEvent('MouseEvent');
            simulatedEvent.initMouseEvent(type, true, true, window, 1,
                first.screenX, first.screenY,
                first.clientX, first.clientY, false,
                false, false, false, 0 /*left*/ , null);
            event.target.dispatchEvent(simulatedEvent);
        },
        dragEndHandler: function(e,isFastScroll) {
            var self = this;
            var userConfig = self.userConfig;
            var v = e.velocityY;
            self.velocityY = v;
            if (Math.abs(v) < 0.5 || !userConfig.useTransition) {
                self.fire(SCROLL_END, {
                    offsetTop: self.getOffsetTop()
                })
                self._boundryCheck();
                self.update();
                return;
            } else {
                var height = self.height;
                var s0 = self.getOffsetTop();
                if(!isFastScroll){
                    var maxSpeed = userConfig.maxSpeed > 0 && userConfig.maxSpeed < 6 ? userConfig.maxSpeed : 3;
                    if (v > maxSpeed) {
                        v = maxSpeed;
                    }
                    if (v < -maxSpeed) {
                        v = -maxSpeed;
                    }
                }
                //judge the direction
                self.direction = e.velocityY < 0 ? "up" : "down";
                if (s0 > 0 || s0 < height - self.containerHeight) {
                    var a = BOUNDRY_CHECK_ACCELERATION * (v / Math.abs(v));
                    var t = v / a;
                    var s0 = self.getOffsetTop();
                    var s = s0 + t * v / 2;
                    self.scrollTo(-s, t, "cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ")");
                    return;
                }
                var a = self.SROLL_ACCELERATION * (v / Math.abs(v));
                var t = v / a;
                var s = s0 + t * v / 2;
                //over top boundry check bounce
                if (s > 0) {
                    var _s = 0 - s0;
                    var _t = (v - Math.sqrt(-2 * a * _s + v * v)) / a;
                    self.scrollTo(0, _t, "cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ")");
                    self._v = v - a * _t;
                    //over bottom boundry check bounce
                } else if (s < height - self.containerHeight) {
                    var _s = (height - self.containerHeight) - s0;
                    var _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
                    self.scrollTo(self.containerHeight - height, _t, "cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ")");
                    self._v = v - a * _t;
                    // normal
                } else {
                    self.scrollTo(-s, t, "cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ")");
                }
                self.isScrolling = true;
                self.update();
            }


        },
        //event bind
        _bindEvt: function() {
            var self = this;
            var startPos = 0;
            var userConfig = self.userConfig;
            var $ctn = self.$ctn;
            var container = $ctn[0];
            var $renderTo = self.$renderTo;
            var height = self.height;

            if (self.__isEvtBind) return;
            self.__isEvtBind = true;

            $renderTo.on("touchstart", function(e) {
                e.preventDefault()
            }).on("tap", function(e) {
                if (!self.isScrolling) {
                    self.simulateMouseEvent(e, "click");
                }
            }).on("tap tapHold", function(e) {
                self.isScrolling = false;
                self.fire(SCROLL_END, {
                    originType: e.type,
                    offsetTop: self.getOffsetTop()
                })
            }).on(Drag.DRAG_START, function(e) {
                if (e.changedTouches.length > 1) return;
                startPos = self.getOffsetTop();
                if (self.isScrolling) {
                    //prevent wrong tap
                    self.fire(SCROLL_END, {
                        offsetTop: startPos
                    });
                }

                self.translateY(container, startPos);
                container.style[transition] = "";
                self.fire(DRAG_START);
            }).on(Drag.DRAG, function(e) {
                e.preventDefault();
                if (e.changedTouches.length > 1) return;
                var pos = Number(startPos) + e.deltaY;
                if (pos > 0) { //overtop 
                    pos = pos / 2;
                }
                if (pos < self.height - self.containerHeight) { //overbottom 
                    pos = pos + (self.height - self.containerHeight - pos) / 2;
                }
                self.translateY(container, pos.toFixed(0));
                container.style[transition] = "";
                self.isScrolling = false;
                self.update();
                self.fire(DRAG);
                self.fire(SCROLL, {
                    offsetTop: Number(pos.toFixed(0))
                })
            }).on(Drag.DRAG_END, function(e) {
                self.dragEndHandler(e)
                self.fire(DRAG_END, {
                    velocityY: e.velocityY
                })
            })



            function transitionEndHandler(e) {
                //stoppropagation inside root element
                if (containerClsReg.test(e.target.className)) {
                    self.isScrolling = false;
                    if (self._v) {
                        self.fire("outOfBoundry")
                        var v = self._v;
                        var a = 0.04 * (v / Math.abs(v));
                        var t = v / a;
                        var s0 = self.getOffsetTop();
                        var s = s0 + t * v / 2;
                        self.scrollTo(-s, t, "cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ")");
                        self._v = 0;
                    } else {
                        self._boundryCheck();
                    }
                    //trigger scrollEnd function after scrolling
                    self.fire(SCROLL_END, {
                        offsetTop: self.getOffsetTop()
                    });
                }
            }

            //callback
            container.addEventListener("transitionend", transitionEndHandler, false);
            container.addEventListener("webkitTransitionEnd", transitionEndHandler, false);
            container.addEventListener("oTransitionEnd", transitionEndHandler, false);
            container.addEventListener("MSTransitionEnd", transitionEndHandler, false);

        }
    }, {
        ATTRS: {

        }
    })

    return XList

}, {
    requires: ["node", "event", "base", "gallery/template/1.0/", "./drag"]
})