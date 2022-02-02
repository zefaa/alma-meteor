import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';

import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
import { ActiveMatkuls } from '../../../api/alma-v1/db/collections-siakad.js';
import { ujianTypeOptions } from '../../../api/alma-v1/db/collections-siakad.js';
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';
import { AcmatkulIndex } from '../../../api/alma-v1/db/collections-siakad.js';
import { Announcements } from '../../../api/alma-v1/db/collections-siakad.js';
import { hariKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';

import { rpsUploads } from '../../../api/alma-v1/db/collections-files.js';
import { bakulFiles } from '../../../api/alma-v1/db/collections-files.js';


// import ClassicEditor from '@ckeditor/ckeditor5-build-classic/build/ckeditor';

import './matkuls.html';

const arr = new ReactiveArray([
]);

const difference = function(array){
   var rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));

   var containsEquals = function(obj, target) {
    if (obj == null) return false;
    return _.any(obj, function(value) {
      return _.isEqual(value, target);
    });
  };

  return _.filter(array, function(value){ return ! containsEquals(rest, value); });
};


const calculateFinalScore = function(scheme, data){
  if ( scheme === 1 ) {
    let score = (data.tugas * 0.1) + ( data.quiz * 0.1 ) + ( data.uts * 0.3 ) + ( data.uas * 0.5 );
    // console.log(score);
    return score;
  } else if ( scheme === 2 ) {
    let score = (data.tugas * 0.1) + ( data.uts * 0.3 ) + ( data.uas * 0.5 );
    // console.log(score);
    return score;
  } else if ( scheme === 3 ) {
    let score = ( data.quiz * 0.1 ) + ( data.uts * 0.3 ) + ( data.uas * 0.5 );
    // console.log(score);
    return score;
  } else if ( scheme === 4 ) {
    let score = ( data.uts * 0.3 ) + ( data.uas * 0.5 );
    // console.log(score);
    return score;
  } else {
    return "Gagal menghitung nilai.";
  }
}

const checkDataComplete = function(scheme, data){
  if ( scheme === 1 ) {
    let score = (data.tugas/data.tugas) + ( data.quiz/data.quiz ) + ( data.uts/data.uts ) + ( data.uas/data.uas );
    return score === 4;
  } else if ( scheme === 2 ) {
    let score = (data.tugas/data.tugas) + ( data.uts/data.uts ) + ( data.uas/data.uas );
    return score === 3;
  } else if ( scheme === 3 ) {
    let score = ( data.quiz/data.quiz ) + ( data.uts/data.uts ) + ( data.uas/data.uas );
    return score === 3;
  } else if ( scheme === 4 ) {
    let score = ( data.uts/data.uts ) + ( data.uas/data.uas );
    return score === 2;
  } else {
    return false;
  }
}

const checkScoreDataComplete = function(data) {
  if ( !isNaN(data.sts) && !isNaN(data.sas) ) {
    return true;
  }
}

const calculateWMFS = function( data ) {
  if ( checkScoreDataComplete() ) {
    return data.sts + data.sas;
  }
}

const fireSummernote = function(){
  $('textarea').summernote({
      popover: {
       image: [],
       link: [],
       air: []
      },
      toolbar: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']]
      ]
  });
}

Template.matkulPage.onCreated(function(){
  this.showSearch = new ReactiveVar(false);
  this.matkulForm = new ReactiveVar(false);
  this.showTingkats = new ReactiveVar(false);
  const handles = [
    Meteor.subscribe('tingkats', function(){
      // console.log("tingkats is ready");
    }),
    Meteor.subscribe('studentsList', function(){
    }),
    Meteor.subscribe('files.profilePics.all', function(){
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      $('.select2').select2();
      console.log("everything is ready")
    }
  });
});

