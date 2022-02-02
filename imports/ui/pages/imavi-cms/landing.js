import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Swal from 'sweetalert2';

import slugify from 'slugify';
import _ from 'underscore';
import { documentFiles, documentPics, profilePics } from '../../../api/alma-v1/db/collections-files.js';
import { Documents } from '../../../api/alma-v1/db/collections-landing.js';

import './landing.html';
import { AppProfiles } from '../../../api/alma-v1/db/collections-profiles.js';
import { Outlet } from '../../../api/alma-v1/db/collections-outlet';

Template.documentForm.onCreated(function(){
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar();
  this.currentUpload2 = new ReactiveVar(false);
  this.docFile = new ReactiveVar();
  this.fileDir = new ReactiveVar()
  this.editor = new ReactiveVar()
  this.submitType = new ReactiveVar(this.data.submitType)
  let tempOutlet = Outlet.find().fetch();
  this.outlets = new ReactiveVar(tempOutlet);
  if(!tempOutlet || tempOutlet.length === 0){
    history.back()
  }
  else if(!Meteor.user().outlets || Meteor.user().outlets.length === 0){
      failAlert('Belum memiliki outlet! Silahkan hubungi admin.')
      history.back()
  }
});

Template.documentForm.onRendered( function(){

  if(this.submitType.get() === 2){
    const _id = Router.current().params._id
    const getDocument = Documents.findOne({
      _id
    })
    if(getDocument){
      $('#title').val(getDocument.title)
      $('#slug').val(getDocument.slug)
      this.imageFile.set(getDocument.imageId)
      this.docFile.set(getDocument.fileId)
      initEditor(Template.instance(), {
        content: getDocument.content
      })
      let outlet = Template.instance().outlets.get();
      outlet.forEach(element => {
          if(getDocument.outlets && getDocument.outlets.includes(element.code)){
              $("#outlet-" + element.code).prop("checked",true);
          }
          else $("#outlet-" + element.code).prop("checked",false);
      });
    }
    // ini hanya berguna jika tidak auto publish
    else{
      history.back();
    }
  }
  else{
    initEditor(Template.instance())
  }
})

Template.documentForm.helpers({
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
    const image = documentPics.findOne({
      "_id": Template.instance().imageFile.get()
    });
    if ( self && image ) {
      Template.instance().imageDir.set(image)
      return image;
    }
  },
  docFile(){
    return Template.instance().docFile.get();
  },
  thisDocFile () {
    const image = documentFiles.findOne({
      "_id": Template.instance().docFile.get()
    });
    if ( self && image ) {
      Template.instance().fileDir.set(image)
      return image;
    }
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
});

