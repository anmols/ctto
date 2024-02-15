var hiderZindex=11999;
var intervalIntervalSec = 5;
var servercallIntervalSec = 3;
var guideMarkerIntervalId = undefined;
var guideMarkersTimeoutSec = 1;
var guideMarkersAutoCloseTimeoutSec = 1;
var highlightTheGuiderOnly = false;
var groupCodeTitles = {"HotelSetup":"Hotel Setup Forms","RSV_VIDEOS":"Single Reservation Videos","GRSV_VIDEOS":"Group Reservation Videos","PAYBILL_VIDEOS":"Payments & Billing Videos","ROOMOPERATION_VIDEOS":"Room Operations Videos","HOUSEKEPPING_VIDEOS":"HouseKeeping Operations Videos"};
var activeObservers=[];
var observerCounter=0;
var guiderMarkerCloseEvents = ['change', 'click', 'keyup','contextmenu'];
var inputEvents = ['change', 'keyup'];
var inputFields=['select', 'input','textarea','radio','checkbox'];
var drawGuiderMarkerIdCounter = 0;
var guiderOpenFlag=false;
var guiderChecked=0;
var postServercallWait = 1;
var guiderTracker = {};
var irfDataCollectorDialog = '';
var introMainDivMaxWidth=300;
var introDescDivMaxWidth=300;
var markerLength=26;
var introDivmargins=115;
var tutorialRunning = false;
var isVideoOpen=false;
var defaultMutationTimeout=120;
var utcDateString="";
var videosHostname='http://plgmedia.staygrid.com/videos';
var audiosHostname='http://plgmedia.staygrid.com/audios';
var openedDialog = undefined;
var milestoneJustRestart = false;
var highlighterDelayTimer = 0.1;
var highLtrTopAdj = 71;
var highLtrBottomAdj = 30;
var apiCallQueue = {};
var logData={};
var messageBoxGuidertimer=0.1;
var ungIdsCacheArr = [];
var ignoreTick=false;
var setTimeOutCache = [];
var customCssClass = [];

var productTrialExternalTask = function()
{
    $("#PanelAutoNA").hide();
    $("#PanelAutoNA_mask").hide();
};
var SelectorIdentifierColor = '';
var ActivityType = '';
// status =  ['active','new','done','hold']

let  stateInterceptors = {
    "productWalk":{
        "beforeStart" : [
            {
                "type" : "event" ///black
            }
        ],
        "beforeNext":[
            {
                "type" : "event" ///black
            }
        ],
        "beforeEnd" : [
            {
                "type" : "event" ///black
            }
        ]
    },
    "milestone":{
        "beforeStartOnce" : [
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "X-Y_Selector": {
                        "selector": ""
                    },
                    "template" : "welcome",
                    "userType" : ["nonReward"],
                    "title": {class :"",text:"{{activeMilestone_heading}}"} ,
                    "subTitle" : {class :"",text:"{{activeMilestone_title}}"},
                    "message" : {class :"",text:"Earn \"<strong class='text-green'>$$</strong>\" while you learn <span class='text-capitalize'>(Redeemable)<span>"},
                    //"message_NoReward" : {class :"",text:""},
                    "showWatchOtherVideoLink": true,
                    "showbalance": true,
                    "showRedeemLink": true
                }

            }
        ],
        "beforeStart" : [
            {
                "type":"task",
                "taskList":[
                    {
                        "category":"dom",
                        "type":"trigger",
                        "whatToDo":"click",
                        "selector": {
                            "self": ".closebtn,.container-close,.btnSrShowClose-button,#btnSrShowClose-button,#msgCancelBtn-button, #srBtnCancel-button, #btnDNRCancel-button, [id^=yui-gen]:contains('No')"
                        }
                    },
                    {
                        "category":"none",
                        "object": "panelQRes",
                        "type":"hide",
                        "whatToDo":"call"
                    }
                ]
            },
            {
                "type" : "event" ///black
            }
        ],
        "beforeRestart":[
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "template" : "startMilestoneAgain",
                    "userType" : ["reward"],
                    "title" : {class :"",text:"Try it yourself & <span class='big bold d-block'>Collect <span class=\"text-green\">${{activeMilestone_points}}</span></span>"} ,
                    "title_NoReward" : {class :"",text:"Try it yourself & <span class='big bold d-block'>Collect <span class=\"text-green\">${{activeMilestone_points}}</span></span>"} ,
                    "link1" : {class :"",text:"{{activeMilestone_title}}"},
                    "showWatchOtherVideoLink": true,
                    "showbalance": true,
                    "showRedeemLink": true
                }
            },
            {
                "type":"task",
                "taskList":[
                    {
                        "category":"dom",
                        "type":"trigger",
                        "whatToDo":"click",
                        "selector": {
                            "self": ".closebtn,.container-close,.btnSrShowClose-button,#btnSrShowClose-button,#msgCancelBtn-button, #srBtnCancel-button, #btnDNRCancel-button, [id^=yui-gen]:contains('No')"
                        }
                    },
                    {
                        "category":"none",
                        "object": "panelQRes",
                        "type":"hide",
                        "whatToDo":"call"
                    }
                ]
            }
        ],
        "afterComplete":[
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "template" : "afterCompleteMilestone",
                    "userType" : ["reward"],
                    "title" : {class :"",text:"CONGRATULATIONS!"} ,
                    "subTitle" : {class :"",text:"YOU COLLECTED <span class=\"text-green\">${{activeMilestone_points}}<span>"} ,
                    "subTitle2" : {class :"",text:""},
                    "subTitle_NoReward" : {class :"",text:"YOU DID IT AGAIN!"} ,
                    "link1" : {class :"",text:"{{nextMilestone_doItTitle}} - Earn ${{nextMilestone_points}}"},                                       "link2" : {class :"",text:"Watch Video"},
                    "showWatchOtherVideoLink": true,
                    "showbalance": true,
                    "showRedeemLink": true,
                    "switchMileStone": true
                }
            },
            {
                "type":"task",
                "taskList":[
                    {
                        "category":"dom",
                        "type":"trigger",
                        "whatToDo":"click",
                        "selector": {
                            "self": ".closebtn,.container-close,.btnSrShowClose-button,#btnSrShowClose-button,#msgCancelBtn-button, #srBtnCancel-button, #btnDNRCancel-button, [id^=yui-gen]:contains('No')"
                        }
                    },
                    {
                        "category":"none",
                        "object": "panelQRes",
                        "type":"hide",
                        "whatToDo":"call"
                    }
                ]
            }
        ],
        "beforeEnd" : [
            {
                "type" : "event" ///black
            }
        ],
        "beforeSkip":[
            {
                "type" : "event" ///black
            }
        ]
    },
    "activity":{
        "beforeStart" : [
            {
                "type" : "event" ///black
            }
        ],
        "beforeNext":[
            {
                "type" : "event" ///black
            }
        ],
        "beforeEnd" : [
            {
                "type" : "event" ///black
            }
        ]
    }
};