Template.matkulPage.helpers({
  formCollection () {
    return MataKuliahs;
  },
  matkulForm(){
    return Template.instance().matkulForm.get();
  },
  showTingkats(){
    return Template.instance().showTingkats.get();
  },
  matkuls () {
    return MataKuliahs.find({
      tingkat: parseInt(this)
    }, {
      sort: {
        "name": 1
      }
    }).fetch();
  },
  allMatkuls () {
    return MataKuliahs.find({
      // tingkat: parseInt(this)
    }, {
      sort: {
        "name": 1
      }
    }).fetch();
  },
  tingkats () {
    const theTingkats = Tingkats.find().fetch();
const tingkatIds = _.map(theTingkats, function(x) {
	if ( x.tingkatId < 10 ) {
		return x.tingkatId;
	}
});

// let tingkats = [0, 1, 2, 3, 4, 5, 6, 7, 30, 90]
return tingkatIds;
  },
  // matkulTingkat () {
  //   let matkuls = MataKuliahs.find({}, {
  //     sort: {
  //       "name": 1
  //     }
  //   });
  //   let sortedMatkuls = _.groupBy(matkuls, function(num){
  //     if (num.tingkat) {
  //       return num.tingkat;
  //     } else {
  //       return 0;
  //     }
  //   })
  //   return sortedMatkuls;
  // },
  showSearch(){
    return Template.instance().showSearch.get();
  }
});


Template.matkulPage.events({
  'click #toggle-matkul-form': function (event, template) {
    event.preventDefault();
    template.matkulForm.set( !template.matkulForm.get());
  },
  'click #toggleSearch': function(event, template) {
    event.preventDefault();
    template.showSearch.set( !template.showSearch.get());
  },
  'click #toggleTingkats': function(event, template) {
    event.preventDefault();
    template.showTingkats.set( !template.showTingkats.get());
  }
});



Template.matkulEdit.helpers({
  formCollection () {
    return MataKuliahs;
  },
});

Template.matkulEdit.events({
  'click #delete-matkul': function (event, template) {
    event.preventDefault();
    let paramsId = Router.current().params._id;
    Meteor.call('deleteMatkul', paramsId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        Router.go('home')
      }
    });
    // console.log(paramsId)
  }
});

Template.matkulDetails.onCreated(function(){
  this.activeMatkulForm = new ReactiveVar(false);
  let matkulId = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('users', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('matkulList', function(){
      console.log('matkulList ready now');
    });
    Meteor.subscribe('matkulDetails', matkulId, function(){
      console.log('matkulDetails ready now');
    });
    Meteor.subscribe('periodeStudis', function(){
      console.log('periodeStudis ready now');
    });
  });
});


Template.matkulDetails.helpers({
  activeMatkuls () {
    // let paramPs = Router.current().params.psId;
    let paramMatkul = Router.current().params._id;

    let activePs = PeriodeStudis.findOne({
      "status": true
    });

    return ActiveMatkuls.find({
      "psId": activePs._id,
      "matkulId": paramMatkul
    }, {
      sort: {
        "matkulName": 1
      }
    });
  },
  formCollection () {
    return ActiveMatkuls;
  },
  activeMatkulForm(){
    return Template.instance().activeMatkulForm.get();
  },
});


Template.matkulDetails.events({
  'click #toggle-matkul-form': function (event, template) {
    event.preventDefault();
    template.activeMatkulForm.set( !template.activeMatkulForm.get());
  },
});




Template.activeMatkulsList.helpers({
  tingkats () {
    const theTingkats = Tingkats.find().fetch();
const tingkatIds = _.map(theTingkats, function(x) {
	if ( x.tingkatId < 10 ) {
		return x.tingkatId;
	}
});

// let tingkats = [0, 1, 2, 3, 4, 5, 6, 7, 30, 90]
return tingkatIds;
  },
  activeMatkuls () {
    // let paramPs = Router.current().params.psId;
    let tingkat = this;
    let paramMatkul = Router.current().params._id;

    let activePs = PeriodeStudis.findOne({
      "status": true
    });

    return ActiveMatkuls.find({
      "psId": activePs._id,
      "matkulId": paramMatkul,
      "tingkat": tingkat
    }, {
      sort: {
        "matkulName": 1
      }
    }).fetch();
  },
});

Template.activeMatkulDetails.onCreated( function(){
  this.viewMode = new ReactiveVar(1);
  this.selectedUjian = new ReactiveVar('2');
  let paramsId = Router.current().params._id;

  Tracker.autorun(() => {
    Meteor.subscribe('users', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', paramsId, function(){
      console.log('acmatkulList ready now');
    });
    Meteor.subscribe('periodeStudis', function(){
      console.log('periodeStudis ready now');
    });
    Meteor.subscribe('ujiansList', function(){
      console.log('ujians ready now');
    });
    Meteor.subscribe('acmatkulAnnouncements', paramsId, function(){
      console.log('acmatkulAnnouncements ready now');
    });
    Meteor.subscribe('amk.ujians.list', function(amkId){
    });
  });
})


