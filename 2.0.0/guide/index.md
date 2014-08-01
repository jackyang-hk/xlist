## 综述

Xlist是基于html5的无尽下拉列表实现，适用于数据量大的html大列表，支持复杂的文档流类型，支持异步加载、刷新、滚动条等功能。

* 版本：2.0.0
* 作者：伯才
* demo：
### 注意：以下demo请在移动设备上查看

[最简demo](../demo/default.html)

[滚动条.html](../demo/scrollbar.html)

[下拉刷新.html](../demo/pulldownrefresh.html)

[上拉分页-滚动条-下拉刷新.html](../demo/pagination.html)

[异步楼层加载](../demo/async-floor.html)

[聚划算wap简单demo](../demo/jhs.html)

[聚划算ipad今日团list](http://ju.taobao.com/pad/normal.htm)

## 初始化组件
		
    S.use('kg/xlist/2.0.0/index', function (S, XList) {
         var xlist = new XList({
         	renderTo: "#J_List",
	        data: data,
	        template: '<div class="item"><h2>Xlist的demo {{num}}</h2></div>',
	        itemHeight: 50 //行高
         });
    })
	

## API说明

### Attribute

#### renderTo  

{ id|HTMLElement } 渲染的容器，需要设置容器的宽高，postion为relative或absolute

#### itemHeight

{ Number } 列表项的高度

#### data

{ Array } 初始化需要传入的数据

#### autoRender

{ Boolean } 是否自动渲染，若设置为false，则需要手动调用render()方法

#### translate3D

{ Boolean } 是否开启3Dtranslate以提高滚动性能

#### stickies

{ Object } 黏在页面上伴随着滚动的元素列表，如:banner slide之类的非常规item

	- 键(key) 代表行号 如{1:{template:"<span>{{demo}}</span>",height:2.0.0}}
	- 值(value) {object}  
	- template {string} 模板|html内容 KISSY.Template
	- height {number} 行高
	- type {number}  坑位类型
		1、常规元素(不用设置)
		2、不进行dom回收的非常规元素(默认为2，带有js的，如slide 等通过js处理的坑位)



#### renderHook

{ Function } 返回e.element代表当前可用的节点   e.data代表当前行的数据  e.template代表默认模板（可自定义）KISSY.Template e.row代表当前屏幕可视区域内渲染的行号。


#### SROLL_ACCELERATION

{ Float } 页面滚动阻尼系数，默认 0.002，值越小，摩擦力越小，页面滚动的距离越长。


### Method

#### render()

渲染

#### getOffsetTop()

获取页面顶部因滚动卷去的偏移量，向上为负数。

#### scrollTo(offset,duration)

滚动到某个位置

#### enableBoundryCheck()

滚动到顶部（底部）的回弹开关 

#### disableBoundryCheck()

滚动到顶部（底部）的回弹开关 


### Event

#### scroll

滚动时触发

#### scrollEnd

滚动结束时触发

#### afterRender

渲染结束后触发，该方法仅触发一次

#### sync

每一次render()方法后触发

#### dragStart

开始拖动页面前触发

#### drag

拖动时触发

#### dragEnd

拖动结束后触发，会包含速度矢量。

#### outOfBoundry

上下越界回弹时触发



### Plugins

#### scrollbar

滚动条插件

#### pulldown

下拉刷新插件

#### pullup

上拉加载插件























