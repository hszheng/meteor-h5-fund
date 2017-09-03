Template.serveriinvite.onCreated(function(){
    var self = this;
    self.autorun(function () {
        self.subscribe("inviteRecord",{});
    });
});

Template.serveriinvite.onRendered(function(){
    $('.mobile-style,.ui-loader,.ui-page').remove();
    var records = [],
        count = 1,
        self = this;
    self.autorun(function(){
        records = [],
        count = 1;
        var inviteRecord = InviteRecord.find().fetch();
        if(DDP._allSubscriptionsReady){
            _.each(inviteRecord,function(item,index){
                records.push({
                    recid:count,
                    name:item.name,
                    invested:item.invested,
                    userId:item.userId,
                    inviteId:item.inviteId,
                    phone:item.phone,
                    timestamp:dateFormat(new Date(item.timestamp))
                });
                count++;
            });

        }
        if(w2ui.iinvite){
            w2ui.iinvite.records = records;
            w2ui['iinvite'].refresh();
        }
    });


    if(w2ui.iinvite){
        w2ui.iinvite.destroy();
    }
    $('#grid2').w2grid({
        name: 'iinvite',
        header: '用户邀请记录',
        show: {
            header : true,
            toolbar : true,
            footer : true,
            lineNumbers : true,
            selectColumn: true,
        },
        columns:[
            { field:'name', caption:'名字',size:'80px'},
            { field:'invested', caption:'是否投资',size:'80px'},
            { field:'userId', caption:'被邀请人ID',size:'120px'},
            { field:'inviteId', caption:'邀请人ID',size:'120px'},
            { field:'phone' ,caption:'被邀请人电话',size:'150px'},
            { field:'timestamp', caption:'时间',size:'180px'},
        ],
        searches:[
            { type:'int', field:'recid', caption:'ID'},
            { type:'invested', field:'invested', caption:'是否投资'},
            { type:'phone', field:'phone', caption:"联系电话"},
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
