/**
 * @fileoverview 
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @module xlist
 **/
KISSY.add(function(S, N, E, Base, Template, Drag) {
    var $ = S.all;
    var clsPrefix = "ks-xlist-";
    var containerClsName = clsPrefix + "container";
    var containerClsReg = new RegExp(containerClsName);
    function quadratic2cubicBezier(a, b) {
        return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)], [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
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
            el.style.webkitTransform = self.userConfig.translate3D ? "translate3D(0," + y + "px,0)" : "translateY(" + y + "px)";
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
                return Number(window.getComputedStyle(self.$ctn[0]).webkitTransform.match(/[-\d]+/g)[5])
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
            var offset = -self.getOffsetTop(container);
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
                    self.fire("scroll")
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
            //绌�
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
            self.boundryCheck();
        },
        disableBoundryCheck: function() {
            var self = this;
            self.__boundryCheckEnabled = false;
        },
        scrollTo: function(offset, duration) {
            var self = this;
            var duration = duration || 0;
            if (duration > 1) {
                duration = duration / 1000;
            }
            var container = self.$ctn[0];
            self.translateY(container, (-offset).toFixed(0));
            container.style.webkitTransition = "-webkit-transform " + duration + "s ease-in-out 0s";
            self.isScrolling = true;
            self.update();
        },
        boundryCheck: function() {
            var self = this;
            if (!self.__boundryCheckEnabled) return;
            var container = self.$ctn[0];
            var height = self.height;
            var pos = self.getOffsetTop(container);
            if (pos > 0) {
                container.style.webkitTransition = "-webkit-transform 0.4s ease-in-out 0s";
                self.translateY(container, 0);
                self.isScrolling = true;
            }
            if (pos < height - self.containerHeight) {
                container.style.webkitTransition = "-webkit-transform 0.4s ease-in-out 0s";
                self.translateY(container, height - self.containerHeight);
                self.isScrolling = true;
            }
            self.update();
        },
        _createContainer: function() {
            var self = this;
            if (self.__isContainerCreated) return;
            var container;
            var $renderTo = self.$renderTo;
            if ($("." + containerClsName, self.$renderTo)[0]) {
                container = $("." + containerClsName, self.$renderTo)[0];
            } else {
                container = document.createElement("div");
                container.className = containerClsName;
                $renderTo[0].appendChild(container);
            }

            container.style.background = "white";
            container.style.width = "100%";
            container.style.position = "relative";
            container.style['z-index'] = 1;
            self.translateY(container, 0);
            container.style.webkitBackfaceVisibility = "hidden";
            container.style.webkitPerspective = 1000;
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
                self.isScrolling = false;
                screenY = e.changedTouches[0].screenY;
                startPos = self.getOffsetTop(container);
                self.translateY(container, startPos);
                container.style.webkitTransition = "";
                self.fire("panstart");
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
                container.style.webkitTransition = ""
                self.isScrolling = false;
                self.fire("pan", {});
            }).on(Drag.DRAG_END, function(e) {
                dragEndHandler(e)
            })

            function dragEndHandler(e) {
                var v = e.velocityY;
                self.velocityY = v;
                if(Math.abs(v) < 0.5){
                    self.fire("panEnd");
                    self.boundryCheck();
                    return;
                }
                var height = self.height;
                var s0 = self.getOffsetTop(container);
                var maxSpeed = userConfig.maxSpeed > 0 && userConfig.maxSpeed < 6 ? userConfig.maxSpeed : 3;
                if (v > maxSpeed) {
                    v = maxSpeed;
                }
                if (v < -maxSpeed) {
                    v = -maxSpeed;
                }

                self.direction = e.velocityY < 0 ? "up" : "down";

                self.fire("flick", {
                    velocityY: e.velocityY
                })

                if (s0 > 0 || s0 < height - self.containerHeight) {
                    var a = 0.08 * (v / Math.abs(v));
                    var t = v / a;
                    var s0 = self.getOffsetTop(container);
                    var s = s0 + t * v / 2;
                    container.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ") 0s";
                    self.translateY(container, s.toFixed(0));
                    return;
                }

                var a = 0.002 * (v / Math.abs(v));
                var t = v / a;
                var s = s0 + t * v / 2;
                if (s > 0) {
                    var _s = 0 - s0;
                    var _t = (v - Math.sqrt(-2 * a * _s + v * v)) / a;
                    container.style.webkitTransition = "-webkit-transform " + _t.toFixed(0) + "ms cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ") 0s";
                    self.translateY(container, 0);
                    _v = v - a * _t;
                } else if (s < height - self.containerHeight) {
                    var _s = (height - self.containerHeight) - s0;
                    var _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
                    container.style.webkitTransition = "-webkit-transform " + _t.toFixed(0) + "ms cubic-bezier(" + quadratic2cubicBezier(-t, -t + _t) + ") 0s";
                    self.translateY(container, (height - self.containerHeight).toFixed(0));
                    _v = v - a * _t;
                } else {
                    container.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ") 0s";
                    self.translateY(container, s.toFixed(0));
                }
                self.isScrolling = true;
                setTimeout(function(){
                    self.update();
                },10)
                
            }

            function transitionEndHandler(e) {
                if (containerClsReg.test(e.target.className)) {
                    self.fire("scrollEnd");
                    self.isScrolling = false;
                    if (_v) {
                        var v = _v;
                        var a = 0.04 * (v / Math.abs(v));
                        var t = v / a;
                        var s0 = self.getOffsetTop(container);
                        var s = s0 + t * v / 2;
                        container.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier(" + quadratic2cubicBezier(-t, 0) + ") 0s";
                        self.translateY(container, s.toFixed(0));
                        _v = 0;
                    } else {
                        self.boundryCheck();
                    }
                }
            }
            container.addEventListener("webkitTransitionEnd", transitionEndHandler, false);
        }
    })

    return XList

}, {
    requires: ["node", "event", "base", "gallery/template/1.0/", "./drag"]
})



