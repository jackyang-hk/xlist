/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @plugin scrollbar XLIST滚动条插件
 **/
;KISSY.add(function(S,Node,Base,Anim){
	var $ = S.all;
	var ScrollBar = Base.extend({
		initializer:function(){
			var self = this;
			self.userConfig = S.merge({
				// containerHeight:0,
				// indicateHeight:0
			},self.userConfig);

			self.xlist = self.userConfig.xlist;
			self.xlist.on("sync",function(){
				self.set("containerHeight",self.xlist.containerHeight)
				self.set("indicateHeight",self.xlist.height);
				self.set("offsetTop",self.xlist.getOffsetTop())
				self.render();
				self._bindEvt();
			})
		},

		render:function(){
			var self = this;
			if(self.__isRender) return;
			self.__isRender = true;
			var xlist = self.xlist;
			var tpl_scrollbar = "<div></div>";
			self.$scrollbar = $(tpl_scrollbar).css({
				width:"6px",
				position:"absolute",
				bottom:"2px",
				top:"2px",
				right:"1px",
				zIndex:999
			}).prependTo(xlist.$renderTo);

			

			var tpl_indicate = '<div></div>';

			self.$indicate = $(tpl_indicate).css({
				"-webkit-box-sizing":"border-box",
				"position":"absolute",
				background:"rgba(0,0,0,0.5)",
				border:"1px solid rgba(255,255,255,0.9)",
				"border-radius":"3px"
			}).prependTo(self.$scrollbar).css({
				width:"100%",
			});

			self._update();

			
		},
		_update:function(){
			var self = this;
			self.ratio = self.$scrollbar.height()/self.get("containerHeight");
			var top = self.get("offsetTop")*self.ratio;
			var h = self.get("indicateHeight")*self.ratio;
			self.$indicate.css({
				transform:"translateY("+top+"px)",
				transition:"",
				height:h+"px"
			});
		},
		_scrollTo:function(y,duration,easing){
			var self = this;
			self.$indicate[0].style.webkitTransform = "translateY("+y+"px)"
			self.$indicate[0].style.webkitTransition = [duration,"s ",easing," 0"].join("");
		},
		_moveTo:function(y){
			var self = this;
			self.$indicate[0].style.webkitTransform = "translateY("+y+"px)"
			self.$indicate[0].style.webkitTransition = "";
		},
		_bindEvt:function(){
			var self = this;
			if(self.__isEvtBind) return;
			self.__isEvtBind = true;

			self.xlist.on("drag",function(e){
				self._moveTo(-self.xlist.getOffsetTop()*self.ratio);
			})
			self.xlist.on("scrollTo",function(e){
				self._scrollTo(e.offsetTop*self.ratio,e.duration,e.easing);
			});

			$(window).on("resize",function(){
				self._update();
			})

			//距离顶部
			self.on("*Change",function(e){
				self._update();
			})

		},
		hide:function(){
			var self = this;
			self.$indicate.hide();
		},
		show:function(){
			var self = this;
			self.$indicate.show();
		}
	},{
		ATTRS:{
			"offsetTop":{
				value:0
			},
			"containerHeight":{
				value:0
			},
			"indicateHeight":{
				value:0
			}

		}
	});

	return ScrollBar;


},{requires:['node','base','anim']})