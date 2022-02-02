import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { generalPics } from '../../../api/alma-v1/db/collections-files.js';
import _ from 'underscore';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic/build/ckeditor';
import slugify from 'slugify';

import './page.html';
import { Page } from '../../../api/alma-v1/db/collections-pages';
import { Outlet } from '../../../api/alma-v1/db/collections-outlet';

Template.listPage.onCreated(function () {
    Tracker.autorun(() => {
        Meteor.subscribe("pages", function(){
            console.log("pages is ready");
        });
        Meteor.subscribe("outlet", function(){
            console.log("outlet is ready");
        });
    });
    this.page = new ReactiveVar();
})

Template.listPage.helpers({
    pages(){
        let page = Page.find({}).fetch();
        Template.instance().page.set(page);
        return page;
    },
});

Template.listPage.events({
    "click .toggle"(e,t){
        let value = $(e.target).attr('status');
        const milik = $(e.target).attr('milik');
        value = !value;
        const data = {
            'id': milik,
            'status': value
        }
        Meteor.call('togglePage', data, function (err,res) {

        });
    },
});

Template.createPage.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);
    this.imageFile = new ReactiveVar();
    this.imageDir = new ReactiveVar();
    this.editor = new ReactiveVar()
    let tempOutlet = Outlet.find().fetch();
    this.outlets = new ReactiveVar(tempOutlet);
    if(!tempOutlet || tempOutlet.length === 0){
        history.back()
    }
    else if(!Meteor.user().outlets || Meteor.user().outlets.length === 0){
        failAlert('Belum memiliki outlet! Silahkan hubungi admin.')
        history.back()
    }
})

Template.createPage.helpers({
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
    },
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
});

Template.createPage.onRendered(function () {
    initEditor(Template.instance())
})

Template.createPage.events({
    "click #insert"(e,t){
        checkSlug('pages', {
            inputId: 'code',
            dbField: 'code'
        }).then((result)=>{
            if(result){
                const code = result
                const title = $('#title').val();
                const content = t.editor.get().getData()
                const data = {
                    title,
                    content,
                    'status': true,
                    'createdBy': Meteor.userId(),
                    'createdAt': new Date(),
                    code
                }
                if(t.imageFile.get()){
                    data.imageLink = t.imageDir.get().link()
                    data.imageId = t.imageFile.get()
                }
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
                data.outlets = outlets
                if(outlets.length > 0){
                    Meteor.call('insertPage', data, function (err, res) {
                        if (err) {
                            failAlert(err)
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
    "input #title" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#code').val(slug);
    },
});

Template.editPage.onCreated(function () {
    let param = Router.current().params._id;
    let temppage = Page.findOne({_id: param});
    if(!temppage){
        history.back()
    }
    else{
        this.availability = new ReactiveVar(true);
        this.editor = new ReactiveVar()
        this.page = new ReactiveVar(temppage);
        this.currentUpload = new ReactiveVar(false);
        this.imageFile = new ReactiveVar()
        if(temppage.imageId){
            this.imageFile.set(temppage.imageId)
        }
        this.imageDir = new ReactiveVar();
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

Template.editPage.onRendered(function () {
    const data = this.page.get()
    initEditor(Template.instance(), {
        content: data.content
    })
    let outlet = Template.instance().outlets.get();
    outlet.forEach(element => {
        if(data.outlets && data.outlets.includes(element.code)){
            $("#outlet-" + element.code).prop("checked",true);
        }
        else $("#outlet-" + element.code).prop("checked",false);
    });
})

Template.editPage.helpers({
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
    page(){
        return Template.instance().page.get();
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

Template.editPage.events({
    "click #save"(e,t){
        const id = Router.current().params._id;
        checkSlug('pages', {
            editId: id,
            inputId: 'code',
            dbField: 'code'
        }).then((result)=>{
            if(result){
                const code = result
                const title = $('#title').val();
                const content = t.editor.get().getData()
                const data = {
                    id,
                    title,
                    content,
                    code
                }
                if(t.imageFile.get()){
                    data.imageLink = t.imageDir.get().link()
                    data.imageId = t.imageFile.get()
                }  else {
                    data.imageLink = ''
                    data.imageId = ''
                }
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
                data.outlets = outlets
                if(outlets.length > 0){
                    Meteor.call('updatePage', data, function (err, res) {
                        if (err) {
                            failAlert(err)
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
              alert(fileId)
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
    "input #title" (e, t){
        const value = e.target.value
        const slug = slugify(value, {
            lower: true,
            strict: true,
        })
        $('#code').val(slug);
    },
});
