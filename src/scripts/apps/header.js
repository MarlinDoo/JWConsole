/*
 * 头部应用
 */
Spms.module('HeaderApp', function(HeaderApp, Spms, Backbone, Marionette, $, _) {

    //this.startWithParent = false;
    HeaderApp.navbar = _.template('<div class="container-fluid">\
              <div class="navbar-header">\
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">\
                  <span class="sr-only">Toggle navigation</span>\
                  <span class="icon-bar"></span>\
                  <span class="icon-bar"></span>\
                  <span class="icon-bar"></span>\
                </button>\
                <ul class="nav navbar-nav">\
                    <li class="dropdown">\
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\
                        <span class="glyphicon glyphicon-folder-open"></span>项目<span class="caret"></span></a>\
                        <ul class="dropdown-menu">\
                            <li><a href="#">项目</a></li>\
                            <li><a href="#">规划</a></li>\
                            <li><a href="#">流程</a></li>\
                            <li><a href="#">成果</a></li>\
                            <li><a href="#">报工</a></li>\
                            </ul>\
                    </li>\
                    <li class="dropdown">\
                    <a href="#/" class="dropdown-toggle" data-toggle="dropdown">研发支撑系统开发<span class="caret"><span></a>\
                        <ul class="dropdown-menu"></li><li><a href="#">研发项目</a><li><a href="#">研发周期</a></li><li><a href="#">研发类型</a></ul>\
                    </li>\
                </ul>\
              </div>\
              <div class="collapse navbar-collapse" id="navbar-collapse" data-region="navbar">\
                <ul class="nav navbar-nav"></ul>\
              </div>\
            </div>');

    HeaderApp.Controller = Juggler.Controller.extend({
        initialize: function() {
            this.navData = new Spms.Enities.Collection();
            this.navbar = new Juggler.Widgets.Navbar({
                collection: this.navData,
                template:HeaderApp.navbar,
                className:'navbar navbar-inverse spms-header'
            });
            Juggler.headerRegion.show(this.navbar);
            this.navData.reset([
            {name: '动态',value: 'as'},
            {name: '项目',value: 'projects'},
            {name:'任务',value:'tasks'},
            {name:'管理',value:'console'},
            {name:'里程碑',value:''},
            {name:'报告',value:''},
            {name:'工时',value:''},
            {name:'成果',value:''}
            ]);
        }
    });

    HeaderApp.on('start', function(){
        new HeaderApp.Controller();
    });

});

