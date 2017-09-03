/**
 * 定义所有的Collection
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */

/*
 *@ name 用户信息
{
    phone: '13666666666',                      // 手机号码
    email: 'test@example.com',              // 邮箱
    assets: 6666,                                   // 总资产
    totalInvest:9999999,                       / /总投资
    profit: 66,                                          // 总收益
    annualRate: 4,                                   // 年收益率
    basicRate:4                                     //基础利率
    name: '张三',                                      // 姓名
    idCard: '500235199001012211',       // 身份证
    verified: false,                                   // 是否已认证
    bankCard: '622222222222222222',  // 银行卡
    cardHolder: '张三',                      // 持卡人姓名
    bankName: '中国建设银行',               // 开户行
    bankCity: '广州',                                // 开户城市
    password: '123456'                          // 交易密码
}
*/

UserInfo = new Mongo.Collection('userInfo');

/*
 *@ name 交易记录
{
    type: '投资',                                // 交易记录类型（活期收益，投资，赎回）
    sum: 3250.00,                            // 金额
    userId: 'mQQgYCigNKH',          // 用户的userId
    timestamp: 1443153524274     // 时间戳
}
*/

TradingRecord = new Mongo.Collection('tradingRecord');

/*
 *@ name 邀请列表
{
    name: '张三',                             // 姓名
    registered: false,                       // 是否已注册
    invested: false,                          // 是否已投资
    userId: 'mQQgYCigNKH',         // 被邀请人id
    inviteId: 'mqqsooiwnnk',          // 邀请人id
    timestamp: 1443153524274    // 时间戳
}

*/

InviteRecord = new Mongo.Collection('inviteRecord');

//统计调用微信公众号token的次数

/*
 *@ name 记录请求微信开发的token
{
    token:''   //标志
}
*/
Token = new Mongo.Collection('token');


/*
 *@ name 赎回列表
{
  name:'张三',    //名字
  bankName:'中国建设银行',//所在银行
  bankCard:'xxxxxx',   //银行卡号
  bankCity:'广州'    //银行卡所在城市
}
*/
WithdrawlRecord = new Mongo.Collection('withdrawlRecord');

/*
 *@ name 基础利率
{
    basicRate:4
}
*/
AnnualRate = new Mongo.Collection('annualRate');
