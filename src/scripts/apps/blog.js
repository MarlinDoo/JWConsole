/**
 * 博客应用
 */
JWC.module('BlogApp.Templates', function(Templates, JWC, Backbone, Marionette, $, _){
  Templates.main = _.template('');

  Templates.Layout = _.template('<div class="col-md-12">\
      <h3>这里可以放按钮组</h3>\
      <div class="col-md-8" data-region="list"></div>\
      <div class="col-md-3" data-region="filter">控制台</div>\
    </div>');
  Templates.List = _.template('<div class="col-md-12">test list</div>');
});

JWC.module('BlogApp', function(BlogApp, JWC, Backbone, Marionette, $, _) {

  BlogApp.Layout = Juggler.Views.Layout.extend({
    className: 'container blog-container',
    template: BlogApp.Templates.main
  });

  BlogApp.Router = Juggler.AppRouter.extend({
    appRoutes:{
      'blogs(/filters/:filter)':'listBlog',
      'blogs/:id':'showBlog'
    }
  })

  BlogApp.Controller = Juggler.Controller.extend({
    listBlog:function(filter){
      JWC.startSubApp('BlogApp.List',filter);
    },
    showBlog:function(id){
      JWC.startSubApp('BlogApp.Show',id);
    }
  });

  BlogApp.on('start', function(){
    new BlogApp.Router({
      controller: new BlogApp.Controller
    });

    BlogApp.on('blog:new', function(){
      JWC.startSubApp('BlogApp:New');
    });

    BlogApp.on('blog:edit', function(data){
      JWC.startSubApp('BlogApp:Edit', data);
    });
  });
});

JWC.module('BlogApp.List', function(List, JWC, Backbone, Marionette, $, _){
  this.startWithParent = false;

  List.Layout = JWC.BlogApp.Layout.extend({
    template: JWC.BlogApp.Templates.Layout,
    triggers: {
      'click button.blog-new': 'blog:new'
    }
  });

  List.View = Juggler.Views.CompositeView.extend({
    template: JWC.BlogApp.Templates.List
  });

  var Controller = Juggler.Controller.extend({
    listBlog: function(filters){
      this.layout = new List.Layout();
      this.listView = new List.View();
      this.onShow();
    },
    onShow: function(){
      Juggler.mainRegion.show( this.layout );
      this.layout.listRegion.show( this.listView );
    }
  });

  List.on('start', function(filter){
    List.Controller = new Controller();
    List.Controller.listBlog(filter);
  });
});
