import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';
import slugify from 'slugify';

import { Categorys, Parokis, Sessions } from '../../../api/alma-v1/db/collections-komsosCenter';

import './sessions.html';

Template.sessionsList.onCreated(function(){

    Tracker.autorun(() => {
      Meteor.subscribe("getSessionsList", function(){
        console.log("session is ready");
      });
      Meteor.subscribe("getCategorysList", function(){
        console.log("session is ready");
      });
      Meteor.subscribe("getParokisList", function(){
        console.log("Paroki is ready");
      });
    });
});

Template.sessionsList.helpers({
    sessions () {
        console.log(Sessions.find({}, {
            sort: {
              "name": 1
            }
          }).fetch())
      return Sessions.find({}, {
        sort: {
          "name": 1
        }
      });
    },
});

Template.sessionsList.events({
  'click #btn-remove' : function(e,t) {
    e.preventDefault();
    const paramId = this._id;
    const id = paramId.toHexString();


    Meteor.call("deleteSession", id, function(error, result) {
      if (result) {
        successAlertBack('Session terhapus!');
      } else {
        failAlert('Gagal terhapus!')
      }
    })
  }
})

Template.sessionForm.onCreated( function(){

    this.category = new ReactiveVar();
    this.paroki = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);

});

Template.sessionForm.onRendered( function(){
  const check = Parokis.find().count();
  if(check > 0) {
    if(this.submitType.get() === 2){
      const _id = Router.current().params._id;
      const objectId = new Meteor.Collection.ObjectID(_id);

      const getSession = Sessions.findOne({
        '_id' : objectId
      })
      if(getSession){
        $('#input-title').val(getSession.title);
        $('#input-startTime').val(getSession.startTime);
        $('#input-endTime').val(getSession.endTime);
        $('#input-excerpt').val(getSession.excerpt);
        $('#select-category').val(getSession.categoryId);
        $('#select-paroki').val(getSession.parokiId);
        $('#input-youtubeLink').val(getSession.youtubeLink);
        initEditor(Template.instance(),{
        content: getSession.description
        })
      }
            // ini hanya berguna jika tidak auto publish
      else{
        history.back();
      }
    }
    else{
      initEditor(Template.instance())
    }
  } else {
    history.back();
  }

});

Template.sessionForm.helpers({
    parokis() {
        return Parokis.find(
            {
                dioceseCode: "032"
            }, {
            sort : {
                'name' : 1
            }
        })
    },
    categorys() {
        return Categorys.find({}, {
            sort : {
                'name' : 1
            }
        })
    }
});

Template.sessionForm.events({
    'click #submit-form': function(e, t ) {

        e.preventDefault();
        const title = $('#input-title').val();
        const startTime = new Date($('#input-startTime').val()).toISOString();
        const endTime = new Date($('#input-endTime').val()).toISOString();
        const excerpt = $('#input-excerpt').val();
        const description = t.editor.get().getData();
        let categoryId = $('#select-category').val();
        let parokiId = $('#select-paroki').val();


        console.log(categoryId);
        console.log(parokiId);
        const youtubeLink = $('#input-youtubeLink').val();

        const body = {
            title,
            startTime,
            endTime,
            excerpt,
            description,
            categoryId,
            parokiId,
            youtubeLink
        }

        const submitType = t.submitType.get();
        let postRoute = 'createSession';

        if (submitType == 2) {
            body._id = Router.current().params._id;
            postRoute = 'editSession';
        }

        Meteor.call (postRoute, body, function (error, result) {
            if (result) {
                successAlertBack('Sessions Tersimpan!');
            } else {
                failAlert(error);
            }
        })

    }
});