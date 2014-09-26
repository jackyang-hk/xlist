## 综述

Xlist是基于html5的无尽下拉列表实现，适用于数据量大的html大列表，支持复杂的文档流类型，支持异步加载、刷新、滚动条等功能。

* 版本：3.0.3
* 作者：伯才
* demo：

注意：以下demo请在移动设备上查看

[最简demo](../demo/default.html)

[下拉刷新](../demo/pulldownrefresh.html)

[上拉分页加载](../demo/pagination.html)

[异步数据更新](../demo/async-data.html)

[吸顶元素sticky](../demo/sticky.html)

[css样式设置](../demo/style.html)

[单行多列](../demo/multi-cols.html)

[滚动阻尼调整](../demo/accelaration.html)

产品应用demo：

[聚划算wap简单demo](../demo/jhs.html)

[聚划算ipad今日团list](http://ju.taobao.com/pad/normal.htm)

### 初始化组件

```    
S.use('kg/xlist/3.0.3/index', function (S, XList) {
     var xlist = new XList({
     	renderTo: "#J_List",
        data: data,
        itemHeight: 50 //行高
     });
})

```


### html结构

```
    <div id="J_List">
        <div class="ks-xlist-container">
            <ul class="ks-xlist-content">
                <li class="ks-xlist-row"></li>
                <li class="ks-xlist-row"></li>
                <li class="ks-xlist-row"></li>
                <li class="ks-xlist-row"></li>
                <li class="ks-xlist-row"></li>
            </ul>
        </div>
    </div>

```
	

## API说明

### Attribute

#### renderTo  

{ id|HTMLElement } 渲染的容器，需要设置容器的宽高，postion为relative或absolute

#### itemHeight

{ Number } 列表项的高度

#### data

{ Array } 初始化需要传入的数据

数据格式

```
var data = [
    {
       //实际数据
       data:{
            name:"Jack",
            age:12
       }, 
       //css样式
       style:{
            height:100,
            color:"red"
       },
       //是否可被回收 默认true
       recycled:false
    },
    {
        //实际数据
       data:{
            name:"Tom",
            age:11
       }, 
       //css样式
       style:{
            height:120,
            color:"white",
            background:"#000"
       },
       //是否可被回收 默认true
       recycled:false
    },
    {...},
    {...}
];

var xlist = new XList({
         renderTo: "#J_List",
        data: data, //传入数据
        itemHeight: 50 //行高
     });

```


#### renderHook

{ Function } 逐行渲染逻辑

代码示例:

```
var xlist = new XList({
            renderTo: "#J_List",
            data: data,
            itemHeight: 40 ,
            infiniteElements:"#J_Scroll .ks-xlist-row",
            renderHook:function(el,row){
            //若逻辑复杂此处可用XTemplate进行渲染
                el.innerHTML = "<h1>name:"+row.data.name+"</h1><p>age:"+row.data.age+"</p>";
            }
        });

```


#### SROLL_ACCELERATION

{ Float } 页面滚动阻尼系数，默认 0.002，值越小，摩擦力越小，页面滚动的距离越长。


### Method

#### render()

渲染，每当需要更新时，都可以执行该方法。

#### getOffsetTop()

获取页面顶部因滚动卷去的偏移量，向上为负数。

#### scrollTo(offset,duration)

滚动到某个位置

#### bounce(Boolean)

是否允许上下边缘回弹效果。

#### appendDataSet(Array)

添加数据集，参考[DataSet](http://gallery.kissyui.com/xlist/3.0.3/guide/dataset.html)类

#### removeDataSet(datasetId)

移除数据集，参考[DataSet](http://gallery.kissyui.com/xlist/3.0.3/guide/dataset.html)类

#### getDataSets

获取所有数据集，参考[DataSet](http://gallery.kissyui.com/xlist/3.0.3/guide/dataset.html)类

DataSet代码示例

```
KISSY.use("node,ajax,kg/xlist/3.0.3/index,kg/xlist/3.0.3/dataset",function(S,Node,Ajax,XList,DataSet){

        var xlist = new XList({
            renderTo: "#J_Scroll",
            itemHeight: 40 ,
            infiniteElements:"#J_Scroll .ks-xlist-row",
            renderHook:function(el,data){
                el.innerText = data.data.num;
            }
        });
        
        var ds = new DataSet(); //创建dataset
        var data = [
            {...},
            {...}
        ];
        ds.appendData(data); //插入数据至dataset实例
        xlist.appendDataSet(ds); //插入数据至xlist
        xlist.render(); //更新并渲染xlist
    });

```

### Event

#### scroll

滚动时触发

#### scrollEnd

滚动结束时触发

#### afterRender

渲染结束后触发，该方法仅触发一次

#### sync

每一次render()方法后触发

#### panStart

手指开始移动时触发

#### pan

手指移动时触发

#### panEnd

手指移动结束后触发，会包含速度矢量。

### Super Class

#### [XScroll](http://gallery.kissyui.com/xscroll/doc/guide/index.html)






