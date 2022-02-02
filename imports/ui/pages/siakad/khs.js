import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { KHS } from '../../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';


import './khs.html';

Template.khsList.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe('khsList');
  });
})


Template.khsList.helpers({
  khs(){
    return KHS.find({}, {
      sort: {
        "noPokok": 1
      }
    });
  }
});



Template.studentKhs.onCreated(function(){
  this.showSearch = new ReactiveVar(false);
  let paramId = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('studentKHS', paramId);
    Meteor.subscribe('studentDetail', paramId);
  });
})


Template.studentKhs.helpers({
  khs(){
    let paramId = Router.current().params._id;
    return KHS.find({"studentId": paramId}, {
      sort: {
        "createdAt": 1
      }
    });
  },
  isMahasiswa(){
    let paramId = Router.current().params._id;
    const loggedInUser = Meteor.user();
    if ( Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'dosen'])) {
      return true;
    } else {
      if ( paramId === loggedInUser._id ) {
        return true;
      } else {
        return false;
      }
    }
  }
});

Template.khsDetails.onCreated(function(){
  this.showSearch = new ReactiveVar(false);
  let psId = Router.current().params.psId;
  Tracker.autorun(() => {
    Meteor.subscribe('periodeStudis');
    Meteor.subscribe('acmatkulsListScoped', psId);
    Meteor.subscribe('userSearch');
  });
})


Template.khsDetails.helpers({
  isMahasiswa(){
    let paramId = Router.current().params._id;
    const loggedInUser = Meteor.user();
    if ( Roles.userIsInRole(loggedInUser, ['admin', 'superadmin', 'dosen'])) {
      return true;
    } else {
      if ( paramId === loggedInUser._id ) {
        return true;
      } else {
        return false;
      }
    }
  },
  gpsf(){
    return this.gps.toFixed(2);
  }
});
