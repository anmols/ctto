// extend jquery dialog function
$.dialog = function(options) {
    $( "#dialog" ).html(options.content);
    
    $( "#dialog" ).dialog({
        modal: true,
        open:options.onOpen,
        beforeClose:options.onClose,
        buttons: {
          Ok: function() {
           
            $( this ).dialog( "close" );
            options.onClose();
          }
        }
      });
};

let domHelper = class domHelper{
    constructor()
    {
        this.productWalk = {};
        this.highliterJQ = {};
    }
    setProductWalk(pk)
    {
        this.productWalk  = pk;
    }
    
    setCertification(cret)
    {
        this.certification  = cret;
    }

    setHighlter(hEle)
    {
        this.highliterJQ = hEle;
    }

    getHighlter()
    {
        return this.highliterJQ;
    }

    isMaskEnabled(){

        let mask = false;
        $('.mask').each(function(item){
            if(item.css('display') === 'none'
                || !item.is(':visible'))
            {
                ;
            }
            else
            {
                mask = true;
            }
        });
        return mask;
    }
    customAlert()
    {
        alert('hi');
    }


    clearGuideMarkerTimout()
    {
        console.log("guideMarkers clearTimeout:: ");
        clearInterval(guideMarkerIntervalId);
        this.removeGuiderMarkerDiv();
    }

    clearAllSetTimeOut()
    {
        for(var i=0;i<setTimeOutCache.length;i++)
        {
            if(setTimeOutCache[i].id)
                clearTimeout(setTimeOutCache[i].id);
        }
        setTimeOutCache = [];
        console.log("clearAllSetTimeOut::");
    }

    guideMarkers(act)
    {
        console.log("guideMarkers init:: ");
        var self = this;
        let timeout = guideMarkersTimeoutSec;
        if(act.guiderTimoutSec)
        {
            timeout = act.guiderTimoutSec;
        }
        self.clearGuideMarkerTimout();
        self.setInitValuesAttribute(act.guideMarkers);
        guideMarkerIntervalId =  setInterval(function () {
            guiderChecked=0;
            if(guiderOpenFlag===true)
                return;
            console.log("guideMarkers after timeout:: ");
            console.log(act.guideMarkers);
            if(Array.isArray(act.guideMarkers))
            {
                for(let i=0; i<act.guideMarkers.length; i++) {
                    let guideMarkersSel=act.guideMarkers[i];
                    let onlyOneElement = false;
                    if(guideMarkersSel.onlyOneElement)
                    {
                        onlyOneElement = guideMarkersSel.onlyOneElement;
                    }
                    let response=self.drawGuiderMarkerDiv(act, i,onlyOneElement);
                    if(response===true)
                        break;
                }
            }
        }, timeout*1000);

    }
    // notify when activty intiater event trigger
    // for example when drag mouse on grid
    // drag mouse is starting point to perform some activity
    // so we can start observe the dom, when activity performed success(open the quick reservation box)
    htmlResolver(act,triggerCallback)
    {
        console.log("htmlResolver :: ");
        let callback = function(){};
        if(typeof triggerCallback === 'function')
        {
            callback = triggerCallback;
        }
        else if(typeof triggerCallback  === 'object' && triggerCallback.onSuccess)
        {
            callback = triggerCallback.onSuccess;
        }
        else
        {
            console.log('no callback found for :');
            console.log(act);
        }

        if(!Array.isArray(act))
        {
            var actStage = [];
            actStage.push(act);
        }
        else
        {
            actStage = act;
        }

        if (actStage && actStage.length > 0)
        {
            let that = this;
            jQuery.each(actStage, function (key, actTask) {
                console.log(actTask);
                if(actTask.type === 'task')
                {
                    jQuery.each(actTask.taskList,function(k,task){
                        if(task.category === 'dom')
                        {
                            var selectors = [];
                            let sel = that.jqSelector(task.selector);
                            if (!Array.isArray(sel) && sel)
                            {
                                selectors.push(sel);
                            }
                            else if(sel)
                            {
                                selectors = sel;
                            }

                            if(selectors.length>0)
                            {
                                jQuery.each(selectors,function(k,sel){
                                    sel.trigger( task.whatToDo );
                                });
                            }
                        }
                        else if(task.category === 'domHelper' && task.whatToDo ==='call')
                        {
                            that[task.type]();
                        }
                        else if(task.category === 'none' && task.whatToDo ==='call')
                        {
                            window[task.object][task.type]();
                        }
                    });
                }
                if(actTask.type === 'event')
                {

                    that.eventResolver(actTask,callback);
                }
                else if(actTask.type === 'MSG_PROMPT')
                {
                    that.displayMessage(actTask,triggerCallback);
                }
                else if(actTask.type === 'servercall')
                {
                    //that.clearGuideMarkerTimout();

                    let milestone = that.productWalk.getCurrentMilestone();
                    let productTrailId = that.productWalk.productWalkId;
                    let milsestoneId = milestone.id;
                    var recursionMilestoneServerCounter = 0;
//                    let utcDate = new Date();
//                    var utcDateString =  utcDate.toUTCString();
                    var method =  actTask.method;

                    var stopCounter = parseInt(actTask.timeoutSeconds);

                    var observerObj={"type": 'servercall', "id" : null, "counter": ++observerCounter};
                    let recursionCallbackObj =  function(data)
                    {
                        let selfId=observerObj.counter;
                        recursionMilestoneServerCounter++;
                        if(data.status === 'pending')
                        {
                            console.log(stopCounter);
                            if(stopCounter > 0)
                            {
                                stopCounter -= servercallIntervalSec;
                            }
                            else
                            {
                                that.removeInterval(selfId);
                                logData.state='timeout';
                                triggerCallback.onTimeOut(data);
                                let unixTimeStamp = Math.floor(Date.now() / 1000);
                                let traceData = {"type":"servercall","data":data,'unixTimeStamp':unixTimeStamp};
                                that.productWalk.userFailedTraceCapture(traceData);
                            }
                        }
                        else if(data.status === 'success')
                        {
                            that.removeInterval(selfId);
                            console.log("postServercallWait: Seconds "+postServercallWait);
                            let observeSetTimeOut = {type:'htmlResolver-servercall-success',id:null};
                            observeSetTimeOut.id =setTimeout(function () {
                                callback(data);
                            }, postServercallWait*1000);
                            setTimeOutCache.push(observeSetTimeOut);
                        }
                        else if(data.status === 'fail')
                        {
                            that.removeInterval(selfId);
                            logData.state='failed';
                            triggerCallback.onFail(data);
                            let unixTimeStamp = Math.floor(Date.now() / 1000);
                            let traceData = {"type":"servercall","data":data,'unixTimeStamp':unixTimeStamp};
                            that.productWalk.userFailedTraceCapture(traceData);
                        }
                    };

                    function serveTimerFun ()
                    {
                        that.productWalk.productWalkServer[method](productTrailId, milsestoneId, utcDateString, recursionCallbackObj);
                    }

                    // setTimeout(serveTimerFun, 2000);

                    observerObj.id= setInterval(serveTimerFun, servercallIntervalSec*1000);
                    activeObservers.push(observerObj);

                }
                else if(actTask.type === 'mutation'
                    && actTask.selector)
                {
                    //that.clearGuideMarkerTimout();
                    console.log('++++++++++++++++++++++++++++++');
                    that.mutationObserver(actTask,triggerCallback);
                }
                else if(actTask.type === 'functionCall')
                {
                    let milestone = that.productWalk.getCurrentMilestone();
                    let user = that.productWalk.user;
                    jQuery.each(actTask.taskList,function(k,task){
                        if(actTask.hasOwnProperty('runOnExecutionCount')
                            && (!actTask.runOnExecutionCount==0
                                && user.hasOwnProperty('completedMilestones')
                                && user.completedMilestones.hasOwnProperty('FDCHAPT1')
                                && milestone
                                && user.completedMilestones.FDCHAPT1.hasOwnProperty(milestone.id)
                                && user.completedMilestones.FDCHAPT1[milestone.id].hasOwnProperty('noOfTimes')
                                && user.completedMilestones.FDCHAPT1[milestone.id].noOfTimes > actTask.runOnExecutionCount))
                        {
                            triggerCallback();
                            return false;
                        }
                        console.log("taskcallback found");
                        if(task.category && that.productWalk[task.category]
                            && task.whatToDo && that.productWalk[task.category][task.whatToDo])
                        {
                            that.productWalk[task.category][task.whatToDo](triggerCallback);
                        }
                        else if(task.whatToDo && that.productWalk[task.whatToDo] )
                        {
                            that.productWalk[task.whatToDo](triggerCallback);
                        }
                        else if(task.category && that.productWalk[task.category] )
                        {
                            that.productWalk[task.category](triggerCallback);
                        }
                        else
                        {
                            alert("please correct the data configuration");
                        }
                    });
                }
                else if(actTask.type === 'template')
                {
                    if(!actTask.taskType)
                        console.log("taskType not defined.");
                    let actElem=that.jqSelector(actTask.selector);
                    if(actTask.taskType=='load')
                    {
                        if(!(actTask.hasOwnProperty('url') && actTask.url))
                        {
                            console.log("url not defined.");
                            triggerCallback.onFail('');
                            return false;
                        }
                        /*let bkpElem=document.createElement('div');
                        bkpElem.id=CryptoJS.MD5(JSON.stringify(actTask.selector));
                        bkpElem.style.visibility='hidden';
                        bkpElem.innerHTML=$(actElem).html();
                        $('body').append(bkpElem);*/
                        $.ajax({
                            type: "GET",
                            async: "false",
                            url: actTask.url,
                            success: function(html) {
                                //$("#calowner").hide();
                                //that.productWalk.hider(that.productWalk.getCurrentActivity());
                                window.scrollTo(0, 0);
                                $(actElem).prepend(html);
                                //$(actElem).load();
                                //document.getElementById("gridcontainer").innerHTML = html;
                                callback();
                            }
                        });
                    }
                    else if(actTask.taskType=='unload')
                    {
                        //let bkpElem=$("#"+CryptoJS.MD5(JSON.stringify(actTask.selector)));
                        //document.getElementById("gridcontainer").innerHTML =  $(bkpElem).html();
                        //$(actElem).html($(bkpElem).html());
                        //$(actElem).load();
                        //$("#calowner").show();
                        //$(actElem).show();
                        $(actElem).remove();
                        //that.productWalk.domHelper.removeHider();
                        //$(bkpElem).remove();
                        callback();
                    }
                    else if(actTask.taskType=='refresh')
                    {
                        if(!(actTask.hasOwnProperty('url') && actTask.url))
                        {
                            console.log("url not defined.");
                            triggerCallback.onFail('');
                            return false;
                        }
                        $.ajax({
                            type: "GET",
                            async: "false",
                            url: actTask.url,
                            success: function(html) {
                                window.scrollTo(0, 0);
                                $(actElem).prepend(html);
                                callback();
                            }
                        });
                    }
                    else if(actTask.taskType=='add')
                    {
                        $.ajax({
                            type: "GET",
                            async: "false",
                            url: actTask.url,
                            success: function(html) {
                                let introGuider=$.parseHTML(html);
                                $(introGuider).zIndex(hiderZindex+10);
//                                $(introGuider).hide();
                                $(actElem).append(introGuider);
//                                $(introGuider).fadeIn(1200);
                                let addCarsoulFun= function ()
                                {
                                    let cntr=0;
                                    for ( let activityId in that.productWalk.taskList[that.productWalk.user.activeMilestone.milestoneId].activityList)
                                    {
                                        let milestoneId=that.productWalk.user.activeMilestone.milestoneId;
                                        let activity = that.productWalk.taskList[milestoneId].activityList[activityId];
                                        if(activity.interactiveMode)
                                        {
                                            let carsoulDiv=document.createElement('span');
                                            let carSoulHolder=that.jqSelector(actTask.carsoulDest.selector);
                                            carsoulDiv.id=CryptoJS.MD5(activity.id);
                                            $(carsoulDiv).addClass('intro-carsoul');
                                            $(carsoulDiv).bind('click', function(){
                                                let target=activity.id;
                                                if(activity.hasOwnProperty('interactiveModeTarget'))
                                                    target=activity.interactiveModeTarget;
                                                $(".intro-carsoul.active").removeClass('active');
                                                $(this).addClass('active');
                                                that.productWalk.domHelper.removeHider();
                                                that.productWalk.domHelper.removeMaskLayer();
                                                $('.animate-me').remove();
                                                $('.hlx-tip').remove();
                                                that.productWalk.switchToActivity(milestoneId, target);
                                            });
                                            let icon=document.createElement('i');
                                            $(carsoulDiv).append(icon);
                                            let tooltipDiv=document.createElement('span');
                                            $(tooltipDiv).addClass('intro-carsoul-tooltip');
                                            $(tooltipDiv).html(activity.title);
                                            $(carsoulDiv).append(tooltipDiv);
                                            $(carSoulHolder).append(carsoulDiv);
                                            if(cntr==0)
                                            {
                                                $(carsoulDiv).addClass('active');
                                            }
                                            cntr++;
                                        }
                                    }
                                }
                                if(actTask.hasOwnProperty('showCarsoul') && actTask.showCarsoul)
                                {
                                    let observeSetTimeOut = {type:'htmlResolver-add-showCarsoul',id:null};

                                    setTimeout(addCarsoulFun, 50);

//                                    addCarsoulFun();
                                }
                                callback();
                            }
                        });
                    }
                    else if(actTask.taskType=='remove')
                    {
                        $(actElem).remove();
                        callback();
                    }
                }
                else
                {
                    console.log('No type defined for htmlresolver ::');
                    console.log(actTask);
                }
            });
        }
    }
    removeInterval(counter)
    {
        for(var i=0;i<activeObservers.length;i++)
        {
            if (activeObservers[i].counter==counter && activeObservers[i].id)
            {
                clearInterval(activeObservers[i].id);
                activeObservers[i].id = null;
            }
        }
    }

    /**
     * Reject an user action. It's a part of canceller. If the "mode" key is not set as "cancel" in cancelIf then automatically the rejector is called.
     * @param {type} actEvent
     * @param {type} triggerCallback
     * @returns {undefined}
     */
    rejecter(actEvent,triggerCallback)
    {
        console.log("rejecter :: ");
        console.log(actEvent);
        let self = this;
        this.productWalk.setCurrentEventHandler(triggerCallback);

        let callback = function(){};
        if(typeof triggerCallback === 'function')
        {
            callback = triggerCallback;
        }
        else if(typeof triggerCallback  === 'object' && triggerCallback.onSuccess)
        {
            callback = triggerCallback.onSuccess;
        }
        else
        {
            console.log('no callback found for :');
        }

        if(!actEvent.selector)
        {
            callback();
            console.log("Selector :"+actEvent.selector+ " not found");
            return;
        }

        let sel = self.jqSelector(actEvent.selector);
        let addPassers=[];
        if(actEvent.selector.hasOwnProperty('eventPass'))
        {
            addPassers=self.jqSelector(actEvent.selector, 'eventPass');
        }

        let onlyOneElement = false;
        if(actEvent.hasOwnProperty('onlyOneElement') && actEvent.onlyOneElement)
        {
            onlyOneElement = true;
        }
        // for multiple selector instances
        if (!Array.isArray(sel) && sel)
        {
            var selectors = [];
            selectors.push(sel);
        }
        else if(sel)
        {
            selectors = sel;
        }

        console.log(selectors);
        if(selectors.length>0)
        {

            jQuery.each(selectors, function (keys, selEles) {
                if(selEles)
                {
                    let selElesAll = [];
                    if(onlyOneElement)
                    {
                        selElesAll[0] = selEles[0];
                    }else
                    {
                        selElesAll = selEles;
                    }
                    jQuery.each(selElesAll, function (key, selEle) {


                        let jqEle = $(selEle);

                        if(jqEle.is(":visible"))
                        {

                            let unqId = "OV-"+CryptoJS.MD5(jqEle.get(0).outerHTML);

                            let jqElePos = jqEle.css("position");
                            let jqEleTop = jqEle.css("top");
                            let jqEleLft = jqEle.css("left");
                            let jqEleWdt = jqEle.css("width");
                            let jqEleHt = jqEle.css("height");

                            let eleWidth = 0;
                            let eleHeight = 0;
                            let startX=0;
                            let startY=0;
                            let elePos='absolute';

                            if(jqElePos == 'absolute')
                            {
                                startX = jqEleLft;
                                startY = jqEleTop;
                                eleWidth = jqEleWdt;
                                eleHeight =parseFloat(jqEleHt);
                                elePos = 'absolute';
                            }else
                            {
                                let position = jqEle.position();
                                eleWidth = jqEle.outerWidth()+'px';
                                eleHeight = parseFloat(jqEle.outerHeight());
                                startX=position.left+'px';
                                startY=position.top+'px';
                            }

                            eleHeight = eleHeight+3;

                            let eleZIndex = jqEle.css("z-index");
                            if(eleZIndex == 'auto' || eleZIndex ==0)
                            {
                                eleZIndex = 1;
                            }
                            eleZIndex = parseInt(eleZIndex);
                            if(jQuery.inArray( unqId, ungIdsCacheArr ) === -1)
                            {
                                jqEle.parent().append('<div id="'+unqId+'" style="'+
                                    'cursor: default; position: '+elePos+'; z-index: '+(eleZIndex+1)+'; left: '+startX+'; top: '+startY+';'+
                                    ' width: '+eleWidth+'; height: '+eleHeight+'px; overflow: hidden;"></div>');
                                self.bindRejectorBehaviour("#"+unqId,true);
                            }
                            ungIdsCacheArr.push(unqId);
                        }
                    });

                    if(addPassers.length>0) // Use this code to execute the methods which covered by rejecter div.
                    {
                        for(let i=0;i<addPassers.length;i++)
                        {
                            let jqEle = $(addPassers[i]);
                            let unqId = "OV-"+CryptoJS.MD5(jqEle.get(0).outerHTML);
                            let ele = $("#"+unqId);
                            switch(actEvent.eventType)
                            {
                                case 'click':

                                    break;
                                case 'contextmenu':
                                    ele.unbind('contextmenu');
                                    ele.contextmenu(function(e) {

                                        e.stopPropagation();
                                        e.preventDefault();

                                        jqEle.trigger('contextmenu'); // To fire jquery bind contextmenu method

                                        /*Use the following code to fire nativ javascript contextmenu */
                                        var element  = jqEle[0];
                                        var ev3 = new MouseEvent("contextmenu", {
                                            bubbles: true,
                                            cancelable: false,
                                            view: window,
                                            button: 2,
                                            buttons: 0,
                                            clientX: e.clientX,
                                            clientY: e.clientY
                                        });
                                        element.dispatchEvent(ev3);

                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            });
        }


    }

    bindRejectorBehaviour(ele,stopProp)
    {
        if(stopProp)
        {
            $(ele).bind('blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit', function(event){
                event.stopPropagation();
            });
        }

        $(ele).click(function(e) {
            if($(".drawGuiderMarkerDiv").length==0)
                ignoreTick=true;

            let observeSetTimeOut = {type:'bindRejectorBehaviour-click',id:null};
            observeSetTimeOut.id = setTimeout(function () {$('.drawGuiderMarkerDiv').effect( "bounce",{},500)},2*1000*messageBoxGuidertimer);
            setTimeOutCache.push(observeSetTimeOut);
        });
        $(ele).contextmenu(function(e) {
            if($(".drawGuiderMarkerDiv").length==0)
                ignoreTick=true;

            let observeSetTimeOut = {type:'bindRejectorBehaviour-click',id:null};
            observeSetTimeOut.id = setTimeout(function () {$('.drawGuiderMarkerDiv').effect( "bounce",{},500)},2*1000*messageBoxGuidertimer);
            setTimeOutCache.push(observeSetTimeOut);
            return false;
        });

    }
    // add event listner to highlight area(if highlighter tag is found),
    //or add event listner like onclick,ondrag and perform some callbacks if event occur
    eventResolver(actEvent,triggerCallback,callbackIndex)
    {
        console.log("eventResolver :: ");
        console.log(actEvent);
        this.productWalk.setCurrentEventHandler(triggerCallback);

        let callback = function(){};
        if(typeof triggerCallback === 'function')
        {
            callback = triggerCallback;
        }
        else if(typeof triggerCallback  === 'object' && triggerCallback.onSuccess)
        {
            callback = triggerCallback.onSuccess;
        }
        else
        {
            console.log('no callback found for :');
        }

        if(!actEvent.selector)
        {
            callback();
            console.log("Selector :"+actEvent.selector+ " not found");
            return;
        }

        let sel = this.jqSelector(actEvent.selector);
        console.log("*********************");
        console.log(sel);
        // for multiple selector instances
        if (!Array.isArray(sel) && sel)
        {
            var selectors = [];
            selectors.push(sel);
        }
        else if(sel)
        {
            selectors = sel;
        }

        console.log(selectors);
        if(selectors.length>0)
        {
            jQuery.each(selectors, function (key, selEle) {
                //"selEle.one" event type is unbound after its first invocation

                if(selEle)
                {
                    let eventName = actEvent.eventType+"."+"productTrailEvent";
                    console.log("bbbbb"+eventName);
                    //selEle.css({ 'border': '2px solid #ff4141' });
                    //selEle.removeAttr( actEvent.eventType );
                    if(callbackIndex !== undefined)
                    {
                        selEle.attr(actEvent.eventType,callbackIndex);
                    }
                    selEle.bind(eventName, function (event) {
                        //event.stopImmediatePropagation();
                        callback(event);

                        console.log("bbbbb 7777"+eventName);

                        // add overlay if highliter tag found

                    });

                    selEle.removeClass('startIfBorderColor');
                    selEle.removeClass('cancelIfBorderColor');
                    selEle.removeClass('completeIfBorderColor');
                    //selEle.addClass(SelectorIdentifierColor);
                }
            });
        }


    }

    highlighterResolver(act,fullAct)
    {
        console.log(" :: highlighterResolver");
        var mySelf = this;

        console.log(" setTimeout :: highlighterResolver");
        let highSel = null, hideBottom=false;
        if (act.highlighter)
        {


            mySelf.removeMaskLayer(true);
            let highlightFunc= function(highLighter) {
                if(highLighter.audio)
                {
                    let audio = document.getElementById('productTrailAudio');
                    let source = document.getElementById('productTrailAudioSource');
                    source.src = audiosHostname+highLighter.audio.src;
                    audio.load(); //call this to just preload the audio without playing
                    audio.play();
                    if(highLighter.audio.ended)
                    {
                        let nxtBtn = mySelf.jqSelector(highLighter.audio.ended.selector);
                        nxtBtn.removeClass('nxtBlink');
                        audio.onended = function() {
                            nxtBtn.addClass('nxtBlink');
                        };
                    }
                }
                highSel = mySelf.jqSelector(highLighter.selector);
                if(highSel && highSel.length >0)
                {
                    if (highSel instanceof jQuery)
                    {
                        if(highLighter.hasOwnProperty('scroll') && highLighter.scroll === false)
                        {
                            $('html, body').addClass('scrollFix');
                        }else
                        {
                            $('html, body').removeClass('scrollFix');
                        }

                        var pickMyZIndex=false;
                        var autoFocus=true;
                        if(highLighter.hasOwnProperty('hideBottom'))
                            hideBottom=highLighter.hideBottom;
                        if(highLighter.hasOwnProperty('pickMyZIndex'))
                            pickMyZIndex=highLighter.pickMyZIndex;
                        if(highLighter.hasOwnProperty('autoFocus'))
                            autoFocus=highLighter.autoFocus;
                        let higherLighterFunc = function () {
                            mySelf.setHighlter(highSel);
                            if(!highLighter.hasOwnProperty('addMaskLayer') || highLighter.addMaskLayer===true)
                            {
                                /*let divSels=mySelf.addMaskLayer(hideBottom,pickMyZIndex,autoFocus);
                                if(fullAct)
                                {
                                    let cancelerObj={
                                        "type" : "event",
                                        "eventType" : "click",
                                        "selector" : {
                                          "self" : divSels
                                        }
                                    };
                                    if(fullAct.hasOwnProperty('cancelIf'))
                                        cancelerObj=fullAct.cancelIf;

                                    mySelf.productWalk.cancelIfHandler(cancelerObj,fullAct,function(){
                                        mySelf.tryAgainMsg(function(){mySelf.productWalk.productTrailExitHandler('active');});
                                        let unixTimeStamp = Math.floor(Date.now() / 1000);
                                        let traceData = {"type":"cancelIf","data":act,'unixTimeStamp':unixTimeStamp};
                                        mySelf.productWalk.userFailedTraceCapture(traceData);
                                    });
                                } */

                                mySelf.addMaskLayer(hideBottom,pickMyZIndex,autoFocus);

                            }

                            if (highLighter.title)
                            {
                                mySelf.drawHighlterTitleDiv(highLighter.title, highLighter.class, highLighter.useCentralGuider);
                                if(act.hasOwnProperty('interactiveMode') && act.interactiveMode)
                                {
                                    $(".intro-carsoul.active").removeClass('active');
                                    $("#"+CryptoJS.MD5(act.id)).addClass('active');
                                }
                            }
                        };
                        higherLighterFunc();
                        //setTimeout(higherLighterFunc, highlighterDelayTimer*1000);
                        $(highSel).on('resize',higherLighterFunc);
                    }else
                    {
                        mySelf.removeMaskLayer(true);
                    }
                }else if(highSel!=null && highLighter.hasOwnProperty('handleMissing') && highLighter.handleMissing)
                {
                    mySelf.highlighterMissing();
                    return false;
                }
            }
            $('.hlx-tip').remove();
            $('.animate-me').remove();
            if(Array.isArray(act.highlighter))
            {
                for(let i=0; i<act.highlighter.length;i++)
                {
                    highlightFunc(act.highlighter[i]);
                }
                return true;
            }
            else
            {
                highlightFunc(act.highlighter);
            }
        }
    }


    highlighterMissing()
    {
        var self = this;
        $.confirm({
            title: 'Prerequisite not found. Unable to continue current task.',
            content: '',
            closeIcon: false,
            buttons: {
                Yes: {
                    text: 'Skip Current Task',
                    btnClass: 'btn btn-yellow',
                    keys: ['enter', 'shift'],
                    action: function(){

                        self.productWalk.userSkipedMilestone();
                    }
                }
            }
        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
            //           $('.jconfirm-closeIcon').hide();
        }, 0);
    }


    // it track the new at44555555555555rrrrrrudded Dom element,new attributes
    mutationObserver(actTask,callback)
    {
        if(actTask.timeoutSeconds === undefined)
        {
            actTask.timeoutSeconds = 10;
        }
        var stopCounter = defaultMutationTimeout;
        if(actTask.hasOwnProperty('timeoutSeconds'))
            stopCounter = parseInt(actTask.timeoutSeconds);
        var intervalSec = .6;
        var self = this;
        var observerObj={"type": 'servercall', "id" : null, "counter": ++observerCounter};
        let recursionCallbackObj =  function()
        {
            let selfId=observerObj.counter;
            stopCounter = stopCounter - intervalSec;
            if(self.checkElementExistInDOM(actTask))
            {
                self.removeInterval(selfId);
                callback.onSuccess();
            }
            else if(stopCounter < 0)
            {
                self.removeInterval(selfId);
                callback.onTimeOut();

                let unixTimeStamp = Math.floor(Date.now() / 1000);
                let traceData = {"type":"mutation","data":actTask,'unixTimeStamp':unixTimeStamp};
                self.productWalk.userFailedTraceCapture(traceData);
            }
        };

        function elementFinderTimerFun ()
        {
            recursionCallbackObj();
        }

        //setTimeout(elementFinderTimerFun, intervalSec*1000);

        observerObj.id= setInterval(elementFinderTimerFun, intervalSec*1000);
        activeObservers.push(observerObj);
    }

    checkElementExistInDOM(actTask)
    {
        console.log("checkElementExistInDOM :::::::");
        console.log(actTask);
        let jqEle = this.jqSelector(actTask.selector);
        let targetNode = jqEle.get(0);
        console.log("targetNode :::::::");
        console.log(targetNode);
        if(targetNode === undefined)
        {
            return false;
        }
        return true;

    }

    // return the jquery Element based on Selector (id,class,attribute value etc)
    jqSelector(selObj, propName)
    {
        let res = null;
        let propFind="self";
        if(typeof propName !='undefined')
            propFind=propName;
        if(selObj && selObj.hasOwnProperty(propFind))
        {
            if(selObj.hasOwnProperty("addCustomClass"))
            {
                customCssClass.push(selObj.addCustomClass);
                $(selObj[propFind]).addClass(selObj.addCustomClass);
            }

            return $(selObj[propFind]);

            let splitSel = selObj[propFind];
            let arr = splitSel.split(">");

            if(arr[2])
            {
                res = $($.trim(arr[0])).find($.trim(arr[1])).find($.trim(arr[2]));
            }
            else if(arr[1])
            {
                res =  $($.trim(arr[0])).find($.trim(arr[1]));
            }
            else
            {
                res =  $($.trim(selObj[propFind]));
            }

        }
        return res;
    }

    setMaskFunc(highSel,pickZIndex,hideBottom)
    {
        let self = this;
        let addedDivSels=[];
        this.removeMaskLayer();
        let eleZIndex = $(highSel).css("z-index");
        let position = highSel.offset();
        let maxX=$(document).width();
        let maxY= $(document).height();
        let eleWidth = highSel.outerWidth();
        let eleHeight = highSel.outerHeight();

        let startX=position.left;
        let startY=position.top;
        let endX=position.left + eleWidth;
        let endY=position.top + eleHeight;

        let zIndex = hiderZindex;
        if(typeof pickZIndex === "boolean" && pickZIndex)
        {
            if(eleZIndex == 'auto' || eleZIndex ==0)
            {
                eleZIndex = 1;
            }

            zIndex = parseInt(eleZIndex)-1;
        }else if($.isNumeric(pickZIndex))
        {
            zIndex = pickZIndex-1;
        }

        this.drawOverlay('leftOvrl',0,0,startX,maxY,zIndex); // Left
        this.drawOverlay('topOvrl',startX,0,maxX-startX,startY,zIndex); // Top
        this.drawOverlay('rgtOvrl',endX,startY,maxX-endX,endY-startY,zIndex); // Right
        addedDivSels=['#leftOvrl','#topOvrl','#rgtOvrl'];
        if(!hideBottom)
        {
            this.drawOverlay('botOvrl',startX,endY,maxX-startX,maxY-endY,zIndex); // Bottom
            addedDivSels.push('#botOvrl');
        }
        $.each(addedDivSels,function(k,ele){
            //self.bindRejectorBehaviour(ele,true);
        });

        return addedDivSels;
    }
    // adding the four mask layers to dark the area
    // and help to highlight the specific one
    addMaskLayer(hideBottom, pickZIndex, autoFocus)
    {
        let addedDivSels = [];
        let highSel = this.getHighlter();

        let self = this;

        if (highSel && highSel.length>0)
        {
            /*if(autoFocus){
                $('html,body').animate({
                        scrollTop: ((highSel.offset().top)-200)
                },
                    1000);
            }*/
            addedDivSels=self.setMaskFunc(highSel,pickZIndex,hideBottom);
        }
        return addedDivSels.join(',');
    }

    drawOverlay(id, sx,sy,w,h,ZIndex)
    {
        $('body').append('<div id="'+id+'" class="dark-overlay base" style="background: black; opacity: 0.2;'+
            'cursor: default; position: absolute; z-index: '+ZIndex+'; left: '+sx+'px; top: '+sy+'px;'+
            ' width: '+w+'px; height: '+h+'px; overflow: hidden;"></div>');
    }
    removeStartExitLink()
    {
        $('#startTrailOvrl').remove();
        $('#exitTrailOvrl').remove();
        
        $('#startCertificateOvrl').remove();
        $('#exitCertificateOvrl').remove();
    }
    
    drawExitTrialLink()
    {
        console.log("drawExitTrialLink ::");
        let id = "exitTrailOvrl";
        $('#startTrailOvrl').remove();
        $('#'+id).remove();
        $('body').append('<a id="'+id+'" title="Exit Learning Mode" onClick = "pWalk.productTrailExitHandler()" class="btn-exit-trial" style="position: absolute; z-index: '+(hiderZindex+2)+';">Exit Learning Mode</a>');
    }

    drawStartTrialLink(noToolTipPlease)
    {
        console.log("drawStartTrialLink ::");
        if(noToolTipPlease === undefined)
        {
            noToolTipPlease = false;
        }
        let id = "startTrailOvrl";
        $('#exitTrailOvrl').remove();
        $('#'+id).remove();
        $('body').append('<a id="'+id+'" title="Start Learning Mode" class="btn-start-trial" style="position: absolute; z-index: '+(hiderZindex+1)+';">Start Learning Mode</a>');
//        $('#'+id).tooltip({
//              disabled: true,
//              close: function( event, ui ) { $(this).tooltip('disable'); }
//             });

        var self = this;
        let observeSetTimeOut = {type:'drawStartTrialLink',id:null};
        observeSetTimeOut.id = setTimeout(function () {
            $("#"+id).on("click",function(){
                $('#drawExitStartToolTip').remove();
                self.productWalk.startProductWalk(true);
            });
        },100);
        setTimeOutCache.push(observeSetTimeOut);

        let txt = 'Click here any time to resume with<br>A.C.E. <em style="font-size: .8em;"> (Automated Coaching Engine)</em>';
        if(!noToolTipPlease)
        {
            this.drawExitStartToolTip(txt);
        }


    }
    
     drawExitCertificateLink()
    {
        console.log("drawExitCertificateLink ::");
        let id = "exitCertificateOvrl";
        $('#startCertificateOvrl').remove();
        $('#'+id).remove();
        $('body').append('<a id="'+id+'" title="Exit Certificate Mode" onClick = "pCertificate.stop()" class="btn-exit-certificate" style="position: absolute; z-index: '+(hiderZindex+2)+';">Exit Certificate Mode</a>');
    
    
    }

    drawStartCertificateLink(noToolTipPlease)
    {
        console.log("drawStartCertificateLink ::");
        
        if(noToolTipPlease === undefined)
        {
            noToolTipPlease = false;
        }
        let id = "startCertificateOvrl";
        $('#exitCertificateOvrl').remove();
        $('#'+id).remove();
        $('body').append('<a id="'+id+'" title="Start Certificate Mode" class="btn-start-certificate" style="position: absolute; z-index: '+(hiderZindex+1)+';">Start Certificate Mode</a>');
//        $('#'+id).tooltip({
//              disabled: true,
//              close: function( event, ui ) { $(this).tooltip('disable'); }
//             });

        var self = this;
        let observeSetTimeOut = {type:'drawStartCertificateLink',id:null};
        observeSetTimeOut.id = setTimeout(function () {
            $("#"+id).on("click",function(){
                $('#drawExitStartCertificateToolTip').remove();
                self.certification.start();
            });
        },100);

        let txt = 'Click here any time to resume with<br>Certification Mode';
        if(!noToolTipPlease)
        {
            this.drawExitStartCertificateToolTip(txt);
        }


    }
    
    
    removeDiv(sel)
    {
        $(sel).remove();
    }

    drawHighlterTitleDiv(txtArr,addClass,useCentralGuider)
    {
//        $('#drawPTrailHighlterDiv').remove();
//        $('#drawPTrailHighlterBorderDiv').remove();



        let highSel = this.getHighlter();
        let width = highSel.outerWidth();
        let height = highSel.outerHeight();
        let position = highSel.offset();
        let left=position.left;
        let right=position.right;
        let top=position.top;
        let totalWidthRequired=left+width+introDescDivMaxWidth+introMainDivMaxWidth+(markerLength*2)+introDivmargins;
        let descDivClass="no-class";
        console.log("WinWid: "+$(document).width()+ " left: "+left+" width: "+width+" main: "+introMainDivMaxWidth+" Desc:"+introDescDivMaxWidth);
        if(addClass === 'right' && totalWidthRequired > $(document).width())
            descDivClass="adjust-class";


        let pLeft=left-2;
        let pTop=top-2;


        if (highSel instanceof jQuery)
        {
            let divStr = '', divHtmlStr='';
            if(txtArr[0])
            {
                divHtmlStr += '<h3>'+txtArr[0]+'</h3>';
                divStr+=txtArr[0];
            };
            if(txtArr[1])
            {
                divHtmlStr += '<div class="'+descDivClass+'">'+txtArr[1]+'</div>';
                divStr+='<span>'+txtArr[1]+"</span>";
            };
            if(useCentralGuider)
            {
                $(highSel).html(divStr);
            }
            else {
                if(addClass === 'right')
                {
                    left  = left+width+26;
                    //top  = top+(height/2);
                }
                else if(addClass === 'left')
                {
                    right  = $( window ).width() - left + 26;
                    //top  = top+(height/2);
                }
                else if(addClass === 'top')
                {
                    top  = top-highLtrTopAdj;
                    //left  = left+(width/2);
                }
                else if(addClass === 'bottom')
                {
                    top  = top+height+highLtrBottomAdj;
                }
                if(addClass === 'left')
                    $('body').append('<div id="drawPTrailHighlterBorderDiv" class="animate-me" style="width:'+width+'px;height:'+height+'px;left:'+pLeft+'px;top:'+pTop+'px;position:absolute; border:2px solid rgb(255,192,0); z-index:'+(hiderZindex+2)+';"></div><div id="drawPTrailHighlterDiv" class="hlx-tip clearfix '+addClass+'" style="display:none; position: absolute; z-index: '+(hiderZindex+3)+'; right: '+right+'px; top: '+top+'px;">'+divHtmlStr+'</div>');
                else
                    $('body').append('<div id="drawPTrailHighlterBorderDiv" class="animate-me" style="width:'+width+'px;height:'+height+'px;left:'+pLeft+'px;top:'+pTop+'px;position:absolute; border:2px solid rgb(255,192,0); z-index:'+(hiderZindex+2)+';"></div><div id="drawPTrailHighlterDiv" class="hlx-tip clearfix '+addClass+'" style="display:none; position: absolute; z-index: '+(hiderZindex+3)+'; left: '+left+'px; top: '+top+'px;">'+divHtmlStr+'</div>');
                $('.hlx-tip').fadeIn(600);
            }
        }
    }


    drawExitStartToolTip(txt)
    {
        $('#drawExitStartToolTip').remove();
        $('body').append('<div id="drawExitStartToolTip" class="btn-start-trial-msg" style="position: absolute; z-index: '+(hiderZindex+1)+';"><h3>'+txt+
            '</h3><button type="button" id="drawExitStartToolTipOk" class="btn btn-yellow d-inline-block">Ok</button></div>');

        $('#drawExitStartToolTipOk').on("click",function(){
            $('#drawExitStartToolTip').remove();
        });
    }
    drawExitStartCertificateToolTip(txt)
    {
        $('#drawExitStartCertificateToolTip').remove();
        $('body').append('<div id="drawExitStartCertificateToolTip" class="btn-start-certificate-msg" style="position: absolute; z-index: '+(hiderZindex+1)+';"><h3>'+txt+
            '</h3><button type="button" id="drawExitStartCertificateToolTipOk" class="btn btn-yellow d-inline-block">Ok</button></div>');

        $('#drawExitStartCertificateToolTipOk').on("click",function(){
            $('#drawExitStartCertificateToolTip').remove();
        });
    }
    drawWatchAgainDiv(remove)
    {
        $('#drawWatchAgain').remove();
        if(remove === undefined)
        {

            let that = this;
            let milestone = this.productWalk.getCurrentMilestone();
            if(milestone.skipMilestoneInterceptor)
            {
                return true;
            }
            $('body').append('<div id="drawWatchAgain" style=" z-index: '+(hiderZindex+5)+';">'+
                '<h1>Current Task</h3>'+
                '<h3>'+milestone.doItTitle+'</h3>'+
                '<button id="drawWatchAgainButton" type="button" class="btn btn-watch-again" onclick="event.stopPropagation()" >Watch Video</button>'+
                '</div>');
            setTimeout(function () {
                $("#drawWatchAgainButton").click(function(){
                    // for clear all event listner,popup
                    that.productWalk.productTrailExitHandler('restart');
                    milestoneJustRestart = true;

                    let observeSetTimeOut = {type:'drawWatchAgainButton-click',id:null};
                    observeSetTimeOut.id = setTimeout(function () {
                        milestoneJustRestart = false;
                    },servercallIntervalSec*4000);
                    setTimeOutCache.push(observeSetTimeOut);

                    that.watchVideo(milestone,function(){
                        let pWalk = that.productWalk.getCurrentProductWalk();
                        //let newMilestone = that.productWalk.taskList[milestoneId];
                        that.productWalk.setCurrentProductWalk(pWalk);
                        that.productWalk.setCurrentMilestone(milestone);

                        let chkPointActivity =    that.productWalk.taskList[milestone.id].activityList[milestone.initActivity];
                        that.productWalk.setCurrentActivity(chkPointActivity);
                        that.productWalk.userCurrentActivity(milestone,chkPointActivity);

                        that.productWalk.letsStart = false;
                        that.productWalk.startMilestone('watchOtherVideo');
                    });
                });
            }, 0);
        }
    }

    drawExitConfirm(cancelCallback,oksuccess)
    {
        var self = this;
        $.confirm({
            title: 'Are you sure you want to exit learning mode?',
            content: '',
            closeIcon: false,
            buttons: {
                Yes: {
                    text: 'Yes',
                    btnClass: 'btn btn-yellow',
                    keys: ['enter', 'shift'],
                    action: function(){
                        if(oksuccess)
                        {oksuccess();}

                        if(self.productWalk && self.productWalk.user)
                        {
                            self.productWalk.user.status = 'stop';
                        }
                        
                        //logData.state='exited';
                        if(self.productWalk && self.productWalk.productWalkServer)
                        {
                            self.productWalk.productWalkServer.updateUser(self.productWalk.user,function(){
                                console.log("update user walk state save success from drawExitConfirm OK ");
                            },function(){
                                alert("Restarting again after Redeem Amount");
                                window.location.reload();
                            });
                            self.drawStartTrialLink();
                        }
                    }
                },
                No: {
                    text: 'No',
                    btnClass: 'btn btn-blue-lt',
                    action: function(){
                        $('.jconfirm-box').removeClass('bluebox');
                        cancelCallback();
                    }
                }
            }
        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
            //           $('.jconfirm-closeIcon').hide();
        }, 0);
    }

    removeMaskLayer(reset)
    {
        console.log('removeMaskLayer :: ('+reset+')');
        $('.dark-overlay').remove();
        $('.hlx-tip').remove();
        $('.animate-me').remove();
        if(reset)
        {
            this.setHighlter({});
        }
    }

    defuseEvent(sel)
    {
        console.log("defuseEvent ::");
        console.log(sel);
        sel.unbind(".productTrailEvent");
        sel.unbind(".drawGuiderMarkerEvent");
    }

    disableElement(disabledNode){
        console.log("disableElement ::");
        var sel = this.jqSelector(disabledNode.selector);

        var href = sel.attr('href');
        var onclick = sel.attr('onclick');
        console.log(sel);
        sel.addClass("productTrailDisabler");
        sel.attr("disabled", true);
//        let tagNames=sel.nodeName;
        if(!$(sel).hasOwnProperty('0'))
            return false;
        if($(sel)[0].nodeName=='DIV')
        {
            $(sel).bind('click',function (e) {
                e.stopPropagation();
            });
        }
        if (typeof href !== typeof undefined && href !== false) {
            if(onclick)
            {
                sel.attr('onclickOld',onclick);
                sel.attr('onclick','');
            }
        }
    }

    removeDisabler(){
        $(".productTrailDisabler").each(function(k,ele){
            $(ele).removeClass("productTrailDisabler");
            $(ele).attr("disabled", false);

            let onclickOld =  $(ele).attr('onclickOld');
            if(onclickOld)
            {
                $(ele).attr('onclick',onclickOld);
            }

        });
    }


    hideElement(disabledNode){
        console.log("disableElement ::");
        var sel = this.jqSelector(disabledNode.selector);

        var href = sel.attr('href');
        var onclick = sel.attr('onclick');
        console.log(sel);
        sel.addClass("productTrailHider");
        if (typeof href !== typeof undefined && href !== false) {
            if(onclick)
            {
                sel.hide();
            }
        }
    }

    removeHider(){
        $(".productTrailHider").each(function(k,ele){
            $(ele).removeClass("productTrailHider");
            $(ele).show();
        });
    }


    removeGuiderMarkerDiv()
    {
        $('.drawGuiderMarkerDiv').remove();
        $("[drawguidermarkerid *='drawGuiderMarkerDiv_'").removeAttr('drawguidermarkerid');
        guiderOpenFlag=false;
    }
    setInitValuesAttribute(guideMarkers)
    {
        let self = this;
        guiderOpenFlag=false;
        if(Array.isArray(guideMarkers)){
            jQuery.each(guideMarkers,function(k,guideMarkersSel){
                let onlyOneElement = false;
                if(guideMarkersSel.onlyOneElement)
                {
                    onlyOneElement = guideMarkersSel.onlyOneElement;
                }
                let guiderMarkerArr = self.jqSelector(guideMarkersSel.selector);
                let guiderMarkerMonArr = self.jqSelector(guideMarkersSel.selector,"monitor");
                if((!guiderMarkerArr || guiderMarkerArr.length==0)
                    && (!guiderMarkerMonArr || guiderMarkerMonArr.length===0) )
                {
                    return;
                }

                //console.log("selArr.getPath() :: ");
                //console.log(selArr.getPath());
                //let paths = selArr.getPath();
                let selArr = guiderMarkerArr;
                if(onlyOneElement)
                {
                    selArr = [guiderMarkerArr[0]];
                }
                if(guiderMarkerMonArr)
                    $.merge( selArr, guiderMarkerMonArr );
                jQuery.each(selArr,function(){
                    this.setAttribute('oldValue', self.findElementValue(this));
                });
                //guiderTracker={};
            });
        }
    }
    findElementValue(elementObj)
    {
        switch(elementObj.nodeName)
        {
            case "SELECT":
                let retVal=CryptoJS.MD5($(elementObj).children("option:selected").val());
                return retVal;
                break;
            case "INPUT":
                if($(elementObj).attr('type')=='checkbox' || $(elementObj).attr('type')=='radio')
                {
                    return CryptoJS.MD5($(elementObj).prop('checked').toString()); // MD5 gives error when bool true
                }
                return CryptoJS.MD5($(elementObj).val());
                break;
            default:
                return CryptoJS.MD5($(elementObj).val());
                break;
        }
    }

    drawGuiderMarkerDiv(fullact, index,onlyOneElement, customZindex)
    {
        if($(".drawGuiderMarkerDiv").length>0)
        {
            return true;
        }

        let timeoutClose = guideMarkersAutoCloseTimeoutSec;
        if(fullact.guiderCloseTimoutSec)
        {
            timeoutClose = fullact.guiderCloseTimoutSec;
        }

        let act=fullact.guideMarkers[index];
        let txtArr = act.title;
        let addClass = act.class;
        let extraHtml = act.extraHtml;
        let pickMyZIndex =false;
        let self=this;

        if(act.hasOwnProperty('pickMyZIndex'))
            pickMyZIndex=act.pickMyZIndex;
        let guiderMarkerArr = this.jqSelector(act.selector);
        let guiderMonitorArr=this.jqSelector(act.selector,"monitor");
        if(!guiderMonitorArr)
            guiderMonitorArr=guiderMarkerArr;
        let autoFocus = true;
        let checkTicker=true;
        if(ignoreTick)
        {
            checkTicker=false;
        }

        if( act.autoFocus === false)
        {
            autoFocus = false;
        }
        if(guiderMarkerArr.length===0)
        {
            return false;
        }

        let selArr = guiderMarkerArr;
        let monArr=guiderMonitorArr;
        if(onlyOneElement)
        {
            selArr = [guiderMarkerArr[0]];
            monArr = [guiderMonitorArr[0]];
        }
        if(selArr.length>0)
        {
            for(let i=0; i<selArr.length; i++)
            {
                let selObj=selArr[i];
                let monObj=selArr[i];
                if(monArr.length > i)
                {
                    monObj=monArr[i];
                }
                let highSel = $(selObj);
                let highSelMon = $(monObj);

                if(checkTicker && guiderTracker[CryptoJS.MD5(act.selector.self)] == 1)
                {
                    continue;
                }

                if (monObj.hasAttribute('oldValue')
                    && this.findElementValue(monObj)
                    && monObj.getAttribute('oldValue') != this.findElementValue(monObj))
                {
                    guiderTracker[CryptoJS.MD5(act.selector.self)]=1;
                    guiderChecked++;
                    continue;
                }
                if(checkTicker && guiderChecked>0)
                {
                    guiderChecked=0;
                    return true;
                }

                if(act.hideTitle===true)
                {
                    guiderTracker[CryptoJS.MD5(act.selector.self)]=1;
                    continue;
                }
                if($(".drawGuiderMarkerDiv").length>0)
                    return true;
                ignoreTick=false;
                if (highSel instanceof jQuery)
                {
                    guiderOpenFlag=true;
                    if(act.focusMyself)
                    {
                        highSel.focus();
                    }
                    let width = highSel.outerWidth();
                    let height = highSel.outerHeight();
                    let position = highSel.offset();
                    let left=position.left;
                    let top=position.top;
                    let divStr = '';
                    jQuery.each(txtArr,function(i,v){
                        divStr += '<p>'+v+'</p>';
                    });
                    let possibleClasses=['left','right','top', 'bottom'];
                    let classes=addClass.split(' ');
                    let positionClass='';
                    for (let i=0;i<possibleClasses.length; i++)
                    {
                        positionClass=classes.find(function(elem){return elem==possibleClasses[i];});
                        if(typeof positionClass != 'undefined')
                            break;
                    }
                    if(positionClass === 'right')
                    {
                        left  = left+width+18;
                        top  = top-10;
                    }
                    else if(positionClass === 'left')
                    {
                        left  = left-220-74;
                        top  = top-10;
                    }
                    else if(positionClass === 'top')
                    {
                        top  = top-90;
                        //left  = left+(width/2);
                    }
                    else if(positionClass === 'bottom')
                    {
                        top  = top+height+25;
                    }
                    window.drawGuiderMarkerIdCounter++;
                    var markerId = 'drawGuiderMarkerDiv_'+drawGuiderMarkerIdCounter;
                    $("[drawguidermarkerid *='drawGuiderMarkerDiv_'").removeAttr('drawguidermarkerid');
                    highSel.attr("drawGuiderMarkerId",markerId);
                    let useZindex=hiderZindex+2;
                    if(customZindex)
                    {
                        useZindex=customZindex;
                    }

                    let extLeft,extTop;
                    if(Array.isArray(extraHtml))
                    {
                        extraHtml.forEach(function(extHtml,ind){
                            extLeft = left;
                            extTop = top;
                            if(extHtml.innerHtml)
                            {
                                if(extHtml.positionPlus && extHtml.positionPlus.left)
                                {
                                    extLeft += extHtml.positionPlus.left;
                                }
                                if(extHtml.positionPlus && extHtml.positionPlus.top)
                                {
                                    extTop += extHtml.positionPlus.top;
                                }
                                $('body').append('<div parentSelector="'+act.selector.self+'" id="'+markerId+'ExtraHtml'+ind+'" class="drawGuiderMarkerDiv dgmdExh hlx-tip-ping '+markerId+'" style="z-index: '+(useZindex)+'; left: '+extLeft+'px; top: '+extTop+'px;">'+extHtml.innerHtml+'</div>');

                            }
                        });
                    }

                    if(act.audio)
                    {
                        let audio = document.getElementById('productTrailAudio');
                        let source = document.getElementById('productTrailAudioSource');
                        source.src = audiosHostname+act.audio.src;
                        audio.load(); //call this to just preload the audio without playing
                        audio.play();
                    }



                    $('body').append('<div parentSelector="'+act.selector.self+'" id="'+markerId+'" class="drawGuiderMarkerDiv hlx-tip-ping '+addClass+'" style="z-index: '+(useZindex)+'; left: '+left+'px; top: '+top+'px;"><div class="h-three"><div class="mouse"><div class="line"></div><div class="wheel"></div><div class="click"></div></div>'+divStr+' <a id="'+markerId+'Close" class="close" >x</a></div></div>');
                    guiderTracker[CryptoJS.MD5(act.selector.self)]=1;
                    if(autoFocus)
                    {
                        $('html,body').animate({
                                scrollTop: (($('#'+markerId).offset().top)-200)},
                            1000);
                    }


                    if(highlightTheGuiderOnly) //Highlight the guider Only.
                        this.setMaskFunc(highSel,pickMyZIndex,false);

                    guiderMarkerCloseEvents.forEach(function(event){
                        let eventName = event+"."+"drawGuiderMarkerEvent";
                        let bindObj=highSel;
                        if(inputEvents.indexOf(event)!=-1 && selObj!=monObj)
                        {
                            bindObj=highSelMon;
                            let changeDetectFunc=function() {
                                if(monObj.hasAttribute('oldValue')
                                    && self.findElementValue(monObj)
                                    && monObj.getAttribute('oldValue') != self.findElementValue(monObj))
                                {
                                    highSelMon.trigger('change');
                                }
                                else
                                {
                                    let observeSetTimeOut = {type:'guiderMarkerCloseEvents-changeDetectFunc',id:null};
                                    observeSetTimeOut.id = setTimeout(changeDetectFunc,100);
                                    setTimeOutCache.push(observeSetTimeOut);
                                }
                            };
                            let observeSetTimeOut = {type:'guiderMarkerCloseEvents-changeDetectFunc',id:null};
                            observeSetTimeOut.id = setTimeout(changeDetectFunc,100);
                            setTimeOutCache.push(observeSetTimeOut);
                        }


                        bindObj.unbind(eventName).bind(eventName, function() {
                            if(bindObj.context!=highSelMon.context )
                            {
                                return true;
                            }
                            if(inputFields.indexOf(bindObj.prop('tagName').toLowerCase())!=-1
                                && inputEvents.indexOf(event)==-1
                                && bindObj.prop('type').toLowerCase()!='button')
                            {
                                return true;
                            }
                            if($('#'+markerId).length>0)
                            {
                                guiderOpenFlag=false;
                            }
                            guiderTracker[CryptoJS.MD5($('#'+markerId).attr('parentSelector'))]=1;

                            let observeSetTimeOut = {type:'guiderMarkerCloseEvents-remove',id:null};
                            observeSetTimeOut.id = setTimeout(function(){$('#'+markerId).remove();},timeoutClose*1000);
                            setTimeOutCache.push(observeSetTimeOut);
                        });

                    });

                    setTimeout(function () {

                        $('#'+markerId+'Close, #'+markerId+',.'+markerId).bind('blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit', function(event){
                            event.stopPropagation();
                        });

                        $('#'+markerId+'Close').click(function(){
                            guiderOpenFlag=false;
                            guiderTracker[CryptoJS.MD5($('#'+markerId).attr('parentSelector'))]=1;
                            $('#'+markerId).remove();
                            $('.'+markerId).remove();
                        });

                        $('#'+markerId+',.'+markerId).click(function(){
                            guiderOpenFlag=false;
                            guiderTracker[CryptoJS.MD5($('#'+markerId).attr('parentSelector'))]=1;
                            $('#'+markerId).remove();
                            $('.'+markerId).remove();
                        });

                        $('.dgmdExh').mouseover(function(){
                            $('.dgmdExh').remove();
                        });

                    }, 0);

                }
                //return true;
            }
        }else
        {
            console.log("no element found");

        }
    }

    displayMessage(actTask,triggerCallback)
    {
        this.dialogPopup(actTask,triggerCallback);
    }

    dialogPopup(content,callback) {
        let that = this;
        let closeIcon=true;
        if(this.productWalk.activeMilestone && (content.html.template=='welcome' || content.html.template=='afterCompleteMilestone'))
        {
            if(this.productWalk.activeMilestone.hasOwnProperty('hideCloseFirstUse')
                && this.productWalk.activeMilestone.hideCloseFirstUse
                && (!this.productWalk.user.hasOwnProperty('completedMilestones')
                    || !this.productWalk.user.completedMilestones.hasOwnProperty('FDCHAPT1')
                    || !this.productWalk.user.completedMilestones.FDCHAPT1.hasOwnProperty(this.productWalk.activeMilestone.id))
                && (!this.productWalk.user.hasOwnProperty('failedTrace')
                    || !this.productWalk.user.failedTrace.hasOwnProperty('FDCHAPT1')
                    || !this.productWalk.user.failedTrace.FDCHAPT1.hasOwnProperty(this.productWalk.activeMilestone.id))
            )
            {
                closeIcon=false;
            }
        }
        
        if(this.certification && openedDialog && openedDialog.$jconfirmBox)
        {
            openedDialog.close();
        } 
        
        let d = openedDialog = $.dialog({
            title: '',
            closeIcon: closeIcon,
            content: this.importTemplate(content),
            onOpen: function(){
                if(that.productWalk.activeMilestone 
                    && that.productWalk.activeMilestone.hasOwnProperty('showVideoButtonGuider')
                    && that.productWalk.activeMilestone.showVideoButtonGuider
                    && that.productWalk.activeMilestone.hasOwnProperty('guideMarkers')
                    && Array.isArray(that.productWalk.activeMilestone.guideMarkers) )
                {
                    guiderTracker={};
                    let timeout=5;
                    if(messageBoxGuidertimer)
                    {
                        timeout=messageBoxGuidertimer;
                    }
                    guideMarkerIntervalId =  setInterval(function () {
                        guiderChecked=0;
                        if(guiderOpenFlag===true)
                            return;
                        console.log("Messagebox guideMarkers after timeout:: ");
                        console.log(that.productWalk.activeMilestone.guideMarkers);
                        if(Array.isArray(that.productWalk.activeMilestone.guideMarkers))
                        {
                            for(let i=0; i<that.productWalk.activeMilestone.guideMarkers.length; i++) {
                                let guideMarkersSel=that.productWalk.activeMilestone.guideMarkers[i];
                                let onlyOneElement = false;
                                if(guideMarkersSel.onlyOneElement)
                                {
                                    onlyOneElement = guideMarkersSel.onlyOneElement;
                                }
                                let response=that.drawGuiderMarkerDiv(that.productWalk.activeMilestone, i,onlyOneElement, 999999999);
                                if(response===true)
                                    break;
                            }
                        }
                    }, timeout*1000);
                }
                that.dialogCloseEventBind(callback.onExit);
                this.$content.find('#next, #nextMsg').click(function(){
                    d.close();
                    if(callback.onSuccess)
                    {
                        callback.onSuccess();
                    }
                    else
                    {
                        callback();
                    }

                });
                this.$content.find('#doitnow').click(function(){
                    d.close();
                    if(Object.keys(that.productWalk).length)
                    {
                        that.productWalk.doItNow = true;
                    }
                    if(callback.onSuccess)
                    {
                        callback.onSuccess();
                    }
                    else
                    {
                        callback();
                    }

                });
                this.$content.find('.nextMilestone').click(function(){
                    d.close();
                    if(callback.onSuccess)
                    {
                        callback.onSuccess();
                    }
                    else
                    {
                        callback();
                    }

                });
                this.$content.find('#nextVideo').click(function(){
                    d.close();
                    if(callback.nextVideo)
                    {
                        callback.nextVideo();
                    }

                });
                this.$content.find('#skip').click(function(){
                    d.close();
                    if(callback.onSkip)
                    {
                        callback.onSkip();
                    }
                });
                this.$content.find('#viewAll').click(function(){
                    d.close();
                    if(callback.viewAll)
                    {
                        callback.viewAll();
                    }
                });
                this.$content.find('#exit').click(function(){
                    d.close();
                    if(callback.onExit)
                    {
                        callback.onExit();
                    }
                });
                this.$content.find('#watch,#watchAgain').click(function(){
                    d.close();
                    that.watchVideo(that.productWalk.activeMilestone,callback.watchAgain);
                });
                this.$content.find('#watchOther').click(function(){
                    d.close();
                    that.watchOtherVideo(callback);
                });
                this.$content.find('#watchOtherBegin').click(function(){
                    d.close();
                    that.watchOtherVideo(callback,false);
                });
                this.$content.find('.redeem-now').click(function(){

                    that.loadPlan();
                });
            },
            onClose: function(isChildCall){
                if(Object.keys(that.productWalk).length)
                {
                    that.productWalk.domHelper.clearGuideMarkerTimout();
                }
            }
        });

//        this.dialogCloseEventBind(callback.onExit);

    }
    loadPlan()
    {
        this.productWalk.productWalkServer.loadplans(function(content){
            var b = openedDialog = $.dialog({
                bootstrapClasses: {
                    container: 'upgrade-plan-list'
                },
                title: '',
                content: "<div id='loadplans'>"+content+"</div>",
                onOpen: function(){
                    var that = this;

                }
            });
        });
    }
    dialogCloseEventBind(callback)
    {
        var self = this;
//        setTimeout(function () {
        $(".jconfirm-closeIcon").unbind(".productTrailClose");
        if(!$("#productTrailVideoDialog").length)
        {
            console.log($(".jconfirm-closeIcon"));
            $(".jconfirm-closeIcon").on("click.productTrailClose", function () {
                console.log('closing Product Trail..');
                if(self.certification && self.certification.stop)
                {
                    self.certification.stop();
                }
                else if(self.productWalk && self.productWalk.user && self.productWalk.user.status == 'done')
                {
                    self.productWalk.productTrailExitHandler();
                }else if(callback)
                {
                    callback();
                }
                else if(self.productWalk && self.productWalk.productTrailExitHandler)
                {
                    self.productWalk.productTrailExitHandler();
                }

                $('#startTrailOvrl').tooltip('enable').tooltip('open');
            });
        }
//
//        }, 1000);
    }
    watchOtherVideo(fromStart)
    {
        if(fromStart)
        {
            this.productWalk.letsStart = true;
        }
        let competedMilestone = this.productWalk.user.completedMilestones;
        let skippedMilestone = this.productWalk.user.skipedMilestones;
        let balance = this.calBalance(this.productWalk.user.completedMilestones);
        let content = '<h3>Video List</h3>';

        var that =this;
        let productWalkList = that.productWalk.productWalks;
        console.log(productWalkList);
        let data = {};
        jQuery.each(productWalkList,function(pId,pTrail){
            data[pId] = {"groups":{},"title":pTrail.title};
            let groups = {};

            console.log(that.productWalk.productWalkTaskList[pId]);

            jQuery.each(that.productWalk.productWalkTaskList[pId],function(mId,mile){
                if(!groups[mile['groupcode']])
                {
                    groups[mile['groupcode']] = {"title":groupCodeTitles[mile['groupcode']],"milestones":{}};
                }
                let mileCp=JSON.parse(JSON.stringify(mile));
                if(pTrail.milestoneList[mId] && pTrail.milestoneList[mId].points)
                {
                    mileCp.points=pTrail.milestoneList[mId].points;
                    console.log(mileCp);
                    groups[mile['groupcode']]['milestones'][mId] = mileCp;
                }

            });
            data[pId]['groups'] =  groups;
        });
        console.log(data);
        content = content+ '<div id="searchDiv"><input type="text" id="watchotherSearch" placeholder="Search Video" /></div>';
        content = content+"<div class = 'watchothervideos'>";
        jQuery.each(data,function(pId,pTrail){

            content = content+'<div><h2>'+pTrail.title+'</h2>';
            jQuery.each(pTrail['groups'],function(gCode,group){
                if(group.title && group.title!== undefined)
                {
                    content = content+'<div class="sub-category"><h3>'+group.title+'</h3><ul class="clearfix">';
                    jQuery.each(group['milestones'],function(mId,mile){
                        let statusClass="";
                        if(competedMilestone && competedMilestone.hasOwnProperty(pId) && competedMilestone[pId].hasOwnProperty(mId))
                            statusClass=" task-completed ";
                        else if(skippedMilestone && skippedMilestone.hasOwnProperty(pId) && skippedMilestone[pId].hasOwnProperty(mId))
                            statusClass=" task-skipped ";
                        content = content+'<li class="'+statusClass+'"><a href="javascript:void(0)" productTrailId = "'+pId+'" milestoneId= "'+mId+'" class="watchfromotherlink">'+mile.title+' <span class="task-status"></span> <span class="task-points">$'+mile.points+'</span></a></li>';
                    });
                    content = content+'</ul></div>';
                }
            });
            content = content+'</div>';

        });
        content = content+"</div>";

        content = content +
            '<div class="score clearfix"><div class="float-left tasks-count">Done: <span class="text-brown">' + this.taskCount(competedMilestone) + ' Tasks</span></div>' +
            '<div class="float-right"><a href="#" class="redeem-now">Redeem now</a></div>' +
            '<div class="float-right your-balance"><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span></div></div>';


        var b = openedDialog = $.dialog({
            bootstrapClasses: {
                container: 'youtube-panel-list'
            },
            title: '',
            content: content,
            onOpen: function(){
                that.dialogCloseEventBind(function(){
                    that.productWalk.startMilestone('watchOtherVideo > dialogCloseEventBind');
                });

                var selfDialog = this;
                this.$content.find('.watchfromotherlink').click(function(){

                    let pWalkId = $(this).attr( "producttrailid" );
                    let milestoneId = $(this).attr( "milestoneid" );
                    let milestone = that.productWalk.productWalks[pWalkId]['milestoneList'][milestoneId];

                    that.productWalk.setCurrentMilestone(milestone);
                    //that.watchVideo(milestone,function(){
                    selfDialog.close();
                    let pWalk = that.productWalk.productWalks[pWalkId];
                    //let newMilestone = that.productWalk.taskList[milestoneId];
                    let newMilestone =    Object.assign(pWalk.milestoneList[milestoneId], that.productWalk.taskList[milestoneId]);
                    that.productWalk.setCurrentProductWalk(pWalk);
                    that.productWalk.setCurrentMilestone(newMilestone);

                    let chkPointActivity =    that.productWalk.taskList[milestone.id].activityList[newMilestone.initActivity];
                    that.productWalk.setCurrentActivity(chkPointActivity);
                    that.productWalk.userCurrentActivity(newMilestone,chkPointActivity);

                    that.productWalk.letsStart = false;
                    that.productWalk.user.status = 'active';

                    that.productWalk.startMilestone('watchOtherVideo');
                    //});
                });
                $('#watchotherSearch').keyup(function(){

                    var searchText = $(this).val();
                    searchText = searchText.toLowerCase();
                    $('div.watchothervideos ul > li').each(function(){
                        let currentLiText = $(this).text();
                        currentLiText = currentLiText.toLowerCase();
                        let showCurrentLi = currentLiText.indexOf(searchText) !== -1;
                        $(this).toggle(showCurrentLi);
                    });
                    let observeSetTimeOut = {type:'watchotherSearch',id:null};

                    observeSetTimeOut.id = setTimeout(function () {
                        $('div.sub-category').each(function(){
                            $(this).show();
                            var hideLiCount = 0;
                            let myLi = $(this).find('ul > li');
                            myLi.each(function(){
                                hideLiCount =  $(this).is(":visible")?hideLiCount:++hideLiCount;
                            });
                            console.log(hideLiCount === myLi.length);
                            if(hideLiCount === myLi.length)
                            {
                                $(this).hide();
                            }
                            else
                            {
                                $(this).show();
                            }
                        });
                    }, 100);

                    setTimeOutCache.push(observeSetTimeOut);


                });

                this.$content.find('.redeem-now').click(function(){
                    that.loadPlan();
                });
            },
            onClose: function () {
//                that.productWalk.startMilestone('watchOtherVideo > dialogCloseEventBind');
            }
        });
//        this.dialogCloseEventBind(function(){
//            that.productWalk.startMilestone('watchOtherVideo > dialogCloseEventBind');
//        });
    }
    
    viewAllCertificateTask()
    {
        let content  = this.certification.getAllTaskView();
        if(openedDialog && openedDialog.$jconfirmBox)
        {
            openedDialog.close();
        }
        let that = this;
        var b = openedDialog = $.dialog({
            bootstrapClasses: {
                container: 'youtube-panel-list'
            },
            title: '',
            content: content,
            onOpen: function(){
               
                var selfDialog = this;
                this.$content.find('.startfromotherlink').click(function(){
                    let cid = $(this).attr( "cid" );
                    that.certification.start(cid);
                    selfDialog.close();
                });               
            },
            onClose: function () {
            }
        });
    }
    
    watchVideo(activeMilestone,callback)
    {
        //{"height": {"type": "viewp", "val": "1"}, "width": {"type": "ratio", "val" : "16/9"} }
        let videoType = 'youtube';
        if(!activeMilestone.hasOwnProperty('vedio') || activeMilestone.vedio.length <= 0)
        {
            if(callback.onSuccess)
            {
                callback.onSuccess();
            }
            else
            {
                callback();
            }
            return false;
        }
        if(activeMilestone.vedio[0].hasOwnProperty('type'))
            videoType = activeMilestone.vedio[0]['type'];
        let videoUrl = activeMilestone.vedio[0]['url'];
        let type = activeMilestone.vedio[0]['style']['height']['type'];
        let val = activeMilestone.vedio[0]['style']['height']['val'];
        let wType = activeMilestone.vedio[0]['style']['width']['type'];
        let wValue = activeMilestone.vedio[0]['style']['width']['val'];

        let w = window.innerWidth;
        let h = window.innerHeight;
        let wh = ($(window).height());
        if(type == 'viewp')
        {
            h = h*parseFloat(val);
            if(wType == 'ratio')
            {
                var arr = wValue.split("/");
                w = h*parseInt(arr[0])/parseInt(arr[1]);
            }

        }
        logData.state='videostart';
        let self  = this;
        logData.taskName=self.productWalk.user.activeMilestone.milestoneId;
        self.productWalk.productWalkServer.logEvent();
        var b;
        if(videoType=='stream')
        {
            b = $.dialog({
                bootstrapClasses: {
                    container: 'video-panel'
                },
                title: '',
                onOpen: function () {
                    let that=this;
                    $('.jconfirm-closeIcon').addClass('videoBox');
                    $("#streamVid").on("ended", function() {  that.close(); });
                },
                content: '' +
                    '<div style="overflow: scroll;height: '+wh+'px !important;"><video id="streamVid" style="width:100%;" controls="controls" autoplay="autoplpay" src="'+videosHostname+videoUrl+'"></video></div>',
                onClose: function(){
                    logData.state='videoend';
                    logData.taskName=self.productWalk.user.activeMilestone.milestoneId;
                    self.productWalk.productWalkServer.logEvent();
                    if(callback.onSuccess)
                    {
                        callback.onSuccess();
                    }
                    else
                    {
                        callback();
                    }
                }
            });
        }
        else {
            b = $.dialog({
                bootstrapClasses: {
                    container: 'youtube-panel'
                },
                title: '',
                content: '' +
                    '<iframe id="productTrailVideoDialog" src="'+videoUrl+'" frameborder="0" style="width:'+w+'px; height:'+h+'px;"></iframe>'
                ,
                onClose: function(){
                    logData.state='videoend';
                    logData.taskName=self.productWalk.user.activeMilestone.milestoneId;
                    self.productWalk.productWalkServer.logEvent();
                    if(callback.onSuccess)
                    {
                        callback.onSuccess();
                    }
                    else
                    {
                        callback();
                    }
                }
            });
        }
    }

    importTemplate(data)
    {
        console.log("importTemplate :: ");
        console.log(data);
        let template  = data.html.template+"_Template";
        if(!this[template])
        {
            console.log("'"+template+"' Template not defined");
            return;
        }
        
        let param  = {};
        if(this.productWalk.activeProductWalk)
        {
            let competedMilestone = this.productWalk.user.completedMilestones;
            let productWalkId = this.productWalk.activeProductWalk.id;
            let milestoneId = this.productWalk.activeMilestone.id;

            let isTaskCompletedBefore = this.isMilestoneCompletedBefore(productWalkId,milestoneId,competedMilestone);
            console.log("isTaskCompletedBefore ::");
            console.log([isTaskCompletedBefore,productWalkId,milestoneId]);

            param = {'isTaskCompleted': isTaskCompletedBefore};
            
        }
        let data2 = this.templateDataModifier(data.html, param);
        return this[template](data2);
    }

    templateTextParser(text)
    {
        if(!text.match(/{{(.*?)}}/g))
        {
            return text;
        }
        let replaceTo = {};
        var result = text.match(/{{(.*?)}}/g).map(function (val) {
            val = val.replace(/{{/g, '');
            return val.replace(/}}/g, '');
        });
        if(Object.keys(this.productWalk).length)
        {
            replaceTo = this.productWalk;
        }
        else if(Object.keys(this.certification).length)
        {
            replaceTo = this.certification;
        }
        
        console.log(replaceTo);
        
        jQuery.each(result,function(k,val){

            let arrVal = val.split("_");
            let txtVal;

            if(arrVal[2]
                && replaceTo[arrVal[0]]
                && replaceTo[arrVal[0]][arrVal[1]]
                && replaceTo[arrVal[0]][arrVal[1]][arrVal[2]])
            {
                txtVal = replaceTo[arrVal[0]][arrVal[1]][arrVal[2]];
            }
            else if(arrVal[1]
                && replaceTo[arrVal[0]]
                && replaceTo[arrVal[0]][arrVal[1]])
            {
                txtVal = replaceTo[arrVal[0]][arrVal[1]];

            } else if(arrVal[0]  && replaceTo[arrVal[0]])
            {
                txtVal = replaceTo[arrVal[0]];
            }
            console.log(txtVal);
            if(typeof txtVal === "function")
            {
                text = txtVal.call(replaceTo);
            }
            if(!(typeof txtVal === "object" || typeof txtVal === "array"))
            {
                text = text.replace("{{"+val+"}}", txtVal);
            }
            else
            {
                text = text.replace("{{"+val+"}}", "");
            }

        });

        return text;
    }
    calBalance(competedMilestone)
    {
        console.log("competedMilestone ::::");
        console.log(competedMilestone);

        let balance = 0;
        if(competedMilestone)
        {
            jQuery.each(competedMilestone,function(pId,pTrail){
                jQuery.each(pTrail,function(mId,milestone){
                    balance += (milestone.isReedemed)?0:parseInt(milestone.points);
                });
            });
        }
        return balance;
    }
    taskCount(competedMilestone)
    {
        let count = 0;
        if(competedMilestone)
        {
            jQuery.each(competedMilestone,function(pId,pTrail){
                jQuery.each(pTrail,function(mId,milestone){
                    count += 1;
                });
            });
        }
        return count;
    }
    /// templates down here
    welcome_Template(data)
    {
        let competedMilestone = this.productWalk.user.completedMilestones;
        console.log("welcome_Template >competedMilestone");
        console.log(competedMilestone);

        let balance = this.calBalance(this.productWalk.user.completedMilestones);
        let milestoneTitle = this.productWalk.activeMilestone.title;
        let milestoneDoItTitle = this.productWalk.activeMilestone.doItTitle;

        let content = ''+
            '<h3 class="text-uppercase ">Try it yourself &amp; <span class="big bold d-block">Collect <span class="text-green">$'+this.productWalk.activeMilestone.points+'</span></span></h3>' +
            '<button id="doitnow" type="button" class="btn btn-next ">'+milestoneDoItTitle+'</button><br>' +
            '<button id="watch" type="button" class="btn btn-yellow btn-watch-video">Watch Video</button>';
        //'<h5 class="text-uppercase">' + this.templateTextParser(data.message.text) + '</h5>';
        /*if(data.showWatchOtherVideoLink)
        	content = content+
        '<p class="text-grey"><a href="javascript:void(0)" id="watchOtherBegin" class="text-link">View All Tasks</a></p>';*/

        let vtLink = '';
        if(data.showWatchOtherVideoLink)
            vtLink='<a href="javascript:void(0)" id="watchOther" class="text-link">(View All)</a>';


        if(data.showbalance)
        {
            content = content +
                '<div class="score clearfix"><div class="float-left tasks-count">Done: <span class="text-brown">' + this.taskCount(competedMilestone) + ' Tasks </span>'+vtLink+'</div>' +
                '<div class="float-right"><a href="#" class="redeem-now">Redeem now</a></div>' +
                '<div class="float-right your-balance"><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span></div></div>';
        }
        content = content +
            '<div class="clearfix mt-10">'+
            '<div class="float-left pwdby">Powered by A.C.E. (Automated Coaching Engine)</div>'+
            '<div class="float-right"><div id="skip" class="btn-skip">Skip</div></div>'+
            '</div>';
        return content;
    }
    welcomeProductTrial(callback,overviewCallback)
    {
        let activeMilestone = this.productWalk.user.activeMilestone;
        console.log("welcomeProductTrial"+JSON.stringify(activeMilestone));
        var that = this;
        let content='';
        let closeIcon = false;
//        if(activeMilestone && activeMilestone.activityId)

        /*if(activeMilestone )
        {
            content = '' +
            '<h3 class="text-uppercase">WELCOME TO <span class="hotelogix">HOTELOGIX</span> TRIAL</h3>' +
            '<button id="take_a_overview" type="button" class="btn btn-block btn-yellow">Click to continue...</button>';
        }
        else
        {
            closeIcon = false;
            content = '' +
                    '<h3 class="text-uppercase">WELCOME TO <span class="hotelogix">HOTELOGIX</span> TRIAL</h3>' +
                    '<button id="take_a_overview" type="button" class="btn btn-block btn-yellow">TAKE A QUICK OVERVIEW</button>';
        }*/
        content = '' +
            '<h3 class="text-uppercase">WELCOME TO <span class="hotelogix">HOTELOGIX</span></h3>'+
            //'<h5 class="text-uppercase" style="color:#faff0b">You are in Learning Mode</h5>'+
            //'<div style="position:relative"><div class="christmas-offer"><div class="snow-left">&#10052;</div><div class="snow-right">&#10052;</div><h5><strong>Congratulations.</strong> You\'ve won!</h5><h4><strong>$25 </strong>FOR SIGNING UP</h4><button id="click_to_continue" type="button" class="btn btn-yellow">Explore with A.C.E.</button></div>'+
            '<button id="click_to_continue" type="button" class="btn btn-yellow">Explore with A.C.E.</button>'+
            '<div><strong>A.C.E. (Automated Coaching Engine)</strong><br>Take a guided walkthrough of the system!</div>'+
            '<div class="or-sep">OR</div>'+
            '<div id="wcGuId" class="hlx-tip-ping right left-click" style="display:none;z-index: 12000; left: 380px; top: 130px;"><div class="h-three" style="width:225px"><div class="mouse"><div class="line"></div><div class="wheel"></div><div class="click"></div></div><div>Click here & take World\'s First Assisted trial.</div> <a id="wcGuClose" class="close">x</a></div></div></div>'+
            '<button id="exit_welcome" type="button" class="btn btn-block btn-yellow">Continue on your own</button>' +
            //'<div class="small wel-footer">Powered by A.C.E. (Automated Coaching Engine)</div>'+
            '</div>';
            

        var b = openedDialog = $.dialog({
            bootstrapClasses: {
            },
            title: '',
            content: content,
            closeIcon: closeIcon,
            onOpen: function(){
                var self = this;
                console.log(this);
                this.$content.find('#click_to_continue').click(function(){
                    callback();
                    self.close();
                });
                /*this.$content.find('#take_a_overview').click(function(){
                    overviewCallback();
                    self.close();
                });*/
                this.$content.find('#exit_welcome').click(function(){
                    self.close();
                    that.drawStartTrialLink();
                });
                $('#wcGuId').show();
                $('#wcGuClose').click(function(){
                    $('#wcGuId').remove();
                });
            },

        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
            $('.jconfirm-closeIcon').click(function(){
                that.drawStartTrialLink(true);
            });
        }, 0);

    }
    
    welcomeProductCertificate(callback)
    {
        let currentCertificate = this.certification.ceritifyGroupTaskList[this.certification.user.certificationId];        
        
        console.log("welcomeProductCertificate"+JSON.stringify(currentCertificate));
        var that = this;
        let content='';
        let closeIcon = false;
        content = '' +
            '<h3 class="text-uppercase">WELCOME TO <span class="hotelogix">HOTELOGIX Certification Process</span></h3>'+
            '<button id="click_to_continue" type="button" class="btn btn-yellow">Continue</button>'+
            '<div><br>Take a Certificate of HOTELOGIX System!</div>'+
            '<div class="or-sep">OR</div>'+
            '<button id="exit_welcome" type="button" class="btn btn-block btn-yellow">Not Now</button>' +
            '</div>';

        var b = openedDialog = $.dialog({
            bootstrapClasses: {
            },
            title: '',
            content: content,
            closeIcon: closeIcon,
            onOpen: function(){
                var self = this;
                
                $($(this).get()[0]).find('#click_to_continue').click(function(){
                    console.log("click_to_continue");
                    callback();
                    self.close();
                });
                $(this).find('#exit_welcome').click(function(){
                    self.close();
                    that.drawStartCertificateLink();
                });
            }

        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
            $('.jconfirm-closeIcon').click(function(){
                that.drawStartCertificateLink(true);
            });
        }, 0);

    }

    /*currently Unused */
    finalCompleteProductTrial()
    {
        this.watchOtherVideo();
        return true;
        console.log("finalCompleteProductTrial");
        let content = '' +
            '<h3> <span class="hotelogix">Congrats</span></h3>' +
            '<h3>Your Learning Mode is Over</h3>' +
            '<h4>Now Have Fun with our Beauty</h4>';

        var b = openedDialog = $.dialog({
            bootstrapClasses: {
            },
            title: '',
            content: content,
            onOpen: function(){
                var that = this;
            }
        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
        }, 0);
    }

    startMilestoneAgain_Template(data)
    {
        let competedMilestone = this.productWalk.user.completedMilestones;
        let balance = this.calBalance(this.productWalk.user.completedMilestones);
        let milestoneTitle = this.productWalk.activeMilestone.doItTitle;

        let content = '' +
            '<h3 class="text-uppercase " ' + data.title.class + '>' + this.templateTextParser(data.title.text) + '</h3>';
        if(data.subTitle)
        {
            content = content+ '<h3 ' + data.title.class + '>' + this.templateTextParser(data.subTitle.text) + '</h3>';
        }
        content = content+
            '<div><button type="button" id="next" class="btn btn-next">' + milestoneTitle + '</button></div>'+
            '<div><button id="watch" type="button" class="btn btn-yellow btn-watch-video">Watch Video</button></div>';

        if(data.message)
        {
            content = content+'<h4>' + this.templateTextParser(data.message.text) + '</h4>';
        }
        if(data.showbalance)
        {
            content = content +
                '<div class="score clearfix"><div class="float-left tasks-count">Done: <span class="text-brown">' + this.taskCount(competedMilestone) + ' Tasks </span><a href="javascript:void(0)" id="watchOther" class="text-link">(View All)</a></div>' +
                '<div class="float-right"><a href="#" class="redeem-now">Redeem now</a></div>' +
                '<div class="float-right your-balance"><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span></div></div>';
        }
        content = content +
            '<div class="clearfix mt-10">'+
            '<div class="float-left pwdby">Powered by A.C.E. (Automated Coaching Engine)</div>'+
            '<div class="float-right"><div id="skip" class="btn-skip">Skip</div></div>'+
            '</div>';

        return content;
    }
    afterCompleteMilestone_Template(data)
    {
        let competedMilestone = {};
        let balance = '';
        if(this.productWalk.user)
        {
            competedMilestone = this.productWalk.user.completedMilestones;
            balance = this.calBalance(this.productWalk.user.completedMilestones);
        }
        if(!data.styleClass)
        {
            data.styleClass = '';
        }
        let content = '<div class="'+data.styleClass+'">' +
            '<div class="task-done"><i></i></div><h3 ' + data.title.class + '>' + this.templateTextParser(data.title.text) + '</h3>';
        if(data.subTitle)
        {
            content = content+ '<h3 ' + data.title.class + '>' + this.templateTextParser(data.subTitle.text) + '</h3>';
        }
        
        if(data.subTitle2 && this.templateTextParser(data.subTitle2.text)!=='')
        {
            content = content+ '<h4 class="text-uppercase">' + this.templateTextParser(data.subTitle2.text) + '</h4>'  ;
        }
        if(data.link1 && this.templateTextParser(data.link1.text)!=='')
        {
            content = content+ '<button id="doitnow" type="button" class="btn btn-yellow ">'+this.templateTextParser(data.link1.text)+'</button><br>' ;
        }
        if(data.link2 && this.templateTextParser(data.link2.text)!=='')
        {
            content = content+'<button id="watchNext" type="button" class="nextMilestone btn btn-yellow btn-watch-video">'+this.templateTextParser(data.link2.text)+'</button>';
        }
        if(data.onSkip && this.templateTextParser(data.onSkip.text)!=='')
        {
            content = content+'<button id="skip" type="button" class="btn btn-yellow">'+this.templateTextParser(data.onSkip.text)+'</button>';
        }
        if(data.viewAll && this.templateTextParser(data.viewAll.text)!=='')
        {
            content = content+'<a href="javascript:void(0)" id="viewAll" class="text-link">'+this.templateTextParser(data.viewAll.text)+'</a>';
        }

        //content = content+'<div><button type="button" id="skip" class="btn btn-skip">Skip</button></div>';


        if(data.message)
        {
            content = content+'<h4>' + this.templateTextParser(data.message.text) + '</h4>';
        }
        if(data.showbalance)
        {
            content = content +
                '<div class="score clearfix"><div class="float-left tasks-count">Done: <span class="text-brown">' + this.taskCount(competedMilestone) + ' Tasks </span><a href="javascript:void(0)" id="watchOther" class="text-link">(View All)</a></div>' +
                '<div class="float-right"><a href="#" class="redeem-now">Redeem now</a></div>' +
                '<div class="float-right your-balance"><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span></div></div>';
        }

        content = content +
            '<div class="clearfix mt-10">'+
            '<div class="float-left pwdby">Powered by A.C.E. (Automated Coaching Engine)</div>'+
            '</div>';
        content = content +'</div>';
        return content;
    }

    onlyMsg_Template(data)
    {
        let content = '' +
            '<h4>' + this.templateTextParser(data.message.text) + '</h4>'+
            '<button type="button" id="nextMsg" class="btn btn-yellow d-inline-block">Ok</button>';
        return content;
    }

    tryAgainMsg(callback)
    {
        console.log("tryAgainMsg");
        let content = '' +
            '<h3>Please Try Again</h3>';

        var b = openedDialog = $.dialog({
            bootstrapClasses: {
            },
            closeIcon: false,
            title: '',
            content: content
        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('bluebox');
//            $('.jconfirm-closeIcon').hide();
        }, 0);

        setTimeout(function () {
            b.close();
            callback();
        }, 2000);
        logData.state='failed';
    }

    trailEndAndRedeem()
    {
        let competedMilestone = this.productWalk.user.completedMilestones;
        console.log("tryAgainMsg");
        console.log(this.productWalk.user);
        let balance = 0;
        let that = this;
        if(this.productWalk.user && this.productWalk.user.completedMilestones)
        {
            balance = this.calBalance(this.productWalk.user.completedMilestones);
        }
        let content = '' +
            '<div class="task-done"><i></i></div>'+
            '<h3>CONGRATULATIONS</h3>'+
            '<h4><small>Completed all tutorials</small></h4>'+
            '<h4 class="bold text-blue">You are now a LEGIT user</h4>'+
            '<div><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span><a id="redeem-now" href="#" class="redeem-now">Redeem now</a></div>'+
            '<div><a href="javascript:void(0)" id="watchOther" class="text-link">View All Tasks</a></div>'+
            '<div class="coming-soon">'+
            '<h4>What’s Coming -</h4>'+
            '<p><b>200+ Tutorials</b> on Hotel Operations, Online Distribution, Backoffice & Setup</p>'+
            '<p><b>Automated</b> Predictive Learning Certification</p>'+
            '<p>Be a <b>certified</b> expert & champ on Hotelogix platform</p>'+
            '<p><b>24*7</b> Real-Time Support powered by our Predictive Learning Engine</p>'+
            '<p><b>On Demand</b> Learning Guides for New features, as and when they come</p>'+
            '<p>Subscribe to <b>discounted plans</b> with Redeemable <span class="text-green">$$</span> rewards</p>'+
            '<h4>FAQs</h4>'+
            '<p class="question">What if I sign up now? Do I need to complete all tutorials</p>'+
            '<p>You can redeem <span class="text-green">$$</span> earned anytime to pay for your future subscriptions</p>'+
            '<h4>Videos Coming Soon...</h4>'+
            '<p class="video-coming-soon">TravelAgent & Corporate Bookings</p>'+
            '<p class="video-coming-soon">Manage Point of Sales</p>'+
            '<p class="video-coming-soon">Increase Online Bookings</p>'+
            '<p class="video-coming-soon">Improve Revenue Management with Automated RMS</p>'+
            '<p class="video-coming-soon">Manage Booking Deposits</p>'+
            '<p class="video-coming-soon">Use Promotional Codes </p>'+
            '<p class="video-coming-soon">Using House Keeping Module</p>'+
            '<p class="text-grey">And many more...</p>'+
            '</div>'+
            '<h5 class="tag-line">Learn &nbsp; <span class="text-grey">&bull;</span> &nbsp; <span class="text-green">Earn</span> &nbsp; <span class="text-grey-777">&bull;</span> &nbsp; Repeat</h5>'+
            '<div class="score clearfix"><div class="float-left tasks-count">Done: <span class="text-brown">' + this.taskCount(competedMilestone) + ' Tasks</span></div>' +
            '<div class="float-right"><a id="redeem-now-footer" href="#" class="redeem-now">Redeem now</a></div>' +
            '<div class="float-right your-balance"><span class="text-lead">Your Balance: <span class="text-green">$' + balance + '</span></span></div></div>';

        var b = openedDialog = $.dialog({
            bootstrapClasses: {
            },
            title: '',
            content: content,
            onOpen: function(){

            }
        });
        setTimeout(function () {
            $('.jconfirm-box').addClass('congratulations-panel');
            $('#redeem-now, #redeem-now-footer').click(function(){
                b.close();
                that.drawStartTrialLink();
                that.loadPlan();
            });
            $('.jconfirm-closeIcon').click(function(){
                that.drawStartTrialLink(true);
            });
            $('#watchOther').click(function(){
                b.close();
                that.watchOtherVideo(callback);
            });
        }, 0);
    }

    irfDataCollectorPropertSetup(callback)
    {
        let url = irfSubUrl;
        this.irfDataCollector(callback,url);
    }
    irfDataCollectorRoomTypes(callback)
    {
        let url = irfSubUrl+'#/room-types';
        this.irfDataCollector(callback,url);
    }
    irfDataCollectorDefaultSettings(callback)
    {
        let url = irfSubUrl+'#/default-settings';
        this.irfDataCollector(callback,url);
    }
    irfDataCollectorSendMail_BasicSetup(callback)
    {
        this.productWalk.productWalkServer.sendMailIrfSub(callback,{"type":"sendIrfData","template":"BasicSetup"});
    }
    irfDataCollectorSendMail_RoomTypes(callback)
    {
        this.productWalk.productWalkServer.sendMailIrfSub(callback,{"type":"sendIrfData","template":"RoomTypes"});
    }
    irfDataCollectorSendMail_DefaultSettings(callback)
    {
        this.productWalk.productWalkServer.sendMailIrfSub(callback,{"type":"sendIrfData","template":"DefaultSettings"});
    }
    trialStartedSendMail(callback)
    {
        this.productWalk.productWalkServer.sendMailIrfSub(callback,{"type":"trialStarted"});
    }
    irfDataCollector(callback,irfUrl)
    {
        //	                '<video width="'+w+'" height="'+h+'" autoplay="autoplpay" src="'+videoUrl+'"></video>',

        let w = $(window).width();
        let h = $(window).height();
        console.log(irfUrl);
        //@var irfSubUrl defined in view/reservation/frontdesk.phtml
        console.log(w,h);
        irfDataCollectorDialog = $.dialog({
            bootstrapClasses: {
                container: 'irf-panel'
            },
            title: '',
            content: '' +
                '<iframe id="productTrailIRFSubDialog" src="'+irfUrl+'" frameborder="0" style="width:'+w+'px; height:'+h+'px;"></iframe>'
            ,
            onClose: function(isChildCall){
                if(callback && callback.onSuccess && isChildCall)
                {
                    callback.onSuccess();
                }
                else if(callback && callback.onExit)
                {
                    callback.onExit();
                }
                else if(callback && callback.onSkip)
                {
                    callback.onSkip();
                }
                else if(callback)
                {
                    callback();
                }
            }
        });
    }

    irfDataCollectorCallback()
    {
        irfDataCollectorDialog.close(true);
    }

    isMilestoneCompletedBefore(pId,milestoneId,completedMilestones)
    {
        let res = false;
        if(completedMilestones && completedMilestones[pId] && completedMilestones[pId][milestoneId]
            && completedMilestones[pId][milestoneId].noOfTimes>1)
        {
            res = true;
        }

        return res;
    }

    templateDataModifier(data,param)
    {
        let data2 = {};
        jQuery.each(data,function(k,m){
            data2[k] = m;
            if(param['isTaskCompleted'] && data[k+'_NoReward'])
            {
                data2[k] = data[k+'_NoReward'];
            }
        });
        return data2;
    }

    puaseAudio()
    {
        let audio = document.getElementById('productTrailAudio');
        let source = document.getElementById('productTrailAudioSource');
        if(source && source.getAttribute("src")!== '')
        {
            audio.pause();
        }

    }
       
};