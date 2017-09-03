Template.serverhome.onRendered(function() {
    $('.mobile-style,.ui-loader,.ui-page').remove();
    var self = this;
});

Template.serverhome.helpers({
    menus: function () {
        return Session.get('Pages');
    }
});

Template.serverhome.events({
    'click .menu-item': function (e) {
        var self = this;
        Router.go(self.route[0].route);
    }
});
