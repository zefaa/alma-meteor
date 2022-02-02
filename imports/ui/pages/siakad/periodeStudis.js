import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';
import SimpleSchema from 'simpl-schema';
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';

import _ from 'underscore';


import './periodeStudis.html';

// let aggregateThis = ( template ) => {
//   Meteor.call('generateKHS', subjectId, (error, result) => {
//     if (error) {
//       console.log(error.reason);
//     } else {
//       console.log(result)
//       template.generateKHS.set(result);
//     }
//   });
// }

Template.periodeStudisPage.onCreated( function(){
  Tracker.autorun(() => {
    Meteor.subscribe('periodeStudis')
  });
  this.generateKHS = new ReactiveVar();
  this.periodeForm = new ReactiveVar(false);
  this.periodeSwitch = new ReactiveVar(false);
});

Template.periodeStudisPage.helpers({
  formCollection () {
    return PeriodeStudis;
  },
  periodeForm(){
    return Template.instance().periodeForm.get();
  },
  periodeSwitch(){
    return Template.instance().periodeSwitch.get();
  },
  periodeStudi () {
    return PeriodeStudis.find({}, {
    });
  }
});

Template.periodeStudisPage.events({
  'click #toggle-periode-form': function (event, template) {
    event.preventDefault();
    template.periodeForm.set( !template.periodeForm.get());
  },
  'click #toggle-periode-switch': function (event, template) {
    event.preventDefault();
    template.periodeSwitch.set( !template.periodeSwitch.get());
  },
  'click #periode-studi-switch': function(event, template){
    event.preventDefault();
    let selectedPsId = $('#psSwitch').val();
    console.log(selectedPsId);
    Meteor.call('periodeStudiSwitch', selectedPsId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        console.log(result)
      }
    });
  },
  'click #delete-ps': function( event, template) {
    event.preventDefault();
    let paramsId = this._id;
    Meteor.call('deletePeriodeStudi', paramsId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        Router.go('home')
      }
    });
  },
  
  "click #naikKelasSemua": function(event, template) {
    event.preventDefault();
    Meteor.call('naikTingkat', function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        $("#confirmNaikKelas").modal('hide');
        successAlert('Semua orang naik kelas!')
        console.log(result)
      }
    });
  }
});

Template.psDetails.onCreated(function(){
  this.showKHS = new ReactiveVar(false);
  this.showSearch = new ReactiveVar(false);
  let psId = Router.current().params.psId;
  Tracker.autorun(() => {
    Meteor.subscribe('periodeStudis');
    Meteor.subscribe('acmatkulsListScoped', psId);
    Meteor.subscribe('userSearch');
  });
})


Template.psDetails.helpers({
  activeMatkuls() {
    let psId = Router.current().params.psId;
    return ActiveMatkuls.find({ 
      "psId": psId 
    }, {
      sort: { "name": 1 }
    });
  },
  showSearch(){
    return Template.instance().showSearch.get();
  },
  showKHS(){
    return Template.instance().showKHS.get();
  }
});

Template.psDetails.events({
  'click #toggleSearch': function(event, template) {
    event.preventDefault();
    template.showSearch.set( !template.showSearch.get());
  },
  'click #toggleKHS': function(event, template) {
    event.preventDefault();
    template.showKHS.set( !template.showKHS.get());
  },
  "click #generateKHS": function(event, template){
    event.preventDefault();
    let psId = Router.current().params.psId;
    Meteor.call('writeKHS', psId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        console.log(result)
      }
    });
  },
});


Template.psDetailsPrint.onCreated(function(){
  let psId = Router.current().params.psId;
  Tracker.autorun(() => {
    Meteor.subscribe('periodeStudis');
    Meteor.subscribe('acmatkulsListScoped', psId);
    Meteor.subscribe('userSearch');
  });
})


Template.psDetailsPrint.helpers({
  activeMatkuls() {
    let psId = Router.current().params.psId;
    return ActiveMatkuls.find({ "psId": psId }, {
      sort: { "name": 1 }
    });
  }
});