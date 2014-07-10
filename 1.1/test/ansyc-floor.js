(function(){
    function genData(floorId,num,str,placeholder){
        var data = [];
        for(var i =0;i<num;i++){
            data.push({
                floorId:floorId,
                num:i,
                placeholder:placeholder,
                str:"<span style='color:red'>"+(str||"loading...")+"</span>"
            });
        }
        return data;
    }

var placeHolder = {
    1:genData(1,1,'',true),
    2:genData(2,2,'',true),
    3:genData(3,3,'',true),
    4:genData(4,4,'',true)
};

console.log(placeHolder)

var mockData = {
    1:genData(1,1,1),
    2:genData(2,2,2),
    3:genData(3,3,3),
    4:genData(4,4,4)
};

//默认是1列
var cols = 1;

window.computeStickies = function(){
    //默认从0层开始
    var startFloorIndex = 0;
    var stickiesPos = {};
    for(var i in mockData){
        //每一层的数据量
        var num = mockData[i].length;

        stickiesPos[startFloorIndex] = {
            height:40,
            type:2,
            template:"<div style='background:red;height:40px;'>floor "+startFloorIndex+"</div>"
        }

        startFloorIndex+= Math.ceil(num/cols)+1;

    }
    return stickiesPos;
}


window.getPlaceHolder = function(floorId){
    return placeHolder[floorId]
}

window.getMockData = function(floorId){
    return mockData[floorId];
}

})();



(function(S){
    S.config({
        packages:[
        {
            name:"gallery",
            path:"../../../../",
            debug:true
        }]
    })
S.use('node,ajax,gallery/xlist/1.1/index,gallery/xlist/1.1/plugin/pulldown,gallery/xlist/1.1/plugin/scrollbar', function(S,Node,Ajax, XList,PullDownPlugin,ScrollBarPlugin) {
    var $ = S.all,xlist;
    //缓存楼层数据
    var floorDataCache = {
        1:getPlaceHolder(1),
        2:getPlaceHolder(2),
        3:getPlaceHolder(3),
        4:getPlaceHolder(4)
    };

    function joinFloorData(datas){
        var tmp =[];
        for(var i in datas){
            tmp = tmp.concat(datas[i])
        }
        return tmp;
    }
    //实例化
    xlist = new XList({
        renderTo: "#J_List",
        autoRender:false,
        template: '<div class="row">{{str}}</div>',
        itemHeight: 180,
        stickies:computeStickies()
    });

    xlist.plug(new PullDownPlugin({
        xlist: xlist,
        height: 50,
        downContent:"<span class='down'>Pull Down To Reload</span>",
        upContent: "<span class='up'>Release To Reload</span>",
        loadingContent: "loading..."
    }));

    xlist.plug(new ScrollBarPlugin({
        xlist: xlist
    }));

    // console.log(joinFloorData(floorDataCache))
    //塞入占位符数据
    xlist.setData(joinFloorData(floorDataCache));

    xlist.render();

    xlist.on("scroll",function(e){
        //计算当前可视区域的楼层
        getCurrentFloorIndexInView(xlist,e.offsetTop)
    })


    function getCurrentFloorIndexInView(xlist,offsetTop){
        var domInfo = {};
        for(var i in xlist.domInfo){
            if(xlist.domInfo[i]['type'] != 1){
                domInfo[i] = xlist.domInfo[i];
            }
        }
        //获取可视范围内的节点
        var visibleItems = xlist.getVisibleItems();
        var currentFloors = {};
        for(var i in visibleItems){
            if(visibleItems[i]['data'] && visibleItems[i]['data']['floorId']){
                currentFloors[visibleItems[i]['data']['floorId']] = 1;
            }
        }
        //加载
        // console.log(Object.keys(currentFloors))
        for(var i in currentFloors){
            renderFloor(i)
        }
    }
    var cache = {}
    function renderFloor(floorId){
        if(cache[floorId]) return;
        console.log("floorId:"+floorId)
        floorDataCache[floorId] = getMockData(floorId);
        xlist.removeData();
        xlist.setData(joinFloorData(floorDataCache));
        //强制替换view内行的html
        for(var i in xlist.visibleIndex){
            if(xlist.domInfo[i].data && xlist.domInfo[i].data.loading){
                // delete xlist.visibleIndex[i]
                // xlist.__renderDomRecord[i] && xlist.__renderDomRecord[i].remove()
            }
        }
        xlist.render();
        cache[floorId] = getMockData(floorId);
    }

    getCurrentFloorIndexInView(xlist,0);

    window.xlist =xlist

    

})
})(KISSY)