var invitedId = '';
var name = 'invitedId';
name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
if (regex.exec(location.search)) {
    results = regex.exec(location.search)[1];
    invitedId = decodeURIComponent(results.replace(/\+/g, " "));
}
Template.mobile.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe("userInfo", {});
        self.subscribe("tradingRecord", {});
        self.subscribe("inviteRecord", {});
        self.subscribe("annualRate", {});
    });
});
if (location.pathname == '/') {
    Session.set('isFirstCreate', true);
    $(document).on("pagecreate", function() {
        if (!Session.get('isFirstCreate')) {

            return;
        }
        Session.set('isFirstCreate', false);
        var backcode = parse('code');
        var state = parse('state');
        if (backcode) {
            Meteor.call('getAccess_tokenByCode', backcode, function(err, result) {
                var openid = result.openid;
                Session.set('openid', openid);
                var result = Meteor.users.findOne({
                    'profile.openid': openid
                });
                if (!result) {
                    if (state === "productInfo") {
                        $.mobile.changePage("#" + state);
                        return;
                    }
                    alert('您尚未绑定账号！');
                    return false;
                }
                if (result) {
                    Meteor.loginWithPassword(result.username, result.profile.loginPassword, function(err1) {
                        if (err1) {
                            alert(err1);
                        } else {
                            $.mobile.changePage("#" + state);
                        }
                    });
                }
                if (err) {
                    alert(err.toString());
                }

                // });

            });
            return;
        }
        // 首次进入
        if (!Meteor.user()) {
            if (invitedId) {
                setTimeout(function(invitedId) {
                    $.mobile.changePage('#register');
                }, 800);
            } else {
                setTimeout(function() {
                    $.mobile.changePage('#login');
                }, 800);
            }
        }

    });
};
$(document).on("pagebeforeshow", "#login", function() {
    $('#login .login-tel').val('');
    $('#login .pass').val('');
    if (Meteor.user()) {
        $.mobile.changePage('#myaccount');
    }
});

$(document).on("pagebeforeshow", "#myaccount", function() {
    if (!Meteor.user()) {
        $.mobile.changePage('#login');
        return;
    }
    if (!Meteor.user().profile.password) {
        $.mobile.changePage('#transactionpassword');
        return;
    }
});

$(document).on("pagebeforeshow", "#mybankcard", function() {
    if (!Meteor.user()) {
        $.mobile.changePage('#login');
    } else {
        $('#mybankcard .card-city').val('');
        $('#mybankcard .card-num').val('');
        $('#mybankcard .card-bank').not('select').eq(0).html('');
        if (Meteor.user().profile.bandCard) {
            $.mobile.changePage('#investment');
        }
    }
});

$(document).on("pagebeforeshow", "#investment", function() {
    $('#investment input[name=investfee]').val('');
    $('#investment .keyboard-containner').css('display', 'none');
})


// 我的银行卡
$(document).on("pagebeforeshow", "#mybankcard", function() {
    if (!Meteor.user()) {
        $.mobile.changePage('#login');
    }
});

// 修改密码
$(document).on("pagebeforeshow", "#changepassword", function() {
    $('#changepassword .old-pass').val('');
    $('#changepassword .new-pass').val('');
    $('#changepassword .new-repass').val('');
});

// 修改交易密码
$(document).on("pagebeforeshow", "#changetradepassword", function() {
    $('#changetradepassword .old-pass').val('');
    $('#changetradepassword .new-pass').val('');
    $('#changetradepassword .new-repass').val('');
});