Template.activeMatkulDetails.helpers({
  ujianTypes () {
    return ujianTypeOptions;
  },
  selectedUjian(){
    return Template.instance().selectedUjian.get()
  },
  ujians() {
    const amkId = Router.current().params._id;
    const isStudent = Roles.userIsInRole(Meteor.user(), ['student'])
    let query = {
      "activeMatkulId": amkId,
    }
    // mungkin mulai sekarang simpannya secara UTC saja karena mongodb enak juga diquery dengan UTC
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getUTCMonth(), today.getUTCDate()))
    if(Template.instance().selectedUjian.get() === '1'){
      query['dateEnd'] = {
        $lt: todayUTC
      }
    }
    else  if(Template.instance().selectedUjian.get() === '2'){
      query = {
        dateStart: { 
          $lte: todayUTC
        },
        dateEnd: {
          $gte: todayUTC
        }
        // $or: [ 
        //   { 
        //     dateStart: { 
        //       $gte: todayUTC
        //     } 
        //   }, 
        // ] 
      }
    }
    if(isStudent){
      query['students.studentId'] = Meteor.user()._id
    }
    return Ujians.find(query);
  },
  selfUjians (){
    let activeMatkulId = Router.current().params._id;
    let value = this.value;
    console.log(value)
    return Ujians.find({
      "activeMatkulId": activeMatkulId,
      "students.studentId": Meteor.userId(),
      "typeUjian": value,
    })
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if (thisAcmatkul !== undefined) {
      if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
        return true
      };
    }
  },
  ownAcmatkulStudent() {
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    const checkExisting = _.findIndex(thisAcmatkul.students, function(x){
      return x.studentId === userId;
    });

    // console.log(thisAcmatkul);

    if (Roles.userIsInRole(userId, ['dosen', 'admin','superadmin']) ) { 
      return true;
    } else {
      console.log(checkExisting)
      if ( checkExisting > -1 ) {
        return true;
      }
    }
  },
  myScore(){
    let userId = Meteor.userId();
    let thisUjian  = this;
    
    let myScore = _.find(this.students, function(num){
      return num.studentId == userId;
    })
    return myScore.score;
  },
  enrolled (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if (thisAcmatkul) {      
      let students = thisAcmatkul.students;
      
      let checkExisting = _.findIndex(students, function(x){
        return x.studentId == userId;
      });

      if ( checkExisting > -1 ) {
        return true;
      }
    }
  },
  viewMode(){
    return Template.instance().viewMode.get()
  },
  
});


Template.activeMatkulDetails.events({
  'click .toggle-view': function(e, t){
    e.preventDefault();
    let self = $(event.target);
    t.viewMode.set(self.data('view-target'));
  },
  'change [name="ujianOptions"]' (e, t){
    t.selectedUjian.set(e.target.value);
  },
});





Template.activeMatkulEdit.onCreated(function(){
  let activeMatkulId = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('usersList', function(){
      console.log('usersList ready now');
    });
    Meteor.subscribe('matkulList', function(){
      console.log('matkulList ready now');
    });
    Meteor.subscribe('activeMatkulList', function(){
      console.log('activeMatkulList ready now');
    });
    Meteor.subscribe('periodeStudis', function(){
      console.log('periodeStudis ready now');
    });
    Meteor.subscribe('activeMatkulDetails', activeMatkulId)
  });
})


Template.activeMatkulEdit.onRendered( function(){

  $('textarea').summernote({
    popover: {
     image: [],
     link: [],
     air: []
    },
    toolbar: [
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['font', ['strikethrough', 'superscript', 'subscript']],
      ['fontsize', ['fontsize']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['height', ['height']]
    ]
  });
})


Template.activeMatkulEdit.helpers({
  formCollection: function () {
    return ActiveMatkuls;
  }
});


Template.activeMatkulEdit.events({
  'click #delete-acmatkul': function (event, template) {
    event.preventDefault();
    let paramsId = Router.current().params._id;
    Meteor.call('deleteActiveMatkul', paramsId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        Router.go('home')
      }
    });
    // console.log(paramsId)
  }
});


