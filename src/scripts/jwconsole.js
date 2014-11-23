(function(root, factory) {
  
  if (typeof define === 'function' && define.amd) {
    define(['Juggler', 'marionette', 'backbone', 'underscore'], function(Juggler, Marionette, Backbone, _) {
      return (root.JWC = factory(root, Juggler, Marionette, Backbone, _));
    });
  } else if (typeof exports !== 'undefined') {
    var Marionette = require('marionette');
    var Backbone = require('backbone');
    var _ = require('underscore');
    module.exports = factory(root, Juggler, Marionette, Backbone, _);
  } else {
    root.JWC = factory(root, root.Juggler, root.Marionette, root.Backbone, root._);
  }

}(this, function(root, Juggler, Marionette, Backbone, _) {
    
  'use strict';
  
  var previousJWC = root.JWC;
  
  var JWC = new Marionette.Application();
  
  JWC.VERSION = '0.0.1';
  
  JWC.noConflict = function() {
    root.JWC = previousJWC;
    return this;
  };
  
  
  /**
	 * 切换子应用
	 */
  JWC.startSubApp = function(appName, args) {
    var currentApp = JWC.module(appName);
		
    if (JWC.currentApp) {
      JWC.currentApp.stop();
    }
      
    JWC.currentApp = currentApp;
    currentApp.start(args);
  };
  
  JWC.module('Config',function(Config, JWC, Backbone, Marionette, $, _){
		
	Config.BaseUrl = 'http://localhost:3000';
		
  });
  
  
  /**
   * 数据实体
   */
  JWC.module('Enities', function(Enities, JWC, Backbone, Marionette, $, _) {
      
    Enities.Model = Juggler.Enities.Model.extend({});
		
	Enities.Collection = Juggler.Enities.Collection.extend({
	  model:Enities.Model
	});
	
	Enities.ShareObject = Enities.Model.extend({
      urlRoot:'/cmri/crossnetuser/searchuser'
	});
	
	Enities.ShareObjects = Enities.Collection.extend({
	  url:'/cmri/crossnetuser/searchuser',
	  model:Enities.ShareObject
	});
      
      
      
  });
	
	
  JWC.module('Components',function(Components, JWC, Backbone, Marionette, $, _){
		
    Components.Form = Juggler.Components.Form.extend({});
		
    Components.Form.editors.ShareObject = Components.Form.editors.TagsInput.extend({
      Collection:JWC.Enities.ShareObjects
	});
		
  })
  /**
   * 主应用
   */
  JWC.module('MainApp', function(MainApp, JWC, Backbone, Marionette, $, _) {
      
    MainApp.Router = Juggler.AppRouter.extend({
      appRoutes: {
        '': 'home'
      }
    });
    
    MainApp.Controller = Juggler.Controller.extend({
      initialize: function() {},
      home: function() {}
    });
    
    MainApp.on('start', function() {
      new MainApp.Router({controller: new MainApp.Controller});
    });
  
  });
  
  
  //在JWC启动前初始化
  Juggler.addInitializer(function() {});
  
  //在JWC启动前启动Juggler
  JWC.addInitializer(function() {});
	
  JWC.addInitializer(function(){
    JWC.addRegions({
        overlayRegion: '#overlay'
    })
	})
	
	JWC.on('start2', function(options) {
    if (Backbone.history)
        Backbone.history.start();  
  });
  
  return JWC;

}));
