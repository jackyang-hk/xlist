## xlist

* 版本：3.0.0
* 教程：[http://gallery.kissyui.com/xlist/3.0.0/guide/index.html](http://gallery.kissyui.com/xlist/3.0.0/guide/index.html)

## changelog

### V1.0

* 修复下拉刷新长按时触发刷新的bug 
* 优化误操作点击时打开超链接的bug
* 优化滚动条回弹效果
* render方法可强制更新渲染可视范围内已渲染的节点
* 修复scrollTo不带duration参数时无止境回调scroll事件的bug
* 修复scrollTo滚动高度未发生变化不回调scrollEnd事件的bug
* 修复滚动条下边界回弹bug
* 重写tap事件，方便进行事件互斥


### V1.1

* 动画单位统一至ms
* dragStart、drag、dragEnd事件统一成panStart、pan、panEnd
* 去除sync()方法，采用render()重新渲染即可
* 解耦dom回收更新机制，RequestAnimateFrame替代setTimeout方案
* 去除stickies配置 合并到data 新的数据源格式：受保护字段recycled、template、height可自定义配置（防止数据中有重复字段）
* 数据分组 setDataWithGroup(data,groupId)  groupId可为空 则默认从0开始计数
* 新增console插件，方便查看dom数量、行号及dom池数量，调试时直接plug()即可
* 新增maxBufferedNum配置项，用于配制可视范围内的行余量。

### v2.0.0 

* 配合kissy gallery社区升级，目前2.0.0不可用，请使用v3.0以上版本！

### V3.0.0

* 原始数据格式调整，增加数据样式等描述
* 重用dom数固定，通过infiniteElements配置
* 新增DataSet数据集
* renderHook参数调整，无需return
* 支持任意高度元素回收
* 支持position:sticky
* 性能优化
* panstart事件定义为发生移动才出发，区分touchstart
* 支持同步渲染
* 移除autoRender配置，默认不渲染，需要手动render()

### V3.0.1
 
* 父类XScroll升级1.1.5

### V3.0.2

* 父类XScroll升级1.1.6

### V3.0.3

* 修复非回收元素重复render的bug
* 父类XScroll升级1.1.8

