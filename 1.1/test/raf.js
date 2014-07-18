(function(){

	var RAF = window.requestAnimationFrame  ||
    window.webkitRequestAnimationFrame  ||
    window.mozRequestAnimationFrame     ||
    window.oRequestAnimationFrame       ||
    window.msRequestAnimationFrame      ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };

    function animate(duration){
    	var start = Date.now();
    	var run = function(){
    		var now = Date.now();
    		if(now > start + duration){
    			console.log("finish")
    			return;
    		}
    		console.log((now - start)/duration)
    		RAF(run);
    	}
    	run();
    }


    animate(1000);

})()