import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { News } from '../../../api/alma-v1/db/collections-news';
import _ from 'underscore';

import './news.html';
import { Outlet } from '../../../api/alma-v1/db/collections-outlet';
import { generalPics } from '../../../api/alma-v1/db/collections-files.js';
import slugify from 'slugify';

Template.listNews.onCreated(function () {
    this.outlets = new ReactiveVar();
    this.news = new ReactiveVar();
    Tracker.autorun(() => {
        Meteor.subscribe("news", function(){
          console.log("news is ready");
        });
        Meteor.subscribe("outlet", function(){
          console.log("outlet is ready");
        });
        Meteor.subscribe('generalPicList', function(){
            console.log("generalPicList is ready");
        });
    });
})

Template.listNews.helpers({
    news(){
        let news = News.find().fetch();
        Template.instance().news.set(news)
        return news;
    }
});

Template.listNews.events({
    "click .toggle-news"(e,t){
        let value = $(e.target).attr('status');
        let milik = $(e.target).attr('milik');
        value = !value;
        let data = {
            'id': milik,
            'status': value
        }
        Meteor.call('toggleNews', data, function (err,res) {

        });
    },
    "click .toggle-featured"(e,t){
        let value = $(e.target).attr('status');
        let milik = $(e.target).attr('milik');
        // console.log(milik);
        value = !value;
        let data = {
            'id': milik,
            'status': value
        }
        Meteor.call('featuredNews', data, function (err,res) {

        });
    }
});

Template.createNews.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);
    this.imageFile = new ReactiveVar();
    this.imageDir = new ReactiveVar();
    this.editor = new ReactiveVar()
    if(!Outlet.find({}).fetch() || Outlet.find({}).fetch().length === 0){
        history.back()
    }
    else if(!Meteor.user().outlets || Meteor.user().outlets.length === 0){
        failAlert('Belum memiliki outlet! Silahkan hubungi admin.')
        history.back()
    }
})

Template.createNews.onRendered(function () {
    initEditor(Template.instance())
})

Template.createNews.helpers({
    outlets(){
        const userOutlets = Meteor.user().outlets
        if(userOutlets && userOutlets.length > 0){
            const codeList = []
            userOutlets.forEach(element => {
                codeList.push(element)
            });
            return Outlet.find({
               code: {$in: codeList}
            }).fetch();
        } else {
            return []
        }
    },
    imageFile(){
        return Template.instance().imageFile.get();
    },
    thisFile () {
        const image = generalPics.findOne({
            "_id": Template.instance().imageFile.get()
        });
        if ( self && image ) {
            Template.instance().imageDir.set(image)
            return image;
        }
    }
});

Template.createNews.events({
    "input #title" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#slug').val(slug);
    },
    "click #submit-news"(e,t){
        checkSlug('news').then((result)=>{
          if(result){
            const slug = result
            const title = $('#title').val();
            const excerpt = $('#excerpt').val();
            let author = $('#author').val();
            const publishDate = new Date($('#publish-date').val());
            const content = t.editor.get().getData()
            const outlets = [];
            $(".outlet").each(function (index, element) {
                if($(element).is(":checked")){
                    outlets.push($(element).val());
                }
            });
            const currentUser = Meteor.user();
            const outletCode = currentUser.outlets[0];
            if(outlets.length < 1) {
               outlets.push(outletCode)
            }
            if(outlets.length > 0){
                if(author.length == 0){
                    // console.log(Meteor.user().fullname);
                    author = Meteor.user().fullname;
                }
                const data = {
                    title,
                    author,
                    publishDate,
                    content,
                    'status': true,
                    outlets,
                    'createdAt': new Date(),
                    'createdBy': Meteor.userId(),
                    slug,
                    excerpt
                }
                if(t.imageFile.get()){
                    data.imageLink = t.imageDir.get().link()
                    data.imageId = t.imageFile.get()
                }
                // console.log(data);
                Meteor.call('insertNews', data, function (error, result) {
                    if (error) {
                      failAlert(error)
                      exitLoading(false);
                    } else {
                      exitLoading(true);
                      successAlertBack()
                    }
                });
            } else {
                failAlert('Outlet harus ada minimal satu!')
            }
          }
        })
    },
    'change #uploadImage': function(event, template) {
        event.preventDefault();
        const checkFile = event.currentTarget.files;

        if ( checkFile && checkFile.length > 0 ) {

          template.currentUpload.set(checkFile);

          _.each(checkFile, function(file){

            const upload = generalPics.insert({
              file: file,
              streams: 'dynamic',
              chunkSize: 'dynamic'
            }, false);

            upload.on('start', function () {
            });

            upload.on('end', function (error, fileObj) {
              if (error) {
                console.log(error);
                exitLoading(false)
              } else {
                exitLoading(true);
              }
              const fileId = fileObj._id;
              template.imageFile.set(fileId);
            });

            upload.start();

          });
          template.currentUpload.set(false);
        }
    },
    'click .remove-image'(event, template) {
        event.preventDefault()
        const fileId = event.target.attributes.buttondata.value.toString();
        template.imageDir.set(undefined)
        template.imageFile.set(undefined)
        Meteor.call('deleteGeneralPic', fileId);
    },
});

