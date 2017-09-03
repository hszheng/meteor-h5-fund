Template.servertradingRecord.onCreated(function(){
    var self = this;
    self.autorun(function () {
        self.subscribe("tradingRecord",{});
    });
});


Template.servertradingRecord.onRendered(function(){
$('.mobile-style,.ui-loader,.ui-page').remove();
    var self = this,
        records = [],
        count = 1;

    setTimeout(function(event){
        $('#withdrawl-btn').click(function(){
            var userTel = $('#userTel').val();
            var withDrawl = $('#withdrawl').val();
            console.log(userTel,withDrawl);
            Meteor.users.find().fetch().forEach(function(item){
                if(item.profile.phone ===userTel){
                    TradingRecord.insert({
                        type:'赎回',
                        sum:withDrawl,
                        userId:item._id,
                        timestamp:(new Date()).getTime()});
                }
            });
        });
    },3000);

    self.autorun(function(){
            records = [],
            count = 1;
        var tradingRecord = TradingRecord.find().fetch();
            if(DDP._allSubscriptionsReady()){
                _.each(tradingRecord,function(item,index){
                    records.push({
                        recid:count,
                        type:item.type,
                        sum:item.sum,
                        userId:item.userId,
                        timestamp:dateFormat(new Date(item.timestamp))
                    });
                    count++;
                });
            }
        if(w2ui.tradingRecord){
            w2ui.tradingRecord.records = records;
            w2ui['tradingRecord'].refresh();
        }
    });


    if(w2ui.tradingRecord){
        w2ui.tradingRecord.destroy();
    }
    $('#grid1').w2grid({
        name: 'tradingRecord',
        header: '用户交易记录',
        show: {
            header : true,
            toolbar : true,
            footer : true,
            lineNumbers : true,
            selectColumn: true,
        },

        columns:[
            { field:'type', caption:'交易类型',size:'100px'},
            { field:'sum', caption:'金额', size:'80px'},
            { field:'userId', caption:'用户ID',size:'180px'},
            { field:'timestamp', caption:'时间',size:'180px'},
        ],
        searches:[
            { type:'int', field:'recid', caption:'ID'},
            { type:'type', field:'type', caption:'类型'},
            { type:'sum', field:'sum', caption:'金额'},
            { type:'timestamp', field:'timestamp', caption:'时间'},
        ],
        records:records,

    });
});

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
