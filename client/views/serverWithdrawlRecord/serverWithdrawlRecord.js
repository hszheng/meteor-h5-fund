Template.serverWithdrawlRecord.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe("tradingRecord", {});
        self.subscribe("userInfo", {});
    });
});


Template.serverWithdrawlRecord.onRendered(function() {
    $('.mobile-style,.ui-loader,.ui-page').remove();
    var self = this,
        records = [],
        count = 1,
        timer = Meteor.setInterval(function () {
            if (!window.w2ui) {
                return;
            }
            Meteor.clearInterval(timer);
        self.autorun(function(){
            records = [],
                count = 1;
            var tradingRecord = TradingRecord.find({
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
                                recid: count,
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
                        count++;
                    });

                });
            }
            if (w2ui.withdrawlRecord) {
                w2ui.withdrawlRecord.clear();
                w2ui.withdrawlRecord.records = records;
                w2ui['withdrawlRecord'].refresh();
            }
        });


        if (w2ui.withdrawlRecord) {
            w2ui.withdrawlRecord.destroy();
        }
        $('#grid3').w2grid({
            name: 'withdrawlRecord',
            header: '用户赎回记录',
            show: {
                header: true,
                toolbar: true,
                footer: true,
                lineNumbers: true,
                selectColumn: true,
            },
            toolbar: {
                items: [{
                    id: 'withdrawl',
                    type: 'button',
                    caption: '赎回',
                    icon: 'w2ui-icon-check'
                }],
                onClick: function(event) {
                    if (event.target == 'withdrawl') {
                        var recid = w2ui.withdrawlRecord.getSelection(),
                            selectedRecord = w2ui.withdrawlRecord.get(recid),
                            result = Meteor.users.findOne(selectedRecord.userId).profile.assets - selectedRecord.sum,
                            assets = parseFloat(result.toFixed(2));
                        // Meteor.users.update({_id:selectedRecord.userId},{$set:{'profile.assets':assets}});   
                        Meteor.call('updateUserById', selectedRecord.userId, {
                            'profile.assets': assets
                        });
                        TradingRecord.update(selectedRecord.recordId, {
                            $set: {
                                isRemoved: false
                            }
                        });

                    }
                }
            },
            columns: [{
                field: 'sum',
                caption: '金额',
                size: '80px',
                attr: 'align=center'
            }, {
                field: 'bankName',
                caption: '开户行',
                size: '100px',
                attr: 'align=center'
            }, {
                field: 'name',
                caption: '名字',
                size: '80px',
                attr: 'align=center'                
            }, {
                field: 'bankCard',
                caption: '银行卡号',
                size: '150px',
                attr: 'align=center'                
            }, {
                field: 'bankCity',
                caption: '开户所在地',
                size: '100px',
                attr: 'align=center'
            }, {
                field: 'phone',
                caption: '联系电话',
                size: '100px',
                attr: 'align=center'                
            }, {
                field: 'timestamp',
                caption: '时间',
                size: '150px',
                attr: 'align=center'                
            }, {
                field: 'recordId',
                caption: 'Id',
                size: '10px',
                hidden: true
            }, {
                field: 'userId',
                caption: 'userId',
                size: '10px',
                hidden: true
            }],
            searches: [{
                type: 'int',
                field: 'recid',
                caption: 'ID'
            }, {
                type: 'name',
                field: 'name',
                caption: '名字'
            }, {
                type: 'sum',
                field: 'sum',
                caption: '金额'
            }, {
                type: 'timestamp',
                field: 'timestamp',
                caption: '时间'
            }, ],
            records: records,

        });
    }, 200);
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