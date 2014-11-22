/*
 * 头部应用
 */
Spms.module('NavApp', function(NavApp, Spms, Backbone, Marionette, $, _) {

    //this.startWithParent = false;

	NavApp.UserState = Juggler.Views.ItemView.extend({
		className:'spms-user_state',
		template:_.template('<ul class="breadcrumb">\
		<li><a href="#"><span class="glyphicon glyphicon-envelope spms-envelope"></span><span class="badge">12</span></a></li>\
		<li class="dropdown">产品经理 ：<a href="#/" class="dropdown-toggle spms-current_user" data-toggle="dropdown">卢红兵  <span class="caret"></span>\
		<img src="../public/images/avatar/def_avatar.png"></a>\
		<ul class="dropdown-menu"><li><a href="#">账户设置</a></li><li class="divider"></li><li><a href="#">系统管理</a></li><li class="divider"></li><li><a href="#">退出</a></li></ul>\
		</li>\
		</ul>')
	});

    NavApp.Layout = Juggler.Views.Layout.extend({
        className:'spms-topbar clearfix',
        regions:{
            leftRegion:'.pull-left',
            rightRegion:'.pull-right'
        },
        template:_.template('<div class="pull-left" data-region="left"></div>\
		<span class="glyphicon glyphicon-play spms-nav-expand"></span>\
		<div class="pull-right" data-region="right"></div>'),
        initialize:function(){
            this.breadcrumbData = new Juggler.Enities.Collection([
            {name:'企业网络',value:'projects'},
            {name:'中国移动研究院',value:'/'},
			{name:'PMS',value:'/'}
            ]);
			this.breadcrumb = new Juggler.Widgets.Breadcrumb({collection:this.breadcrumbData});
			this.userState = new NavApp.UserState();
        },
        onRender:function(){
            this.leftRegion.show(this.breadcrumb);
			this.rightRegion.show(this.userState);
        }
    });

    NavApp.Controller = Juggler.Controller.extend({
        initialize: function() {
            this.layout = new NavApp.Layout();
            Juggler.navRegion.show(this.layout);
        }
    });

    NavApp.on('start', function() {
        new NavApp.Controller();
    });

});