Template.activeMatkulSyllabus.onCreated(function(){
  this.showForm = new ReactiveVar(false);
  let paramsId = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('users', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', paramsId, function(){
      console.log('acmatkulList ready now');
    });
  });
});

Template.activeMatkulSyllabus.onRendered( function(){
  $('textarea').summernote({
        popover: {
         image: [],
         link: [],
         air: []
        },
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['strikethrough', 'superscript', 'subscript']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']]
        ]
    });

})


Template.activeMatkulSyllabus.helpers({
  formCollection () {
    return ActiveMatkuls;
  },
  showForm(){
    return Template.instance().showForm.get();
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    console.log(userId)
    console.log(thisAcmatkul.dosenId)

    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
      return true
    };
  }
});

Template.activeMatkulSyllabus.events({
  'click #toggle-syl-form': function (event, template) {
    event.preventDefault();
    template.showForm.set( !template.showForm.get());
    setTimeout(function(){ 
      fireSummernote() 
    }, 200);
  },
});




Template.activeMatkulRps.onCreated(function(){
  this.showForm = new ReactiveVar(false);
  this.currentUpload = new ReactiveVar(false);
  this.tempFile = new ReactiveVar();
  let paramsId = Router.current().params._id;


  Tracker.autorun(() => {
    Meteor.subscribe('users', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', paramsId, function(){
      console.log('acmatkulList ready now');
    });

    Meteor.subscribe('files.rpsUploads.all', function(){

    });
  });
});

Template.activeMatkulRps.onRendered( function(){
  fireSummernote();
})


Template.activeMatkulRps.helpers({
  imageFile() {
    if (this.rps.upload) {
      return rpsUploads.findOne({
        "_id": this.rps.upload
      });
    }
  },
  formCollection () {
    return ActiveMatkuls;
  },
  showForm(){
    return Template.instance().showForm.get();
  },
  mayEdit(){
    let paramsId = Router.current().params._id;
    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id" : paramsId
    });
    let thisUserId = Meteor.userId();
    console.log(thisAcmatkul.dosenId)
    console.log(thisUserId)

    const checkSelfOwned = function(){
      return thisUserId == thisAcmatkul.dosenId;
    }

    const userIsAdmin = function(){
      let loggedInUser = Meteor.user();
      return Roles.userIsInRole(loggedInUser, ['admin', 'superadmin']);
    }

    console.log(checkSelfOwned())
    console.log(userIsAdmin())

    if (checkSelfOwned() || userIsAdmin()) {
      return true;
    }

  }
});

Template.activeMatkulRps.events({
  'click #toggle-rps-form': function (event, template) {
    event.preventDefault();
    template.showForm.set( !template.showForm.get());
    setTimeout(function(){ 
      fireSummernote() 
    }, 200);
  },
  'submit #rps-edit-form': function( event, template ) {
    event.preventDefault();

    let paramsId = Router.current().params._id;

    const rawFormData = $('#rps-edit-form').serializeArray();
    var formData = {};

    $.map(rawFormData, function(n, i){
        formData[n['name']] = n['value'];
    });

    const fileId = template.tempFile.get();

    _.extend(formData, {
      "upload": fileId
    })

    console.log(formData);

    console.log(formData)
    Meteor.call('updateRps', paramsId, formData, fileId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
      }
    });
  },
  'change #fileInput'(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const upload = rpsUploads.insert({
        file: e.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
        }
        template.currentUpload.set(false);
        let fileId = fileObj._id;
        let paramId = Router.current().params._id;
        template.tempFile.set(fileId);
        Meteor.call('setRpsUpload', paramId, fileId, function (error, result) {
          if (error) {
            failAlert(error)
          } else {
            successAlert('RPS Scan successfully uploaded!')
          }
        });
      });

      upload.start();
    }
  },
  'click .remove-image'(event, template) {
    rpsUploads.remove({_id: this.profilePicId});
  }
});

Template.myActiveMatkuls.onCreated(function(){

  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulList', function(){
      console.log('activeMatkulList ready now');
    });
    // Meteor.subscribe('myAcmatkuls', function(){
    //   console.log('myAcmatkuls ready now');
    // });
    Meteor.subscribe('periodeStudis', function(){
      console.log('periodeStudis ready now');
    });
  });
});

