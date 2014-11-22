(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['marionette', 'backbone', 'underscore'], function(Marionette, Backbone, _) {
            return (root.Juggler = factory(root, Marionette, Backbone, _));
        });
    } else if (typeof exports !== 'undefined') {
        var Marionette = require('marionette');
        var Backbone = require('backbone');
        var _ = require('underscore');
        module.exports = factory(root, Marionette, Backbone, _);
    } else {
        root.Juggler = factory(root, root.Marionette, root.Backbone, root._);
    }

}(this, function(root, Marionette, Backbone, _) {

    'use strict';

    var previousJuggler = root.Juggler;

    var Juggler = Backbone.Juggler = new Marionette.Application();

    Juggler.VERSION = '0.0.1';

    Juggler.noConflict = function() {
        root.Juggler = previousJuggler;
        return this;
    };

    Backbone.Juggler = Juggler;

    //Backbone.ajaxSync = Backbone.sync;

    Backbone.sync = function Sync(method, model, options) {

        var xhr;

        model._method = method;

        if (Juggler.Config.DEV) {
            var key = model.urlRoot||_.result(model,'url');
            console.log('backbone.localStorage key is:',key);
            model.localStorage = model.localStorage||new Backbone.LocalStorage(key);
            xhr = Backbone.localSync.apply(this,arguments);
        }
        else{
            xhr = Backbone.ajaxSync.apply(this,arguments);
        }



        return xhr;

    };


    Juggler.Dialog = BootstrapDialog;

    Juggler.Notify = $.growl;


    Juggler.Message = {
        SYNC_DONE: '请求成功',
        SYNC_FAIL: '请求失败'
    };


    Juggler.Controller = Marionette.Controller.extend({
        Layout:Marionette.LayoutView,
        getLayout:function(){
            this.layout = this.layout||new this.Layout();
            return this.layout;
        }
    });

    Juggler.AppRouter = Marionette.AppRouter.extend({

    });

    Juggler.module('Config', function(Config, Juggler, Backbone, Marionette, $, _) {

        Config.DEV = true;

    });

    /*
   * Juggler Templates
   */
    Juggler.module('Templates', function(Templates, Juggler, Backbone, Marionette, $, _) {

        Templates.empty = _.template('');

        Templates.layout = function(data) {
            var $el = $('<div>');
            $.each(data.regions, function(key, value) {
                var $item = $('<div>');
                if (value.indexOf('#') == 0)
                    $item.attr('id', value.replace('#', ''));
                else if (value.indexOf('.') == 0)
                    $item.addClass(value.split('.').join(' '));
                $el.append($item);
            });

            return $el.html();
        };

        Templates.navbar = _.template('<div class="container">\
              <div class="navbar-header">\
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse">\
                  <span class="sr-only">Toggle navigation</span>\
                  <span class="icon-bar"></span>\
                  <span class="icon-bar"></span>\
                  <span class="icon-bar"></span>\
                </button>\
                <a class="navbar-brand" href="#"><%= brand %></a>\
              </div>\
              <div class="collapse navbar-collapse" id="navbar-collapse" data-region="navbar">\
                <ul class="nav navbar-nav nav-primary"></ul>\
                <ul class="nav navbar-nav nav-secondary"></ul>\
              </div>\
            </div>');

        Templates.datalist = _.template('\
            <div data-region="filter"></div>\
            <div data-region="list-content"></div>\
            <div data-region="pagination"></div>\
        ');

        // 无Label 表单项模板
        Templates.Form_Field_template_0_12 = _.template('\
            <div class="form-group field-<%= key %>">\
              <div class="col-sm-12 project-form-value">\
                <span data-editor></span>\
                <p class="help-block" data-error></p>\
                <p class="help-block"><%= help %></p>\
              </div>\
            </div>\
          ');
    });



    Juggler.module('Enities', function(Enities, Juggler, Backbone, Marionette, $, _) {

        Enities.Model = Backbone.Model.extend({
            urlRoot: '/test',
            silent: true,
            message: Juggler.Message,
            parse: function(resp, options) {
//                 if(resp.error_code){
//                     options.error(resp);
//                     return false;
//                 }
                return this.localStorage||this.collection?resp:resp.data&&resp.data.item;
            },
            S4:function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            },
            guid: function() {
               return (this.S4()+this.S4()+""+this.S4()+""+this.S4()+""+this.S4()+""+this.S4()+this.S4()+this.S4());
            },
        });


        Enities.Collection = Backbone.PageableCollection.extend({
            url: '/test',
            silent: true,
            message: Juggler.Message,
            state:{
                firstPage:1,
                pageSize:20,
                totalPages:1,
                currentPage:1
            },
            queryParams: {
                currentPage: "pageno",
                pageSize: "pagesize",
                totalRecords: "num"
            },
            parse: function(resp,options) {
//                 if(resp.error_code){
//                     options.error(resp);
//                     return false;
//                 }
                if(resp.data&&resp.data.page){
                    this.state.pageSize = resp.data.page.pagesize || 20;
                    this.state.totalRecords = resp.data.page.num;
                    this.state.totalPages = Math.ceil(resp.data.page.num/this.state.pageSize) || 1;
                    this.state.currentPage = resp.data.pageno;
                }
                return this.localStorage?resp:resp.data && resp.data.list;
            },
            moveUp: function(model) {
              var index = this.indexOf(model);
              if (index > 0){
                this.swap(index, index-1);
              }
            },
            moveDown: function(model) {
              var index = this.indexOf(model);
              if (index < this.models.length) {
                this.swap(index, index+1);
              }
            },
            swap: function (indexA, indexB) {
                var models = _.clone(this.models);
                models[indexA] = models.splice(indexB, 1, models[indexA])[0];
                this.set(models);
            }
        });

    });


    /*
   * Juggler Views
   */
    Juggler.module('Views', function(Views, Juggler, Backbone, Marionette, $, _) {

        Views.ItemView = Marionette.ItemView.extend({
            constructor: function(options) {
                this.options = _.defaults(options, _.result(this.defaults));
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: _.template('')
        });

        Views.EmptyView = Views.ItemView.extend({
            className: 'alert alert-warning',
            template: Juggler.Templates.empty,
            defaults: {text: 'not found！'},
            serializeData: function() {
                return this.options
            }
        });

        Views.Layout = Marionette.LayoutView.extend({
            template: Juggler.Templates.layout,
            render: function() {
                var that = this;
                Marionette.LayoutView.prototype.render.apply(this, arguments);
                this.$('[data-region]').each(function(i, item) {
                    var region = $(item).attr('data-region');
                    var region2 = $.camelCase(region);
                    region2 && that.addRegion(region2 + 'Region', '[data-region=' + region + ']');
                });

                return this;
            },
            serializeData: function() {
                return this.options;
            }
        });

        Views.CompositeView = Marionette.CompositeView.extend({
            emptyView: Views.EmptyView,
            childViewContainer: "",
            template: _.template(''),
            getChildView: function(item) {
                return Views[item.get('viewType')] || Marionette.getOption(this, "childView") || this.constructor;
            }
        });

        Views.Item = Views.ItemView.extend({
            tagName: 'li',
            template: _.template('<a href="#<%- value %>"><%= name %></a>'),
            ui: {
                links: 'a',
                buttons: 'btn',
                editClass: '.js-edit',
                deleteClass: '.js-delete'
            },
            events: {
                'click @ui.links': 'onClick',
                'click @ui.buttons': 'onPress'
            },
            triggers: {
                'click @ui.editClass': 'edit',
                'click @ui.deleteClass': 'delete'
            },
            onClick: function() {
                this.trigger('clicked', this.model);
            },
            onPress: function() {
                thsi.trigger('pressed', this.model);
            }
        });



        Views.List = Views.CompositeView.extend({
            tagName: 'ul',
            template: _.template(''),
            childView: Views.Item
        });

        Views.Collection = Marionette.CollectionView.extend({

        });

    });

    Juggler.module('Widgets', function(Widgets, Juggler, Backbone, Marionette, $, _) {

        Widgets.GroupItem = Juggler.Views.Item.extend({
            className: 'list-group-item'
        });

        Widgets.TabsItem = Juggler.Views.Item.extend({
            template:_.template('<a data-target="#<%- value %>" data-toggle="tab" ><%- name %></a>')
        });

        Widgets.PanelContent = Juggler.Views.ItemView.extend({
            className:'tab-pane fade',
            initialize:function(options){
                this.$el.attr('id',this.model.get('value'));
            }
        });

        Widgets.ListGroup = Juggler.Views.List.extend({
            className: 'list-group',
            childView: Widgets.GroupItem
        });

        Widgets.Tabs = Juggler.Views.List.extend({
            className: 'nav nav-tabs',
            childView:Widgets.TabsItem
        });

        Widgets.Panels = Juggler.Views.CompositeView.extend({
            className:'tab-content',
            childView:Widgets.PanelContent
        });

        Widgets.Pills = Juggler.Views.List.extend({
            className: 'nav nav-pills'
        });

        Widgets.Stack = Juggler.Views.List.extend({
            className: 'nav nav-pills nav-stacked'
        });

        Widgets.Nav = Juggler.Views.List.extend({
            className: 'nav navbar-nav'
        });

        Widgets.Breadcrumb = Juggler.Views.List.extend({
            className: 'breadcrumb'
        });

        Widgets.Pagination = Juggler.Views.List.extend({
            className: 'pagination pull-right',
            defaults: {
                first: '&laquo;',
                prev: '&lsaquo;',
                next: '&rsaquo;',
                last: '&raquo;',
                totalPages: 100,
                startPage: 1,
                visiblePages: 10
            },
            initialize: function(options) {
                var collection = this.collection;
                this.defaults.onPageClick = function(event, page) {
                    collection.getPage(page);
                };
                this.options = _.extend(this.defaults, options);
                this.collection.on('reset',this.pageable,this);
                this.options.model.on('change',this.queryParams,this);
            },
            render: function() {
                return this;
            },
            pageable:function(){
                this.options.totalPages = this.collection.state.totalPages || 1;
                this.options.startPage = this.collection.state.currentPage;
                this.options.totalRecords = this.collection.state.totalRecords;

                this.onDestroy();

                if(this.options.totalPages>1)
                    this.$el.twbsPagination(this.options);

            },
            queryParams:function(){
                this.collection.queryParams = _.extend(this.collection.queryParams,this.options.model.toJSON());
            },
            onDestroy:function(){
                if(this.$el.data('twbs-pagination'))
                    this.$el.twbsPagination('destroy');
            }
        });

        Widgets.Navbar = Juggler.Views.Layout.extend({
            className: 'navbar',
            template: Juggler.Templates.navbar,
            defaults: {
                type: 'default',
                position: 'static',
                brand: '首页'
            },
            regions: {
                navbarRegion: '.collapse'
            },
            initialize: function(options) {
                this.options = _.defaults(options, this.defaults);
                this.navbar = new Juggler.Widgets.Nav({collection: this.collection});
            },
            onRender: function() {
                this.$el.addClass('navbar-' + this.options.type);
                this.$el.addClass('navbar-' + this.options.position);
                this.navbarRegion.show(this.navbar);
            }
        });

        Widgets.FilterItem = Juggler.Views.Item.extend({
            onClick:function(e){
                var params = $.param(this.model.toJSON());
                Backbone.history.navigate(params);
                e.preventDefault();
            }
        });

        Widgets.Filter = Widgets.Pills.extend({
            childView:Widgets.FilterItem,
            emptyView:Juggler.Views.ItemView
        });

    });

    Juggler.module('Components', function(Components, Juggler, Backbone, Marionette, $, _) {

        Components.DataList = Juggler.Views.Layout.extend({
            className: 'data-list',
            template: Juggler.Templates.datalist,
            FilterView: Juggler.Widgets.Filter,
            ListView: Juggler.Widgets.ListGroup,
            PaginationView: Juggler.Widgets.Pagination,
            initialize: function(options) {
                var collection = new Juggler.Enities.Collection(options.filter||[]);
                this.filter = new this.FilterView({collection:collection});
                this.list = new this.ListView({collection: this.collection});
                this.pagination = new this.PaginationView({collection: this.collection,model:options.filterModel||new Juggler.Enities.Model()});
            },
            onShow: function() {
                this.filterRegion.show(this.filter);
                this.listContentRegion.show(this.list);
                this.paginationRegion.show(this.pagination)
            }
        });

        Components.Form = Backbone.Form.extend({
            events: {
                'submit': 'onSubmit'
            },
            initialize: function(options) {
                Backbone.Form.prototype.initialize.apply(this, arguments);
                this.options = _.extend({submitButton: '提交'}, options);
                this.errors = {};
                this.complete = true;
                this.submitButton = null;
                this.on('field:change field:blur', this.validateField, this);
                this.on('validate', this.setButtonState, this);
                this.model&&this.model.on('request', this.onRequest, this);
                this.model&&this.model.on('change', this.onModelChange, this);
                if(this.model && !this.model.isNew() && this.options.patch) this.old_model = this.model.clone();
            },
            handleEditorEvent: function(e, editor) {
                Backbone.Form.prototype.handleEditorEvent.apply(this, arguments);
                this.trigger('field:' + e, editor.key);
            },
            validate: function() {
                var errors = Backbone.Form.prototype.validate.apply(this, arguments);
                this.errors = errors == null ? {} : errors;
                this.trigger('validate', this.errors);
                return errors;
            },
            validateField: function(key) {
                var error = this.fields[key].validate();
                error ? this.errors[key] = error : delete this.errors[key];
                this.trigger('validate', this.errors);
                return this.errors;
            },
            validateEditors: function() {
                for (var i in this.fields) {
                    var error = this.fields[i].editor.validate();
                    if (error)
                        this.errors[i] = error;
                }
                ;
                this.trigger('validate', this.errors);
                return this.errors;
            },
            setButtonState: function() {
                _.isEmpty(this.errors) && this.complete
                ? this.submitButton.removeClass('disabled').removeAttr('disabled')
                : this.submitButton.addClass('disabled').attr('disabled', 'disabled')
            },
            render: function() {
                Backbone.Form.prototype.render.apply(this, arguments);
                this.trigger('render');
                this.values = this.getValue();
                this.submitButton = this.$el.find(':submit')
                .wrap('<div class="form-group" />')
                .wrap('<div class="col-md-12" />')
                .addClass('btn-primary')
                .addClass('pull-right');

                this.validateEditors();

                return this;
            },
            resetValue: function() {
                this.setValue(this.values);
            },
            templateData: function() {
                var data = {
                    submitButton: ' 提交 '
                };
                return data;
            },
            onSubmit: function(e) {

                var that = this;

                e.preventDefault();

                if (this.commit())
                    return;

                var saveHandle;

                if(!this.model.isNew() && this.options.patch){
                  var saveParams = this.options.patch?{patch:true}:'',
                      patchData = this.old_model.changedAttributes(this.model.toJSON());
                  saveHandle = this.model.save(patchData, saveParams);
                }else{
                  saveHandle = this.model.save();
                }

                saveHandle
                .always(function() {
                    that.complete = true;
                    that.setButtonState();
                });
            },
            onModelChange: function() {
                var values = this.model.toJSON();
                this.setValue(values);
                this.validateEditors();
                this.setButtonState();
            },
            onRequest: function(model, xhr) {
                var that = this;
                that.complete = false;
                this.setButtonState();
            }
        });


        Components.Form.editors.DatePicker = Components.Form.editors.Text.extend({
            defaultValue:'',
            defaults:{
                format: 'yyyy-mm-dd',
                autoclose: true
            },
            initialize: function(options) {
                var that = this;
                Components.Form.editors.Text.prototype.initialize.call(this, options);
                this.defaultValue = this.value;
                this.$el.addClass('datepicker-input');
                this.options = _.defaults(options,this.defaults);
                this.$el.datepicker(this.options)
                    .on('changeDate',function(e){
                        that.value = parseInt(e.date.getTime()/1000);
                        that.form.trigger(that.options.key+':change',that.form,that);
                    });
                this.DatePicker = this.$el.data('datepicker');
                this.setValue(this.value);
            },
            getValue: function() {
                return this.value;
            },
            setValue: function(value) {
                var d = new Date();
                value&&d.setTime(value*1000);
                this.DatePicker.setDate(d);
            }

        });

        Components.Form.editors.TagsInput = Components.Form.editors.Text.extend({
            defaults:{
                freeInput:true,
                itemValue:'id',
                itemText:'name'
            },
            Collection: Juggler.Enities.Collection,
            initialize: function(options) {
                var that = this;
                Components.Form.editors.Text.prototype.initialize.call(this, options);
                this.collection = options.schema.collection||this.collection||new this.Collection;
                this.options = _.extend({},this.defaults,{
                    typeahead:{
                        source: function(query){
                            var defer = $.Deferred();
                            that.collection.on('reset',function(){
                                //console.log(this.toJSON());
                                defer.resolve(this.toJSON());
                            });
                            that.collection.fetch({data:{s:query},reset:true});
                            return defer;
                        },
                        matcher:function(item){
                            return item;
                        }
                    }
                },options.schema.tagsinput);

                this.form.on('render',this.onRender,this);

            },
            getValue: function() {
                return this.$el.tagsinput('items');
            },
            setValue: function(value) {
                var that = this;
                //this.$el.tagsinput('removeAll');
                if(_.isArray(value)){
                    _.each(value,function(item,i){
                        that.$el.tagsinput('add',item);
                    });

                }

            },
            render: function() {
                return this;
            },
            onRender:function(){
                this.$el.tagsinput(this.options);
                this.setValue(this.value);
            },
            remove:function(){
                 this.$el.datepicker('remove')
                 Components.Form.editors.Text.prototype.remove.apply(this,arguments);
             }
        });

        /**
         * 上传文件基础组件，视图上只包含一个按钮
         * 参数说明
         *      通过表单Schema 传入上传组件相关参数
         *      url 文件上传目标地址
         *      mutiple 是否多文件上传
         *      title 按钮文字
         *      params 文件上传参数，如 app_type/app_id
         */
        Components.Form.editors.BaseUploader = Components.Form.editors.Base.extend({
            defaults:{
                multiple: true,         // 多文件上传
                title: 'Upload',        // 上传文件按钮文字
                params:{app_type:'osns_app_spms',app_id:'project_tmp_id'},          // 上传文件参数 如app_type/app_id等
                url:'/devp/uploader/upload.php'
            },
            template: '<span id="uploader-button" class="btn btn-primary uploader-button"><%= title %></span>',
            initialize: function(options) {
                _.bindAll(this, 'fileAdd', 'fileRemove', 'fileInvalid', 'tooManyFile', 'beforeUpload', 'uploadStart', 'uploadAbort', 'uploadComplete', 'uploadError', 'uploadProgress');
                Components.Form.editors.Base.prototype.initialize.call(this, options);

                _.extend(this, this.defaults, _.pick(options.schema, 'url', 'title', 'params', 'multiple'));

                this._files = [];
                this.$inputUploader = $(_.template(this.template,this));
            },
            validate: function() {
                // 如果有文件正在上传，则返回false
                var err = {
                    type: 'uploader',
                    message: '文件正在上传，请稍后...'
                };
                if( this.uploader.countFiles('UPLOADING') ) return err;
            },
            initUploader: function (options){
                this.uploader = new Uploader({
                    selectButton: this.$inputUploader,
                    url: this.url,
                    data: this.params
                });
                this.uploader
                    .on("fileAdd", this.fileAdd)
                    .on("fileRemove", this.fileRemove)
                    .on("fileInvalid", this.fileInvalid)
                    .on("tooManyFile", this.tooManyFile)
                    .on("beforeUpload", this.beforeUpload)
                    .on("uploadStart", this.uploadStart)
                    .on("uploadProgress", this.uploadProgress)
                    .on("uploadAbort", this.uploadAbort)
                    .on("uploadComplete", this.uploadComplete)
                    .on("uploadFail", this.uploadError);
            },
            getValue: function() {
                return this._files;
            },
            // 文件格式为 [{id:,name:,...},...]
            setValue: function(value) {
                if (!_(value).isArray()) {
                    throw new Error("文件格式错误");
                }
                this._files = value;
                this.updateList(this._files);
            },
            // 将上传成功后的文件添加到列表中
            addUploaded: function( file ){
                this._files.push( file );
            },
            // 删除已上传的文件
            removeUploaded: function( file_id ){
                this.setValue( _.reject(this.getValue(), function(f){ return f.id == file_id; }) );
            },
            // 更新文件显示列表
            updateList: function(files) {},
            render: function( options ){
                Components.Form.editors.Base.prototype.render.apply(this, arguments);
                this.$el.append( '<style>.uploader-button{position: relative; overflow: hidden; }\
                    .uploader-button input {position: absolute; right: 0; top: 0; font-size: 200px; outline: none; opacity: 0; cursor: pointer;}</style>' );
                this.$el.append( this.$inputUploader );

                this.initUploader( this.options );
                return this;
            },
            fileInvalid: function(name, message) {},
            tooManyFile: function(name, message) {},
            beforeUpload: function(uniqueId, name, data, xhr) {},
            uploadStart: function(uniqueId, name) {},
            uploadComplete: function(uniqueId, name, resp, status, xhr) {
                status == 200 && this.addUploaded( JSON.parse(resp) );
            },
            uploadError: function(uniqueId, name, message) {},
            uploadProgress: function() {},
            fileAdd: function(uniqueId, name, file) {},
            fileRemove: function(uniqueId, name) {},
            uploadAbort: function(uniqueId, name) {}
        });

        Components.Grid = Backgrid.Grid.extend({
            className:'table table-bordered backgrid',
            initialize:function(options){
                Components.Grid.__super__.initialize.apply(this,arguments);
                this.highlight=this.collection.at(this.collection.length-1);
                this._selected = [];

                this.collection.on('backgrid:fold',this.fold,this);
                this.collection.on('backgrid:unfold',this.unfold,this);
                this.collection.on('backgrid:edit',this.onSelect,this);
                this.collection.on('selected',this.onSelected,this);
                this.model.on('change',this.backup,this);
                this.model.on('error',this.onError,this);
                this.model.on('sync',this.onSync,this);
                this.collection.on('add',this.wireProject,this);

                this.model.fetch();
            },
            onSync:function(model,resp,options){console.log(this.model._method+':'+'sync')
                Juggler.vent.trigger(this.model._method+':'+'sync',model,resp,options);
            },
            onError:function(){
                new Juggler.Notify({message:'操作失败'});
            },
            onSelect:function(model){
                this.select(model.collection.indexOf(model));
            },
            onSelected:function(data){
                data=_.isArray(data)?data:[this.collection.at(data)];
                this.select(data);
            },
            select:function(selected){
                this.nomarlizeRow();
                this._selected=_.isArray(selected)?selected:[parseInt(selected)];
                this.highlightRow();
            },
            getSelected:function(){
                return this._selected;
            },
            nomarlizeRow:function(model){
                var selected = this._selected;
                var that = this;
                _.each(selected,function(item,i){
                    that.body.rows[item].$el.removeClass('bg-info');
                });
            },
            highlightRow:function(model){
                var selected = this._selected;
                var that = this;
                _.each(selected,function(item,i){
                    that.body.rows[item].$el.addClass('bg-info');
                });
            },
            insertRow:function(data,collection,options){
                data.id = data.id||this.model.guid();
                Backgrid.Grid.prototype.insertRow.apply(this,arguments);
            },
            insertRowAbove:function(){
                var selected = this._selected[0];
                if(!this._selected.length==1)return;
                var model = this.collection.at(selected);
                var prev = this.collection.at(selected-1);
                var level = prev&&model.get('level')<=prev.get('level')?prev.get('level'):model.get('level');
                var pid = prev&&model.get('level')<=prev.get('level')?prev.get('parent_id'):model.get('parent_id');
                var plan_start_time = prev&&model.get('level')<=prev.get('level')?prev.get('plan_end_time'):model.get('plan_start_time');
                this.insertRow({
                    level:level,
                    name:'新任务',
                    plan_start_time:plan_start_time,
                    plan_end_time:plan_start_time,
                    parent_id:pid
                },{at:this._selected[0]});
                this._selected[0]++;
                this.select(selected);
            },
            insertRowBelow:function(model){
                var selected = this._selected[0];
                if(!this._selected.length==1)return;
                var model = this.collection.at(selected);
                var prev = this.collection.at(selected+1);
                var level = prev&&model.get('level')>prev.get('level')?model.get('level'):prev.get('level');
                var plan_start_time = prev&&model.get('level')<=prev.get('level')?model.get('plan_end_time'):prev.get('plan_start_time');
                this.insertRow({
                    level:level,
                    name:'新任务',
                    plan_start_time:plan_start_time,
                    plan_end_time:plan_start_time
                },{at:this._selected[0]+1});
                //this._selected[0]--;
                this.select(selected+1);
            },
            deleteRow:function(){
                if(!this._selected.length==1)return;
                this.removeRow(this.collection.at(this._selected[0]));
                this._selected.pop();
            },
            moveUp:function(){
                var selected = this._selected[0];
                if(!this._selected.length==1||this._selected[0]<=0)return;
                var model = this.collection.at(this._selected[0]);
                var tree = [model.toJSON()];
                var index = selected;

                for(var i=selected-1;i>0;i-- ){
                    if(model.get('level')==this.collection.at(i).get('level')){
                        index = i;
                        break;
                    }
                }

                for(var i=selected+1;i<this.collection.length;i++ ){
                    if(model.get('level')>=this.collection.at(i).get('level'))break;
                    tree.push(this.collection.at(i).toJSON());
                    //this.collection.remove(this.collection.at(i),{reset:true});
                }
                while(model.get('level')<this.collection.at(selected+1).get('level')){
                    //tree.push(this.collection.at(i).toJSON());
                    this.collection.remove(this.collection.at(selected+1),{reset:true});
                }
                this.collection.remove(model);
                //tree.unshift(model.toJSON());console.log(tree)
                this.collection.add(tree,{at:index});
                //this.collection.moveUp(this.collection.at(this._selected[0]));
                //this.select(this._selected[0]-1);
            },
            moveDown:function(){
                if(!this._selected.length==1||this._selected[0]>=this.collection.length-1)return;
                this.collection.moveDown(this.collection.at(this._selected[0]));
                this.select(this._selected[0]+1);
            },
            intent:function(){
                var selected;
                if(!this._selected.length==1)return;
                selected = this._selected[0];
                var model = this.collection.at(selected);
                var prev = this.collection.at(selected-1);
                if(model.get('level')>prev.get('level'))return;
                for(var i=selected;i>0;i--){
                    var item=this.collection.at(i);
                    if(item.get('level')==model.get('level')){
                        item.set('parent_id',model.get('parent_id'));
                        break;
                    }
                }
                for(var i=selected;i<this.collection.length;i++){
                    var item = this.collection.at(i);
                    if(item.get('level')<model.get('level'))break;
                    item.set('level',item.get('level')+1);
                };
            },
            unintent:function(){
                var selected = this._selected[0];
                if(!this._selected.length==1)return;
                var model = this.collection.at(this._selected[0]);
                var prev = this.collection.at(selected-1);
                if(model.get('level')<=1)return;

                model.set('level',model.get('level')-1);
                model.set('parent_id',prev.get('parent_id'));

                for(var i=selected+1;i<this.collection.length;i++){
                    var item = this.collection.at(i);
                    if(item.get('level')<=model.get('level')+1)break;
                    item.set('level',item.get('level')-1);
                }
            },
            wireProject:function(model){
                model.set('pid',this.model.get('id'));
            },
            backup:function(){
                this.collection.reset(this.model.get('plantask'),{reset:true});
            },
            fold:function(){
                var that = this;
                var selected = this._selected[0];
                if(!this._selected.length==1)return;
                var model = this.collection.at(selected);
                if(selected>=this.collection.length)return;
                for(var i=selected+1;i<this.collection.length;i++){
                    var item = this.collection.at(i);
                    if(item.get('level')<=model.get('level'))break;
                    that.body.rows[i].$el.hide();
                }
            },
            unfold:function(){
                var that = this;
                var selected = this._selected[0];
                if(!this._selected.length==1)return;
                var model = this.collection.at(selected);
                if(selected>=this.collection.length)return;
                for(var i=selected+1;i<this.collection.length;i++){
                    var item = this.collection.at(i);
                    if(item.get('level')<=model.get('level'))break;
                    that.body.rows[i].$el.show();
                }
            },
            save:function(){
                this.model.set('plantask',this.collection.toJSON());
                this.model.save(null,{reset:true,wait:true});
            }
        });

        Backgrid.DurationCell = Backgrid.StringCell.extend({
            attributes:{
                width:'40px'
            }
        });

        Backgrid.DateCellEditor = Backgrid.InputCellEditor.extend({
            events:{
                'changeDate':'onChangeDate',
                'hide':'onHide'
            },
            initialize:function(){
                Backgrid.DateCellEditor.__super__.initialize.apply(this,arguments);
                this.value = this.model.get(this.column.get('name'));
            },
            render:function(){
                Backgrid.DateCellEditor.__super__.render.apply(this,arguments);
                this.$el.datepicker({
                    autoclose:true,
                    format:'yyyy-mm-dd'
                });
                this.DatePicker = this.$el.data('datepicker');
                return this;
            },
            onHide:function(e){
                e.type='blur';
                this.model.trigger('backgrid:edited',this.model,this.column);
            },
            onChangeDate:function(e){
                var model = this.model;
                var api = this.$el.data('datepicker');
                e.type='blur';
                api&&this.saveOrCancel(e);
            }
        });

        Backgrid.DateCell = Backgrid.DateCell.extend({
            attributes:{
                width:'100px'
            },
            formatter:_.extend({},Backgrid.CellFormatter.prototype,{
                fromRaw:function(rawData,model){
                    var day = moment(rawData*1000);
                    return day.format('YYYY-MM-DD');
                },
                toRaw:function(rawData,model){
                    var m = moment(rawData,'YYYY-MM-DD');
                    return m.isValid()?parseInt(m.valueOf()/1000):undefined;
                }
            }),
            editor:Backgrid.DateCellEditor
        });

        Backgrid.IndexCell = Backgrid.DateCell.extend({
            attributes:{
                width:'30px',
                'style':'text-align:left'
            },
            formatter:_.extend({},Backgrid.CellFormatter.prototype,{
                fromRaw:function(rawData,model){
                    return model.collection.indexOf(model)+1;
                },
                toRaw:function(rawData,model){
                    var m = moment(rawData,'YYYY-MM-DD');
                    return m.isValid()?parseInt(m.valueOf()/1000):undefined;
                }
            }),
            //editor:Backgrid.DateCellEditor
        });

        Backgrid.PreTaskCell = Backgrid.StringCell.extend({
            formatter:_.extend({},Backgrid.CellFormatter.prototype,{
                fromRaw:function(rawData,model){
                    if(!rawData)return '';
                    var defaults = {
                        row:'',
                        relation:'FS',
                        delay_time:1
                    };
                    var data = _.map(rawData,function(item,i){
                        _.defaults(item,defaults);
                        return ''+item.row+item.relation+'+'+item.delay_time;
                    }).join(',')
                    return data;
                },
                toRaw:function(rawData,model){
                    var tasks = this.parsePreTask(rawData,model);
                    return tasks||undefined;
                },
                parsePreTask:function(rawData,model){
                    var pre_tasks = [],
                        isValid=true;
                    _.each(rawData.split(','),function(item,i){
                        var item2 = item.match(/^(\d+)?(\w+)?(\+)?(\d+)?/),
                            dep = {
                                row:parseInt(item2[1]),
                                pre:item2[2],
                                offset:item2[4]
                            },
                            pre_taskplan,
                            task = model.collection.at(parseInt(dep.row-1)),
                            taskplan;
                        //console.log(item2)
                        if(!task||!dep.row){
                            isValid = false;
                            return;
                        }

                        pre_taskplan = {
                            row:dep.row,
                            depend_id:task.get('id'),
                            name:task.get('name'),
                            relation:dep.pre,
                            delay_time:dep.offset
                        };

                        pre_tasks.push(pre_taskplan);
                    });

                    return pre_tasks.length?pre_tasks:undefined;
                }
            }),
            //editor:Backgrid.DateCellEditor
        });

        Backgrid.TagsInputCellEditor = Backgrid.InputCellEditor.extend({
            events:{

            },
            initialize:function(options){
                this.collection = options.collection||this.collection||new Spms.Enities.ShareObjects();
                Backgrid.TagsInputCellEditor.__super__.initialize.apply(this,arguments);
            },
            render:function(){
                var that = this,
                    model = this.model;
                //Backgrid.TagsInputCellEditor.__super__.render.apply(this,arguments);
                var value = this.formatter.fromRaw(model.get(this.column.get("name")), model);
                this.collection.reset(model.get(this.column.get('name')));
                //console.log(value)
                this.$el.tagsinput({
                    itemText:'name',
                    itemValue:'name',
                    typeahead:{
                        source: function(query){
                            var defer = $.Deferred();
                            that.collection.on('reset',function(){
                                defer.resolve(this.toJSON());
                            });
                            that.collection.fetch({data:{s:query},reset:true});
                            return defer;
                        },
                        matcher:function(item){
                            return item;
                        }
                    }
                    });
                this.$el.tagsinput('focus');
                this.$el.tagsinput('input')
                    .blur(function(e){
                        var value = that.$el.tagsinput('items');
                        that.model.set(that.column.get('name'),value);
                        that.$el.tagsinput('destroy');
                        that.model.trigger('backgrid:edited',that.model,that.column);
                    });
                this.collection.each(function(item){
                    that.$el.tagsinput('add',item.toJSON())
                });

                this.delegateEvents();

                return this;
            }
        });

        Backgrid.TagsInputCell = Backgrid.StringCell.extend({
            editor:Backgrid.TagsInputCellEditor,
            formatter:_.extend({},Backgrid.CellFormatter.prototype,{
                fromRaw:function(rawData,model){//console.log(rawData)
                    return _.map(rawData,function(item){
                        return item.name;
                    }).join(',');
                },
                toRaw:function(rawData,model){
                    //console.log('toRaw',rawData)
                    return rawData;
                }
            }),
        });

        Backgrid.TreeCell = Backgrid.StringCell.extend({
            events:{
                'click i':'onClick',
                'click':'enterEditMode'
            },
            initialize:function(){
                Backgrid.StringCell.prototype.initialize.apply(this,arguments);
                this.model.on('change',this.render,this);
                this.model.on('backgrid:fold',this.fold,this);
                this.model.on('backgrid:unfold',this.unfold,this);
                this.$el.css('width','400px');
            },
            render:function(){
                var that = this;
                this.$el.css('padding-left',this.model.get('level')+'em');
                Backgrid.StringCell.prototype.render.apply(this,arguments);
                var hasChild = this.model.get('hasChild');
                var plus_minus = 'minus';
                var $icon = $('<i />')
                    .addClass('glyphicon glyphicon-'+plus_minus+'-sign');
                this.$el.prepend($icon);

                return this;
            },
            onClick:function(e){
                var $target = $(e.target),
                    fold = $target.attr('class').indexOf('minus')>=0;
                e.preventDefault();
                e.stopPropagation();
                //if(!this.model.get('hasChild'))
                //    return;
                this.model.trigger('backgrid:edit',this.model);
                this.model.trigger('backgrid:'+(fold?'fold':'unfold'),this.model);
            },
            fold:function(){
                this.$el.find('i')
                .removeClass('glyphicon-minus-sign')
                .addClass('glyphicon-plus-sign');

            },
            unfold:function(){
                this.$el.find('i')
                .removeClass('glyphicon-plus-sign')
                .addClass('glyphicon-minus-sign');

            }
        });

        Components.Grid.CellActions = Backgrid.Cell.extend({
            template: _.template('<button class="btn btn-success">查看</button>\
                    <button class="btn btn-success">修改</button>\
                    <button class="btn btn-success">删除</button>'),
            render: function() {
                this.$el.html(this.template());
                return this;
            }
        });


        Components.TabsPanel = Juggler.Views.Layout.extend({
            template:_.template('<div class="tabs"></div><div class="panel"></div>'),
            regions:{
                tabsRegion:'.tabs',
                panelRegion:'.panel'
            },
            onRender:function(options){//console.log(this)
                var co = options.collection||new Juggler.Enities.Collection([]);
                this.tabsRegion.show(new Juggler.Widgets.Tabs({collection:co})) ;
                this.panelRegion.show (new Juggler.Widgets.Panels({collection:co}));
            }
        });

    });



    Juggler.addInitializer(function() {

        Juggler.Notify(false, {
            type: 'warning',
            placement: {align: 'center'},
            mouse_over: 'pause',
            z_index: 9999,
            animate: {
                enter: 'animated bounceInDown',
                exit: 'animated bounceOutUp'
            }
        });


        Juggler.Dialog.configDefaultOptions({
            title: '提示：',
            closeByBackdrop: false,
        });


    });

    Juggler.addInitializer(function() {

        Juggler.vent.on('create:sync', function(model, data) {
            Juggler.Notify({
                message:'创建成功！'
            });
        });

        Juggler.vent.on('update:sync', function(model, data) {
            Juggler.Notify({
                message:'更新成功！'
            });
        });

        Juggler.vent.on('read:sync', function(model, data) {
//             Juggler.Notify({
//                 message:'读取成功！'
//             });
        });

        Juggler.vent.on('error', function(model, data) {

            Juggler.Notify('操作失败！', {
                animate: {
                    enter: 'animated shake',
                    exit: 'animated shake'
                }
            });
        });



    });

    Juggler.addInitializer(function() {

        Juggler.addRegions({
            navRegion: '#nav',
            headerRegion: '#header',
            mainRegion: '#main',
            footerRegion: '#footer'
        })

    });


    Juggler.on('start', function() {

        if (Backbone.history)
            Backbone.history.start();

    });


    return Juggler;

}));
