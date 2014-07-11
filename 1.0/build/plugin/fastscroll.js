/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @plugin fastscroll 加速滚动
 **/
;
KISSY.add("gallery/xlist/1.0/plugin/fastscroll",function(S, Base, Node) {
	var $ = S.all;
	//最小的滑动速度
	var MIN_DRAG_VELOCITY = 1;
	//最小间隔时间  超出则不计算
	var MAX_DURAITON = 500;
	//定义多少次滑动后进行速度叠加
	var DRAG_TIMES = 4;

	var MAX_SPEED = 15;

	var FastScroll = Base.extend({
		initializer: function() {
			var self = this;
			var xlist = self.userConfig.xlist;
			self.dragRecords = [];
			//统计同方向快速滑动次数
			self.times = 0;
			xlist.on("dragEnd",function(e){
				if(Math.abs(e.velocityY) > MIN_DRAG_VELOCITY){
					self.dragRecords.push({
						velocityY:e.velocityY,
						timeStamp:e.timeStamp
					});
					self.times ++;
				}else{
					self.reset();
				}
				if(self.times >= DRAG_TIMES){
					// console.log("times:",self.times,"加速","velocityY:",e.velocityY,"newVelocity:",Math.abs(e.velocityY)/e.velocityY * MAX_SPEED)
					xlist.dragEndHandler({
						velocityY:Math.abs(e.velocityY)/e.velocityY * MAX_SPEED
					},true);
				}
				self.set("direction",xlist.direction)
			})

			xlist.on("scrollEnd",function(e){
				if(!xlist.isScrolling){
					self.reset();
				}
			})

			xlist.on("dragStart",function(e){
				if(xlist.isScrolling){
					if(self.dragRecords.length){
						//前一次时间
						var preTime = self.dragRecords.pop()['timeStamp'];
						if(e.timeStamp - preTime > MAX_DURAITON){
							self.reset();
						}
					}
				}else{
					//清空数据
					self.dragRecords = [];
				}
			})
			self.on("afterDirectionChange",function(){
				self.reset();
			})
		},
		//清空数据
		reset:function(){
			var self = this;
			self.dragRecords = [];
			self.times = 0;
		},
		judger:function(){
			var self =this;
			if(self.dragRecords.length){

			}
		}
	}, {
		ATTRS: {

		}
	})
	return FastScroll;

}, {
	requires: ['base', 'node']
});