Template.myActiveMatkuls.helpers({
  tingkats () {
    const theTingkats = Tingkats.find().fetch();
    const tingkatIds = _.map(theTingkats, function(x) {
    	if ( x.tingkatId < 10 ) {
    		return x.tingkatId;
      	}
    });
    return tingkatIds;
  },
  activeMatkuls () {
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    let tingkat = parseInt(this);

    return ActiveMatkuls.find({
      "dosenId": { $ne: Meteor.userId() },
      "psId": thisPS._id,
      "tingkat": tingkat
    },{
      sort: {
        "name": 1
      }
    }).fetch();
  },
  myActiveMatkuls(){
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    return ActiveMatkuls.find({
      "dosenId": Meteor.userId(),
      "psId": thisPS._id,
    }, {
      sort: {
        "name": 1
      }
    })
  },
  studentActiveMatkuls(){
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    let theseMatkuls = ActiveMatkuls.find({
        "students.studentId": Meteor.userId(),
        "psId": thisPS._id,
      }, {
        sort: {
          "name": 1
        }
      }).fetch();

    let groupedMatkuls = _.groupBy(theseMatkuls, function(num){
      return num.tingkat;
    });

    let iteratedMatkuls = [];

    let keys = $.map(groupedMatkuls, function(v, i) {
      // console.log(v)
      // console.log(i)
      let thisData = {
        "tingkat": i,
        "matkuls": v
      }
      iteratedMatkuls.push(thisData)
    });

    if( thisPS !== undefined ) {
      return iteratedMatkuls;
    }
  },
  otherActiveMatkuls(){
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    return ActiveMatkuls.find({
      "students.studentId": { $ne : Meteor.userId() },
      "psId": thisPS._id,
    }, {
      sort: {
        "name": 1
      }
    });
  },
  allActiveMatkuls(){
    let thisPS = PeriodeStudis.findOne({
      "status": true
    });
    if( thisPS !== undefined ) {
      return ActiveMatkuls.find({
        "psId": thisPS._id,
      }, {
        sort: {
          "name": 1
        }
      })
    }
  }
});



Template.attendanceFormPrint.onCreated( function() {
  this.page2 = new ReactiveVar(false);
    let activeMatkulId = Router.current().params._id;

  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', activeMatkulId);
  });
});


Template.attendanceFormPrint.helpers({
  page2 () {
    return Template.instance().page2.get();
  }
});

Template.attendanceFormPrint.events({
  'click #togglePage': function (event, template) {
    event.preventDefault();
    template.page2.set( !template.page2.get()); 
  }
});



Template.teachingJournal.onCreated(function(){
  let activeMatkulId = Router.current().params._id;

  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', activeMatkulId);
  });
})

Template.teachingJournal.onRendered( function(){

  $('textarea').summernote({
        popover: {
         image: [],
         link: [],
         air: []
        },
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['strikethrough', 'superscript', 'subscript']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']]
        ]
    });


})

Template.teachingJournal.helpers({
  formCollection: function () {
    return ActiveMatkuls;
  },
  formSchema: function () {
    return ActiveMatkulsSchema;
  },
});

Template.teachingJournal.events({
  'click .submit-note': function (event, template) {
    event.preventDefault();
    console.log(this);
    let inputNote = $(event.target).prev('.input-note').val();
    let thisTopic = this.topic;
    let paramsId = Router.current().params._id;
    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": paramsId
    });
    console.log(thisAcmatkul)
    console.log(inputNote)
    Meteor.call('updateJournal', paramsId, thisTopic, inputNote, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
        // Router.go('home')
      }
    });
  }
});

Template.teachingJournalPrint.onCreated(function(){
  let activeMatkulId = Router.current().params._id;
  this.page2 = new ReactiveVar(false);

  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log('users ready now');
    });
    Meteor.subscribe('activeMatkulDetails', activeMatkulId);
  });
})


Template.teachingJournalPrint.helpers({
  page2 () {
    return Template.instance().page2.get();
  }
});

Template.teachingJournalPrint.events({
  'click #togglePage': function (event, template) {
    event.preventDefault();
    template.page2.set( !template.page2.get());
  }
});



Template.searchAcmatkuls.onCreated(function(){
  Tracker.autorun(() => {
    Meteor.subscribe('acmatkulSearch', function(){
      console.log('acmatkulSearch ready now');
    });
    Meteor.subscribe('matkulSearch', function(){
      console.log('matkulSearch ready now');
    });
  });
})

