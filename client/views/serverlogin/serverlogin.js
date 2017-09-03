/**
 * 用户登录功能
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */

Template.serverlogin.onCreated(function () {
    // 默认显示登录按钮
    Session.setDefault('displayButton', true);
});
Template.serverlogin.onRendered(function(){
    $('.mobile-style,.ui-loader,.ui-page').remove();
});

Template.serverlogin.helpers({
    /**
     * 是否显示登录按钮
     * 
     * @return {Boolean} true：显示登录按钮；false：显示正在登录的动画
     */
    displayButton: function () {
        return Session.get('displayButton');
    },
    /**
     * 是否禁止登录按钮点击事件
     * 
     * @return {[String]} disabled：禁止点击登录按钮；''：不禁止
     */
    disableButton: function () {
        return !Session.get('displayButton') ? 'disabled' : '';
    },
    /**
     * 登录提示信息
     * 
     * @return {[String]} 登录提示信息
     */
    loginMessage: function () {
        return Session.get('loginMessage');
    }
});

Template.serverlogin.events({
    /**
     * 登录
     * 
     * @param  {Object} e      登录提交事件
     * @param  {Object} target form表单的jQuery对象
     * 
     * @return {Boolean}       阻止页面跳转
     */
    'submit #loginForm': function (e, target) {
        e.preventDefault();
        Session.set('displayButton', false);
        Session.set('loginMessage', '');

        var email = target.find('#email').value,
            password = target.find('#password').value;

        Meteor.loginWithPassword(email, password, function (err) {
            if (err) {
                Session.set('loginMessage', err.reason);
            } else {
                Router.go('serverhome');
            }
            Session.set('displayButton', true);
        });

        return false;
    }
});
