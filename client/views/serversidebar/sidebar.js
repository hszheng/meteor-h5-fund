/**
 * 导航列表
 *
 * @author  Vincent Zheng
 * @version 1.0
 * @since   2015-09-18
 * @review
 */

Template.serversidebar.onRendered(function() {
    var self = this,
        nodes = [];

    self.autorun(function() {
        if (Meteor.user()) {
            setTimeout(function() {
                nodes = [];
                // 初始化导航列表，如果没有文本内容，则不显示出来
                _.each(SYS_ROUTES, function(route, index) {
                    if (!route.text) {
                        return;
                    }
                    nodes.push({
                        id: route.route,
                        text: route.text
                    });
                });

                if (w2ui.sysSidebar) {
                    w2ui.sysSidebar.destroy();
                }

                $('#sysSidebar').w2sidebar({
                    name: 'sysSidebar',
                    nodes: nodes,
                    onClick: function(event) {
                        Router.go(event.target);
                    }
                });
            }, 500);
        }
    });
});

Template.serversidebar.events({
    /**
     * 导航关闭按钮点击事件，点击后收起或者显示导航列表
     */
    'click #sysSidebarClose': function(e) {
        $('#sysSidebarContainer').toggleClass('sidebar-closed');
        $(e.currentTarget).toggleClass('glyphicon-circle-arrow-left');
        $(e.currentTarget).toggleClass('glyphicon-circle-arrow-right');
    }
});