Template.searchAcmatkuls.helpers({
  acmatkulIndex: () => AcmatkulIndex,
  attributes(){
    return {
      placeholder: "Cari nama mata kuliah disini"
    }
  },
});

Template.activeMatkulStudentsForm.onCreated( function(){
  let activeMatkulId = Router.current().params._id;
  arr.clear();
  this.allStudents = new ReactiveVar();
  studentData = this.allStudents;

  const handles = [
    Meteor.subscribe('studentsList', function(){
      console.log('students list ready now');
    }),
    Meteor.subscribe('periodeStudis', function(){
      console.log('periodeStudis ready now');
    }),
    Meteor.subscribe('activeMatkulDetails', activeMatkulId, function(){})
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    if ( areReady === true ) {
      let dataStudents = this.data.students;
      _.each(dataStudents, function(x){
        return arr.push(x);
      })
      // const userSearchList = Meteor.users.find().fetch();
      // studentData.set(userSearchList);
      Meteor.call('getStudents', function (error, result) {
        if (error){
          failAlert(error)
        } else {
          successAlert()
          console.log(result);
          studentData.set(result);
          $('.select2').select2();
        }
      });
    }
  });

});
Template.activeMatkulStudentsForm.onRendered( function(){

})

Template.activeMatkulStudentsForm.helpers({
  formCollection: function () {
    return ActiveMatkuls;
  },
  allTheStudents(){
    return Template.instance().allStudents.get();
  },
  otherStudents(){
    let allStudents = Template.instance().allStudents.get();
    let existingStudents = arr.array();
    let a = _.pluck(allStudents, "studentId");
    let b = _.pluck(existingStudents, "studentId");

    let filteredStudents = _.difference(a, b);
    let cleanedStudents = _.reject(allStudents, function(num){
      return _.contains(b, num.studentId);
    })
    return cleanedStudents;
  },
  enrolledStudents(){
    return arr.array();
  }
});

Template.activeMatkulStudentsForm.events({
  'click #push-student': function (e, t) {
    e.preventDefault();

    let allStudents = Template.instance().allStudents.get();
    let studentId = $('#select-student').val();

    let checkExisting = _.findIndex(arr, function(x){
      return x.studentId == studentId;
    });

    let thisStudent = _.findWhere(allStudents, {"studentId": studentId });

    if ( checkExisting < 0 && thisStudent ) {
      console.log(thisStudent)
      arr.push(thisStudent);
      $('#select-student').val([]);
    } else {
      failAlert('Mahasiswa sudah di dalam daftar.')
    }
  },
  'click .delete-student': function(e, t){
    e.preventDefault();
    arr.remove(this);
  },
  'click #submit-form': function(e, t ) {
    e.preventDefault();
    let paramId = Router.current().params._id;
    let studentData = arr.array();
    Meteor.call('updateAmkStudents', paramId, studentData, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert('Tersimpan!')
      }
    });
  }
});


Template.jadwalKuliah.onCreated(function(){
  this.showOrdering = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe('userSearch');
    Meteor.subscribe('activeMatkulList');
  });
})

Template.jadwalKuliah.helpers({
  hariKuliahs () {
    return hariKuliahs;
  },
  tingkats () {
    const theTingkats = Tingkats.find().fetch();
    const tingkatIds = _.map(theTingkats, function(x) {
	if ( x.tingkatId < 10 ) {
		return x.tingkatId;
	}
});

// let tingkats = [0, 1, 2, 3, 4, 5, 6, 7, 30, 90]
return tingkatIds;
  },
  activeMatkuls() {
    let activePs = PeriodeStudis.findOne({
      "status": true
    });
    return ActiveMatkuls.find({
      "psId": activePs._id,
    }, {
      sort: { "displayOrder": 1 }
    }).fetch();
  },
  activeMatkulsInTingkat(day) {
    // console.log(day);
    let activePs = PeriodeStudis.findOne({
      "status": true
    });
    return ActiveMatkuls.find({
      "psId": activePs._id,
      "tingkat": parseInt(this),
      "scheduleDay": day
    }, {
      sort: { "displayOrder": 1 }
    }).fetch();
  },
  showOrdering (){
    return Template.instance().showOrdering.get()
  }
});