Template.editNews.onCreated(function () {
    let param = Router.current().params._id;
    const tempNews = News.findOne({
        '_id': new Meteor.Collection.ObjectID(param)
    });
    if(!tempNews){
        history.back()
    }
    else{
        this.news = new ReactiveVar(tempNews);
        let tempOutlet = Outlet.find().fetch();
        this.outlets = new ReactiveVar(tempOutlet);
        this.currentUpload = new ReactiveVar(false);
        this.imageFile = new ReactiveVar()
        this.editor = new ReactiveVar()
        if(tempNews.imageId){
            this.imageFile.set(tempNews.imageId)
        }
        this.imageDir = new ReactiveVar();
        if(!tempOutlet || tempOutlet.length === 0){
            history.back()
        }
        else if(!Meteor.user().outlets || Meteor.user().outlets.length === 0){
            failAlert('Belum memiliki outlet! Silahkan hubungi admin.')
            history.back()
        }
    }
})

Template.editNews.onRendered(function () {
    let news = Template.instance().news.get();
    let outlet = Template.instance().outlets.get();
    outlet.forEach(element => {
        if(news.outlets.includes(element.code)){
            $("#outlet-" + element.code).prop("checked",true);
        }
        else $("#outlet-" + element.code).prop("checked",false);
    });
    const data = this.news.get()
    initEditor(Template.instance(), {
        content: data.content
    })
})

Template.editNews.helpers({
    outlets(){
        const userOutlets = Meteor.user().outlets
        if(userOutlets && userOutlets.length > 0){
            const codeList = []
            userOutlets.forEach(element => {
                codeList.push(element)
            });
            return Outlet.find({
               code: {$in: codeList}
            }).fetch();
        } else {
            return []
        }
    },
    news(){
        return Template.instance().news.get();
    },
    imageFile(){
        return Template.instance().imageFile.get();
    },
    thisFile () {
        const image = generalPics.findOne({
            "_id": Template.instance().imageFile.get()
        });
        if ( self && image ) {
            Template.instance().imageDir.set(image)
            return image;
        }
    }
});

Template.editNews.events({
    "input #title" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#slug').val(slug);
    },
    "click #save-news"(e,t){
        const _id = Router.current().params._id
        checkSlug('news', {
          editId: new Meteor.Collection.ObjectID(_id)
        }).then((result)=>{
          if(result){
            const slug = result
            const title = $('#title').val();
            let author = $('#author').val();
            const excerpt = $('#excerpt').val();
            const publishDate = new Date($('#publish-date').val());
            const content = t.editor.get().getData()
            const outlets = [];
            $(".outlet").each(function (index, element) {
                if($(element).is(":checked")){
                    outlets.push($(element).val());
                }
            });
            const currentUser = Meteor.user();
            const outletCode = currentUser.outlets[0];
            if(outlets.length < 1) {
               outlets.push(outletCode)
            }
            if(outlets.length > 0){
                if(author.length == 0){
                    author = Meteor.user().fullname;
                }
                // next: testing news dan artikelnya
                const data = {
                    'id': _id,
                    title,
                    author,
                    outlets,
                    publishDate,
                    content,
                    slug,
                    excerpt
                }
                if(t.imageFile.get()){
                    data.imageLink = t.imageDir.get().link()
                    data.imageId = t.imageFile.get()
                }  else {
                    data.imageLink = ''
                    data.imageId = ''
                }
                Meteor.call('updateNews', data, function (error, result) {
                    if (error) {
                      failAlert(error)
                      exitLoading(false);
                    } else {
                      exitLoading(true);
                      successAlertBack()
                    }
                });
            } else {
                failAlert('Outlet harus ada minimal satu!')
            }
          }
        })
    },
    'change #uploadImage': function(event, template) {
        event.preventDefault();
        const checkFile = event.currentTarget.files;

        if ( checkFile && checkFile.length > 0 ) {

          template.currentUpload.set(checkFile);

          _.each(checkFile, function(file){

            const upload = generalPics.insert({
              file: file,
              streams: 'dynamic',
              chunkSize: 'dynamic'
            }, false);

            upload.on('start', function () {
            });

            upload.on('end', function (error, fileObj) {
              if (error) {
                console.log(error);
                exitLoading(false)
              } else {
                exitLoading(true);
              }
              const fileId = fileObj._id;
              template.imageFile.set(fileId);
            });

            upload.start();

          });
          template.currentUpload.set(false);
        }
    },
    'click .remove-image'(event, template) {
        event.preventDefault()
        const fileId = event.target.attributes.buttondata.value.toString();
        template.imageDir.set(undefined)
        template.imageFile.set(undefined)
        Meteor.call('deleteGeneralPic', fileId);
    },
});

