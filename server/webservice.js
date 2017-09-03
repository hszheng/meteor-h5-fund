/**
 * 系统所有的Web Service
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */

var parseString = Npm.require('xml2js').parseString;
Router.map(function () {
    this.route('weixinMsg', {
        path: '/weixinMsg',
        where: 'server',
        action: function () {
            var req = this.request;
            var res = this.response;
            req.on('data', Meteor.bindEnvironment(function (chunk) {
                parseString(chunk.toString(), { explicitArray : false, ignoreAttrs : true },function (err, result) {
                    var data = result.xml;
                    // console.log(data);
                    var ToUserName = data.ToUserName;
                    var FromUserName = data.FromUserName;
                    var MsgType = data.MsgType;
                    var result = '';
		    var EventKey = '';
	            var userInfo = Meteor.users.findOne({'profile.openid':FromUserName});
                    if (MsgType == 'text') {
                        var Content = data.Content; 
			if(Content == '解绑'){
			  if(!userInfo){
			     Content ='您尚未绑定账号！';
			    // return false;
			   }else{
			     Meteor.users.update(userInfo._id,{$unset:{'profile.openid':1}});
			     Content ='解绑成功！';
			   }
			}                                       
                        result = initTextXML(FromUserName, ToUserName, Content);
                    }
                    else {
                        var Content = '',yesterdayrFee = 0;
			//  Meteor.call('getUserFromSelector',{'profile.openid':FromUserName},function(err,result){
                        var userInfo = Meteor.users.findOne({'profile.openid':FromUserName}); 
                       	   if(!userInfo){
			      Content = '您尚未绑定账号！'	
			     //return false;
			   }
                           else{
			      var date = new Date();
           		        date.setHours(0);
           		        date.setMinutes(0);
          		        date.setSeconds(0);
           		        date.setMilliseconds(0);
           		      var todayTime = date.getTime();
          		      var lastTime = todayTime - 24 * 3600 * 1000;
           		      var record = TradingRecord.findOne({
               			 userId: userInfo._id,
               		     /* timestamp: {
                   		 $gt: lastTime,
                   		 $lt: todayTime
               		      },*/
                                timestamp:todayTime,
              		  	type: '活期收益'
           		      });
            		  if (!record){
			       yesterdayrFee = 0;
			  }
           		  else {
			       yesterdayrFee = record.sum; 
			  }          
			     Content = '尊敬的' + userInfo.profile.name + '，您的账户信息如下：' + '\n' +
                                      '账户总资产(元)：' + userInfo.profile.assets + '\n' +
                                      '昨日收益(元)：' + yesterdayrFee + '\n' +
                                      '累计收益(元)：' + userInfo.profile.profit + '\n' +
                                      '<a href="http://m.72touzi.com">更多账户信息' + '</a>';        
                         }
                        result = initTextXML(FromUserName, ToUserName, Content);
                    }
                    res.end(result);
                });
            }));
        }
    });
});

function initTextXML(ToUserName, FromUserName, Content){
    return '<xml>' +
        '<ToUserName><![CDATA[' + ToUserName + ']]></ToUserName>' +
        '<FromUserName><![CDATA[' + FromUserName + ']]></FromUserName>' +
        '<CreateTime>' + Date.now() + '</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        '<Content><![CDATA[' + Content + ']]></Content>' +
    '</xml>';
}

// 用户消息推送第一次对接
/*
Router.map(function () {
    this.route('weixinMsg', {
        path: '/weixinMsg',
        where: 'server',
        action: function () {
            var req = this.request;
            var token = 'QiErMoney';
            var timestamp = req.query.timestamp;
            var nonce = req.query.nonce;
            var tmpArr = [token, timestamp, nonce];
            tmpArr.sort();
            var tmpStr = tmpArr.join('');
            // console.log(req.query);
            var shaResult = new jsSHA(tmpStr, 'TEXT').getHash('SHA-1', 'HEX');
            if (shaResult == req.query.signature) {
                this.response.end(req.query.echostr);
            }
            else {
                // console.log('not weixin server!');
                this.response.end('not weixin server!');
            }
        }
    });
})
*/

Router.route('return_url', {
    path: '/return_url',
    where: 'server',
    action: function() {
        var request = this.request,
            response = this.response,
            data = request.body,
            result = null;

        investment(data);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('success');
    }
});

Router.route('notify_url', {
    path: '/notify_url',
    where: 'server',
    action: function() {
        var request = this.request,
            response = this.response,
            data = request.body,
            result = null;

        investment(data);

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('success');
    }
});

// 投资成功
function investment(data) {
    var record = TradingRecord.findOne({ timestamp: parseInt(data.OrdId), isRemoved: true }),
        invite = {}, invite = {}, basicRate = 0;
    if (!record) {
        return;
    }

    var user = Meteor.users.findOne(record.userId);
    if (!user) {
        return;
    }
    
    TradingRecord.update(record._id, { $set: { isRemoved: false } });
    Meteor.users.update(user._id, { $set: { 'profile.assets': parseFloat((user.profile.assets + record.sum).toFixed(2)), 'profile.totalInvest': parseFloat((user.profile.totalInvest + record.sum).toFixed(2)) } });
  
    
    invited = InviteRecord.findOne({userId:userId,invested:false}); 
    InviteRecord.update(invited._id,{$set:{invested:true}});
    invite = InviteRecord.find({inviteId:invited.inviteId,invested:true}).fetch(),
    basicRate =  Meteor.users.findOne({},{fields: {'profile.basicRate': 1}}).profile.basicRate;
    // console.log(invited.inviteId,invite.length,basicRate);
    if(invite){
            if(invite.length>=2){
                    
                var user = Meteor.users.findOne(invited.inviteId);
                // console.log(user);
                Meteor.users.update(invited.inviteId,{$set:{'profile.annualRate':basicRate+2.00}});
            }
    }

    

}