Template.mobile.onRendered(function() {
    var self = this;
    self.autorun(function() {
        if (Meteor.user()) {
            var annualRate = Meteor.user().profile.annualRate, // AnnualRate.findOne().basicRate,
                rate = 360 * annualRate / 100,
                percent = annualRate / 100;
            $('.aInterest').text(annualRate.toFixed(2));
            if (percent >= 0.5) {
                $('.circle-rotate-right').css('display', 'block');
                $('.circle-rotate-right').css('transform', 'rotateZ(' + (rate - 180) + 'deg)');
            } else {
                $('.circle-rotate-left').css('transform', 'rotateZ(' + rate + 'deg)');
            }
            //我的邀请
            Meteor.call('getTokenAndTicket', function(err, result) {

                var now = Math.floor(Date.now() / 1000) + '',
                    imgUrl = '',
                    link = 'http://m.72touzi.com/?invitedId=' + Meteor.userId(),
                    // link = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx03464ad5a6328ac0&redirect_uri=http%3A%2F%2Fwww.72touzi.com%2F%3FinvitedId%3D'+ Meteor.userId()+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect',
                    appId = 'wx03464ad5a6328ac0',
                    // appId = 'wxcfa3cedf47dc35f0',
                    nonceStr = 'Wm3WZYTPz0wzccnW',
                    ticket = result.ticket,
                    str = decodeURIComponent('jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + now + '&url=' + location.href.split('#')[0]),

                    signature = new jsSHA(str, 'TEXT').getHash('SHA-1', 'HEX');
                // alert(str);
                wx.config({
                    debug: false,
                    appId: appId,
                    timestamp: now,
                    nonceStr: nonceStr,
                    signature: signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ']
                });
                wx.ready(function() {
                    wx.onMenuShareTimeline({
                        title: '快来和我一起体验高收益的活期理财吧！', //分享标题
                        link: link, //分享链接
                        imgUrl: 'http://m.72touzi.com/images/peiking72.png', //分享图标
                        success: function() {
                            //用户确认分享后执行的回调函数
                            // console.log(link);
                        },
                        cancel: function() {
                            //用户取消分享后 执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: '快来和我一起体验高收益的活期理财吧！', //分享标题
                        desc: '固定年化收益最高6%，10万每天赚16.43元，保本保息，随存随取。', //分享描述
                        link: link,
                        imgUrl: 'http://m.72touzi.com/images/peiking72.png', //分享图标
                        type: '', //分享类型默认为link
                        dataUrl: '', //默认为空
                        success: function() {
                            //用户确认分享后执行的回调函数
                            // alert(Meteor.userId());
                        },
                        cancel: function() {
                            //用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareQQ({
                        title: '快来和我一起体验高收益的活期理财吧！', // 分享标题
                        desc: '固定年化收益最高6%，10万每天赚16.43元，保本保息，随存随取。', // 分享描述
                        link: link, // 分享链接
                        imgUrl: ' http://m.72touzi.com/images/peiking72.png', // 分享图标
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });

                });
                wx.error(function(rss) {});
            });
        }
    });
    createCode();

    //初始化   
    $(document).on("pageinit", "#pageone", function() {

    });

    // 注册
    $('#register #register-but').click(function(event) {
        event.preventDefault();

        if (validate()) {
            var phone = $('.register-tel').val(),
                pass = $('.register-pass.pass').val(),
                repass = $('.register-pass.re-pass').val();
            if (!phone) {
                $('.register-tel').focus();
                return;
            }
            if (!/^\d+$/.test(pass)) {
                alert('密码为6位数字！');
                return;
            }
            if (!pass) {
                $('.register-pass.pass').focus();
                return;
            }
            if (!repass) {
                $('.register-pass.re-pass').focus();
                return;
            }
            if (pass !== repass) {
                alert('两次密码输入不一致！');
                return;
            }
            if (pass.length < 6) {
                alert('密码长度至少为六位！');
                return;
            }
            if (!phone.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/)) {
                alert('手机号码不符合规则！');
                return;
            }
            //调用Accounts.createUser创建用户
            Accounts.createUser({
                username: phone,
                password: pass
            }, function(err, result) {
                console.log('invitedId:' + invitedId);
                if (err) {
                    if (err.reason === "Username already exists.") {
                        alert('该用户已存在');
                        $('.register-tel').focus();
                    }
                } else {
                    //invitedId = getParameterByName('invitedId');
                    if (invitedId) {
                        console.log(invitedId);
                        Meteor.call('getInviteUser', invitedId, Meteor.userId(), phone, function(err, result) {

                        });
                    }
                    $.mobile.changePage('#transactionpassword');
                }

            });
        }
        return false;
    });
    //忘记密码
    $('#forgetPassword').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        $.mobile.changePage('#resetPassword');
    });
    //忘记交易密码
    $('.resetTransPass').click(function(e) {
        $.mobile.changePage('#resetTranPassword');
    });
    //提交新交易密码
    $('.resetTranPassword .submitnTranPass').click(function(e) {
        e.preventDefault();
        var idCard = $('#resetTranPassword .real-card').val();
        pass = $('#resetTranPassword .pass').val();
        repass = $('#resetTranPassword .re-pass').val();
        if (!idCard) {
            $('#resetTranPassword .real-card').focus();
            return;
        }
        if (!pass) {
            $('#resetTranPassword .pass').focus();
            return;
        }
        if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(idCard))) {
            $('#resetTranPassword #popupTip p').html('输入的身份证号长度不对，或者号码不符合规定！');
            $('#resetTranPassword #popupTip').popup('open');
            return;
        }
        if (!/^\d+$/.test(pass)) {
            alert('新密码为6位数字！');
            return;
        }
        if (!pass) {
            $('#resetTranPassword .pass').focus();
            return;
        }
        if (!repass) {
            $('#resetTranPassword .re-pass').focus();
            return;
        }
        if (pass !== repass) {
            alert('两次密码输入不一致！');
            return;
        }
        if (pass.length < 6) {
            alert('密码长度至少为六位！');
            return;
        }
        $('#resetTranPassword .real-card').val('');
        $('#resetTranPassword .pass').val('');
        $('#resetTranPassword .re-pass').val('');

        Meteor.call('updateUserById', Meteor.userId(), {
            'profile.password': pass
        });
    });
    //提交新密码
    $('.submitnewPass').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        var name = $('#resetPassword .authenticate .real-name').val(),
            idCard = $('#resetPassword .authenticate .real-card').val(),
            pass = $('#resetPassword .register-pass.pass').val(),
            repass = $('#resetPassword .register-pass.re-pass').val();

        if (!name) {
            $('#resetPassword #popupTip p').html('请输入真实姓名');
            $('#resetPassword #popupTip').popup('open');
            return;
        }
        if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(idCard))) {
            $('#resetPassword #popupTip p').html('输入的身份证号长度不对，或者号码不符合规定！');
            $('#resetPassword #popupTip').popup('open');
            return;
        }
        if (!/^\d+$/.test(pass)) {
            alert('新密码为6位数字！');
            return;
        }
        if (!pass) {
            $('.register-pass.pass').focus();
            return;
        }
        if (!repass) {
            $('.register-pass.re-pass').focus();
            return;
        }
        if (pass !== repass) {
            alert('两次密码输入不一致！');
            return;
        }
        if (pass.length < 6) {
            alert('密码长度至少为六位！');
            return;
        }


        $('#resetPassword .authenticate .real-name').val(''),
            $('#resetPassword .authenticate .real-card').val(''),
            $('#resetPassword .register-pass.pass').val(''),
            $('#resetPassword .register-pass.re-pass').val('');
        Meteor.call('resetPass', name, idCard, pass, function(err, result) {

            if (result) {
                console.log(result);
                $('#resetPassword #popupTip p').html('修改成功！');
                $('#resetPassword #popupTip').popup('open');
            } else {
                $('#resetPassword #popupTip p').html('验证失败！');
                $('#resetPassword #popupTip').popup('open');
            }
            if (err) {
                console.log(err);
            }
        });

    });
    // 输入交易密码
    $('#transactionpassword #transact-btn').click(function(event) {
        var tranPass = $('#transactionpassword .tran-pass').val(),
            tranRepass = $('#transactionpassword .tran-repass').val();
        if (!/^\d+$/.test(tranPass)) {
            alert('交易密码为6位数字！');
            return;
        }
        if (!tranPass) {
            $('#transactionpassword .tran-pass').val().focus();
            return;
        }
        if (!tranRepass) {
            $('#transactionpassword .tran-repass').focus();
            return;
        }
        if (tranPass !== tranRepass) {
            alert('两次交易密码输入不一致！');
            return;
        }
        if (tranPass.length != 6) {
            alert('交易密码长度必须为6位！');
            return;
        }
        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                'profile.password': tranPass
            }
        });
        $.mobile.changePage('#myaccount');
    });

    // 修改交易密码
    $('#changetradepassword #transact-btn').click(function(event) {
        var oldPass = $('#changetradepassword .old-pass').val(),
            newPass = $('#changetradepassword .new-pass').val(),
            newRePass = $('#changetradepassword .new-repass').val();
        if (!oldPass) {
            $('#changetradepassword .old-pass').val().focus();
            return;
        }
        if (!/^\d+$/.test(newPass)) {
            alert('新密码为6位数字！');
            return;
        }
        if (!newPass) {
            $('#changetradepassword .new-pass').focus();
            return;
        }
        if (!newRePass) {
            $('#changetradepassword .new-repass').focus();
            return;
        }
        if (newPass !== newRePass) {
            alert('两次交易密码输入不一致！');
            return;
        }
        if (newPass.length != 6) {
            alert('交易密码长度必须为6位！');
            return;
        }
        if (oldPass != Meteor.user().profile.password) {
            alert('旧的交易密码不正确！');
            return;
        }
        Meteor.call('updateUserById', Meteor.userId(), {
            'profile.password': newPass
        });
        $('#changetradepassword .old-pass').val('');
        $('#changetradepassword .new-pass').val('');
        $('#changetradepassword .new-repass').val('');
        $.mobile.changePage('#accountmanagement');
    });

    // 修改密码
    $('#changepassword #transact-btn').click(function(event) {
        var oldPass = $('#changepassword .old-pass').val(),
            newPass = $('#changepassword .new-pass').val(),
            newRePass = $('#changepassword .new-repass').val();
        if (!oldPass) {
            $('#changepassword .old-pass').val().focus();
            return;
        }
        if (!/^\d+$/.test(newPass)) {
            alert('新密码为6位数字！');
            return;
        }
        if (!newPass) {
            $('#changepassword .new-pass').focus();
            return;
        }
        if (!newRePass) {
            $('#changepassword .new-repass').focus();
            return;
        }
        if (newPass !== newRePass) {
            alert('两次交易密码输入不一致！');
            return;
        }
        Accounts.changePassword(oldPass, newPass, function(err, result) {
            if (err) {
                if (err.reason === 'Incorrect password') {
                    return alert('原密码错误.');
                }
            } else {
                $('#changepassword .old-pass').val('');
                $('#changepassword .new-pass').val('');
                $('#changepassword .new-repass').val('');
                $.mobile.changePage('#accountmanagement');
            }
        });
    });

    // 修改邮箱
    $('#mailbox .mailbox-btn').click(function(event) {
        event.preventDefault();
        var email = $('#mailbox .mailbox').val();
        if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(email)) {
            return alert('邮箱格式不正确！');
        }
        Meteor.users.update(Meteor.userId(), {
            $set: {
                'profile.email': email
            }
        });
        $('#mailbox .mailbox').val('');
        $.mobile.changePage('#accountmanagement');
    })

    // 登陆
    $('#login-btn').click(function(event) {
        event.preventDefault();
        var loginTel = $('.login-tel').val(),
            pass = $('.pass').val();
        if (!loginTel) {
            $('.login-tel').focus();
            return;
        }
        if (!/[^/d]/g.test(pass)) {
            alert('密码为6位数字！');
            return;
        }
        if (!pass) {
            $('.pass').focus();
            return;
        }
        Meteor.loginWithPassword(loginTel, pass, function(err) {
            if (err) {
                if (err.reason == "Incorrect password") {
                    alert('密码错误');
                    return false;
                }
                if (err.reason == "User not found") {
                    alert('找不到该用户');
                    return false;
                }
            } else if (!Meteor.user().profile.password) {
                $.mobile.changePage('#transactionpassword');
                return;
            } else {

                $.mobile.changePage('#myaccount');
                return true;
            }
        });

    });

    // 我的账户
    $('#myaccount #newInvest').click(function(event) {
        event.preventDefault();
        if (!Meteor.user().profile.verified) {
            $.mobile.changePage('#verified');
        } else {
            if (Meteor.user().profile.bankName) {
                $.mobile.changePage('#investment');
            } else {
                $.mobile.changePage('#mybankcard');
            }
        }
    });

    //活期盈图片跳转
    $('#financialproduct .to-earnings').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#productInfo');
    });
    // 累计收益,
    $('#myaccount #list-profit').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#earnings');
        // $.mobile.changePage('#investmentagreement');
    });

    $('#myaccount #withdrawl').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#myaccount');
    });

    $('#myaccount #tradeRecord').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#transactionrecord');
    });

    $('#myaccount #accountMan').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#accountmanagement');
    });
    $('#myaccount #myInvite').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#iinvite');
    });
    // 跳转至当前页面
    $('.myAccount').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#myaccount');
    });
    // 跳转至理财产品页面
    $('.foundProduct').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#financialproduct');

    });
    // 跳转至更多页面
    $('.forMore').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#more');
    });

    // 跳转至注册页面
    $('.to-register').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#register');
    })

    // 跳转至注册协议页面
    $('.to-registrationagreement').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#registrationagreement');
    })

    // 跳转至活期盈投资协议页面
    $('.to-investmentagreement').click(function(event) {
            event.preventDefault();
            $.mobile.changePage('#investmentagreement');
        })
        //跳转至我的银行卡
    $('.mybank-card').click(function(event) {
        event.preventDefault();
        // 以下条件语句阻止用户修改信息
        // if (Meteor.user().profile.bankCard) return;
        $.mobile.changePage('#mybankcard');
    });

    // 跳转至我的手机号
    $('.myphone').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        // 以下条件语句阻止用户修改信息
        // if (Meteor.user().profile.email) return;
        $.mobile.changePage('#newphone');
    });
    // 提交新手机号
    $('#newPhoneNum').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        var phone = $('#newphone .register-tel').val();
        if (!phone) {
            $('#newphone .register-tel').focus();
            return;
        }

        if (!phone.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/)) {
            alert('手机号码不符合规则！');
            return;
        }
        Meteor.call('updateUserById', Meteor.userId(), {
            'profile.phone': phone,
            'username': phone
        });

    });
    // 跳转至绑定邮箱页面
    $('.to-mailbox').click(function(event) {
        event.preventDefault();
        // 以下条件语句阻止用户修改信息
        // if (Meteor.user().profile.email) return;
        $.mobile.changePage('#mailbox');
    })

    // 跳转至修改密码页面
    $('.change-password').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#changepassword');
    })

    // 跳转至修改交易密码页面
    $('.change-trade-password').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#changetradepassword');
    })

    // 跳转至72的由来页面
    $('.to-72oforigin').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#72oforigin');
    });

    // 跳转至常见的问题页面
    $('.to-commonproblem').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#commonproblem');
    });

    // 跳转至关于我们页面
    $('.to-aboutus').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#aboutus');
    });
    // 跳转至联系我们页面
    $('.to-contacts').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        $.mobile.changePage('#contacts');
    });
    // 跳转至我的投资页面
    $('#financialproduct #newInvest').click(function(event) {
        event.preventDefault();
        if (!Meteor.user().profile.verified) {
            $.mobile.changePage('#verified');
        } else {
            if (Meteor.user().profile.bankName) {
                $.mobile.changePage('#investment');
            } else {
                $.mobile.changePage('#mybankcard');
            }
        }
    });
    //跳转至投资赎回页面
    $('#withdrawl').click(function(event) {
        event.preventDefault();
        $.mobile.changePage('#withdrawlMoney');
    });

    // 退出登陆
    $('#accountmanagement .drop-out2').click(function(event) {
        Meteor.logout();
        Meteor.setTimeout(function() {
            $.mobile.changePage('#login');
        }, 100);
    });
    //赎回金额
    $('#trade-pass #withdrawl-btn').click(function(event) {
        var sum = parseFloat(parseFloat($('#trade-pass .withdrawlSum').val()).toFixed(2)),
            password = $('#trade-pass .tran-repass').val(),
            userInfo = Meteor.user().profile,
            assets = userInfo.assets - sum;
        if (!sum && !password) {
            $('#withdrawlMoney #popupTip p').html('请输入赎回金额和交易密码!');
            $('#withdrawlMoney #popupTip').popup('open');
            return;
        }
        if (!(/(^[0-9]*[1-9][0-9]*$)/.test(sum))) {
            $('#withdrawlMoney #popupTip p').html('请输入赎回金额!');
            $('#withdrawlMoney #popupTip').popup('open');
            return;
        }
        if (!password) {
            $('#withdrawlMoney #popupTip p').html('交易密码为空或错误！');
            $('#withdrawlMoney #popupTip').popup('open');
            return;
        }
        if (password !== userInfo.password) {
            $('#withdrawlMoney #popupTip p').html('交易密码为空或错误！');
            $('#withdrawlMoney #popupTip').popup('open');
            return;
        }
        if (sum > userInfo.assets) {
            $('#withdrawlMoney #popupTip p').html('赎回金额不得大于总资产！');
            $('#withdrawlMoney #popupTip').popup('open');
            return;
        }
        TradingRecord.insert({
            type: '赎回',
            sum: sum,
            userId: Meteor.userId(),
            timestamp: (new Date()).getTime()
        });
        //        Meteor.users.update(Meteor.userId(),{$set:{assets:assets}});
        $('#withdrawlMoney #popupTip p').html('提交成功');
        $('#withdrawlMoney #popupTip').popup('open');
        $('#trade-pass .withdrawlSum').val('');
        $('#trade-pass .tran-repass').val('');
        // $('#withdrawlMoney #popupTip p').html('提交成功');
        // $('#withdrawlMoney #popupTip').popup('open');
        Meteor.setTimeout(function delayJump(event) {
            $.mobile.changePage('#myaccount');
        }, 2000);
        //$.mobile.changePage('#myaccount');      
    });
    // 实名验证
    $('#verified .authenticate .submit-verify').click(function(event) {
        var name = $('#verified .authenticate .real-name').val();
        var idCard = $('#verified .authenticate .real-card').val();
        var user = Meteor.user();
        if (!name) {
            $('#verified #popupTip p').html('请输入真实姓名');
            $('#verified #popupTip').popup('open');
            return;
        }
        if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard))) {
            $('#verified #popupTip p').html('输入的身份证号长度不对，或者号码不符合规定！');
            $('#verified #popupTip').popup('open');
            return;
        }
        Meteor.call('updateUserById', Meteor.userId(), {
            'profile.name': name,
            'profile.idCard': idCard,
            'profile.verified': true,
            'profile.cardHolder': name
        }, function(err, result) {
            if (result != 'true') {
                $('#verified #popupTip p').html('验证失败');
                $('#verified #popupTip').popup('open');
                return;
            } else {
                if (!user.profile.bankCard || !user.profile.bankCity || !user.profile.bankName) {
                    $.mobile.changePage('#mybankcard');
                } else {
                    $.mobile.changePage('#investment');
                }

            }
            $('#verified .authenticate .real-name').val('');
            $('#verified .authenticate .real-card').val('');
        });
    })

    // 我的银行卡
    $('#mybankcard .bind-card').click(function(event) {
        var bankCity = $('#mybankcard .card-city').val();
        var bandCard = $('#mybankcard .card-num').val();
        var bankName = $('#mybankcard .card-bank').not('select').eq(0).html();
        if (!bankName) {
            $('#mybankcard #popupTip p').html('请选择银行卡');
            $('#mybankcard #popupTip').popup('open');
            return;
        }
        if (!bandCard) {
            $('#mybankcard #popupTip p').html('请输入银行卡号');
            $('#mybankcard #popupTip').popup('open');
            return;
        }
        if (!bankCity) {
            $('#mybankcard #popupTip p').html('请输入开户城市');
            $('#mybankcard #popupTip').popup('open');
            return;
        }
        Meteor.call('updateUserById', Meteor.userId(), {
            'profile.bankCard': bandCard,
            'profile.bankName': bankName,
            'profile.bankCity': bankCity
        }, function(err, result) {
            if (result != 'true') {
                $('#mybankcard #popupTip p').html('提交失败');
                $('#mybankcard #popupTip').popup('open');
                return;
            } else {
                $('#mybankcard .card-city').val('');
                $('#mybankcard .card-num').val('');
                $('#mybankcard .card-bank').not('select').eq(0).html('');
                $.mobile.changePage('#myaccount');
            }
        });
    });

    // 输入投资金额
    $('#investment input[name=investfee]').click(function(event) {
        $('#investment .keyboard-containner').css('display', 'none');
        Session.set('payPassword', '');
        $('#investment #ui-block-reset input').val('');
    });

    // 投资金额确认
    $('#investment .invest-confirm').click(function(event) {
        event.preventDefault();
        var num = parseFloat($('#investment input[name=investfee]').val());
        if (!num || num <= 0) {
            $('#investment input[name=investfee]').focus();
            $('#investment #popupTip p').html('请输入有效的投资金额');
            $('#investment #popupTip').popup('open');
            return;
        }
        $('#investment .keyboard-containner').css('display', 'block');
        $('#investment #ui-block-reset input').val('');
        Session.set('payPassword', '');
    });
    //邀请好友
    $('#invite-btn').click(function(event) {
        $('#iinvite #popupTip p').html();
        $('#iinvite #popupTip').popup('open');
    });

    // 投资输入支付密码
    $('#investment #ui-block-keyboard .ui-bar-a').click(function(event) {
        event.preventDefault();
        var num = parseFloat($(event.target).attr('data-num'));
        if (num >= 0 && num <= 9) {
            var payPassword = Session.get('payPassword');
            $('#investment #ui-block-reset input').eq(payPassword.length).val('*');
            payPassword += num;
            Session.set('payPassword', payPassword);
            if (payPassword.length === 6) {
                $('#investment .keyboard-containner').css('display', 'none');
                $('#investment #ui-block-reset input').val('');
                Session.set('payPassword', '');
                setTimeout(function() {
                    if (payPassword != Meteor.user().profile.password) {
                        $('#investment #popupTip p').html('密码错误');
                        $('#investment #popupTip').popup('open');
                    } else {
                        var assets = Meteor.user().profile.assets;
                        var totalInvest = Meteor.user().profile.totalInvest;
                        var investfee = parseFloat($('#investment input[name=investfee]').val());
                        if (!investfee) return alert('error');
                        //Meteor.call('updateUserById',Meteor.userId(),{'profile.assets': parseFloat((assets + investfee).toFixed(2)), 'profile.totalInvest': parseFloat((totalInvest + investfee).toFixed(2))}, function(err,result){
                        Meteor.call('createOrder', {
                            userId: Meteor.userId(),
                            OrdAmt: investfee
                        }, function(err, result) {
                            if (err) {
                                $('#mybankcard #popupTip p').html('提交失败');
                                $('#mybankcard #popupTip').popup('open');
                                return;
                            } else {
                                $('#investmentForm .ordamt').val(investfee);
                                $('#investmentForm .ordid').val(result);
                                $('#investmentForm input[type="submit"]').click();
                                $('#investment input[name=investfee]').val('');
                                $.mobile.changePage('#myaccount');
                                /*TradingRecord.insert({
                                    userId: Meteor.userId(),
                                    timestamp: Date.now(),
                                    type: "投资",
                                    sum: investfee
                                });
*/
                            }
                        });
                    }
                }, 500);
            }
            return;
        }
        if ($(event.target).attr('data-num') == '-') {
            var payPassword = Session.get('payPassword');
            $('#investment #ui-block-reset input').eq(payPassword.length - 1).val('');
            Session.set('payPassword', payPassword.substr(0, payPassword.length - 1));
            return;
        }
    });

    $('.all-record').click(function(event) {
        event.preventDefault();
        // Session.set('logs',true);
        $('#one').css('display', 'block');
        $('.ui-listview1.invest-record').css('display', 'none');
        $('.ui-listview1.withdrawl-record').css('display', 'none');
        $('.ui-listview1.all-record').css('display', 'block');
    });

    $('.invest-record').click(function(event) {
        event.preventDefault();
        $('#one').css('display', 'none');
        $('.ui-listview1.all-record').css('display', 'none');
        $('.ui-listview1.withdrawl-record').css('display', 'none');
        $('.ui-listview1.invest-record').css('display', 'block');
        // Session.set('logs',true);
    });
    $('.withdrawl-record').click(function(event) {
        event.preventDefault();
        // Session.set('logs',true);
        $('#one').css('display', 'none');
        $('.ui-listview1.all-record').css('display', 'none');
        $('.ui-listview1.invest-record').css('display', 'none');
        $('.ui-listview1.withdrawl-record').css('display', 'block');
    });
});