Template.documentForm.events({
  "input #title" (e, t){
    const value = e.target.value
    const slug = slugify(value, {
        lower: true,
        strict: true,
    })
    $('#slug').val(slug);
  },
  'click #submit-form': function (event, template) {
    event.preventDefault();
    // tidak perlu pengecekan mode edit atau create saat checkSlugnya
    // sudah ditest dan aman
    const _id = Router.current().params._id
    checkSlug('documents', {
      editId: _id
    }).then((result)=>{
      if(result){
        const slug = result
        const content = template.editor.get().getData()
        const body = {
          title: $('#title').val(),
          content
        }
        if(template.imageFile.get()){
          body.imageLink = template.imageDir.get().link()
          body.imageId = template.imageFile.get()
        } else {
          body.imageLink = ''
          body.imageId = ''
        }
        if(template.docFile.get()){
          body.fileLink = template.fileDir.get().link()
          body.fileId = template.docFile.get()
        } else {
          body.fileLink = ''
          body.fileId = ''
        }
        const submitType = template.submitType.get()
        let postRoute = 'documentCreate'
        if(submitType === 2){
          postRoute = 'documentEdit'
          body._id = _id
        }
        body.slug = slug

        const outlets = [];
        $(".outlet").each(function (index, element) {
            if($(element).is(":checked")){
              outlets.push($(element).val());
            }
        });
        body.outlets = outlets

        if(outlets.length > 0){
          Meteor.call(postRoute, body, function (error, result) {
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

        const upload = documentPics.insert({
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
    Meteor.call('deleteDocPics', fileId);
  },
  'change #uploadFile': function(event, template) {
    event.preventDefault();
    const checkFile = event.currentTarget.files;

    if ( checkFile && checkFile.length > 0 ) {

      template.currentUpload2.set(checkFile);

      _.each(checkFile, function(file){

        const upload = documentFiles.insert({
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
          template.docFile.set(fileId);
        });

        upload.start();

      });
      template.currentUpload2.set(false);
    }
  },
  'click .remove-file'(event, template) {
    event.preventDefault()
    const fileId = event.target.attributes.buttondata.value.toString();
    Meteor.call('deleteDocFile', fileId);
    template.fileDir.set(undefined)
    template.docFile.set(undefined)
  }
});

Template.documentList.onCreated( function(){
  Tracker.autorun(() => {
    Meteor.subscribe('documentList', function(){
      console.log("documentList is ready");
    });
    Meteor.subscribe('documentPicList', function(){
      console.log("documentPicList is ready");
    });
    Meteor.subscribe('documentFileList', function(){
      console.log("documentFileList is ready");
    });
    Meteor.subscribe("outlet", function(){
      console.log("outlet is ready");
    });
  });
});

Template.documentList.helpers({
  dataList: function () {
    return Documents.find({
      status: true
    }, {
      sort: {
        "createdAt": 1,
      }
    });
  }
});

Template.documentItem.events({
  'click .delete-document': function (e, t) {
    e.preventDefault();
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah anda yakin untuk menghapus item ini?',
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Iya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.value) {
        Meteor.call('documentDelete', this._id, function (error, result) {
          if (error) {
            failAlert(error)
            exitLoading(false);
          } else {
            successAlert('Sukses!')
            exitLoading(true);
          }
        });
      }
    });
  }
});

Template.lecturerList.onCreated( function(){
  Tracker.autorun(() => {
    Meteor.subscribe('files.profilePics.all', function(){
      console.log("files.profilePics.all is ready");
    });
    Meteor.subscribe('getAllLecturers', function(){
      console.log("getAllLecturers ready");
    });
  });
});

Template.lecturerList.helpers({
  dataList: function () {
    let dataDosen = [];

    const dataUsers = Meteor.users.find({
      roles: {
        $elemMatch: {
          _id: 'dosen'
        }
      }
    }, {
      sort: {
              "fullname": 1,
            }
      }).fetch();
    _.each(dataUsers, function(x){
      const objectId = new Meteor.Collection.ObjectID(x.profileId)
      const profilesDosen = AppProfiles.findOne({
        _id : objectId
      })
      if(profilesDosen){
        const dataReturn = {
          _id : x._id,
          fullname : profilesDosen.fullName
        };
        dataDosen.push(dataReturn);
      }
    })

    return dataDosen;
  }
});

Template.lecturerForm.onCreated(function(){
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar('');
  this.editor = new ReactiveVar()
  this.dataProfileDosen = new ReactiveVar();
  this.submitType = new ReactiveVar(this.data.submitType)
  this.profileId = new ReactiveVar()
});

Template.lecturerForm.onRendered( function(){
  if(this.submitType.get() === 2){
    const id  = Router.current().params._id;
    const users = Meteor.users.findOne({
      _id : id,
      roles: {
        $elemMatch: {
          _id: 'dosen'
        }
      }
    })
    if(users && users.profileId){
      const template = Template.instance()
      const context = this
      this.profileId.set(users.profileId)
      Meteor.call('getLecturer', this.profileId.get(), function(error, result) {
        if(result){
          $('#fullname').val(result.fullName);
          $('#keterangan').val(result.excerpt);
          if(checkValid(result.slug)){
            $('#slug').val(result.slug); 
          } else {
            $('#fullname').trigger('input'); 
          }
          initEditor(template, {
            content: result.description
          })
          context.imageFile.set(result.imageId);
        }
      // ini hanya berguna jika tidak auto publish
        else{
          history.back();
        }
      });
    }else{
      history.back();
    }
  }
  else{
    initEditor(Template.instance())
  }
})

Template.lecturerForm.helpers({
  imageFile(){
    return Template.instance().imageFile.get();
  },
  thisFile () {
    const image = profilePics.findOne({
      "_id": Template.instance().imageFile.get()
    });
    if ( self && image ) {
      Template.instance().imageDir.set(image)
      return image;
    }
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
});

Template.lecturerForm.events({
  "input #fullname" (e, t){
    const value = e.target.value
    const slug = slugify(value, {
        lower: true,
        strict: true,
    })
    $('#slug').val(slug);
  },
  'click #submit-form': function (event, template) {
    event.preventDefault();
    const _id = template.profileId.get()
    checkSlug('appProfiles', {
      editId: _id
    }).then((result)=>{
      if(result){
        const slug = result
        const fullname = $('#fullname').val()
        const description = template.editor.get().getData()
        const keterangan = $('#keterangan').val()
        const body = {
          fullname,
          description,
          keterangan,
          slug
        }
        if(template.imageFile.get()){
          body.imageLink = template.imageDir.get().link()
          body.imageId = template.imageFile.get()
        } else {
          body.imageLink = ''
          body.imageId = ''
        }
        const submitType = template.submitType.get()
        let postRoute = ''
        if(submitType === 2){
          postRoute = 'lecturerLandingEdit'
          body._id = Router.current().params._id
        }
        Meteor.call(postRoute, body, function (error, result) {
          if (error) {
            failAlert(error)
            exitLoading(false);
          } else {
            exitLoading(true);
            successAlertBack()
          }
        });
      }
    })
  },
  'change #uploadImage': function(event, template) {
    event.preventDefault();
    const checkFile = event.currentTarget.files;

    if ( checkFile && checkFile.length > 0 ) {

      template.currentUpload.set(checkFile);

      _.each(checkFile, function(file){

        const upload = profilePics.insert({
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
    Meteor.call('deleteLandingProPic', fileId);
  }
});

Template.lecturerItem.events({
  "click .toggle-featured"(e,t){
    let value = $(e.target).attr('status');
    let milik = $(e.target).attr('milik');
    console.log(value);
    // console.log(milik);
    value = !value;
    let data = {
        'id': milik,
        'status': value
    }
    Meteor.call('featuredLecturer', data, function (err,res) {

    });
  }
})