let productWalk = class productWalk{

    constructor(productWalkId, productWalks,taskList,domHelper,stateInterceptors,productWalkServer,commonActivtyList) {
        this.productWalkId = productWalkId;
        this.productWalkTaskList = taskList;
        this.taskList = taskList[productWalkId];
        this.productWalks = productWalks;
        this.domHelper = domHelper;
        this.stateInterceptors = stateInterceptors;
        this.productWalkServer = productWalkServer;
        this.commonActivtyList = commonActivtyList;
        this.activeProductWalk={};
        this.activeMilestone={};
        this.activeActivity={};
        this.taskList = this.copyMappingActivity(this.taskList,this.commonActivtyList);
        this.activeStatus = ['active','stop','restart','',undefined];
    }

    load(callback)
    {
        console.log(' Load product Walk of :'+this.productWalkId);
        var that  = this;
        this.productWalkServer.getuser(function(data){

            console.log(' Load User data from server:');
            console.log(data);
            that.setUser (data);
            let user = that.getUser();
            // setting product walk object in domHelper for compplete access the
            // current state of the project walk
            that.domHelper.setProductWalk(that);

            var introMilestone = {};
            var introActivity = {};
            if(that.productWalks[that.productWalkId])
            {
                // find out which activity and milestone user doing currently
                let res = that.findUserProductWalk(that.productWalks,user,that.taskList);
                that.setCurrentProductWalk(res.productWalk);
                that.setCurrentMilestone(res.milestone);
                that.setCurrentActivity(res.activity);
                introMilestone = res.introMilestone;
                introActivity = res.introActivity;
            }
            else
            {
                console.log(" No product Walk found for Module : "+that.productWalkId);
            }
            if(user.status === 'stop')
            {
                that.domHelper.drawStartTrialLink(true);
            }
            else if(callback)
            {

                tutorialRunning = true;
                that.domHelper.welcomeProductTrial(callback,function()
                {
                    that.setCurrentMilestone(introMilestone);
                    that.setCurrentActivity(introActivity);
                    callback();
                });
            }
        });
    }

    replaceMappingValue(keyStr,value, hayStack)
    {
        let keyArr = keyStr.split('_');
        let str = '';
        keyArr.forEach(function(v){
            if(parseInt(v)>=0)
            {
                str += "["+v+"]";
            }
            else
            {
                str += "['"+v+"']";
            }
        });

        eval("hayStack"+str+"=value");
        return hayStack;
    }
    copyMappingActivity(taskList,commonActivity)
    {
        var self = this;
        jQuery.each(taskList,function(a,task){
            jQuery.each(task['activityList'],function(b,act){

                if(act.mapActivityRef && commonActivity[act.mapActivityRef])
                {
                    let obj = commonActivity[act.mapActivityRef];
                    let obj2 = JSON.parse(JSON.stringify(obj));
                    let newAct = JSON.parse(JSON.stringify(Object.assign(obj2,act)));
                    if(act.mapActivityXPath)
                    {
                        jQuery.each(act.mapActivityXPath,function(key,val){
                            newAct = self.replaceMappingValue(key,val,newAct);
                        });
                    }
                    taskList[a]['activityList'][b] = newAct;
                }

            });
        });
        return taskList;
    }
    findUserProductWalk(productWalkList,user,taskList)
    {
        console.log("findUserProductWalk ::");
        let res= {"productWalk":{},"milestone":{},'activity':{}};
        // if user comes FirstTime ,show first productwalk,first milestone
        if(user.activeMilestone && user.activeMilestone.productWalkId && user.activeMilestone.milestoneId)
        {
            let userMilestone = user.activeMilestone;
            let productWalk = productWalkList[user.activeMilestone.productWalkId];

            // if user was performing some of the milstone in prevoius session
            // start with the same
            let activeStatus = this.activeStatus;
            if(activeStatus.indexOf(user.status)!==-1)
            {
                res.productWalk = productWalk;
                if( userMilestone.milestoneId
                    && productWalk.milestoneList[ userMilestone.milestoneId])
                {
                    res.milestone = Object.assign( productWalk.milestoneList[ userMilestone.milestoneId], taskList[userMilestone.milestoneId]);
                }
                if(     userMilestone.activityId
                    && taskList[userMilestone.milestoneId]
                    && taskList[userMilestone.milestoneId].activityList
                    && taskList[userMilestone.milestoneId].activityList[ userMilestone.activityId])
                {
                    res.activity = taskList[userMilestone.milestoneId].activityList[ userMilestone.activityId];
                }
                else
                {
                    res.activity = taskList[userMilestone.milestoneId].activityList[taskList[userMilestone.milestoneId].initActivity];
                }
            }

        }else
        {
            console.log(user.status);
            let fistKey = Object.keys(productWalkList)[0];
            res.productWalk =  productWalkList[fistKey];
            let milestoneId =  productWalkList[fistKey].init_milestone_id;
            res.milestone = Object.assign( productWalkList[fistKey].milestoneList[milestoneId], taskList[milestoneId]);
            res.activity = taskList[milestoneId].activityList[taskList[milestoneId].initActivity];
        }
        let introMilestoneId =  res.productWalk.init_intro_milestone_id;
        res.introMilestone = Object.assign( res.productWalk.milestoneList[introMilestoneId], taskList[introMilestoneId]);
        res.introActivity = taskList[introMilestoneId].activityList[taskList[introMilestoneId].initActivity];

        return res;
    }
    shouldStartProductWalk()
    {
        // check if already pop up and block is there
        if(this.domHelper.isMaskEnabled())
        {
            return false;
        }
        // can start instantly if user is in active or new in Product Walk through
        if( this.user.status === 'new'
            ||  this.user.status === 'active')
        {
            return true;
        }
        return false;
    }

    isMilestoneShouldSkiped(pWalk,milestone,user)
    {
        let milestoneId = milestone.id;
        let pId = pWalk.id;
        let res = false;
        if(user.completedMilestones && user.completedMilestones[pId])
        {
            jQuery.each(user.completedMilestones[pId],function(k,m){
                if(m.milestoneId === milestoneId)
                {
                    res = true;
                }
            });
        }
        if(user.skipedMilestones && user.skipedMilestones[pId])
        {
            jQuery.each(user.skipedMilestones[pId],function(k,m){
                if(m.milestoneId === milestoneId)
                {
                    res = true;
                }
            });
        }
        return res;
    }

    getCurrentEvents ()
    {
        return this.ce;
    }
    setCurrentEvents(c)
    {
        this.ce = c;
    }
    getCurrentEventHandler ()
    {
        return this.ceh;
    }
    setCurrentEventHandler (c)
    {
        this.ceh = c;
    }

    setCurrentProductWalk (pw)
    {
        this.activeProductWalk = pw;
    }
    getCurrentProductWalk ()
    {
        return this.activeProductWalk;
    }
    setUser (u)
    {
        this.user = u;
    }
    getUser ()
    {
        return this.user;
    }

    setCurrentMilestone (ml)
    {
        this.activeMilestone = ml;
    }
    getCurrentMilestone ()
    {
        return this.activeMilestone;
    }
    setNextMilestone (ml)
    {
        this.nextMilestone = ml;
    }
    getNextMilestone ()
    {
        return this.nextMilestone;
    }

    setCurrentActivity(act)
    {
        this.activeActivity = act;
    }
    getCurrentActivity()
    {
        return this.activeActivity;
    }

    userCurrentActivity(milestone,activity)
    {
        if(activity.checkpointId)
        {
            this.user.activeMilestone.activityId = activity.checkpointId; // @TODO  add checkpointId
        }
        else
        {
            this.user.activeMilestone.activityId =  milestone.initActivity;
        }
    }
    userStartedNewMilestone(productWalk,milestone)
    {
        this.user.activeMilestone = {
            "productWalkId" :productWalk.id,
            "milestoneId" :milestone.id,
            "activityId":"",
            "startTime":new Date(),
            "endTime":"",
            "timeSpend":"",
            "points" : milestone.points
        };

    }
    userCompletedMilestone()
    {
        console.log("userCompletedMilestone ::");
        let activity = this.getCurrentActivity();
        this.defuseAllEventListneres(activity);

        let walkId = this.user.activeMilestone.productWalkId;
        let milestoneId = this.user.activeMilestone.milestoneId;
        if(!this.user.completedMilestones)
        {
            this.user.completedMilestones = {};
        }
        if(!this.user.completedMilestones[walkId])
        {
            this.user.completedMilestones[walkId] = {};
        }
        if(!this.user.completedMilestones[walkId][milestoneId])
        {
            this.user.completedMilestones[walkId][milestoneId] = {};
        }

        if(Object.size(this.user.completedMilestones[walkId][milestoneId])===0)
        {
            let activeMilestone=this.user.activeMilestone;
            let nxtMilestone=this.getNextMilestone();
            activeMilestone.milestoneId=nxtMilestone.id;
            activeMilestone.activityId=nxtMilestone.initActivity;
            activeMilestone.noOfTimes = 1;
            this.user.completedMilestones[walkId][milestoneId] = activeMilestone;
            this.user.completedMilestones[walkId][milestoneId]["endTime"] =  new Date();
            this.user.status = 'active';

        }
        else
        {
            let noOfTimes = parseInt(this.user.completedMilestones[walkId][milestoneId].noOfTimes);
            noOfTimes+=1;
            this.user.completedMilestones[walkId][milestoneId].noOfTimes = noOfTimes;
        }
        logData.state='success';
        this.productWalkServer.updateUser(this.user,function(){
            console.log("update user walk state success");
        },function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });

    }
    userSkipedMilestone()
    {
        console.log("userSkipedMilestone ::");
        this.defuseAllEventListneres(this.getCurrentActivity());

        let walkId = this.user.activeMilestone.productWalkId;
        let milestoneId = this.user.activeMilestone.milestoneId;
        if(!this.user.skipedMilestones)
        {
            this.user.skipedMilestones = {};
        }
        if(!this.user.skipedMilestones[walkId])
        {
            this.user.skipedMilestones[walkId] = {};
        }
        if(!this.user.skipedMilestones[walkId][milestoneId])
        {
            this.user.skipedMilestones[walkId][milestoneId] = {};
        }
        this.user.skipedMilestones[walkId][milestoneId] = this.user.activeMilestone;
        this.user.skipedMilestones[walkId][milestoneId]["endTime"] =  new Date();

        this.user.status = 'active';
        logData.state='skipped';
        this.productWalkServer.updateUser(this.user,function(){
            console.log("update user walk state success");
        },function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });
        var self = this;
        self.switchToNextIf(
            self.getCurrentProductWalk(),
            self.getCurrentMilestone(),
            {},
            function(){
                //self.domHelper.removeMaskLayer(true);
                console.log('switch to next activity success');
            },
            function(){
                console.log('switch to next activity fail');
            },
            true
        );
    }

    userFailedTraceCapture(traceParamData)
    {
        console.log('userFailedTraceCapture start');
        let walkId = this.user.activeMilestone.productWalkId;
        let milestoneId = this.user.activeMilestone.milestoneId;
        let activity = this.getCurrentActivity();
        let activityId = activity.id;
        if(!this.user.failedTrace)
        {
            this.user.failedTrace = {};
        }
        if(!this.user.failedTrace[walkId])
        {
            this.user.failedTrace[walkId] = {};
        }
        if(!this.user.failedTrace[walkId][milestoneId])
        {
            this.user.failedTrace[walkId][milestoneId] = {};
        }
        if(!this.user.failedTrace[walkId][milestoneId][activityId])
        {
            this.user.failedTrace[walkId][milestoneId][activityId] = {};
        }

        let traceData = traceParamData;
        let unixTimeStamp =  traceData["unixTimeStamp"];
        traceData["timeStamp"] =  new Date();
        traceData.data = JSON.stringify(traceData.data);

        this.user.failedTrace[walkId][milestoneId][activityId][unixTimeStamp] = traceData;

    }
    // lets start the product walk based in previous session
    startProductWalk(letsStart)
    {
        this.productWalkServer.startProductTraining();
        console.log("start ProductWalk : "+this.activeProductWalk.title);
        this.letsStart = letsStart;
        let beforeStart =  this.stateInterceptors['productWalk']['beforeStart'];
        console.log(beforeStart);
        this.domHelper.htmlResolver(beforeStart,() => this.startMilestone('startProductWalk'));

    }

    startMilestone(callfrom)
    {
        let utcDate = new Date();
        utcDateString =  utcDate.toUTCString();
        console.log("start Milestone : ");
        console.log("callfrom :"+callfrom);
        console.log(this.activeMilestone.title);
        productTrialExternalTask();

        var self = this;
        let milestone = this.getCurrentMilestone();
        if(milestone.hideStartExitLink)
        {
            self.domHelper.removeStartExitLink();
        }
        else
        {
            self.domHelper.drawExitTrialLink();
        }

        let user = this.getUser();
        if( user.status === 'done')
        {
            this.domHelper.watchOtherVideo();
            //this.domHelper.trailEndAndRedeem();
            return;
        }

        this.user.status = 'active';
        this.productWalkServer.updateUser( this.getUser(),function(){},function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });

        let pWalk = this.getCurrentProductWalk();
        this.setNextMilestone(this.whatsNextMilestone(this.taskList,pWalk,milestone));

        this.userStartedNewMilestone(pWalk,milestone);
        let beforeStart = { "type" : "event"};
        let beforeStartFirst = { "type" : "event"};
        var callback = undefined;



        if((self.letsStart || milestone.letsStart) && self.doItNow === false)
        {
            self.letsStart = false;
            milestone.letsStart = false;
            self.setCurrentMilestone(milestone);
            beforeStartFirst = this.stateInterceptors['milestone']['beforeStartOnce'];
            callback =  () =>self.startMilestone('startMilestone');
        }
        else
        {
            self.letsStart = false;
            beforeStartFirst = this.stateInterceptors['milestone']['beforeRestart'];
        }
        beforeStart = this.stateInterceptors['milestone']['beforeStart'];

        if(milestone.skipMilestoneInterceptor === true)
        {
            beforeStart = { "type" : "event"};
            beforeStartFirst = { "type" : "event"};
            //self.letsStart = true;
        }
        if(self.doItNow === true)
        {
            beforeStartFirst = { "type" : "event"};
            //self.letsStart = true;
        }
        // reset to default
        self.doItNow = false;

        if(callback === undefined)
        {
            callback = function(){self.domHelper.htmlResolver(beforeStart,function(){
                    logData.state='taskstart';
                    logData.taskName=self.user.activeMilestone.milestoneId;
                    self.productWalkServer.logEvent();
                    self.domHelper.drawWatchAgainDiv();
                    self.startActivity();
                }
            );};
        }

        self.domHelper.htmlResolver(beforeStartFirst,
            {
                "onSkip":function(){
                    self.letsStart = true;
                    self.userSkipedMilestone();
                    console.log('Skiping current actiivty: ');
                },
                "onExit":function(){
                    self.letsStart = true;
                    self.productTrailExitHandler('stop');
                    console.log('Exit from current actiivty: ');
                },
                "watchAgain":() =>self.startMilestone('startMilestone'),
                "onSuccess":function(){
                    callback();
                }
            }
        );
    }
    startActivity()
    {
        // puse audio during switch to next activity
        this.domHelper.puaseAudio();

        guiderTracker={};
        console.log("start Activity : "+this.activeActivity.title);
        var self = this;
        var i = 0;
        // save the current active state of the Activity in User Object

        // updateing user object as per which activity going on
        this.userCurrentActivity(this.getCurrentMilestone(),this.getCurrentActivity());
        console.log('activity beforeStart '+i++);
        // help to perform some basic common task
        // when any activity start(in future may be some)

        let beforeStart =   this.stateInterceptors['activity']['beforeStart'];
        this.domHelper.htmlResolver(beforeStart,{'onSuccess':function(){

                console.log('activity htmlResolver '+i++);
                self.setCurrentEvents({});
                self.resetEventtListnerProcess();
                // giving Message prompt what to do in this activity
                self.domHelper.highlighterResolver(self.getCurrentActivity());
                self.domHelper.htmlResolver(self.getCurrentActivity(),{
                    'onSuccess':function(){
                        console.log('activity startIf '+i++);
                        // check event fire to recognise activity going to start or not

                        self.cancelIf(self.getCurrentActivity(),function(){
                            //self.productTrailExitHandler('active');
                            self.domHelper.tryAgainMsg(function(){self.productTrailExitHandler('active');});
                            let unixTimeStamp = Math.floor(Date.now() / 1000);
                            let traceData = {"type":"cancelIf","data":self.getCurrentActivity(),'unixTimeStamp':unixTimeStamp};
                            self.userFailedTraceCapture(traceData);
                            //self.productTrailExitHandler('active');
                        });


                        ActivityType = 'startIf';
                        self.domHelper.guideMarkers(self.getCurrentActivity());
                        self.startIf(self.getCurrentActivity(),function(){
                            self.hider(self.getCurrentActivity());
                            self.defuseAllEventListneres(self.getCurrentActivity());
                            console.log('activity completeIf '+i++);
                            // this will monitor if it require other wise it will callback

//                        self.cancelIf(self.getCurrentActivity(),function(){
//                            self.productTrailExitHandler('active');
//                        });
                            ActivityType = 'completeIf';
//                        self.domHelper.guideMarkers(self.getCurrentActivity());
                            self.completeIf(self.getCurrentActivity(),function(){
                                    self.defuseAllEventListneres(self.getCurrentActivity());
                                    console.log('activity switchToNextIf '+i++);
                                    // help to decide what to perform next based on  multiple condition

//                             self.cancelIf(self.getCurrentActivity(),function(){
//                                    self.productTrailExitHandler('active');
//                                });

                                    self.disabler(self.getCurrentActivity());
                                    ActivityType = 'switchIf';
//                            self.domHelper.guideMarkers(self.getCurrentActivity());
                                    self.switchToNextIf(
                                        self.getCurrentProductWalk(),
                                        self.getCurrentMilestone(),
                                        self.getCurrentActivity(),
                                        function(){
                                            self.defuseAllEventListneres(self.getCurrentActivity());
                                            self.activityFootPrintCleaner();
                                            self.setCurrentEvents({});
                                            //self.domHelper.removeMaskLayer(true);
                                            console.log('switch to next activity success');
                                        },
                                        function(){
                                            console.log('switch to next activity fail');
                                        }
                                    );
                                },
                                function()
                                {
                                    console.log('activity not completed');
                                });
                        });

                    },
                    'onSkip':function(){
                        self.userSkipedMilestone();
                    },
                    'onExit':function(){
                        self.productTrailExitHandler('stop');
                    }
                });
            }});
    }
    cancelIf(act,success){

        //if(highlightTheGuiderOnly) // No need to handle cancelIf as only the required element is highlighted
        //return false;

        var self = this;
        if(Array.isArray(act.cancelIf))
        {

            for(let i=0;i<ungIdsCacheArr.length;i++)
            {
                $('#'+ungIdsCacheArr[i]).remove();
            }
            ungIdsCacheArr=[];

            jQuery.each(act.cancelIf,function(k,canSel){
                self.cancelIfHandler(canSel,act,success);
            });
        }
    }

    cancelIfHandler(canSel,act,success)
    {
        if(canSel.mode && canSel.mode === 'reject') // Default behaviour is canceler. If mode set to reject then it will work as a rejector
        {
            this.domHelper.rejecter(canSel,{});
        }else
        {
            this.domHelper.eventResolver(canSel,{
                'onSuccess':function(){
                    console.log('onSuccess cancelIf: '+act.title);
                    success();
                }
            });

        }

    }
    disabler(act){
        console.log("disabler :: ");
        console.log(act.disabler);
        var self = this;
        if(Array.isArray(act.disabler))
        {
            jQuery.each(act.disabler,function(k,disSel){
                self.domHelper.disableElement(disSel);
            });
        }
    }

    hider(act){
        console.log("hider :: ");
        console.log(act.hider);
        var self = this;
        if(Array.isArray(act.hider))
        {
            jQuery.each(act.hider,function(k,disSel){
                self.domHelper.hideElement(disSel);
            });
        }
    }

    activityFootPrintCleaner()
    {
        for(var i=0;i<activeObservers.length;i++)
        {
            this.closeObserver(activeObservers[i]);
        }
        activeObservers = [];

        for(let i=0;i<ungIdsCacheArr.length;i++)
        {
            $('#'+ungIdsCacheArr[i]).remove();
        }
        ungIdsCacheArr=[];

        this.domHelper.clearAllSetTimeOut();
        this.domHelper.removeDisabler();
        this.domHelper.removeHider();
        this.domHelper.removeMaskLayer(true);
        this.domHelper.clearGuideMarkerTimout();
        $('html, body').removeClass('scrollFix');
    }
    milsstoneFootPrintCleaner()
    {
        this.domHelper.drawWatchAgainDiv(true);     // removing div here
        $('html, body').removeClass('scrollFix');
    }

    resetEventtListnerProcess()
    {
        for(var i=0;i<activeObservers.length;i++)
        {
            this.closeObserver(activeObservers[i]);
        }
        activeObservers = [];
        var observerObj={"type": 'servercall', "id" : null, "counter": ++observerCounter};
        observerObj.id= setInterval(() => this.resetEventListner(), 2*1000);
        activeObservers.push(observerObj);
    }

    closeObserver(obj)
    {
        switch(obj.type)
        {
            case 'servercall':
                clearInterval(obj.id);
                break;
            default:
                break;
        }
    }
    productTrailExitHandler(userStatus){

        console.log("productTrailExitHandler :: "+userStatus);

        // puse audio during switch to next activity
        this.domHelper.puaseAudio();
        this.milsstoneFootPrintCleaner();
        this.activityFootPrintCleaner();
        let milestone = this.getCurrentMilestone();
        let activity = this.getCurrentActivity();

        this.defuseAllEventListneres(activity);
        let activityId = milestone.initActivity;
        if(activity && activity.checkpointId)
        {
            activityId = activity.checkpointId;
        }
        let chkPointActivity =    this.taskList[milestone.id].activityList[activityId];
        this.setCurrentActivity(chkPointActivity);
        this.userCurrentActivity(milestone,chkPointActivity);
        if(userStatus && userStatus.length>0)
        {
            this.user.status = userStatus;
        }

        this.productWalkServer.updateUser(this.user,function(){
            console.log("update user walk state save success from productTrailExitHandler ");
        },function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });

        if(openedDialog && openedDialog.$jconfirmBox)
        {
            openedDialog.close();
        }
        if(userStatus === 'active')
        {
            this.startMilestone('productTrailExitHandler > active');
        }
        else if(userStatus === 'restart')
        {
            return;
        }
        else if(userStatus === 'exit')
        {
            this.productWalkServer.stopProductTraining();
            this.user.status = 'stop';
            //logData.state='exited';
            this.productWalkServer.updateUser(this.user,function(){
                console.log("update user walk state save success from drawExitConfirm OK ");
            },function(){
                alert("Restarting again after Redeem Amount");
                window.location.reload();
            });
            this.domHelper.drawStartTrialLink();
        }
        else
        {
            this.domHelper.drawExitConfirm(()=>this.startMilestone('productTrailExitHandler'), () => this.productWalkServer.stopProductTraining());
        }