Template.jadwalKuliah.events({
  'click #toggleOrdering': function( event, template ) {
    template.showOrdering.set(!template.showOrdering.get());
  },
  'click .order-up': function ( event, template ) {
    let activeMatkulId = this._id;
    console.log(activeMatkulId);

    Meteor.call('displayOrderRock', activeMatkulId, -1, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
      }   
    });
  },
  'click .order-down': function ( event, template ) {
    let activeMatkulId = this._id;
    console.log(activeMatkulId);

    Meteor.call('displayOrderRock', activeMatkulId, 1, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
      }   
    });
  }
});


Template.activeMatkulBakul.onCreated(function(){
  this.editMode = new ReactiveVar(false);
})

Template.activeMatkulBakul.onRendered(function(){

})

Template.activeMatkulBakul.helpers({
  editMode(){
    return Template.instance().editMode.get();
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
      return true
    };
  },
  formCollection(){
    return ActiveMatkuls;
  },
  sortedFiles: function(files) {
    return _.sortBy(files, function(x) {
      return x.timestamp;
    });
  }
});

Template.activeMatkulBakul.events({
  'click #toggleForm': function(event, template){
    template.editMode.set(!template.editMode.get());
  },
});



Template.scoreForm.onCreated(function(){
  this.editMode = new ReactiveVar(false);
})

Template.scoreForm.onRendered(function(){

})

Template.scoreForm.helpers({
  editMode(){
    return Template.instance().editMode.get();
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
      return true
    };
  },
  formCollection(){
    return ActiveMatkuls;
  },
  studentScores (){
    let students = this.students;
    let scores = this.scores;
    if ( scores ) {
      return scores;
    } else {
      return students;
    }
  },
  calculatedScore(){
    let scoringScheme = Template.instance().data.scoringScheme;
    if ( checkDataComplete(scoringScheme, this) ) {
      return calculateFinalScore(scoringScheme, this);
    } else {
      return "Data belum lengkap."
    }
  },
});

Template.scoreForm.events({
  'click #toggleForm': function(event, template){
    event.preventDefault();
    template.editMode.set(!template.editMode.get());
  },
  'click #submit-form': function(event, template){
    event.preventDefault();
    enterLoading();
    const rawFormData = $('#score-form').serializeArray();

    let paramId = Router.current().params._id;

    Meteor.call('submitScoreForm', paramId, rawFormData, function (error, result) {
      if (error) {
        exitLoading(false);
        failAlert(error)
      } else {
        exitLoading(true);
        successAlert('Tersimpan!')
      }
    });
  },
});







const calculateFinalScore2 = function(data){
  let finscore = ( data.sts + data.sas )/2;
  return parseFloat(finscore.toFixed(2));
}

const checkDataComplete2 = function(data){
  return ( !isNaN(data.sts) && !isNaN(data.sas));
}





Template.scoreForm2.onCreated(function(){
  this.editMode = new ReactiveVar(false);
  this.showNotes = new ReactiveVar(false);
  this.finalScores = new ReactiveVar();
})

Template.scoreForm2.onRendered(function(){

})

