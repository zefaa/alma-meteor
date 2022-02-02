import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';
import fancybox from '@fancyapps/fancybox';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';

import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';
import { TugasAkhirs } from '../../../api/alma-v1/db/collections-siakad.js';
import { ujianTypeOptions } from '../../../api/alma-v1/db/collections-siakad.js';

import { taImages } from '../../../api/alma-v1/db/collections-files.js';

import './tugasAkhirs.html';


Template.taForm.onCreated(function(){
  // this.tingkatForm = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe("userSearch", function(){
      console.log("users is ready");
    });
    Meteor.subscribe("periodeStudis", function(){
      console.log("periodeStudis is ready");
    });
    Meteor.subscribe('files.taImages.all');
  });
});

Template.taForm.onRendered( function(){
  // this.$('.wysiwyg').froalaEditor({
  //   scaytAutoload: false,
  //   toolbarButtons: ['bold', 'italic', 'underline','strikeThrough', 'subscript', 'superscript', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'insertTable', 'emoticons', 'specialCharacters'],
  //   quickInsertButtons: ['ul', 'ol', 'table', 'hr']
  // });
  // this.$(".datetimepicker").datetimepicker();
  this.$(".datepicker").datepicker();
});

Template.taForm.helpers({
  formCollection(){
    return TugasAkhirs;
  }
});

Template.taForm.events({
  
});

Template.taList.onCreated(function(){

  Tracker.autorun(() => {
    Meteor.subscribe('taList', function(){
      console.log("talist is ready");
    });
    Meteor.subscribe('userSearch');
    Meteor.subscribe('periodeStudis');
  });
})


Template.taList.helpers({
  periodeStudis(){
    return PeriodeStudis.find().fetch();
  },
  tugasAkhir () {
    return TugasAkhirs.find({

    })
  }
});


Template.taDetails.onCreated(function(){
  let currentTa = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('taDetails', currentTa, function(){
      console.log("currentTa is ready");
    });
    Meteor.subscribe('userSearch');
    Meteor.subscribe('files.taImages.all');
  });
});
Template.taDetails.onRendered(function(){
  this.$(".fancybox").fancybox();
})

Template.taDetails.helpers({
  imageFile() {
    console.log(taImages.findOne(this.picture))
    return taImages.findOne(this.picture);
  },
});


Template.taEdit.onCreated(function(){
  let currentTa = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('taDetails', currentTa, function(){
      console.log("currentTa is ready");
    });
    Meteor.subscribe('userSearch');
    Meteor.subscribe('files.taImages.all');
  });
});

Template.taEdit.onRendered( function(){
  $('[name="soalUjian"], [name="note"]').froalaEditor({
    scaytAutoload: false,
    toolbarButtons: ['bold', 'italic', 'underline','strikeThrough', 'subscript', 'superscript', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'insertTable', 'emoticons', 'specialCharacters'],
    quickInsertButtons: ['ul', 'ol', 'table', 'hr']
  });
})

Template.taEdit.helpers({
  formCollection: function () {
    return TugasAkhirs;
  }
});

Template.taEdit.events({
  'click #deleteTa': function (event, template) {
    event.preventDefault();
    let paramId = Router.current().params._id;
    Meteor.call('deleteTa', paramId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlertBack()
      }
    });
  }
});

SimpleSchema.debug = true;
