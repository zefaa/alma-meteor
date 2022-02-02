import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// import { KHS } from '../../../api/alma-v1/db/collections-siakad.js';
import { Transcripts } from '../../../api/alma-v1/db/collections-siakad.js';
import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
// import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
// import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';


import './transcripts.html';

const arr = new ReactiveArray([
]);


Template.transcriptsList.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe('transcriptsList');
  });
})


Template.transcriptsList.helpers({
  transcripts(){
    return Transcripts.find({}, {
      sort: {
        "createdAt": 1
      }
    });
  }
});


Template.transcriptDetails.onCreated(function(){

  let paramId = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('transcriptDetails', paramId);
  });
})


Template.transcriptDetails.helpers({
  gpaf(){
    if (this.gpa) {
      return this.gpa.toFixed(2);
    }
  }
});

Template.transcriptInject.onCreated(function(){
  arr.clear();
  this.selectedMakul = new ReactiveVar();
  let paramId = Router.current().params._id;
  const handles = [
    Meteor.subscribe('transcriptDetails', paramId),
    Meteor.subscribe('matkulList')
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    // console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);

    if ( areReady === true ) {
      $('.select2').select2();
    }
  });

})


Template.transcriptInject.helpers({
  matkuls(){
    return MataKuliahs.find({});
  },
  selectedMk(){
    return arr.array();
  }
});

Template.transcriptInject.events({
  "change #selectMk": function(e,t){
    e.preventDefault();
    // return t.selectedMakul.set(thisMk)
  },
  "click #pushMk": function(e, t){
    e.preventDefault();
    let mkId = $('#selectMk').val();
    let score = $('#inputScore').val();
    // console.log(score);
    let thisMk = MataKuliahs.findOne({"_id": mkId});
    if ( thisMk && !isNaN(parseInt(score)) ) {
      let array = arr.array();
      // console.log(thisMk);
      let checkExisting = _.findIndex(array, function(x){
        return x.mkId == mkId;
      });
      if (checkExisting < 0 ) {
        let data = {
          "psId": "injected",
          "psName": "injected",
          "amkId": "injected",
          "mkId": mkId,
          "mkName": thisMk.name,
          "mkNameEn": thisMk.nameEn,
          "sks": thisMk.jumlahSKS,
          "code": thisMk.code,
          "score": score
        }
        // console.log(data);
        return arr.push(data);
      } else {
        failAlert('Mata Kuliah sudah ada dalam daftar.')
      }
    } else {
      failAlert('Mohon periksa kembali masukan Anda.')
    }
  },
  "click .delete-this": function(e, t){
    e.preventDefault();
    return arr.remove(this);
  },
  "click #submitInjection": function(e, t) {
    e.preventDefault();
    enterLoading()
    let data = arr.array();
    let paramId = Router.current().params._id;
    Meteor.call('injectTranscript', paramId, data, function (error, result) {
      if (error) {
        failAlert(error)
        exitLoading(false);
      } else {
        successAlert('Tersimpan!')
        exitLoading(true);
        arr.clear();
      }
    });
  }
});
