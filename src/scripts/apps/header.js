/**
 * 头部应用
 */
JWC.module('HeaderApp', function(HeaderApp, JWC, Backbone, Marionette, $, _) {
  HeaderApp.navbar = _.template('<section class="vbox">\
        <header class="nav-bar">\
          <a href="#" class="navbar-brand">Console Brand</a>\
        </header>\
        <section class="">\
          <div class="bg-danger nav-user">\
            <img class="img-circle" src="./images/avatar.png" />\
            <h6>孟影（抹茶）</h6>\
          </div>\
          <ul class="nav nav-pills nav-stacked">\
            <li><a href="#blogs">博客</a></li>\
            <li><a href="#campaign">活动</a></li>\
            <li><a href="#statistics">统计数据</a></li>\
            <li class="active"><a href="#enterprises">企业管理</a></li>\
          </ul>\
        </section>\
        <div class="bg-danger wrapper">reminder region</div>\
      </section>\
      <footer class="bg-gradient">\
        <span class="glyphicon glyphicon-cog"></span>\
        <span class="glyphicon glyphicon-log-out"></span>\
      </footer>');
  HeaderApp.Controller = Juggler.Controller.extend({
    initialize: function() {
      this.navbar = new Juggler.Views.ItemView({
        template:HeaderApp.navbar
      });
      Juggler.navRegion.show(this.navbar);
    }
  });

  HeaderApp.on('start', function(){
    new HeaderApp.Controller();
  });

});

