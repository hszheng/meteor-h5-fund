Template.serverWithdrawl.onCreated(function() {
    var self = this;
    self.autorun(function() {
        if (Session.get('tradingRecordSelector') || Session.get('tradingRecordOptions')) {
            self.subscribe('tradingRecord', Session.get('tradingRecordSelector'), Session.get('tradingRecordOptions'));
        }
        if (Session.get('userInfoSelector') || Session.get('userInfoOptions')) {
            self.subscribe('userInfo', Session.get('userInfoSelector'), Session.get('userInfoOptions'));
        }

    });

    Session.set('tradingRecordSelector', {
        'isRemoved': {
            $ne: true
        }
    });

    Session.set('tradingRecordOptions', {});

    Session.set('userInfoSelector', {
        'profile.role': {
            $exists: false
        }
    });

    Session.get('userInfoOptions', {});
});

Template.serverWithdrawl.onRendered(function(e) {
    var self = this;
    self.autorun(function() {
        var records = [],
            count = 1,
            html = '';

            tradingRecord = TradingRecord.find({
                type: '赎回',
                'isRemoved': {
                    $ne: false
                }
            }).fetch(),

            userInfo = Meteor.users.find({
                'profile.role': {
                    $exists: false
                }
            }).fetch();
        //名字，开户行，银行卡号，开户所在地，联系方式，赎回金额，日期
        if (DDP._allSubscriptionsReady()) {
            _.each(tradingRecord, function(item, index) {
                _.each(userInfo, function(user, pos) {
                    if (item.userId === user._id) {
                        records.push({
                            num: count,
                            name: user.profile.name,
                            sum: item.sum,
                            bankName: user.profile.bankName,
                            bankCard: user.profile.bankCard,
                            bankCity: user.profile.bankCity,
                            phone: user.profile.phone,
                            timestamp: dateFormat(new Date(item.timestamp)),
                            recordId: item._id,
                            userId: item.userId
                        });
                    }
                });
                count++;
            });
        }

        Session.set('records', records);
            
});
//对table绑定点击事件，通过target定位行，改变行的属性
    $('.table-responsive table').on('click', function(e) {
        var item = $(e.target).parent();
            item.addClass('changebgColor');
            item.siblings().removeClass('changebgColor');        
    }); 
    $('.table-responsive .withdrwal-btn').on('click',function(e){
        var item  = $('.table-responsive .changebgColor td'),
            sum  = $('table .changebgColor td[name="sum"]').html(),
            userId = $('table .changebgColor td[name="userId"]').html(),
            recordId = $('table .changebgColor td[name="recordId"]').html(),
            result = Meteor.users.findOne(userId).profile.assets- parseFloat(sum),
            
            assets =parseFloat(result.toFixed(2));
            
            Meteor.call('updateUserById',userId,{'profile.assets':assets},function(err,result){
                if(!err){
                    TradingRecord.update(recordId,{$set:{isRemoved:false}});        
                    alert('赎回成功！');
                }
            });
            
            
    });
});

Template.serverWithdrawl.helpers({
    records: function(e) {
        return Session.get('records');
    }

});

// 选中某一行进行赎回操作
(function initTableRow(){
    $('.table-responsive table tbody tr:not(:first-child)').on('click', function(e) {
        $('.table-responsive table').removeClass('changebgColor');
        var item = $(e.currentTarget);
        item.addClass('changebgColor');
        item.siblings().removeClass('changebgColor');
    });    
})();

// 日期格式
function dateFormat(date) {
    var month = (date.getMonth() + 1) + '';
    var d     = date.getDate() + '';
    var hours = date.getHours() + '';
    var min   = date.getMinutes() + '';
    var sec   = date.getSeconds() + '';
    return date.getFullYear() + '-' + '00'.substring(0, 2 - month.length) + month + '-' +
        '00'.substring(0, 2 - d.length) + d + ' ' +
        '00'.substring(0, 2 - hours.length) + hours + ':' +
        '00'.substring(0, 2 - min.length) + min + ':' +
        '00'.substring(0, 2 - sec.length) + sec;
}
