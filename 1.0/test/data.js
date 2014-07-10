(function(){
	function genData(floorId,num){
		var data = [];
		for(var i =0;i<num;i++){
			data.push({
				floorId:floorId,
				num:i
			});
		}
		return data;
	}

var mockData = {
	1:genData(1,3),
	2:genData(2,4),
	3:genData(3,7),
	4:genData(4,5)
};

window.mockData = mockData;
})()
