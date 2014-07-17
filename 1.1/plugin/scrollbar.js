/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @plugin scrollbar XLIST滚动条插件
 **/
;
KISSY.add("gallery/xlist/1.1/plugin/scrollbar",function(S, Node, Base, Anim) {
	var $ = S.all;
	//最短滚动条高度
	var MIN_SCROLLBAR_HEIGHT = 60;
	//滚动条被卷去剩下的最小高度
	var BAR_MIN_HEIGHT = 5;
	var ScrollBar = Base.extend({
		initializer: function() {
			var self = this;
			self.userConfig = S.merge({}, self.userConfig);
			self.xlist = self.userConfig.xlist;
			self.xlist.on("sync", function() {
				self.set("containerHeight", self.xlist.containerHeight)
				self.set("indicateHeight", self.xlist.height);
				self.set("offsetTop", self.xlist.getOffsetTop())
				self.render();
				self._bindEvt();
			})
		},

		render: function() {
			var self = this;
			if (self.__isRender) return;
			self.__isRender = true;
			var xlist = self.xlist;
			var tpl_scrollbar = "<div></div>";
			self.$scrollbar = $(tpl_scrollbar).css({
				width: "3px",
				position: "absolute",
				bottom: "2px",
				top: "2px",
				right: "2px",
				zIndex: 999,
				overflow: "hidden",
				"-webkit-border-radius": "2px"
			}).prependTo(xlist.$renderTo);

			var tpl_indicate = '<div></div>';

			self.$indicate = $(tpl_indicate).css({
				"-webkit-box-sizing": "border-box",
				"position": "absolute",
				background: "rgba(0,0,0,0.3)",
				"-webkit-border-radius": "1.5px"
			}).prependTo(self.$scrollbar).css({
				width: "100%",
			});

			self._update();
		},
		_update: function() {
			var self = this;
			var barInfo = self.computeScrollBar(Math.abs(self.get("offsetTop")));
			self._moveTo(barInfo.top);
			self.$indicate.height(barInfo.height);
		},
		//计算边界碰撞时的弹性
		computeScrollBar: function(top) {
			var self = this;
			var top = top || 0;
			//滚动条容器高度
			var indicateHeight = self.get("indicateHeight");
			var containerHeight = self.get("containerHeight");
			var ratio = top / containerHeight;
			var barOffsetTop = indicateHeight * ratio;
			var barHeight = indicateHeight * indicateHeight / containerHeight;
			var _barOffsetTop = barOffsetTop * (indicateHeight - MIN_SCROLLBAR_HEIGHT + barHeight) / indicateHeight
			if (barHeight < MIN_SCROLLBAR_HEIGHT) {
				barHeight = MIN_SCROLLBAR_HEIGHT;
				barOffsetTop = _barOffsetTop;
			}
			//顶部回弹
			if (barOffsetTop < 0) {
				barOffsetTop = Math.abs(top) * barHeight / MIN_SCROLLBAR_HEIGHT > barHeight - BAR_MIN_HEIGHT ? BAR_MIN_HEIGHT - barHeight : top * barHeight / MIN_SCROLLBAR_HEIGHT;
			} else if (barOffsetTop + barHeight > indicateHeight) {
				//底部回弹
				var _top = top - containerHeight + indicateHeight;
				if (_top * barHeight / MIN_SCROLLBAR_HEIGHT > barHeight - BAR_MIN_HEIGHT) {
					barOffsetTop = indicateHeight - BAR_MIN_HEIGHT;
				} else {
					barOffsetTop = indicateHeight - barHeight + _top * barHeight / MIN_SCROLLBAR_HEIGHT;
				}
			}
			self.set("barOffsetTop", barOffsetTop)
			return {
				height: barHeight,
				top: barOffsetTop
			};

		},
		_scrollTo: function(y, duration, easing) {
			var self = this;
			self.show();
			self.$indicate[0].style.webkitTransform = "translateY(" + y + "px)"
			self.$indicate[0].style.webkitTransition = [duration, "s ", easing, " 0"].join("");
		},
		_moveTo: function(y) {
			var self = this;
			self.show();
			self.$indicate[0].style.webkitTransform = "translateY(" + y + "px)"
			self.$indicate[0].style.webkitTransition = "";
		},
		_bindEvt: function() {
			var self = this;
			if (self.__isEvtBind) return;
			self.__isEvtBind = true;

			self.xlist.on("drag", function(e) {
				self._moveTo(self.computeScrollBar(-self.xlist.getOffsetTop())['top']);
			})
			self.xlist.on("scrollTo", function(e) {
				self._scrollTo(self.computeScrollBar(e.offsetTop)['top'], e.duration, e.easing);
			});
			self.xlist.on("dragStart", function(e) {
				self.isBoundryBounce = false;
			})
			self.xlist.on("outOfBoundry", function(e) {
				self.isBoundryBounce = true;
			})
			self.xlist.on("scrollEnd", function(e) {
				if (!self.isBoundryBounce && e.originType != 'tapHold') {
					// self.hide();
					self._moveTo(self.computeScrollBar(-self.xlist.getOffsetTop())['top']);
				}
			})

			$(window).on("resize", function() {
				self._update();
			})

			self.on("afterOffsetTopChange", function(e) {
				self._update();
			})
			self.on("afterIndicateHeightChange", function(e) {
				self._update();
			})
			self.on("afterContainerHeightChange",function(e){
				self._update();
			})

		},
		hide: function() {
			var self = this;
			self.$scrollbar.css({
				opacity: 0
			});
			self.$scrollbar[0].style.webkitTransition = "opacity 0.3s ease-out"
		},
		show: function() {
			var self = this;
			self.$scrollbar.css({
				opacity:1
			});
		}
	}, {
		ATTRS: {
			//页面顶部被卷去的高度
			"offsetTop": {
				value: 0
			},
			//页面整体高度
			"containerHeight": {
				value: 0
			},
			//视窗高度
			"indicateHeight": {
				value: 0
			},
			//滚动条高度
			"barHeight": {
				value: 0
			},
			"barOffsetTop": {
				value: 0
			}
		}
	});

	return ScrollBar;


}, {
	requires: ['node', 'base', 'anim']
})