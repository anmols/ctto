
let productWalkServer = class productWalkServer{

    updateUser(user,callback,modifiedCallback){

        console.log('update user cuurent state to server ::');
        let url = "/frontdesk/api";
        this.post(url,"saveuserwalk",user,callback,modifiedCallback,true);
    }

    logEvent(){
        console.log('log the logData object to server ::');
        let url = "/frontdesk/api";
        this.post(url,"logevent",{},function(){},function(){},true);
    }

    ismilestonecompleted(productTrailId,milsestoneId,timestamp,callback){

        console.log('ismilestonecompleteds  server API request::');
        let url = "/frontdesk/api";
        let data = {};
        data["hotelId"] = productTrailHotelId; // hotelId
        data["userId"] = productTrailUserId;   // userId
        data["productTrailId"] = productTrailId;
        data["milsestoneId"] = milsestoneId;
        data["timestamp"] = timestamp;
        this.post(url,"ismilestonecompleted/taskName/"+milsestoneId,data,callback);
    }
    
    ismilestonegroupcompleted(productTrailId,groupId,timestamp,callback){

        console.log('ismilestonecompleteds  server API request::');
        let url = "/frontdesk/api";
        let data = {};
        data["hotelId"] = productTrailHotelId; // hotelId
        data["userId"] = productTrailUserId;   // userId
        data["productTrailId"] = productTrailId;
        data["groupId"] = groupId;
        data["timestamp"] = timestamp;
        this.post(url,"ismilestonegroupcompleted",data,callback);
    }

    getuser(callback)
    {
        console.log('get user cuurent state from server ::');
        let url = "/frontdesk/api";
        let data = {"hotelId":productTrailHotelId,"userId":productTrailUserId};
       
        this.post(url,"getuserwalk",data,callback);
    }
    startProductTraining()
    {
        tutorialRunning = true;
        console.log('Start the training. ::');
        let url = "/frontdesk/api";
        let data = {"hotelId":productTrailHotelId,"userId":productTrailUserId};
        this.post(url,"startTraining",data,function(){});
    }
    stopProductTraining()
    {
        tutorialRunning = false;
        console.log('Start the training. ::');
        let url = "/frontdesk/api";
        let data = {"hotelId":productTrailHotelId,"userId":productTrailUserId};
        this.post(url,"stopTraining",data,function(){});
    }
    addIrfdatajson(callback)
    {
        console.log('create irfdata json file ::');
        console.log(callback);
        let url = "/frontdesk/api";
        let data = {"hotelId":productTrailHotelId,"userId":productTrailUserId,"create":true};
        this.post(url,"irfdatajson",data,function(){
            console.log('addIrfdatajson callback ::');
            if(callback && callback.onSuccess)
            {
                callback.onSuccess();
            }
            else if(callback)
            {
                callback();
            }
        });
    }

    removeIrfdatajson(callback)
    {
        console.log('remove irfdata json file ::');
        let url = "/frontdesk/api";
        let data = {"hotelId":productTrailHotelId,"userId":productTrailUserId,"remove":true};
        this.post(url,"irfdatajson",data,function(){
            if(callback && callback.onSuccess)
            {
                callback.onSuccess();
            }
            else if(callback)
            {
                callback();
            }
        });
    }


    post(url,requestType,data,callback,modifiedCallback, sendLog){
        callback({});
        return;
        if(apiCallQueue[requestType])
        {
            console.log('Not calling twice same api:'+requestType);
            return;
        }
        apiCallQueue[requestType] = JSON.stringify(data);
        url = url+"/"+requestType;
        if(sendLog)
        {
            for(var prop in logData)
            {
                if(Object.prototype.hasOwnProperty.call(logData, prop) && typeof logData[prop]!='undefined')
                {
                    url=url+"/"+prop+"/"+logData[prop];
                }
            }
            if(!logData.hasOwnProperty('state'))
                data.state='';
            logData={};
        }
        var requestType = requestType;
        $.ajax({
            url:url,
            type:"POST",
            dataType:"json",
            data:data,
            success: function(data) {
                apiCallQueue[requestType] = undefined;
                if(requestType === 'ismilestonecompleted' && (tutorialRunning === false || milestoneJustRestart))
                {
                    return;
                }
                if(data == 'modified' && modifiedCallback)
                {
                    modifiedCallback();
                    return;
                }
                callback(data);
            },
            error: function (e) {
                apiCallQueue[requestType] = undefined;
                if(requestType === 'ismilestonecompleted' && (tutorialRunning === false || milestoneJustRestart))
                {
                    return;
                }
                if(e.responseText == 'modified' && modifiedCallback)
                {
                    modifiedCallback();
                    return;
                }
                if(e.status === 200)
                {
                    callback(data);
                }
                console.log(e);
            }
        });
    }
    get(url,requestType,data,callback){

        url = url+"/"+requestType;
        $.ajax({
            url:url,
            type:"GET",
            dataType:"json",
            data:data,
            success: function(data) {
                callback(data);
            },
            error: function (e) {
                if(e.status === 200)
                {
                    callback(data);
                }
                console.log(e);
            }
        });
    }
    sendMailIrfSub(callback,param)
    {
        // check is param callback a js function
        
        if(callback && typeof callback.onSuccess == 'function')
            {
                callback.onSuccess(); return;
                
            }
        if(typeof callback == 'function')
            {
                callback(); return;
                
            }
            return;
        let url = BASE_URL+'/irf-sub';
        let data = {};
        data["param"] = param; // hotelId
        data["hotelId"] = productTrailHotelId; // hotelId
        data["userId"] = productTrailUserId;
        data["token"] = irfToken;
        this.post(url,"sendmail.php",data,function(){
            if(callback && callback.onSuccess)
            {
                callback.onSuccess();
            }
            else if(callback)
            {
                callback();
            }
        });
    }
    loadplans(callback)
    {
        let posturl = "/frontdesk/login/loadplans/plan/PMS001/redeem/true/noOfRooms/0/caller/plg";
        $.ajax({
            url:posturl,
            type:"GET",
            success: function(data) {
                callback(data);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
};