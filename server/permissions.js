/**
 * Collection权限设置
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */

// 不允许注册新用户
// Accounts.validateNewUser(function (user) {
//   	return false;
// });

// 不允许修改用户信息
// Meteor.users.deny({
//     insert: function (userId, party) {
//     	return true;
//     },
//     update: function (userId, party, fields, modifier) {
//     	return true;
//     },
//     remove: function (userId, party) {
//     	return true;
//     }
// });