Template.mobile.helpers({
        statistics: function() {
            var statistics = [],
                date = dateFormat(new Date()),
                num = 36 + Meteor.users.find().fetch().length,
                invest = 2470874.78,
                profit = 25441,
                // userInfo = Meteor.users.find({},{fields: {'profile.assets': 1,'profile.profit':1}}).fetch();
                userInfo = Meteor.users.find({
                    'profile.assets': {
                        $gt: 0
                    }
                }, {
                    fields: {
                        'profile.totalInvest': 1,
                        'profile.profit': 1
                    }
                });
            userInfo.forEach(function(obj) {
                invest += obj.profile.totalInvest;
            });
            userInfo.forEach(function(obj) {
                profit += obj.profile.profit;
            });
            statistics.push({
                date: date,
                num: num,
                invest: parseFloat(invest.toFixed(2)),
                profit: parseFloat(profit.toFixed(2))
            });
            return statistics;
        },
        currentUser: function() {
            if (!Meteor.user()) return;

            var profile = Meteor.user().profile;
            if (!profile) return;
            if (!profile.email) {
                profile.email = '请先绑定邮箱';
            }
            return profile;
        },
        bankCard: function() {
            if (!Meteor.user()) return;
            var profile = Meteor.user().profile;
            var cardNum = profile.bankCard;
            if (cardNum !== '') {
                var bankCard = cardNum.substring(0, 5) + '***' + cardNum.substring(cardNum.length - 6, cardNum.length);
            }
            return bankCard;
        },
        email: function() {
            if (!Meteor.user()) return;
            var profile = Meteor.user().profile;
            var email = profile.email;
            if (email !== '') {
                var email = email.substring(0, 5) + '***' + email.substring(email.length - 6, email.length);
            }
            return email;
        },
        yesterdayFee: function() {
            var date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            var todayTime = date.getTime();
            var lastTime = todayTime - 24 * 3600 * 1000;
            var record = TradingRecord.findOne({
                userId: Meteor.userId(),
                timestamp: todayTime,
                type: '活期收益'
            });
            if (!record) return '暂无收益';
            else return record.sum;
        },
        investrecord: function(type) {

            var selector = {
                userId: Meteor.userId()
            };
            if (type == 1) {
                selector.type = '投资';
            } else if (type == 2) {
                selector.type = '赎回';
            } else if (type == 3) {
                selector.type = '活期收益';
            } else {
                selector.type = {
                    $ne: '活期收益'
                }
            }
            var logs = TradingRecord.find(selector, {
                sort: {
                    timestamp: -1
                }
            }).fetch();
            //logs长度
            console.log(logs.length);
            if (logs.length === 0) {
                var date = new Date();
                return [{
                    type: '暂无记录',
                    time: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    fee: 0
                }];
            }
            logs.forEach(function(log) {
                var date = new Date(log.timestamp);
                log.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
                log.fee = log.sum ? log.sum.toFixed(2) : 0;
            });

            return logs;
        },
        inviteArr: function() {
            var logs = InviteRecord.find({
                inviteId: Meteor.userId()
            }, {
                sort: {
                    timestamp: -1
                }
            }).fetch();
            logs.forEach(function(log) {
                var user = Meteor.users.findOne(log.userId);
                if (user && user.profile.totalInvest > 0) log.isInvest = true;
                else log.isInvest = false;
            });
            return logs;
        }
    })
    //获取openid返回值
