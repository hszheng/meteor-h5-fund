/**
 * 系统启动时的逻辑
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */


Meteor.startup(function() {
    // 如果没有管理员，添加一个管理员账户
    Meteor.users.update("TnQLxuMBBHWqpbzTN", {
        $set: {
            'profile.assets': 666
        }
    });
    // // console.log(AnnualRate.findOne().basicRate);
    if(!AnnualRate.findOne()){
        AnnualRate.insert({basicRate:4});
    }
    
    if (!Accounts.findUserByUsername('admin')) {
        Accounts.createUser({
            username: 'admin',
            email: 'admin@xuuue.cn',
            password: 'admin',
            profile: {
                role: 'admin'
            }
        });
    }

    Accounts.validateNewUser(function(user) {
        // console.log(user.username);

        return true;
    });
    Accounts.onCreateUser(function(options, user) {
        if (user) {
            try {

            } catch (e) {
                // console.log(e.toString());
            }
        }

        var profile = {
            phone: options.username,
            email: '',
            assets: 0,
            totalInvest: 0,
            profit: 0,
            annualRate: parseFloat(AnnualRate.findOne().basicRate.toFixed(2)),
            basicRate: parseFloat(AnnualRate.findOne().basicRate.toFixed(2)),
            name: '',
            idCard: '',
            verified: false,
            bankCard: '',
            cardHolder: '',
            bankName: '',
            bankCity: '',
            password: ''
        }
        user.profile = profile;
        return user;
    });

    Meteor.setInterval(function() {
        var date = new Date();
        var profit = null;
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        var todayTime = date.getTime(),
            time = todayTime - 86400000,
            midnight = todayTime + 86400000,
            _idArray = [],
            userIdArr = [],
            newInvest = [],
            oldInvest = [],
            userToMinus = [],
            users = [];
        var log = TradingRecord.findOne({
            timestamp: todayTime,
            type: '活期收益'
        });
        if (log) return;
        // TradingRecord.find({type:'投资',timestamp: {$gt:todayTime,$lt:midnight}}).fetch().forEach(function(item){
        TradingRecord.find({ type: '投资', timestamp: { $gt: time, $lt: todayTime } }).fetch().forEach(function(item) {
            newInvest.push({ userId: item.userId, sum: item.sum });
        });

        // TradingRecord.find({type:'投资',timestamp: {$lt:todayTime}}).fetch().forEach(function(item){
        TradingRecord.find({ type: '投资', timestamp: { $lt: time } }).fetch().forEach(function(item) {
            oldInvest.push({ userId: item.userId, sum: item.sum });
            _idArray.push(item.userId);
        });



        userIdArr = _.uniq(_idArray);

        users = Meteor.users.find({ _id: { $in: userIdArr }, 'profile.assets': { $gt: 0 } }).fetch();

        _.each(users, function(user) {
            var addsum = 0;
            _.each(newInvest, function(newinvest) {
                if (user._id == newinvest.userId) {
                    var assets = user.profile.assets;
                    user.profile.assets = parseFloat((assets - newinvest.sum).toFixed(2));
                    addsum += newinvest.sum;
                }
                // console.log('要增加的金额：' + addsum);
            });
            profit = parseFloat((user.profile.assets * user.profile.annualRate / 100 / 365).toFixed(2));
            // console.log('产生的收益：' + profit);

            if (!profit || profit <= 0) return;
            TradingRecord.insert({
                userId: user._id,
                type: '活期收益',
                timestamp: todayTime,
                sum: profit
            });

            var allProfit = parseFloat((user.profile.profit + profit).toFixed(2));
            var allAssets = parseFloat((user.profile.assets + profit + addsum).toFixed(2));
            var totalInvest = parseFloat((user.profile.totalInvest + profit).toFixed(2));
            Meteor.users.update(user._id, {
                $set: {
                    'profile.profit': allProfit,
                    'profile.assets': allAssets,
                    'profile.totalInvest': totalInvest,
                }
            });
            // console.log('总资产：' + allAssets + '，总投资：' + totalInvest);
        });
    }, 3600 * 1000);

    // 初始化微信菜单栏
    var data = {
        "button": [{
                "name": "我要投资",
                "sub_button": [{
                        "type": "view",
                        "name": "我要投资",
                        "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fm.72touzi.com&state=investment&response_type=code&scope=snsapi_userinfo&connect_redirect=1#wechat_redirect"
                    },
                    {
                        "type": "view",
                        "name": "理财产品",
                        "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fm.72touzi.com&state=productInfo&response_type=code&scope=snsapi_userinfo&connect_redirect=1#wechat_redirect"
                    }
                ]
            },
            {
                "name": "我的账户",
                "sub_button": [{
                        "type": "click",
                        "name": "我的资产",
                        "key": "myfee"
                    },
                    {
                        "type": "view",
                        "name": "我的账户",
                        "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fm.72touzi.com&state=myaccount&response_type=code&scope=snsapi_userinfo&connect_redirect=1#wechat_redirect"
                    },
                    {
                        "type": "view",
                        "name": "注册/绑定",
                        "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fm.72touzi.com%2FbindAccount&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
                    }
                ]
            },
            {
                "type": "view",
                "name": "邀请好友",
                "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fm.72touzi.com&state=iinvite&response_type=code&scope=snsapi_userinfo&connect_redirect=1#wechat_redirect"
            }
        ]
    };
    Meteor.call('getTokenAndTicket', function(err, result) {
        var token = result.token;
        var url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + token;
        Meteor.http.call('post', url, { data: data }, function(error, result) {
            if (!result || !result.content) return;
            var content = JSON.parse(result.content);
            if (content.errmsg == 'ok') {
                // console.log('菜单栏初始化成功');
            } else {
                // console.log(content);
            }
        });
    });
});

