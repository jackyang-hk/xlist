/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @plugin pulldown XLIST下拉刷新插件
 **/
;
KISSY.add("gallery/xlist/1.0/plugin/pulldown",function(S, Base, Node) {
	var $ = S.all;
	var prefix;
	var containerCls;
	var content = "Pull Down To Refresh";
	var loadingContent = "Loading...";

	var PullDown = Base.extend({
		initializer: function() {
			var self = this;
			var xlist = self.userConfig.xlist;
			self.userConfig = S.merge({
				content: content,
				downContent: "",
				upContent: "",
				loadingContent: loadingContent,
				prefix: "ks-xlist-plugin-pulldown-"
			}, self.userConfig);

			prefix = self.userConfig.prefix;
			if (xlist) {
				xlist.on("afterRender", function() {
					self.render()
				})
			}

		},
		render: function() {
			var self = this;
			var containerCls = prefix + "container";
			var tpl = '<div class="' + containerCls + '"></div>';
			var xlist = self.userConfig.xlist;
			var height = self.userConfig.height || 60;
			var $pulldown = self.$pulldown = $(tpl).css({
				position: "absolute",
				width: "100%",
				height: height,
				"top": -height
			}).prependTo(xlist.$ctn);
			self.on("afterStatusChange", function(e) {
				$pulldown.removeClass(prefix + e.prevVal).addClass(prefix + e.newVal);
				self.setContent(self.userConfig[e.newVal + "Content"]);

			})
			$pulldown.addClass(prefix + self.get("status"));
			$pulldown.html(self.userConfig[self.get("status") + "Content"] || self.userConfig["content"]);
			self._bindEvt();
		},
		_bindEvt: function() {
			var self = this;
			if(self._evtBinded) return;
			var height = self.userConfig.height || 60;
			var reloadItv, loadingItv;
			var offsetTop = 0;

			xlist.on("drag", function(e) {
				offsetTop = xlist.getOffsetTop();
				if (offsetTop > 0) {
					if (Math.abs(offsetTop) < height) {
						self.set("status", "down");
					} else {
						self.set("status", "up");
					}
				}
			})


			xlist.on("dragStart", function() {
				clearTimeout(loadingItv);
				clearTimeout(reloadItv);
				self.isBoundryBounce = false;
				xlist.enableBoundryCheck();
			})

			xlist.on("outOfBoundry", function() {
				self.isBoundryBounce = true;
			})

			xlist.on("scrollEnd", function(e) {
				offsetTop = xlist.getOffsetTop();
				//防止tapHold引起的回弹
				if (offsetTop > height && !self.isBoundryBounce && e.originType != 'tapHold') {
					xlist.disableBoundryCheck();
					xlist.scrollTo(-height, 0.4);
					xlist.isScrolling = false;
					self.set("status", "loading");
					loadingItv = setTimeout(function() {
						xlist.enableBoundryCheck();
					}, 500);
					reloadItv = setTimeout(function() {
						location.reload();
					}, 700);
				}
			})

			self._evtBinded = true;
		},
		setContent: function(content) {
			var self = this;
			if (content) {
				self.$pulldown.html(content);
			}
		}
	}, {
		ATTRS: {
			"status": {
				value: "down"
			}

		}
	})

	return PullDown;


}, {
	requires: ['base', 'node']
});