function parse(val) {
    var result = '',
        tmp = [];
    location.search
        .substr(1)
        .split('&')
        .forEach(function(item) {
            tmp = item.split('=');
            if (tmp[0] === val) {
                result = decodeURIComponent(tmp[1]);
            }
        });
    return result;
}
// 验证码功能
var code; //在全局定义验证码
//产生验证码
function createCode() {
    code = "";
    var codeLength = 4; //验证码的长度
    var checkCode = document.getElementById("code");
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //随机数
    for (var i = 0; i < codeLength; i++) { //循环操作
        var index = Math.floor(Math.random() * 36); //取得随机数的索引（0~35）
        code += random[index]; //根据索引取得随机数加到code上
    }
    checkCode.innerHTML = code; //把code值赋给验证码
}
//校验验证码
function validate() {
    var inputCode = document.getElementById("captcha").value.toUpperCase(); //取得输入的验证码并转化为大写
    if (inputCode.length <= 0) { //若输入的验证码长度为0
        alert("请输入验证码！"); //则弹出请输入验证码
        return false;
    } else if (inputCode != code) { //若输入的验证码与产生的验证码不一致时
        alert("验证码输入错误！@_@"); //则弹出验证码输入错误
        createCode(); //刷新验证码
        document.getElementById("captcha").focus();
        document.getElementById("captcha").value = ""; //清空文本框
        return false;
    } else return true;

}

// 日期格式
function dateFormat(date) {
    var month = (date.getMonth() + 1) + '';
    var d = date.getDate() + '';
    var hours = date.getHours() + '';
    var min = date.getMinutes() + '';
    var sec = date.getSeconds() + '';
    return date.getFullYear() + '-' + '00'.substring(0, 2 - month.length) + month + '-' +
        '00'.substring(0, 2 - d.length) + d;
    // + ' ' +
    // '00'.substring(0, 2 - hours.length) + hours + ':' +
    // '00'.substring(0, 2 - min.length) + min + ':' +
    // '00'.substring(0, 2 - sec.length) + sec;
}