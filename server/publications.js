/**
 * publish所有的Collection
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */
Meteor.publish("userInfo", function () {
  return Meteor.users.find({'profile.role': { $exists: false }},{});
});

Meteor.publish("tradingRecord", function () {
    return TradingRecord.find({'isRemoved':{$ne:true}},{});
 // return TradingRecord.find({},{});
});

Meteor.publish("inviteRecord", function () {
  return InviteRecord.find({},{});
});

// 'invested':{$ne:true}
Meteor.publish("annualRate",function(){
	return AnnualRate.find({},{});
});
