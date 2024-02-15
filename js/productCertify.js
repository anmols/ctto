var apiCallQueue = {};
var SERVER_REQUEST_CHECK  =   5;
var openedDialog = undefined;
var logData={};
var hiderZindex=11999;
var initCertificationTaskId = "TASK1";
var utcDateString;

let  stateInterceptors = {    
    "certification":{
      
        "beforeNext":[
            {
                "type" : "event" ///black
            }
        ],
        "timeUp":[
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "template" : "afterCompleteMilestone",
                    "userType" : ["reward"],
                    "title" : {class :"",text:"Sorry !"} ,
                    "subTitle" : {class :"",text:"Your Time is Up for this Task"} ,
                    "subTitle2" : {class :"",text:""},
                    "link1" : {class :"",text:"Try Again"},                                       
                    "onSkip" : {class :"",text:"Skip"},        
                    "viewAll" : {class :"",text:"viewAll"},    
                    "showWatchOtherVideoLink": false,
                    "showbalance": false,
                    "showRedeemLink": false,
                    "switchMileStone": false
                }
            }
        ],
        "beforeStart" : [
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "X-Y_Selector": {
                        "selector": ""
                    },
                    "template" : "afterCompleteMilestone",
                    "styleClass" : "certificateTaskView",
                    "userType" : ["nonReward"],
                    "title": {class :"",text:""} ,
                    "subTitle" : {class :"",text:"{{getTaskView}}"},
                    "message" : {class :"",text:""},
                    "onSkip" : {class :"",text:"Skip"},
                    //"message_NoReward" : {class :"",text:""},
                    "link1" : {class :"",text:"Start"},    
                    "viewAll" : {class :"",text:"viewAll"},    
                    "showWatchOtherVideoLink": false,
                    "showbalance": false,
                    "showRedeemLink": false
                }

            }
        ],
        "afterComplete":[
            {
                "type" : "MSG_PROMPT",
                "html": {
                    "template" : "afterCompleteMilestone",
                    "userType" : ["reward"],
                    "title" : {class :"",text:"CONGRATULATIONS!"} ,
                    "subTitle" : {class :"",text:"Your Certification Task Completed<span>"} ,
                    "subTitle2" : {class :"",text:""},
                    "link1" : {class :"",text:"Next"},                                       
                    "viewAll" : {class :"",text:"viewAll"},                                       
                    "showWatchOtherVideoLink": false,
                    "showbalance": false,
                    "showRedeemLink": false,
                    "switchMileStone": false
                }
            }
        ]
    }
    
};

