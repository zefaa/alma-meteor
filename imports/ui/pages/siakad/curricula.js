
import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';

import { Curricula } from '../../../api/alma-v1/db/collections-siakad.js';
import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';

const arr = new ReactiveArray([
]);

import './curricula.html';
import slugify from 'slugify';


Template.curriculaPage.onCreated(function(){
  this.curriculumForm = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe("matkulList", function(){
      console.log("matkulList is ready");
    });
    Meteor.subscribe("curricula", function(){
      console.log("Curricula is ready");
    });
  });
});

Template.curriculaPage.helpers({
  formCollection () {
    return Curricula;
  },
  showCurriculumForm(){
    return Template.instance().curriculumForm.get();
  },
  curriculum () {
    return Curricula.find({}, {
      sort: {
        "name": 1
      }
    });
  },
});

Template.curriculaPage.events({
  'click #toggle-curriculum-form': function (event, template) {
    event.preventDefault();
    template.curriculumForm.set( !template.curriculumForm.get());
  },
});


Template.curriculumForm.onCreated( function(){
  arr.clear();
  this.allMks = new ReactiveVar();
  this.selectedMk = new ReactiveVar();

  const handles = [
    Meteor.subscribe('matkulList', function(){
      console.log('mk list ready now');
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      $('.select2').select2();
      console.log("everything is ready");
      let mklist = this.data.matkuls;
      _.each(mklist, function(x){
        arr.push(x);
      })
    }
  });

});
Template.curriculumForm.onRendered( function(){
})

Template.curriculumForm.helpers({
  matkuls(){
    return MataKuliahs.find({});
  },
  pushedMks(){
    return arr.array();
  }
});

Template.curriculumForm.events({
  'click #push-mk': function (e, t) {
    e.preventDefault();

    let mkId = $('#select-mk').val();

    let checkExisting = _.findIndex(arr.array(), function(x){
      return x.mkId === mkId;
    });

    let thismk = MataKuliahs.findOne({"_id": mkId });

    if ( ( checkExisting < 0 ) && thismk ) {
      _.extend(thismk, {
        "mkId": mkId
      });
      arr.push(thismk);
      console.log(thismk);
      $('#select-mk').val('');
    } else {
      failAlert('Mata Kuliah sudah di dalam daftar.')
    }
  },
  'click .delete-matkul': function(e, t){
    e.preventDefault();
    arr.remove(this);
  },
  'click #submit-form': function(e, t ) {
    e.preventDefault();
    let name = $('#input-name').val();
    let desc = $('#input-desc').val();
    let mkData = arr.array();


    Meteor.call('createCurriculum', name, desc, mkData, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert('Tersimpan!')
      }
    });
  }
});
