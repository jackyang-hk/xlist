## 综述

Xlist是基于html5的无尽下拉列表实现

* 版本：1.0
* 作者：伯才
* demo：[http://gallery.kissyui.com/xlist/1.0/demo/index.html](http://gallery.kissyui.com/xlist/1.0/demo/index.html)

## 初始化组件
		
    S.use('gallery/xlist/1.0/index', function (S, XList) {
         var xlist = new XList({
         	renderTo: "#J_List",
	        data: data,
	        template: '<div class="item"><h2>Xlist的demo {{num}}</h2></div>',
	        itemHeight: 50 //行高
         });
    })
	

## DEMO

[默认](./demo/default.html)

[附着物](./demo/stickies.html)

[上拉分页](./demo/pagination.html)

## API说明

### renderTo 容器


