KISSY.add(function(S,N){
	var $ = S.all;
	function log(args){

		if(!$("#J_Console_log")[0]){
			$("<div id='J_Console_log'></div>").css({
				position:"fixed",
				top:0,
				zIndex:9999,
				left:0
			}).prependTo($("body"))
		}

		$("#J_Console_log").html(JSON.stringify(args)+"<br/>"+Date.now())

	}

	// window.console.log = log;

	return log;

},{requires:['node']})