Meteor.methods({
    updateInterest: function() {
        var date = new Date();
        var profit = null;
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        var todayTime = date.getTime(),
            time = todayTime - 86400000,
            midnight = todayTime + 86400000,
            _idArray = [],
            userIdArr = [],
            newInvest = [],
            oldInvest = [],
            userToMinus = [],
            users = [];
        var log = TradingRecord.findOne({
            timestamp: todayTime,
            type: '活期收益'
        });
        if (log) return;
        TradingRecord.find({ type: '投资', timestamp: { $gt: todayTime, $lt: midnight } }).fetch().forEach(function(item) {
            newInvest.push({ userId: item.userId, sum: item.sum });
        });

        TradingRecord.find({ type: '投资', timestamp: { $lt: todayTime } }).fetch().forEach(function(item) {
            oldInvest.push({ userId: item.userId, sum: item.sum });
            _idArray.push(item.userId);
        });



        userIdArr = _.uniq(_idArray);

        users = Meteor.users.find({ _id: { $in: userIdArr }, 'profile.assets': { $gt: 0 } }).fetch();

        _.each(users, function(user) {
            var addsum = null;
            _.each(newInvest, function(newinvest) {
                if (user._id == newinvest.userId) {
                    var assets = user.profile.assets;
                    user.profile.assets = parseFloat((assets - newinvest.sum).toFixed(2));
                    addsum += newinvest.sum;
                }
                // console.log('要增加的金额：' + addsum);
            });
            profit = parseFloat((user.profile.assets * user.profile.annualRate / 100 / 365).toFixed(2));
            // console.log('产生的收益：' + profit);

            if (!profit || profit <= 0) return;
            TradingRecord.insert({
                userId: user._id,
                type: '活期收益',
                timestamp: todayTime,
                sum: profit
            });

            var allProfit = parseFloat((user.profile.profit + profit).toFixed(2));
            var allAssets = parseFloat((user.profile.assets + profit + addsum).toFixed(2));
            var totalInvest = parseFloat((user.profile.totalInvest + profit).toFixed(2));
            Meteor.users.update(user._id, {
                $set: {
                    'profile.profit': allProfit,
                    'profile.assets': allAssets,
                    'profile.totalInvest': totalInvest,
                }
            });
            // console.log('总资产：' + allAssets + '，总投资：' + totalInvest);
        });

    },
    resetPass: function(name, idCard, pass) {
        var self = this;
        self.unblock();
        var selector = {
                'profile.name': name,
                'profile.idCard': idCard,
                'profile.password': trancPassword
            },
            user = [];
        user = Meteor.users.find(selector).fetch();
        // console.log('pass:' + pass);
        if (user.length) {
            Accounts.setPassword(user[0]._id, pass);
            return user[0]._id + 'test';
        } else {
            return '';

        }
    },
    createOrder: function(options) {
        var self = this;
        var ordId = Date.now();
        self.unblock();

        if (!options) {
            return;
        }

        TradingRecord.insert({
            sum: options.OrdAmt,
            userId: options.userId,
            timestamp: ordId,
            type: '投资',
            isRemoved: true
        });

        return ordId;
    },
    updateUserById: function(userId, item) {
        var self = this;
        self.unblock();
        var user = Meteor.users.findOne(userId);
        if (!user) return;
        Meteor.users.update(userId, {
            $set: item
        });
        return 'true';
    },
    getTokenAndTicket: function() {
        var self = this,
            token = Token.findOne(),
            tokenResult = null,
            card = null,
            ticketResult = null;

        self.unblock();
        if (!token || Date.now() - token.time > 7000 * 1000) {
            // tokenResult = HTTP.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxcfa3cedf47dc35f0&secret=2d884acb55ae7e4d43b8ccee7ac0ac47');
            // ticketResult = HTTP.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tokenResult.data.access_token + '&type=jsapi');
            tokenResult = HTTP.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx03464ad5a6328ac0&secret=e61627bf1195577d18261d946739c1d6');
            ticketResult = HTTP.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tokenResult.data.access_token + '&type=jsapi');
            // console.log(tokenResult, ticketResult);
            if (!token) {
                Token.insert({
                    token: tokenResult.data.access_token,
                    ticket: ticketResult.data.ticket,
                    time: Date.now()
                });
            } else {
                Token.update(token._id, {
                    $set: {
                        token: tokenResult.data.access_token,
                        ticket: ticketResult.data.ticket,
                        time: Date.now()
                    }
                });
            }
        }
        return Token.findOne();
    },
    getInviteUser: function(invitedId, userId, phone) {
        var self = this,
            name = '',
            userInfo = Meteor.users.findOne(invitedId);
        self.unblock();
        if (userInfo) {
            name = userInfo.profile.name;
            InviteRecord.insert({
                name: name,
                invested: false,
                userId: userId,
                inviteId: invitedId,
                phone: phone,
                timestamp: (new Date()).getTime()
            });
            return true;
        } else return;
    },
    updateRate: function(rate) {
        var self = this;
        self.unblock();

        var basic = AnnualRate.findOne(),
            basicrate = basic.basicRate;

        if (basicrate !== rate) {
            var addRate = rate - basicrate;

            Meteor.users.find({
                'profile.role': {
                    $exists: false
                }
            }, {}).forEach(function(item) {
                Meteor.users.update(item._id, {
                    $set: {
                        'profile.annualRate': item.profile.annualRate + addRate,
                        'profile.basicRate': rate
                    }
                });
            });
            AnnualRate.update(basic._id, {
                $set: {
                    basicRate: rate
                }
            });
        }
    },
    getAccess_tokenByCode: function(code) {
        var self = this;
        self.unblock();
        var result = HTTP.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx03464ad5a6328ac0&secret=e61627bf1195577d18261d946739c1d6&code=' + code + '&grant_type=authorization_code');
        if (result && result.content) return JSON.parse(result.content);
        else return '';
    },
    getUserFromSelector: function(selector) {
        var self = this;
        self.unblock();
        return Meteor.users.findOne(selector);
    },
    judgeBindedOrNot: function(code) {
        var self = this;
        self.unblock();
        var result = HTTP.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx03464ad5a6328ac0&secret=e61627bf1195577d18261d946739c1d6&code=' + code + '&grant_type=authorization_code');
        if (result && result.content) {
            var result = JSON.parse(result.content);
            var user = Meteor.users.findOne({ 'profile.openid': result.openid });
            // console.log(user);
            return { openid: result.openid, user: user };
        } else return '';
    }
});


function dateFormat(date) {
    var month = (date.getMonth() + 1) + '';
    var d = date.getDate() + '';
    var hours = date.getHours() + '';
    var min = date.getMinutes() + '';
    var sec = date.getSeconds() + '';
    return date.getFullYear() + '-' + '00'.substring(0, 2 - month.length) + month + '-' +
        '00'.substring(0, 2 - d.length) + d + ' ' +
        '00'.substring(0, 2 - hours.length) + hours + ':' +
        '00'.substring(0, 2 - min.length) + min + ':' +
        '00'.substring(0, 2 - sec.length) + sec;
}