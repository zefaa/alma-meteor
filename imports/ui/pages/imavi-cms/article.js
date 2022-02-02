import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Article } from '../../../api/alma-v1/db/collections-articles.js';
import { generalPics } from '../../../api/alma-v1/db/collections-files.js';
import _ from 'underscore';

import './article.html';
import { Outlet } from '../../../api/alma-v1/db/collections-outlet';
import slugify from 'slugify';

Template.listArticle.onCreated(function () {
    Tracker.autorun(() => {
        Meteor.subscribe("article", function(){
            console.log("article is ready");
        });
        Meteor.subscribe("generalPicList", function(){
            console.log("generalPicList is ready");
        });
        Meteor.subscribe("outlet", function(){
            console.log("outlet is ready");
        });
    });
    this.articles = new ReactiveVar();
    this.outlets = new ReactiveVar();
})

Template.listArticle.helpers({
    articles() {
        let articles = Article.find().fetch();
        Template.instance().articles.set(articles);
        console.log(articles)
        return articles;
    }
});

Template.listArticle.events({
    "click .toggle-article"(e,t){
        let value = $(e.target).attr('status');
        let milik = $(e.target).attr('milik');

        value = !value;
        let data = {
            'id': milik,
            'status': value
        }
        Meteor.call('toggleArticle', data, function (err,res) {

        });
    },
    "click .toggle-featured"(e,t){
        let value = $(e.target).attr('status');
        let milik = $(e.target).attr('milik');
        value = !value;
        let data = {
            'id': milik,
            'status': value
        }
        Meteor.call('featuredArticle', data, function (err,res) {

        });
    }
});

Template.createArticle.onCreated(function () {
    this.availability = new ReactiveVar(false);
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

Template.createArticle.onRendered(function () {
    initEditor(Template.instance())
})

Template.createArticle.helpers({
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
    articles() {
        let articles = Article.find().fetch();
        return articles;
    },
    availability(){
        return Template.instance().availability.get();
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

Template.createArticle.events({
    "input #judul-artikel" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#slug').val(slug);
    },
    "click .cancel" (e,t){
        history.back();
    },
    "click #submit-article"(e, t){
        checkSlug('articles').then((result)=>{
            if(result){

                const slug = result
                let author = $('#author').val();
                const publishDate = new Date($('#publish-date').val());
                const title = $('#judul-artikel').val();
                const excerpt = $('#excerpt').val();
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
                    const content = t.editor.get().getData()
                    const data = {
                        title,
                        excerpt,
                        author,
                        publishDate,
                        content,
                        'status': true,
                        outlets,
                        'createdAt': new Date(),
                        'createdBy': Meteor.userId(),
                        slug
                    }
                    if(t.imageFile.get()){
                        data.imageLink = t.imageDir.get().link()
                        data.imageId = t.imageFile.get()
                    }
                    // console.log(data);
                    Meteor.call('insertArticle', data, function (err,res) {
                        if(err){
                            failAlert(err)
                        } else {
                            successAlertBack('Data berhasil disimpan')
                        }
                    })
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

Template.editArticle.onCreated(function () {
    let param = Router.current().params._id;
    this.availability = new ReactiveVar(true);
    const tempArticle = Article.findOne({
        '_id': new Meteor.Collection.ObjectID(param)
    });
    if(!tempArticle){
        history.back()
    }
    else{
        this.article = new ReactiveVar(tempArticle);
        this.currentUpload = new ReactiveVar(false);
        this.imageFile = new ReactiveVar()
        if(tempArticle.imageId){
            this.imageFile.set(tempArticle.imageId)
        }
        this.imageDir = new ReactiveVar();
        this.editor = new ReactiveVar()
        let tempOutlet = Outlet.find().fetch();
        this.outlets = new ReactiveVar(tempOutlet);
        if(!Outlet.find({}).fetch() || Outlet.find({}).fetch().length === 0){
            history.back()
        }
        else if(!Meteor.user().outlets || Meteor.user().outlets.length === 0){
            failAlert('Belum memiliki outlet! Silahkan hubungi admin.')
            history.back()
        }
    }
})

Template.editArticle.onRendered(function () {
    let article = Template.instance().article.get();
    let outlet = Template.instance().outlets.get();
    outlet.forEach(element => {
        if(article.outlets.includes(element.code)){
            $("#outlet-" + element.code).prop("checked",true);
        }
        else $("#outlet-" + element.code).prop("checked",false);
    });
    const data = this.article.get()
    initEditor(Template.instance(), {
        content: data.content
    })
})

Template.editArticle.helpers({
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
    article() {
        let articles = Template.instance().article.get();
        return articles;
    },
    availability(){
        return Template.instance().availability.get();
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

Template.editArticle.events({
    "input #title" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#slug').val(slug);
    },
    "click #save-article"(e,t){
        const _id = Router.current().params._id
        checkSlug('articles', {
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
                    const data = {
                        'id': _id,
                        title,
                        outlets,
                        author,
                        publishDate,
                        content,
                        slug,
                        excerpt
                    }
                    // console.log(data);
                    if(t.imageFile.get()){
                        data.imageLink = t.imageDir.get().link()
                        data.imageId = t.imageFile.get()
                    } else {
                        data.imageLink = ''
                        data.imageId = ''
                    }
                    Meteor.call('updateArticle', data, function (err,res) {
                        if(err){
                            failAlert(err)
                        } else {
                            successAlertBack('Data berhasil disimpan')
                        }
                    })
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