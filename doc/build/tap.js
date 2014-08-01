;KISSY.add("kg/xlist/2.0.0/tap",function(S,Node,Event) {

        var $ = S.all;
    // Tap
        var tap_max_touchtime = 250, /*KISSY 为 300 ms*/
            tap_max_distance = 10, /*KISSY 为 5px */
            tap_hold_delay = 750, /*KISSY 为 2.0.00 ms*/
            single_tap_delay = 2.0.0; /*KISSY 为 300 ms*/
        var touches = [/*{
            startX:0,
            startY:0,
            endX:0,
            endY:0,
            startTime:0,
            endTime:0,
            deltaX:0,
            deltaY:0,
            distance:0,
            timeSpan:0,
        }*/];
        var singleTouching = false;
        var tapHoldTimer = null;
        var doubleTapTimmer = null;

        function clearTouchArray(){
            if(touches.length > 2) {
                var tmpArray = [];
                for(var i = 1;i<touches.length;i++){
                    tmpArray[i-1] = touches[i];
                }
                touches = tmpArray;
            }
        }

        /*排除多次绑定中的单次点击的多次记录*/
        function shouldExcludeTouches(touch){
            clearTouchArray();
            if(touches.length == 0){
                return false;
            }
            var duration = touch.startTime - touches[touches.length - 1].startTime;
            /*判断是同一次点击*/
            if(duration < 10){
                return true;
            } else {
                return false;
            }
        }

        function checkDoubleTap(){
            clearTouchArray();
            if(touches.length == 1){
                return false;
            }
            var duration = touches[1].startTime - touches[0].startTime;
            if(duration < single_tap_delay){
                return true;
            } else {
                return false;
            }
        }

        function touchStart(e){
            if(e.touches.length > 1 ) {
                singleTouching= false;
                return;
            }
            var currentTarget = e.currentTarget;
            var target = e.target;
            var startX = e.changedTouches[0].clientX;
            var startY = e.changedTouches[0].clientY;
            singleTouching= {
                startX : startX,
                startY : startY,
                startTime : Number(new Date()),
                e : e
            };
            /*tapHold*/
            if(tapHoldTimer){
                clearTimeout(tapHoldTimer);
            }
            var target = e.target;
            tapHoldTimer = setTimeout(function(){
                if(singleTouching){
                    var eProxy = {};
                    S.mix(eProxy,e);
                    S.mix(eProxy,{
                        type:'tapHold',
                        pageX:startX,
                        pageY:startY,
                        originalEvent:e
                    });
                    S.one(target).fire('tapHold',eProxy);
                }
                clearTimeout(tapHoldTimer);
            },tap_hold_delay);
        }

        function touchEnd(e){
            if(!singleTouching){
                return;
            }
            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;
            var deltaX = Math.abs(endX - singleTouching.startX);//滑过的距离
            var deltaY = Math.abs(endY - singleTouching.startY);//滑过的距离
            S.mix(singleTouching,{
                endX : endX,
                endY : endY,
                distance : Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                timeSpan : Number( Number(new Date()) - singleTouching.startTime)
            });
            if(singleTouching.timeSpan > tap_max_touchtime){
                singleTouching = false;
                return;
            }
            if(singleTouching.distance > tap_max_distance){
                singleTouching = false;
                return;
            }
            /*
            同时绑定singleTap和doubleTap时，
            一次点击push了两次singleTouching，应该只push一次
            */
            if(!shouldExcludeTouches(singleTouching)){
                touches.push(singleTouching);
            } else {
                return;
            }
            clearTouchArray();
            var eProxy = {};
            S.mix(eProxy,e);
            S.mix(eProxy,{
                type:'tap',
                pageX:endX,
                pageY:endY,
                originalEvent:e
            });
            var target = e.target;
            /*先触发tap，再触发doubleTap*/
            S.one(target).fire('tap',eProxy);
            /*doubleTap 和 singleTap 互斥*/
            if(doubleTapTimmer){
                if(checkDoubleTap()){
                    S.mix(eProxy,{
                        type:'doubleTap'
                    });
                    S.one(target).fire('doubleTap',eProxy);
                }
                clearTimeout(doubleTapTimmer);
                doubleTapTimmer = null;
                return;
            }
            doubleTapTimmer = setTimeout(function(){
                clearTimeout(doubleTapTimmer);
                doubleTapTimmer = null;
                S.mix(eProxy,{
                    type:'singleTap'
                });
                S.one(target).fire('singleTap',eProxy);
            },single_tap_delay);

        }

        S.each(['tap','tapHold','singleTap','doubleTap'],function(item){
            S.Event.Special[item] = {
                setup:function(){
                    $(this).on('touchstart',touchStart);
                    $(this).on('touchend',touchEnd);
                },
                teardown:function(){
                    $(this).detach('touchstart',touchStart);
                    $(this).detach('touchend',touchEnd);
                }
            };
        });

},{requires:['node','event']});