let certification = class certification{
    
    constructor(ceritifyGroupTaskList,domHelper,stateInterceptors,productWalkServer,taskList_FRONTDESK){
       
        this.ceritifyGroupTaskList = ceritifyGroupTaskList;
        this.domHelper = domHelper;
        this.stateInterceptors = stateInterceptors;
        this.productWalkServer = productWalkServer;
        this.taskList = taskList_FRONTDESK['FDCHAPT1'];
        this.timer;
        this.timerId = 'certificateTimerId';
        this.taskWindowId = 'certificateTaskWindowId';
        this.taskAndTimeWindowId = 'timerTaskDiv';
        
        console.log(this.taskList);
    };
    
    setUser (u)
    {
        this.user = u;
    }
    getUser ()
    {
        return this.user;
    }
    
    setTimerId (id)
    {
        this.timerId = id;
    }
    
    
    
    load(callback){
        console.log("load ::");
        var that  = this;
        this.productWalkServer.getuser(function(data){

            console.log(' Load User data from server:');
            console.log(data);
            that.setUser (data);
            
            that.domHelper.setCertification(that);
            if(!that.user.certification)
            {
                that.user.certification = {};
            }
            if(!that.user.certification.currentId)
            {
                that.user.certification.currentId = initCertificationTaskId;
            }            
            that.user.productTrailId = "FDCHAPT1";
            
            if(!that.ceritifyGroupTaskList[that.user.certification.currentId])
            {
                console.log(" No certification Master data found for certificationId : "+that.user.certification.currentId);
                return;
            }
            
            if(that.user.certification.status === 'stop')
            {
                that.domHelper.drawStartCertificateLink(true);
            }
            else if(callback)
            {
                that.domHelper.welcomeProductCertificate(callback,function()
                {
                    callback();
                });
            }
        });
        
    };
    
    start(certificationId) {
        let utcDate = new Date();
        utcDateString =  utcDate.toUTCString();
        
        console.log("start ::id:"+certificationId);        
        let that =  this;
        that.domHelper.drawExitCertificateLink();
        that.user.certification.status = 'start';       
        
        
        that.productWalkServer.updateUser(that.user,function(){
            console.log("update user walk state save success from drawExitConfirm OK ");
        });
            
        this.clearTimer();
        if(certificationId)
        {
            this.user.certification.currentId = certificationId;
        }
        
        let beforeStart = this.stateInterceptors['certification']['beforeStart'];
        let timeUp = this.stateInterceptors['certification']['timeUp'];
        let onFail = this.stateInterceptors['certification']['onFail'];
        let afterComplete = this.stateInterceptors['certification']['afterComplete'];
        
        let certifyCheckCallback = function(){
                                that.checkCertificationCompleted(function(){
                                    console.log("Certification Success");
                                    
                                    that.domHelper.htmlResolver(afterComplete, {'onSuccess': function () {                                                                                         
                                            that.next();  
                                    },"onExit":function(){
                                        that.stop();                                        
                                    },"viewAll":function(){
                                        that.domHelper.viewAllCertificateTask();                                        
                                    }});

                                },
                                function(){
                                    console.log("Certification Under Processing..");
                                },
                                function(){
                                    console.log("Certification Failed");
                                    
                                    that.domHelper.htmlResolver(onFail, {'onSuccess': function () {
                                            that.start(certificationId);   
                                    },"onExit":function(){
                                        that.stop();                                        
                                    },"onSkip":function(){
                                        that.next();                                        
                                    },"viewAll":function(){
                                        that.domHelper.viewAllCertificateTask();                                        
                                    }});
                                });
                            };
        let certifyTimeOverCallback = function(){
            that.domHelper.htmlResolver(timeUp, {'onSuccess': function () {
                                            that.start(certificationId);   
                                    },"onExit":function(){
                                        that.stop();                                        
                                    },"onSkip":function(){
                                        that.next();                                        
                                    },"viewAll":function(){
                                        that.domHelper.viewAllCertificateTask();                                        
                                    }});
        };
        
        this.domHelper.htmlResolver(beforeStart, {'onSuccess': function () {
                // update view of task list
                that.updateTaskWindow();
                that.startTimer(
                            function(){},
                            certifyCheckCallback,
                            certifyTimeOverCallback
                        );
                
                
            },"onSkip":function(){
                that.next();   
            },"onExit":function(){
                that.stop();                                        
            },"viewAll":function(){
                that.domHelper.viewAllCertificateTask();                                        
            }
        });
    };
    checkCertificationCompleted(successCallback,waitingCallback,failCallback){
        
        let groupId = this.user.certification.currentId;
        let productTrailId = this.user.productTrailId;
        let that = this;
        
        this.productWalkServer.ismilestonegroupcompleted(productTrailId,groupId,utcDateString,function(data){
            
            if(!that.user.certification.list)
            {
                that.user.certification.list = {};
            }
            if(!that.user.certification.list[groupId])
            {
                that.user.certification.list[groupId] = {};
            }
            
            that.user.certification.list[groupId]["tasks"] = data.tasks;
            that.user.certification.list[groupId]["status"] = data.status;            
            
            // update view of task list
            that.updateTaskWindow();
            
            that.productWalkServer.updateUser(that.user,function(){
                console.log("update user walk state success");
            },function(){});
            
            if(data.status == 'success' && successCallback)
            {
                that.clearTimer();
                successCallback();
            }
            else if(data.status == 'pending' && waitingCallback)
            {
                waitingCallback();
            }
            else if(data.status == 'fail' && failCallback)
            {
                that.clearTimer();
                failCallback();
            }
        });
        
    }
    
    stop(callback){
        console.log("stop ::");
        console.log('Exit from current Certification Task: ');
        
        this.clearTimer();
        let that  = this;
        let stopCallback = function(){
            if(openedDialog && openedDialog.$jconfirmBox)
            {
                openedDialog.close();
            }        
            that.user.certification.status = 'stop';

            that.productWalkServer.updateUser(that.user,function(){
                console.log("update user walk state save success from drawExitConfirm OK ");
            });
            that.domHelper.drawStartCertificateLink(true);   
        };
        
        that.domHelper.drawExitConfirm(()=>that.start(that.user.certification.currentId), () => stopCallback());
        if(callback)
        {
            callback();
        }
    };   
    next(callback){
        
        console.log("next ::");
        this.clearTimer();
        
        if(this.ceritifyGroupTaskList[this.user.certification.currentId] && this.ceritifyGroupTaskList[this.user.certification.currentId].next)
        {
            this.start(this.ceritifyGroupTaskList[this.user.certification.currentId].next);
        }else
        {
            this.certificationCompleted();
        }
        if(callback)
        {
            callback();
        }
    };
    
    certificationCompleted(){
        alert("Certification Task Completed");
        this.domHelper.drawStartCertificateLink();
    }
    
    updateTaskWindow()
    {
        $("#"+this.taskAndTimeWindowId).show();
        
        console.log($("#"+this.taskWindowId));
                
        let taskHtml = '';
        let that = this;
        if(that.ceritifyGroupTaskList[this.user.certification.currentId])
        {
            taskHtml += "<div class='task-list'><h5>"+that.ceritifyGroupTaskList[this.user.certification.currentId].title+"</h5>";
            taskHtml += "<ul>";
            let taskStatus = {};
            if(that.user.certification.list && that.user.certification.list[this.user.certification.currentId])
            {
                taskStatus = that.user.certification.list[this.user.certification.currentId]['tasks'];
            }
            
            // let groupTitle = that.ceritifyGroupTaskList[groupId].shortTitle;
             let groupTasks = that.ceritifyGroupTaskList[this.user.certification.currentId].milestoneList;
            jQuery.each(groupTasks, function (mileId, task) {
                
                let title = task.title;
                if(!task.title && that.taskList[mileId])
                {
                    title = that.taskList[mileId].title;
                }
                
                let status = 'pending';
                if(taskStatus[mileId] && taskStatus[mileId]['status'])
                {
                    status = taskStatus[mileId]['status'];
                }
                taskHtml += '<li>'+title+"<span class= 'task-status "+status+"'></span></li>";

            });
            
            taskHtml += "</ul></div>";
        }
        
        $("#"+this.taskWindowId).html(taskHtml);
    }
    
    getCurrentCertifyTitle(){
        return this.ceritifyGroupTaskList[this.user.certification.currentId].title;
    }
    getCurrentCertifyShortTitle(){
        return this.ceritifyGroupTaskList[this.user.certification.currentId].shortTitle;
    }
    
    getNextCertifyTitle(){
        
        if(this.ceritifyGroupTaskList[this.user.certification.currentId].next)
        {
            return this.ceritifyGroupTaskList[this.ceritifyGroupTaskList[this.user.certification.currentId].next].title;
        }
        return '';
    }
    
    getNextCertifyShortTitle(){
        if(this.ceritifyGroupTaskList[this.user.certification.currentId].next)
        {
            return this.ceritifyGroupTaskList[this.ceritifyGroupTaskList[this.user.certification.currentId].next].shortTitle;
        }
        return '';
    }
    
    getTaskView(certificateId,insertTitleClass){
        console.log("getTaskView ::");
        let taskHtml = '';
        let that = this;
        if(!insertTitleClass)
        {
            insertTitleClass = "";
        }
        
        let timerHtml = '';
        if(!certificateId)
        {
            certificateId = that.user.certification.currentId;
        }
        if(that.ceritifyGroupTaskList[certificateId])
        {
            let timer = that.ceritifyGroupTaskList[certificateId].timer*1000;
            let minutes = Math.floor((timer % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((timer % (1000 * 60)) / 1000);
            timerHtml += '<div id="timer"><span>TIME: '+ minutes + "m " + seconds + "s "+"</span></div>";
        }
            
        if(that.ceritifyGroupTaskList[certificateId])
        {
            taskHtml += timerHtml+"<div class='task-list ' ><h5 class='"+insertTitleClass+"' cid = '"+certificateId+"'>"+that.ceritifyGroupTaskList[certificateId].title+"</h5>";
            taskHtml += "<ul>";
            let groupTasks = that.ceritifyGroupTaskList[certificateId].milestoneList;
            jQuery.each(groupTasks, function (mileId, task) {
                
                let title = task.title;
                if(!task.title && that.taskList[mileId])
                {
                    title = that.taskList[mileId].title;
                }
                taskHtml += '<li>'+title+"</li>";

            });

            taskHtml += "</ul></div>";
        }
        return taskHtml;
    }
    
    getAllTaskView()
    {
        let that = this;
        let content = "<div class = 'viewAllCertificateTask'>"+'<ul>';
        jQuery.each(that.ceritifyGroupTaskList,function(cId,certificate){
            
            content = content+'<li>'+that.getTaskView(cId,'startfromotherlink')+'</li>';         
             
        });
        content = content+"</div>";
        return content;
    }
    
    clearTimer(msg){
        console.log("clearTimer ::");        
        clearInterval(this.timer);        
        if(msg && msg !== '')
        {
            $("#"+this.taskAndTimeWindowId).hide();
            $("#"+this.timerId).html(msg);
        }
        else
        {
            $("#"+this.taskAndTimeWindowId).hide();
        }
    }
    
    startTimer(onStartCallback, onInervalCallback, onEndCallback){
        console.log("startTimer ::");
        if(onStartCallback)
        {
            onStartCallback();
        }
       
        let grpTask = this.ceritifyGroupTaskList[this.user.certification.currentId];
        
        
        let countDownDate = new Date().getTime();
        
        if(grpTask.timer)
        {
            countDownDate += grpTask.timer * 1000;
        }
        else
        {
            countDownDate += 300 * 1000;
        }
        
        let callbackIntervalTime  = SERVER_REQUEST_CHECK;
       
        
        
        let that = this;
        // Update the count down every 1 second
        this.timer = setInterval(function() {

            // Get today's date and time
            let now = new Date().getTime();
            // Find the distance between now and the count down date
            let distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            //let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            //let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="demo"
            $("#"+that.taskAndTimeWindowId).show();
            $("#"+that.timerId).html(minutes + "m " + seconds + "s ");

            // If the count down is finished, write some text
            if (distance < 0) {
              that.clearTimer("Time Over");
              if(onEndCallback)
              {
                  onEndCallback();
              }
            }
            else if(onInervalCallback && (parseInt(distance/1000)%callbackIntervalTime === 0))
            {
                onInervalCallback();
            }
            
        }, 1000);
        
    }
    
    
};


var pCertificate;
$(document).ready(function () {
    
    let url = "";
    let requestProductCertificationData = "productCertify.json?v="+jsUpdateVersion;
    let requestProductWalkTaskList = "productWalkTaskList.json?v="+jsUpdateVersion;
    
    var productWalkServer2 = new productWalkServer();
    
    productWalkServer2.get(url, requestProductWalkTaskList, {}, function(taskList_FRONTDESK){    

        productWalkServer2.get(url,requestProductCertificationData,{},function(certificationData){

            pCertificate = new certification(certificationData, new domHelper(), stateInterceptors, productWalkServer2, taskList_FRONTDESK);

            pCertificate.load(function()
            {
                pCertificate.start(pCertificate.user.certification.currentId);

            });
            console.log(pCertificate);
        });


    });
});