//    	this.stopProductTraining();
    }

    startIf(act,callback){

        console.log(" :: startIf ::");
        console.log(act.startIf);
        var self = this;
        self.setCurrentEvents(act.startIf);
        if(Array.isArray(act.startIf))
        {
            jQuery.each(act.startIf,function(k,startTask){
                var startTask = startTask;
                self.domHelper.htmlResolver(startTask,{
                    'onSuccess':function(){
                        self.domHelper.highlighterResolver(startTask,act);
                        callback();
                    },
                    "onSkip":function(){
                        self.userSkipedMilestone();
                        console.log('Skiping current actiivty: '+act.title);
                    },
                    "onExit":function(){
                        self.productTrailExitHandler('stop');
                        console.log('Exit from current actiivty: '+act.title);
                    },
                    'onFail':function(){
                        alert("Mission Failed. Please start again.");
                        self.productTrailExitHandler('active');
                    },
                    "onTimeOut":function(){
                        alert("Mission TimeOut. Please start again.");
                        self.productTrailExitHandler('active');
                    }
                });
            });
        }
        else
        {
            callback();
        }
    }
    completeIf(act,callback){

        console.log(" :: completeIf ::");
        console.log(act.completeIf);

        var self = this;
        self.setCurrentEvents(act.completeIf);
        if(Array.isArray(act.completeIf))
        {
            jQuery.each(act.completeIf,function(k,completeTask){
                var completeTask = completeTask;
                self.domHelper.htmlResolver(completeTask,{
                    'onSuccess':function(){
                        self.domHelper.highlighterResolver(completeTask,act);
                        callback();
                    },
                    "onExit":function(){
                        self.productTrailExitHandler('stop');
                        console.log('Exit from current actiivty: '+act.title);
                    },
                    'onFail':function(){
                        alert("Mission Failed. Please start again.");
                        self.productTrailExitHandler('active');
                    },
                    'onTimeOut':function(){
                        alert("Mission TimeOut. Please start again.");
                        self.productTrailExitHandler('active');
                    }
                });
            });
        }else
        {
            callback();
        }
    }

    switchToNextIf(productWalk,milestone,act,successCallback,failCallback,isSkip){
        console.log(" :: switchToNextIf ::");
        var self = this;
        if(isSkip === undefined)
        {
            isSkip = false;
        }
//        let actIds =   Array.keys(self.taskList[milestone.id].activityList);
//        let curIndex = actIds.indexOf(act.id);
//        if(actIds[''])
        self.setCurrentEvents(act.switchIf);
        if(Array.isArray(act.switchIf))
        {
            console.log(" :: switchToNextIf  act ::");
            self.isSwitched = false;
            jQuery.each(act.switchIf,function(k,actSwitch){
                console.log(actSwitch);
                if(actSwitch.type === 'event')
                {
                    self.isSwitched = true;
                    self.domHelper.eventResolver(actSwitch,
                        {
                            "onSuccess":function(e){

                                console.log(e);
                                var callbackIndex = $(e.target).attr(e.type);

                                if(successCallback)
                                {
                                    successCallback();
                                }
                                self.domHelper.htmlResolver(self.stateInterceptors['activity']['beforeNext'],function(){
                                    let milestone = self.getCurrentMilestone();
                                    console.log(self);
                                    if(callbackIndex )
                                    {
                                        self.switchToActivity(milestone.id, act.switchIf[callbackIndex].switchToActivity);
                                    }
                                    else
                                    {
                                        self.switchToActivity(milestone.id, actSwitch.switchToActivity);
                                    }

                                });
                            },
                            "onFail":function(){
                                if(failCallback)
                                {
                                    failCallback();
                                }
                            }
                        },k
                    );
                }
                else if(actSwitch.type === 'delay')
                {
                    console.log('delay next activity called');
                    self.isSwitched = true;
                    let interval = intervalIntervalSec;
                    if(actSwitch.interval)
                    {
                        interval = actSwitch.interval;
                    }

                    let observeSetTimeOut = {type:'delay',id:null};

                    observeSetTimeOut.id = setTimeout(function(){
                        if(!tutorialRunning)
                        {
                            return false;
                        }
                        console.log('setTimeout called afetr '+interval*1000+" Sec");
                        if(successCallback)
                        {
                            successCallback();
                        }
                        self.domHelper.htmlResolver(self.stateInterceptors['activity']['beforeNext'],function(){
                            let milestone = self.getCurrentMilestone();
                            console.log(self);
                            self.switchToActivity(milestone.id, actSwitch.switchToActivity);
                        });
                    }, interval*1000);

                    setTimeOutCache.push(observeSetTimeOut);

                }
            });

            // if no event found to trigger then swicth to activity
            if(!self.isSwitched && act.switchIf[0].switchToActivity)
            {
                if(successCallback)
                {
                    successCallback();
                }
                this.switchToActivity(milestone.id, act.switchIf[0].switchToActivity);
            }

        }
        else if(milestone.switchIf) // considering this is the leave node activity, move to next milstone
        {
            console.log(" :: switchToNextIf  milestone ::");
            self.isSwitched = false;
            if(milestone.skipMilestoneInterceptor === true)
            {
                isSkip = true;
            }
            if(!isSkip)
            {
                self.userCompletedMilestone();
            }
            jQuery.each(milestone.switchIf,function(k,milesoneSwitch){
                if(milesoneSwitch.type === 'condition')
                {
                    self.isSwitched = true;
                    self.conditionResolver(milesoneSwitch,
                        {
                            "onSuccess":function(){
                                if(successCallback)
                                {
                                    successCallback();
                                }
                                self.domHelper.removeMaskLayer();
                                self.milsstoneFootPrintCleaner();
                                let afterComplete = self.stateInterceptors['milestone']['afterComplete'];
                                let showVideoFirst = false;
                                if(isSkip)
                                {
                                    afterComplete = { "type" : "event"};
                                }
                                if(Object.keys(afterComplete).length > 0)
                                {
                                    showVideoFirst = true;
                                }
                                self.domHelper.htmlResolver(afterComplete,function(){

                                    self.switchToMilestone(milesoneSwitch.switchToMilestone);
                                    if(showVideoFirst && !self.doItNow)
                                    {
                                        self.letsStart = false;
                                        self.domHelper.watchVideo(self.getCurrentMilestone(),()=>self.startMilestone('switchToNextIf > condition && showVideoFirst'));
                                    }
                                    else
                                    {
                                        self.startMilestone('switchToNextIf > condition');
                                    }
                                });
                            },
                            "onFail":function(){

                            }
                        }
                    );
                }

            });
            if(!self.isSwitched && milestone.switchIf[0].switchToMilestone)
            {
                if(successCallback)
                {
                    successCallback();
                }
                self.domHelper.removeMaskLayer();
                self.milsstoneFootPrintCleaner();
                let afterComplete = self.stateInterceptors['milestone']['afterComplete'];
                let showVideoFirst = true;
                if(isSkip)
                {
                    afterComplete = { "type" : "event"};
                    showVideoFirst = false;
                }

                self.domHelper.htmlResolver(afterComplete,function(){
                    self.switchToMilestone(milestone.switchIf[0].switchToMilestone);
                    if(showVideoFirst && !self.doItNow)
                    {
                        self.letsStart = false;
                        self.domHelper.watchVideo(self.getCurrentMilestone(),()=>self.startMilestone('switchToNextIf'));
                    }
                    else
                    {
                        self.startMilestone('switchToNextIf > condition');
                    }
                });
            }
        }
        else if(productWalk.switchIf)
        {
            console.log(" :: switchToNextIf  productWalk ::");
            self.isSwitched = false;

            if(milestone.skipMilestoneInterceptor === true)
            {
                isSkip = true;
            }
            if(!isSkip)
            {
                self.userCompletedMilestone();
            }
            //self.userCompletedProductWalk();
            self.domHelper.removeMaskLayer();
            self.milsstoneFootPrintCleaner();
            if(successCallback)
            {
                successCallback();
            }
            jQuery.each(productWalk.switchIf,function(k,productWalkSwitch){

                if(productWalkSwitch.switchToProductWalk)
                {
                    self.isSwitched = true;
                    self.domHelper.htmlResolver(self.stateInterceptors['productWalk']['beforeNext'],function(){
                        self.switchToProductWalk(productWalkSwitch.switchToProductWalk);
                    });
                }
            });
            if(!self.isSwitched)
            {
                this.allProductLapsCompleted();
            }
        }else
        {
            console.log(" :: switchToNextIf  allProductLapsCompleted ::");
            if(successCallback)
            {
                successCallback();
            }
            self.user.status = 'done';
            if(milestone.skipMilestoneInterceptor === true)
            {
                isSkip = true;
            }
            if(!isSkip)
            {
                self.userCompletedMilestone();
            }
            self.domHelper.removeMaskLayer();
            self.milsstoneFootPrintCleaner();
            self.allProductLapsCompleted();
        }

    }

    conditionResolver(myswitch,triggerCallback)
    {
        console.log("conditionResolver :: ");
        console.log(myswitch);
        console.log(triggerCallback);
        var self = this;

        let isTrue = false;
        if(myswitch.match)
        {

            let qStringOR  = [];
            jQuery.each(myswitch.match,function(k,myMatches){
                let qStringAND  = [];

                jQuery.each(myMatches,function(operator,conditions){

                    jQuery.each(conditions,function(propertyName,propertyValue){
                        console.log(propertyValue);
                        let value = self.domHelper.templateTextParser(propertyName);
                        if(typeof value === 'string')
                        {
                            value = '"'+value+'"';
                        }
                        if(typeof propertyValue === 'string')
                        {
                            propertyValue = '"'+propertyValue+'"';
                        }
                        qStringAND.push("("+value+" "+ operator +" "+ propertyValue+")");

                    });
                });
                qStringOR.push(qStringAND.join( " && " ));
            });
            let qStr = qStringOR.join( " || " );
            console.log(qStr);
            isTrue = eval(qStr);
            console.log(isTrue);
        }
        if(isTrue && triggerCallback.onSuccess)
        {
            triggerCallback.onSuccess();
        }
        else if(triggerCallback.onFail)
        {
            triggerCallback.onFail();
        }
    }

    defuseAllEventListneres(act)
    {
        console.log("defuseAllEventListneres :: ");
        let self = this;
        let eContainers = ["startIf","completeIf","cancelIf","switchIf","guideMarkers"];
        jQuery.each(eContainers,function(k,container){

            if(act && act[container])
            {
                jQuery.each(act[container],function(k,actEvent){
                    if(actEvent.type === 'event' && actEvent.selector)
                    {
                        let sel = self.domHelper.jqSelector(actEvent.selector);
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

                        if(selectors.length>0)
                        {
                            jQuery.each(selectors,function(k,sel){
                                self.domHelper.defuseEvent(sel);
                            });
                        }
                    }
                });
            }

        });

        for(let i=0;i<customCssClass.length;i++)
        {
            $('.'+customCssClass[i]).removeClass(customCssClass[i]);
        }
        customCssClass=[];
    }

    switchToActivity(milestoneId, actId){

        console.log("switchToActivity :: "+actId);
        let newActivity =    this.taskList[milestoneId].activityList[actId];
        this.setCurrentActivity(newActivity);
        this.startActivity(false);

    }
    switchToMilestone(milestoneId){
        console.log("switchToMilestone :: "+milestoneId);
        this.letsStart = true;
        let pkWalk = this.getCurrentProductWalk();
        let newMilestone =    Object.assign(pkWalk.milestoneList[milestoneId], this.taskList[milestoneId]);
        let newActivity = this.taskList[milestoneId].activityList[newMilestone.initActivity];
        this.setCurrentMilestone(newMilestone);
        this.setCurrentActivity(newActivity);

        this.userStartedNewMilestone(pkWalk,newMilestone);
        this.productWalkServer.updateUser(this.user,function(){},function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });
    }

    // Not Working
    switchToProductWalk(productWalkId) {
        console.log("switchToProductWalk :: "+productWalkId);
        this.letsStart = true;
        let pWalk = this.productWalk[productWalkId];
        let newMilestone = this.taskList[pWalk.init_milestone_id];

        this.setCurrentProductWalk(pWalk);
        this.setCurrentMilestone(newMilestone);
        this.setCurrentActivity(newMilestone.initActivity);
        this.productWalkId = productWalkId;

        this.userStartedNewMilestone(pWalk,newMilestone);
        this.productWalkServer.updateUser(this.user,function(){},function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });
        this.startProductWalk(false);
    }


    allProductLapsCompleted(callback)
    {
        this.domHelper.drawStartTrialLink();
        this.domHelper.trailEndAndRedeem();
        //this.domHelper.finalCompleteProductTrial();
    }

    stopProductWalk(callback)
    {
        console.log("allProductLapsCompleted :: ");
        // notifiy server
        this.user.status = 'hold';
        logData.state='hold';
        this.productWalkServer.updateUser(this.user,callback,function(){
            alert("Restarting again after Redeem Amount");
            window.location.reload();
        });
    }

    reportWindowSizeHandler()
    {
//       window.pWalk.domHelper.removeMaskLayer();
//       window.pWalk.domHelper.addMaskLayer(false,undefined,true);
    }

    resetEventListner()
    {
        console.log("reset event");
        let events = this.getCurrentEvents();
        let handler = this.getCurrentEventHandler();
        this.defuseAllEventListneres(this.getCurrentActivity());
        this.domHelper.removeDisabler();
        this.domHelper.removeHider();
        var self = this;
        SelectorIdentifierColor ='cancelIfBorderColor';
        this.cancelIf(this.getCurrentActivity(),function(){
            //self.productTrailExitHandler('active');
            self.domHelper.tryAgainMsg(function(){self.productTrailExitHandler('active');});
            let unixTimeStamp = Math.floor(Date.now() / 1000);
            let traceData = {"type":"cancelIf","data":self.getCurrentActivity(),'unixTimeStamp':unixTimeStamp};
            self.userFailedTraceCapture(traceData);
            //self.productTrailExitHandler('active');
        });
        this.disabler(this.getCurrentActivity());
        this.hider(this.getCurrentActivity());

        // console.log(events);
        if(Array.isArray(events))
        {
            jQuery.each(events, function (k, event) {

                if (event.type === 'event')
                {
                    SelectorIdentifierColor = ActivityType+'BorderColor';
                    self.domHelper.eventResolver(event, handler);
                }
            });
        }


    }

    whatsNextMilestone(taskList,pkWalk,milestone)
    {
        let isMultipleCount = 0;
        let nextMilestone = {};
        if(milestone.switchIf)
        {
            jQuery.each(milestone.switchIf,function(k,milesoneSwitch){
                isMultipleCount++;
                let milestoneId = milesoneSwitch.switchToMilestone;
                nextMilestone =    Object.assign(pkWalk.milestoneList[milestoneId], taskList[milestoneId]);

                if(nextMilestone.skipMilestoneInterceptor)
                {
                    isMultipleCount = 0;
                    return;
                }

            });
        }
        if(Object.size(nextMilestone)>0 && isMultipleCount === 0)
        {
            nextMilestone = this.whatsNextMilestone(taskList,pkWalk,nextMilestone);
        }

        return nextMilestone;
    }
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

