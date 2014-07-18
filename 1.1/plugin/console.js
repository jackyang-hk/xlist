KISSY.add("gallery/xlist/1.1/plugin/console",function(S,Node,Base){
	var $ = S.all;
	var Console = Base.extend({
		initializer:function(){
			var self = this;
			var userConfig = self.userConfig;
            var xlist = userConfig.xlist;
            var $console = $("<div></div>").css({
                    "position": "absolute",
                    "top":0,
                    "width": "100%",
                    "height": "75px",
                    "background": "#000",
                    "opacity":0.5,
                    "right":0,
                    "color":"#fff",
                    "text-align": "center",
                    "line-height":"25px",
                    "z-index": 9999
                }).prependTo($("body"));
                var cache = Object.keys(xlist.__renderDomRecord).length;
                var visibleIndex = Object.keys(xlist.visibleIndex).toString();
                $console.html("当前dom数 :"+ cache+"<br/> rows:"+visibleIndex);
                xlist.on("scroll",function(e){
                    var _visibleIndex = Object.keys(xlist.visibleIndex).toString();
                    if(_visibleIndex != visibleIndex){
                         var num = Object.keys(xlist.__renderDomRecord).length;
                          $console.html("当前dom数 :"+ num+"<br/> rows:"+_visibleIndex +" <br/> itempool:"+xlist.itemPool.items.length);
                          visibleIndex = _visibleIndex;
                    }
                })
		}
	});
	
	return Console;

},{
	requires:['node','base']
});
