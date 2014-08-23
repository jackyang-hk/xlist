KISSY.add(function(S,Node,Base){
	var $ = S.all;
	var Console = Base.extend({
        pluginId:"xlist/plugin/console",
		pluginInitializer:function(xlist){
			var self = this;
			var userConfig = self.userConfig;
            var xlist = userConfig.xlist;
            var $console = $("<div></div>").css({
                    "position": "absolute",
                    "top":0,
                    "width": "100%",
                    // "height": "100%",
                    "background": "#000",
                    "opacity":0.5,
                    "right":0,
                    "color":"#fff",
                    "text-align": "center",
                    "font-size":"28px",
                    "line-height":"50px",
                    "z-index": 9999
                }).prependTo(xlist.$renderTo);
                var cache = Object.keys(xlist.__renderDomRecord).length;
                var visibleIndex = Object.keys(xlist.visibleIndex).toString();



                var prev,fps = 0;
                var _prev;
                xlist.on("itemPop",function(){
                     var now = Date.now();
                    itemFps = 1000/(now - _prev);
                    _prev = now;
                })
                var velocity;
                xlist.on("panEnd",function(e){
                    velocity = Math.abs(e.velocityY.toFixed(1));
                })
                
                xlist.on("scroll",function(e){
                    var v = velocity > xlist.userConfig.maxSpeed ?  xlist.userConfig.maxSpeed : velocity;
                    var now = Date.now();

                    fps = 1000/(now - prev);
                    prev = now;
                    var _visibleIndex = Object.keys(xlist.visibleIndex).toString();
                    if(_visibleIndex != visibleIndex){
                         var num = Object.keys(xlist.__renderDomRecord).length;
                          $console.html("Dom Num :"+ num+"<br/> fps:"+ fps.toFixed(1)+"<br/>  PoolFps:"+itemFps.toFixed(1)+"<br/> Height:"+xlist.userConfig.itemHeight+"px<br/>PoolNum:"+xlist.itemPool.items.length+"<br/> Velocity:"+v+"px/ms<br/> 1000/Height*Velocity="+(1000/xlist.userConfig.itemHeight*v).toFixed(1));
                          visibleIndex = _visibleIndex;
                    }
                })
		}
	});
	
	return Console;

},{
	requires:['node','base']
});