Template.scoreForm2.helpers({
  editMode(){
    return Template.instance().editMode.get();
  },
  showNotes(){
    return (Template.instance().showNotes.get() && this.notes);
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let activeMatkulId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
      return true
    };
  },
  formCollection(){
    return ActiveMatkuls;
  },
  studentScores (){
    const students = this.students;
    const scores = this.scores;
    const amkId = Router.current().params._id;
    let hasUTS = false, hasUAS = false;
    let UTSdate, UASdate
    try {
      students.forEach(element => {
        hasUTS = hasUAS = false;
        const studentId = element.studentId
        const getUjians = Ujians.find({
          'activeMatkulId': amkId,
          'students.studentId': studentId
        }, {
          fields: {
            'typeUjian': 1,
            'students.studentId': 1,
            'students.score': 1,
            'createdAt': 1
          }
        }).fetch()
        const getStudentUjian = []
        getUjians.forEach(element2 => {
          const temp = _.findWhere(element2.students, {"studentId": studentId });
          if(element2.typeUjian === 3 && temp.score){
            hasUTS = true
            UTSdate = (element2.createdAt).getTime()
          }
          else if(element2.typeUjian === 4 && temp.score){
            hasUAS = true
            UASdate = (element2.createdAt).getTime()
          }
          temp.createdAt = (element2.createdAt).getTime()
          temp.typeUjian = element2.typeUjian
          if(!temp.score){
            temp.score = 0
          }
          getStudentUjian.push(temp)
        });
        element.hasUTS = hasUTS
        element.hasUAS = hasUAS
        if(hasUTS){
          const tugasList = [], quizList = [];
          let utsScore = 0
          getStudentUjian.forEach(element2 => {
            if(element2.createdAt <= UTSdate){
              if(element2.typeUjian === 1){
                tugasList.push(element2.score)
              }
              else if(element2.typeUjian === 2){
                quizList.push(element2.score)
              }
              else if(element2.typeUjian === 3){
                utsScore = element2.score
              }
            }
          });
          const tugasPercentage = 0.2
          const quizPercentage = 0.3
          const utsPercentage = 0.5
  
          let tugasPart = 0
          if(tugasList.length > 0){
            tugasPart = tugasPercentage * (_.reduce(tugasList, function(memo, num){
              return memo + num; 
            }, 0) / tugasList.length);
          }
  
          let quizPart = 0
          if(quizList.length > 0){
            quizPart = quizPercentage * (_.reduce(quizList, function(memo, num){
              return memo + num; 
            }, 0) / quizList.length);
          }
  
          const utsPart = utsPercentage * utsScore
          element.sts = parseFloat((tugasPart + quizPart + utsPart).toFixed(2));
        }
        if(hasUAS){
          const tugasList = [], quizList = []
          let uasScore = 0
          getStudentUjian.forEach(element2 => {
            if(element2.createdAt > UTSdate && element2.createdAt <= UASdate){
              if(element2.typeUjian === 1){
                tugasList.push(element2.score)
              }
              else if(element2.typeUjian === 2){
                quizList.push(element2.score)
              }
              else if(element2.typeUjian === 4){
                uasScore = element2.score
              }
            }
          });
          const tugasPercentage = 0.2
          const quizPercentage = 0.3
          const uasPercentage = 0.5
  
          let tugasPart = 0
          if(tugasList.length > 0){
            tugasPart = tugasPercentage * (_.reduce(tugasList, function(memo, num){
              return memo + num; 
            }, 0) / tugasList.length);
          }
  
          let quizPart = 0
          if(quizList.length > 0){
            quizPart = quizPercentage * (_.reduce(quizList, function(memo, num){
              return memo + num; 
            }, 0) / quizList.length);
          }
  
          const uasPart = uasPercentage * uasScore
          element.sas = parseFloat((tugasPart + quizPart + uasPart).toFixed(2));
          element.finalScore = ((element.sts + element.sas) / 2).toFixed(2)
        }
      });
      const finalScores = []
      students.forEach(element => {
        const data = {
          fullname: element.fullname,
          studentId: element.studentId
        }
        if(element.sts){
          data.sts = element.sts
        }
        if(element.sas){
          data.sas = element.sas
        }
        finalScores.push(data)
      });
      console.log(finalScores)
      Template.instance().finalScores.set(finalScores)
    } catch (error) {
      console.log(error)
    }

    return students;
    // if ( scores ) {
    //   return scores;
    // } else {
    //   return students;
    // }
  },
  calculatedScore(){
    if ( checkDataComplete2(this) ) {
      return calculateFinalScore2(this);
    } else {
      return "Data belum lengkap."
    }
  },
});

Template.scoreForm2.events({
  'click #toggleForm': function(event, template){
    event.preventDefault();
    template.editMode.set(!template.editMode.get());
  },
  'click #toggleNotes': function(event, template){
    event.preventDefault();
    template.showNotes.set(!template.showNotes.get());
  },
  'click #submit-form': function(event, template){
    event.preventDefault();
    enterLoading();
    const finalScores = Template.instance().finalScores.get()
    finalScores.forEach(element => {
      // harus diberi template.$ karena didalamnya foreach
      element.notes = template.$('#' + element.studentId + '-notes').val()
    });

    let paramId = Router.current().params._id;

    Meteor.call('submitScoreForm2', paramId, finalScores, function (error, result) {
      if (error) {
        exitLoading(false);
        failAlert(error)
      } else {
        exitLoading(true);
        successAlert('Tersimpan!')
      }
    });
  },
});

