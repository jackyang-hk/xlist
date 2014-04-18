## 综述

Xlist是基于html5的无尽下拉列表实现

* 版本：1.0
* 作者：伯才
* demo：



[index.html](../demo/index.html)

[pagination.html](../demo/pagination.html)

## 初始化组件
		
    S.use('gallery/xlist/1.0/index', function (S, XList) {
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

	- key {number} 代表行号
	- value {object}  
	- template {string} 模板|html内容 KISSY.Template
	- height {number} 行高
	- type {number}  坑位类型
		1、常规元素(不用设置)
		2、不进行dom回收的非常规元素(默认为2，带有js的，如slide 等通过js处理的坑位)
		3、需要回收dom的非常规元素(如图片等不用绑定js的坑位)



#### renderHook

{ Function } 返回e.element代表当前可用的节点   e.data代表当前行的数据  e.template代表默认模板（可自定义）KISSY.Template


### Method

#### render()

渲染

#### sync()

同步数据并渲染

#### scrollTo(offset,duration)

滚动到某个位置

#### enableBoundryCheck()

滚动到顶部（底部）的回弹开关 

#### disableBoundryCheck()

滚动到顶部（底部）的回弹开关 


