$(document).ready(function () {
    /*
    prevElement = null;
    document.addEventListener('mousemove',
        function(e){
            var elem = e.target || e.srcElement;
            if (prevElement!= null) {prevElement.classList.remove("mouseOn");}
            elem.classList.add("mouseOn");
            prevElement = elem;
        },true);
        */
    let url = "";
    let requestProductWalkData = "productWalkData.json?v="+jsUpdateVersion;
    let requestProductWalkTaskList = "productWalkTaskList.json?v="+jsUpdateVersion;
    let requestProductWalkCommonTask = "productWalkCommonTask.json?v="+jsUpdateVersion;
    var productWalkServer2 = new productWalkServer();


    jQuery.fn.extend({
        getPath: function() {
            var pathes = [];

            this.each(function(index, element) {
                var path, $node = jQuery(element);

                while ($node.length) {
                    var realNode = $node.get(0), name = realNode.localName;
                    if (!name) { break; }

                    name = name.toLowerCase();
                    var parent = $node.parent();
                    var sameTagSiblings = parent.children(name);

                    if (sameTagSiblings.length > 1)
                    {
                        var allSiblings = parent.children();
                        var index = allSiblings.index(realNode) + 1;
                        if (index > 0) {
                            name += ':nth-child(' + index + ')';
                        }
                    }

                    path = name + (path ? ' > ' + path : '');
                    $node = parent;
                }

                pathes.push(path);
            });

            return pathes.join(',');
        }
    });

    productWalkServer2.get(url,requestProductWalkData,{},function(productWalkData_FRONTDESK){

        productWalkServer2.get(url,requestProductWalkCommonTask,{},function(commonActivity){

            productWalkServer2.get(url, requestProductWalkTaskList, {}, function(taskList_FRONTDESK){

                let pWalk = new productWalk("FDCHAPT1", productWalkData_FRONTDESK, taskList_FRONTDESK, new domHelper(), stateInterceptors, productWalkServer2, commonActivity);
                let observeSetTimeOut = {type: 'productWalkServer2-get', id: null};

                observeSetTimeOut.id = setTimeout(function()
                {

                    pWalk.load(function()
                    {
                        pWalk.startProductWalk(true);

                    });

                    console.log(pWalk);
                    window.pWalk = pWalk;
                    window.onresize = pWalk.reportWindowSizeHandler;

                }, 2000);

                setTimeOutCache.push(observeSetTimeOut);
            });
        });
    });


});
