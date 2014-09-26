## DataSet

代码示例

```
 
    KISSY.use(kg/xlist/3.0.3/dataset",function(S,DataSet){

        var ds = new DataSet();
        
        ds.setId(124);

    	ds.appendData({row:1})

    	ds.appendData([{row:2},{row:3}])

    	ds.removeData(ds.getId()); 

    })

```
## Constructor

```
    var ds = new DataSet({
        id:"DS_1",
        data:[
            {...},
            {...}
        ]
    })

```

## Method

### appendData(Array)

插入数据

### removeData()

清空数据

### getData()

获取数据

### setId(id)

设置id

### getId()

获取id
