/**
 * 所有的配置信息
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-17
 * @review
 */



/**
 * 所有页面的route
 *
 * @type {Array}
 *
 * @author  Vincent Zheng
 */
SYS_ROUTES = [
    { route: 'serverhome', path: '/serverhome', template: 'serverhome', text: '首页' },
    { route: 'serverlogin', path: '/serverlogin', template: 'serverlogin', text: '' },
    { route: 'serveruserManagement', path:'/serveruserManagement', template:'serveruserManagement', text:'用户管理'},
    { route: 'serveriinvite', path:'/serveriinvite', template:'serveriinvite', text:'我的邀请'},
    { route: 'servertradingRecord', path:'/servertradingRecord', template:'servertradingRecord', text:'交易记录'},
    { route: 'serverWithdrawlRecord', path:'/serverWithdrawlRecord',template:'serverWithdrawlRecord',text:'赎回金额'},
    { route: 'mobile', path:'/', template:'mobile', text:''},
    { route: 'bindAccount', path:'/bindAccount',template:'bindAccount',text:''},  
    { route: 'serverWithdrawl', path:'/serverWithdrawl', template:'serverWithdrawl', text:'提现赎回'}
];
