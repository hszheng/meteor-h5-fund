Template.bindAccount.onCreated(function(){
    var self = this;
    self.autorun(function () {
        self.subscribe("userInfo",{'profile.openid': Session.get('openid')});
    });
    var code = parse('code');
    if (code) {
        Meteor.call('judgeBindedOrNot',code,function(err,result){
           var openid = result.openid;
            Session.set('openid',openid);
		if (result.openid!==undefined && result.user) {
                  alert('该用户已绑定账号！绑定新账号前请解绑！');
                  $('.bindAccount').attr('disabled','disabled');
                } 
        });
    }
    else {
      location.assign('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fwww.72touzi.com%2FbindAccount&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
        
    }
});

Template.bindAccount.helpers({
    binded: function(){
        return Session.get('isBinded');
    }
});

Template.bindAccount.events({
   'click .bindAccount':function(event){
	
        var username = $('#bindAccount .login-tel').val();
        var password = $('#bindAccount .pass').val();
        if(!username) return alert('请输入用户名');
	if(!password) return alert('请输入密码');
	if(!Session.get('openid')) return alert('error');
	Meteor.loginWithPassword(username,password,function(err,result){
	 if(err){
           return alert('用户名或密码错误！');
         }
	 else{
	   $('#bindAccount .login-tel').val('');
           $('#bindAccount .pass').val('');
	   Meteor.call('updateUserById',Meteor.userId(),{'profile.openid':Session.get('openid'),'profile.loginPassword':password},function(err,result){
	      $('.bindAccount').attr('disabled','disabled');
           	return alert('绑定成功！');
          });
        }
       });
},
   'click .to-register':function(e){
       e.preventDefault();
       location.assign('http://www.72touzi.com/?invitedId=wechatAccount');
       
},
   'click #forgetPassword':function(e){
      e.preventDefault();
      Router.go('/#resetPassword');  
}

});
function parse(val) {
    var result = '',
        tmp = [];
    location.search
    .substr(1)
        .split('&')
        .forEach(function (item) {
        tmp = item.split('=');
        if (tmp[0] === val) {
            result = decodeURIComponent(tmp[1]);
        }
    });
    return result;
}
