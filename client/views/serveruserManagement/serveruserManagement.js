Template.serveruserManagement.onCreated(function(){
    var self = this;
    self.autorun(function () {
        self.subscribe("userInfo",{});
    });
});

Template.serveruserManagement.onRendered(function(){
    $('.mobile-style,.ui-loader,.ui-page').remove();
    var self = this,
        records = [],
        count = 1;
    setTimeout(function timer(){
        $('#annualInterest-btn').click(function(event) {
            /* Act on the event */
            var annualRate = parseFloat(parseFloat($('#annualInterest').val()).toFixed(2));

            Meteor.call('updateRate',annualRate,function(err,result){
                if(err){
                    console.log(err.toString());
                }
                else{
                    $('#annualInterest').val('');
                }
            });
        });
    },1000);
    self.autorun(function () {
            records = [],
            count = 1;
        var userInfo = Meteor.users.find({'profile.role': {$exists: false }}).fetch();
        if(DDP._allSubscriptionsReady()){
              
            _.each(userInfo,function getRecord(item,index){
               if(item.profile){
                records.push({
                    recid:count,
                    name:item.profile.name,
                    phone:item.profile.phone,
                    email:item.profile.email,
                    assets:item.profile.assets,
                    totalInvest:item.profile.totalInvest,
                    profit:item.profile.profit,
                    annualRate:item.profile.annualRate,
                    idCard:item.profile.idCard,
                    verified:item.profile.verified,
                    bankCard:item.profile.bankCard,
                    cardHolder:item.profile.cardHolder,
                    bankName:item.profile.bankName,
                    bankCity:item.profile.bankCity,
                    password:item.profile.password
                });
                count++;
               }
            });
            console.log(records.length);
            if (w2ui.userManagement) {
                w2ui.userManagement.records =records;
                w2ui['userManagement'].refresh();
            }
        }
    });

    if (w2ui.userManagement) {
        w2ui.userManagement.destroy();
    }
    $('#grid').w2grid({
        name: 'userManagement',
        header: '用户信息管理界面',
        show: {
            header : true,
            toolbar : true,
            footer : true,
            lineNumbers : true,
            selectColumn: true,
            //             expandColumn: true
        },
        columns:[
            { field:'name', caption:'姓名',size:'80px'},
            { field:'phone', caption:'手机号', size:'120px'},
            { field:'email', caption:'邮箱',size:'150px'},
            { field:'assets', caption:'总资产',size:'80px'},
            { field:'totalInvest', caption:'总投资',size:'80px'},
            { field:'profit', caption:'总收益',size:'80px'},
            { field:'annualRate', caption:'年收益率/%',size:'80px'},
            { field:'idCard', caption:'身份证',size:'180px'},
            { field:'verified', caption:'是否验证',size:'80px'},
            { field:'bankCard', caption:'卡号',size:'150px'},
            { field:'cardHolder', caption:'持卡人',size:'80px'},
            { field:'bankName', caption:'开户行',size:'120px'},
            { field:'bankCity', caption:'开户城市',size:'100px'},
            { field:'password:', caption:'交易密码',size:'7%',hidden: true},
        ],
        searches:[
            { type:'int', field:'recid', caption:'ID'},
            { type:'tel', field:'phone', caption:'手机号'},
            { type:'email', field:'email', caption:'邮箱'},
            { type:'text', field:'name', caption:'姓名'},
        ],
        records:records,

    });
});
