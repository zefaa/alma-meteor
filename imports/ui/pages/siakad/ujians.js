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
import { Ujians } from '../../../api/alma-v1/db/collections-siakad.js';
import { ujianTypeOptions } from '../../../api/alma-v1/db/collections-siakad.js';

import { ujianFiles } from '../../../api/alma-v1/db/collections-files.js';

import { fabric } from "fabric";
import Pristine from 'pristinejs';
import { Stopwatch } from 'stopwatch.js'
import Swal from 'sweetalert2';
import './ujians.html';

function getFormDataStudentId(formDataItemName){
  return formDataItemName.split('-')[0];
}
function getFormDataActiveMatkulId(formDataItemName){
  return formDataItemName.split('-')[1];
}

const fireSummernote = function(){
  console.log("fired");
  $('.summer').summernote({
      height: 150,
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



Template.ujianInput.onCreated( function(){

});

Template.ujianInput.onRendered( function(){
  // this.$(".datepicker").datetimepicker();
  this.dataForm = new Pristine(document.getElementById("dataForm"))
  const dateEndInput = document.getElementById("dateEnd")
   
  this.dataForm.addValidator(dateEndInput, function(value, el) {

    let dateStart = $("#dateStart").val()
    if(dateStart !== ''){
      dateStart = new Date(dateStart)
    }

    if(dateStart !== '' && value.length){
      const dateEnd = new Date(value)
      if(dateStart.getTime() <= dateEnd.getTime()){
        return true;
      }
    }
    return false;
  }, 'Tanggal selesai harus lebih besar daripada tanggal mulai', 2, false);

  $(".datepicker").datepicker({
    autoclose: true,
    format: "yyyy-mm-dd",
    startDate: new Date(),
  });
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
});



Template.ujianInput.helpers({
  typeUjians(){
    return ujianTypeOptions;
  }
});

Template.ujianInput.events({
  'submit #dataForm': function (event, template) {
    event.preventDefault();
    const valid = template.dataForm.validate();
    if(valid){
      let acmatkulId = Router.current().params._id;
      let dateStart = new Date($("#dateStart").val());
      let dateEnd = new Date($("#dateEnd").val());
      let time = $("#inputTime").val();
      let name = $("#inputname").val();
      let typeUjian = $("#selectTypeUjian").val();
      let instructionUjian = $("#inputInstructionUjian").val();
      let soalUjian = $("#inputSoalUjian").val();
      let unggahTugas = $("input[name='input-unggahan']:checked").val();
      let note = $("#inputNote").val();
  
      let uploadStatus = false;
  
      if ( unggahTugas === "true" ) {
        uploadStatus = true;
      }
  
      // const formData = $('#ujianInputForm').serializeArray();
  
      // const data = []
      // _.each(formData, function(el){
      //   console.log(el)
      //   let thisGuy = Meteor.users.findOne({
      //     "_id": getFormDataStudentId(el.name)
      //   });
      //   let item = {
      //     "_id": getFormDataStudentId(el.name),
      //     "username": thisGuy.username,
      //     "fullname": thisGuy.fullname,
      //     "score": el.value
      //   };
      //   data.push(item);
      // });
      // console.log(data)
      // console.log(formData)
  
      Meteor.call('ujianAdd', acmatkulId, name, dateStart,
                  dateEnd, time, typeUjian, uploadStatus,
                  instructionUjian, soalUjian, note, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlertBack()
        }
      });
    }
  },
  
});


Template.ujiansList.helpers({
  ujians: function () {
    return Ujians.find()
  }
});

Template.ujiansListActive.onCreated(function(){
  let currentUjian = Router.current().params._id;
  this.ujiansFuture = new ReactiveVar(true);

  Tracker.autorun(() => {
    Meteor.subscribe('ujiansListActive', function(){
      console.log("ujiansListActive is ready");
    });
    Meteor.subscribe('matkulListActive', function(){
      console.log("matkulListActive is ready");
    });
    Meteor.subscribe('userSearch');
    Meteor.subscribe('periodeStudis');
  });
})


Template.ujiansListActive.helpers({
  ujians: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });

    if (currentPeriodeStudi !== undefined ) {
      let currentPS = currentPeriodeStudi._id;
      return Ujians.find({
        "psId": currentPS,
        "date": {
          $gte: new Date()
        }
      }, {
        sort: {
          "date": -1
        }
      });
    }
  },
  myUjiansDosen: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });
    let currentPS = currentPeriodeStudi._id;

    let userId = Meteor.userId();

    return Ujians.find({
      "psId": currentPS,
      "date": {
        $gte: new Date()
      },
      "dosenId": userId
    }, {
        sort: {
          "date": -1
        }});
  },
  myUjiansStudent: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });
    let currentPS = currentPeriodeStudi._id;
    let userId = Meteor.userId();

    return Ujians.find({
      "psId": currentPS,
      "date": {
        $gte: new Date()
      },
      "students.studentId": userId
    }, {
        sort: {
          "date": -1
        }});
  },
  ujiansPast: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });

    if (currentPeriodeStudi !== undefined ) {
      let currentPS = currentPeriodeStudi._id;
      return Ujians.find({
        "psId": currentPS,
        "date": {
          $lt: new Date()
        }
      }, {
        sort: {
          "date": -1
        }});
    }
  },
  myUjiansDosenPast: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });
    let currentPS = currentPeriodeStudi._id;

    let userId = Meteor.userId();

    return Ujians.find({
      "psId": currentPS,
      "date": {
        $lt: new Date()
      },
      "dosenId": userId
    }, {
        sort: {
          "date": -1
        }});
  },
  myUjiansStudentPast: function () {
    let currentPeriodeStudi = PeriodeStudis.findOne({
      "status": true
    });
    let currentPS = currentPeriodeStudi._id;
    let userId = Meteor.userId();

    return Ujians.find({
      "psId": currentPS,
      "date": {
        $lt: new Date()
      },
      "students.studentId": userId
    }, {
        sort: {
          "date": -1
        }});
  },
  currentPsId (){
    let currentPs = PeriodeStudis.findOne({
      "status": true
    });
    return currentPs._id;
  },
  ujiansFuture(){
    return Template.instance().ujiansFuture.get();
  }
});

Template.ujiansListActive.events({
  'click #setViewFuture': function (event, template) {
    event.preventDefault();
    template.ujiansFuture.set(true);
  },
  'click #setViewPast': function (event, template) {
    event.preventDefault();
    template.ujiansFuture.set(false);
  }
});


Template.ujianDetails.onCreated(function(){
  this.viewMode = new ReactiveVar(1);
  this.nowLoading = new ReactiveVar(true);
  let stillLoading = this.nowLoading;

  let currentUjian = Router.current().params._id;

  const handles = [
    Meteor.subscribe('ujianDetails', currentUjian, function(){
      console.log("currentUjian is ready");
    }),
    Meteor.subscribe('userSearch')
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    if ( areReady === true ) {
      console.log("everything is ready")
      stillLoading.set(false);
    }
  });
});

Template.ujianDetails.helpers({
  ownAcmatkul (){
    let userId = Meteor.userId();
    let ujianId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let activeMatkulId = this.activeMatkulId;

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });

    console.log(userId)


    if (thisAcmatkul !== undefined ) {
      if ( userId === thisAcmatkul.dosenId || Roles.userIsInRole(loggedInUser, ['admin','superadmin']) ) {
        return true
      };
    }
  },
  viewMode(){
    return Template.instance().viewMode.get()
  },
  stillLoading(){
    return Template.instance().nowLoading.get()
  },
  enrolled(){
    return true;
  }
});

Template.ujianDetails.events({
  'click .toggle-view': function(e, t){
    e.preventDefault();
    let self = $(event.target);
    t.viewMode.set(self.data('view-target'));
  },
});



Template.ujianEdit.onCreated(function(){
  let currentUjian = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('ujianDetails', currentUjian, function(){
      console.log("currentUjian is ready");
    });
    Meteor.subscribe('userSearch');
  });
});

Template.ujianEdit.onRendered( function(){
      console.log("now firing")
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

Template.ujianEdit.helpers({
  formCollection: function () {
    return Ujians;
  },
  ownAcmatkul (){
    let userId = Meteor.userId();
    let ujianId = Router.current().params._id;
    let loggedInUser = Meteor.user();

    let activeMatkulId = this.activeMatkulId;

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

Template.ujianEdit.events({
  'click #deleteUjian': function (event, template) {
    event.preventDefault();
    let ujianId = Router.current().params._id;
    Meteor.call('deleteUjian', ujianId, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert('Ujian telah terhapus!')
        Router.go('home');
      }
    });
  }
});

Template.ujianPrint.onCreated(function(){
  let currentUjian = Router.current().params._id;
  Tracker.autorun(() => {
    Meteor.subscribe('ujianDetails', currentUjian, function(){
      console.log("currentUjian is ready");
    });
    Meteor.subscribe('userSearch');
  });
});


let aggregateUjians = ( acmatkulId, template ) => {
  Meteor.call('aggregateUjians', acmatkulId, (error, result) => {
    if (error) {
      console.log(error.reason);
    } else {
      // console.log(result)
      template.ujiansByType.set(result);
    }
  });
}



Template.ujianReport.onCreated(function(){
  let acmatkulId = Router.current().params._id;

  let template = Template.instance();
  var self = this;
  this.ujiansByType = new ReactiveVar();
  this.nowLoading = new ReactiveVar(true);
  let thisActiveMatkul = ActiveMatkuls.findOne({
    _id: acmatkulId
  });
  this.thisActiveMatkul = new ReactiveVar(thisActiveMatkul);

  Tracker.autorun(() => {
    Meteor.subscribe('activeMatkulDetails', acmatkulId);
    Meteor.subscribe('ujianListScoped', acmatkulId);
    Meteor.subscribe('userSearch');
  });
});



Template.ujianReport.onRendered( () => {
  let acmatkulId = Router.current().params._id;

  aggregateUjians( acmatkulId, Template.instance() );
});


Template.ujianReport.helpers({
  ujianByTypes(){
    let acmatkulId = Router.current().params._id;
    let ujians = Template.instance().ujiansByType.get();
    let thisActiveMatkul = Template.instance().thisActiveMatkul.get();
    let scoringScheme = thisActiveMatkul.scoringScheme;

    // console.log(scoringScheme)

    const ujiansByType = [];

    _.each(ujians, function(el){
      let studentId = el._id.studentId;
      let ujianType = el._id.ujianType;
      let score = el.score;
      let avgScore = 
        _.reduce(
          score,
          (memo, num) => memo + num,
          0
        ) / score.length || 1;

      calculateWeightedScore = function(){
        if ( scoringScheme === 1 ) {
          // console.log("lengkap")
          if ( ujianType === 1 || ujianType === 2) {
            return avgScore * 0.1;
          } else if ( ujianType === 3 ) {
            return avgScore * 0.3;
          } else if ( ujianType === 4 ) {
            return avgScore * 0.5;
          }
        } else if ( scoringScheme === 2 || scoringScheme === 3 ) {
          // console.log("lengkap")
          if ( ujianType === 2 || ujianType === 1 ) {
            return avgScore * 0.2;
          } else if ( ujianType === 3 ) {
            return avgScore * 0.3;
          } else if ( ujianType === 4 ) {
            return avgScore * 0.5;
          }
        } else if ( scoringScheme === 4 ) {
          // console.log("lengkap")
          if ( ujianType === 3 ) {
            return avgScore * 0.5;
          } else if ( ujianType === 4 ) {
            return avgScore * 0.5;
          }
        }
      }

      // calculateWeightedScore();
      // console.log(calculateWeightedScore())


      ujiansByType.push({
        ujianType,
        studentId,
        score,
        avgScore,
        weightedScore: calculateWeightedScore()
      })
    });

    // console.log(ujiansByType)
    const sortedUjians = _.sortBy(ujiansByType, "ujianType");
    // console.log(sortedUjians)


    const groupedUjians = _.groupBy(sortedUjians, "studentId");

    console.log(groupedUjians)

    const groupedIteratedResultsData = [];
    _.each(groupedUjians, function(e, k){
      console.log(e.weightedScore)
      let finalScore = _.reduce(
        e,
          (memo, num) => memo + num.weightedScore,
          0
        );
      groupedIteratedResultsData.push({
        "studentId": k,
        "ujians": e,
        "finalScore": finalScore
      });
    });
    console.log(groupedIteratedResultsData)







    return groupedIteratedResultsData;
  },
  ujianDirects(){
    let acmatkulId = Router.current().params._id;
    return Ujians.find({
      "activeMatkulId": acmatkulId
    })
  },
  ujianTugas(){
    let acmatkulId = Router.current().params._id;
    return Ujians.find({
      "activeMatkulId": acmatkulId,
      "typeUjian": 1,
      // "students._id": this.studentId
    }, {
      sort: {
        "date": -1
      }
    });
  },
  ujianQuiz(){
    let acmatkulId = Router.current().params._id;
    return Ujians.find({
      "activeMatkulId": acmatkulId,
      "typeUjian": 2,
      // "students._id": this.studentId
    }, {
      sort: {
        "date": -1
      }
    });
  },
  ujianUTS(){
    let acmatkulId = Router.current().params._id;
    return Ujians.find({
      "activeMatkulId": acmatkulId,
      "typeUjian": 3,
      // "students._id": this.studentId
    }, {
      sort: {
        "date": -1
      }
    });
  },
  ujianUAS(){
    let acmatkulId = Router.current().params._id;
    return Ujians.find({
      "activeMatkulId": acmatkulId,
      "typeUjian": 4,
      // "students._id": this.studentId
    }, {
      sort: {
        "date": -1
      }
    });
  },
  ujianTypes(){
    console.log(this)
    let types = [1, 2, 3 ,4]
    return types;
    // return this.ujians;
  }
});


Template.ujianDetailsPrintScores.onCreated( function(){
  
  let ujianId = Router.current().params._id;

  Tracker.autorun(() => {
    Meteor.subscribe('ujianDetails', ujianId, function(){
      let thisUjian = Ujians.findOne({ "_id": ujianId });
      let acmatkulId = thisUjian.activeMatkulId;

      Meteor.subscribe('activeMatkulDetails', acmatkulId);
    });
    Meteor.subscribe('userSearch');
  });
})


Template.ujianDetailsPrintAttendance.onCreated( function(){
  console.log(this.data)
  let ujianId = Router.current().params._id;

  Tracker.autorun(() => {
    Meteor.subscribe('ujianDetails', ujianId, function(){
      let thisUjian = Ujians.findOne({ "_id": ujianId });
      let acmatkulId = thisUjian.activeMatkulId;
      Meteor.subscribe('activeMatkulDetails', acmatkulId);
    });
    Meteor.subscribe('userSearch');
  });
})


Template.ujianDetailsPrintAttendance.helpers({
  acmatkulStudents () {
    let thisActiveMatkul = ActiveMatkuls.findOne({
      "_id": this.activeMatkulId
    });
    return thisActiveMatkul.students;
  },
  
});



Template.inputScoreView.onCreated(function(){
  let currentUjian = Router.current().params._id;
  this.inputWM = new ReactiveVar(false);

  Tracker.autorun(() => {
    Meteor.subscribe('ujianDetails', currentUjian, function(){
      console.log("currentUjian is ready");
    });
    Meteor.subscribe('userSearch', function(){
      console.log("user ready")
    });
  });
});

Template.inputScoreView.helpers({
  acmatkulStudents: function () {
    let ujianId = Router.current().params._id;
    let acmatkulId = this.activeMatkulId;
    let thisActiveMatkul = ActiveMatkuls.findOne({
      "_id": acmatkulId
    });
    let studentsList = thisActiveMatkul.students;
    return studentsList;
  },
  score (){
    let userId = this.studentId;
    console.log(userId)
    let ujianId = Router.current().params._id;
    let thisUjian = Ujians.findOne({
      "_id": ujianId
    });
    // console.log(thisUjian)

    let studentsList = thisUjian.students;
    console.log(studentsList)

    let thisStudent = _.find(studentsList, function(x){
      return x.studentId == userId;
      console.log(x)
    })

    return thisStudent.score;
  },

  inputWM(){
    return Template.instance().inputWM.get();
  }
});


Template.inputScoreView.events({
  'click #toggleInputWM': function(event, template) {
    event.preventDefault();
    template.inputWM.set(!template.inputWM.get())
  },
  'keyup .inputScoreWM': function(event, template) {
    event.preventDefault();
    let wmValue = event.target.value;
    let convertedValue = (100/90) * wmValue;
    let convertLimitedValue;

    if (convertedValue >= 100 ) {
      convertLimitedValue = 100;
    } else {
      convertLimitedValue = convertedValue;
    }

    function writeValue() {
        $(event.target).next().val(convertLimitedValue);
    }


    let textInput = event.target;
    let timeout = null;

    clearTimeout(timeout);
    timeout = setTimeout(function () {
      writeValue();
    }, 500);

  },
  'click #submitScores': function (event, template) {
    event.preventDefault();
    let ujianId = Router.current().params._id;
    const formData = $('#input-score-table-form').serializeArray();
    console.log(formData)

    // TODO: handle input score WM

    const data = []
    _.each(formData, function(el){
      console.log(el)
      let item = {
        "studentId": el.name,
        "score": el.value
      };
      data.push(item);
    });
    console.log(data);
    Meteor.call('inputUjianScores', ujianId, data, function (error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlert()
      }
    });
  }
});

//1 menit = 60000ms
//10000ms = 10 detik //gunakan ini buat ngetesnya
const noteTime = 10000
const attemptTime = 30000

Template.ujianDo.onCreated(function(){
  const paramId = Router.current().params._id;
  
  this.currentUpload = new ReactiveVar(false);
  this.ujianFileId = new ReactiveVar();
  this.ujianFilesList = new ReactiveArray();

  this.finalAnswer = new ReactiveVar();
  this.finalFile = new ReactiveVar();
  this.lockAnswer = new ReactiveVar(false);

  this.nowLoading = new ReactiveVar(true);
  this.setTimer = new ReactiveVar();
  const thisTimer = this.setTimer;
  this.remainingTime = new ReactiveVar();
  const thisRemaining = this.remainingTime


  let stillLoading = this.nowLoading;

  const handles = [
    Meteor.subscribe('ujianDetails', paramId, function(){
      console.log("ujian detail is ready");
    }),
    Meteor.subscribe('files.ujianFiles.all')

  ];

  const template = Template.instance()

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready");
      let thisData = this.data
      setTimeout(function(){
        const getStudent = _.findWhere(thisData.students, { "studentId": Meteor.user()._id });
        const testTime = parseInt(thisData.time)
        thisRemaining.set(testTime - getStudent.timePassed)
        let passedTime = getStudent.timePassed
  
        if(getStudent.attempt <= 2){
          const newTimer = window.setInterval(function(){
            passedTime += noteTime / 60000
            thisRemaining.set(testTime - passedTime)
            if(passedTime >= testTime){
              failAlert('Waktu ujian telah habis')
              submitAnswer(template)
            }
            Meteor.call('noteTime', paramId, function (error, result) {
            });
          }, noteTime);
          thisTimer.set(newTimer)
  
          setTimeout(function(){
            Meteor.call('noteAttempt', paramId, function (error, result) {
            });
          }, attemptTime);
          stillLoading.set(false);
          setTimeout(function(){
            fireSummernote()
          }, 200);
        }
        else{
          failAlert('Anda telah mengakses ujian ini sebanyak tiga kali')
          Router.go('ujianDoDetails', {'_id': paramId});
        }
      }, 3000);
    }
  });
});

// Template.ujianDo.onRendered(function() {
//   setTimeout(function(){
//     fireSummernote()
//   }, 200);
// })

Template.ujianDo.helpers({
  remainingTime(){
    return Template.instance().remainingTime.get()
  },
  stillLoading(){
    return Template.instance().nowLoading.get()
  },
  ujianFilesList () {
    return Template.instance().ujianFilesList.array();
  },
  thisFile () {
    const self = this.toString();
    const image = ujianFiles.findOne({
      "_id": self
    });
    if ( self && image ) {
      return image;
    }
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  lockAnswer(){
    return Template.instance().lockAnswer.get();
  }
});

function submitAnswer(t){
  enterLoading();
  const ujianId = Router.current().params._id;
  if(!t.finalAnswer.get()){
    console.log('answer')
    t.finalAnswer.set($('#answer').val())
  }
  if(!t.finalFile.get()){
    console.log('ujian')
    t.finalFile.set(t.ujianFilesList.array())
  }
  clearInterval(t.setTimer.get());
  // $('#answer').summernote('disable');
  $('#answer').prop( "disabled", true );
  t.lockAnswer.set(true);
  Meteor.call('submitUjian', ujianId,
              t.finalAnswer.get(),
              t.finalFile.get(), function (error, result) {
    if (error) {
      failAlert(error)
      exitLoading(false);
    } else {
      successAlert()
      exitLoading(true);
      Router.go('ujianDoDetails', {'_id': ujianId});
    }
  });
}

Template.ujianDo.onDestroyed(function () {
  clearInterval(Template.instance().setTimer.get());
});

Template.ujianDo.events({
  'click #submit-form': function (e, t) {
    e.preventDefault();
    if($('#answer').val().length > 0){
      Swal.fire({
        title: 'Pastikan Jawaban Anda Kembali',
        text: 'Jawaban akan dikunci dan tidak bisa diubah hingga jawaban terkirim atau anda refresh halaman ini',
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Kirim Jawaban',
        cancelButtonText: 'Tidak'
      }).then((result) => {
        if (result.value) {
          submitAnswer(t)
        }
      });
    }
    else{
      failAlert('Jawaban tidak boleh kosong')
    }
  },
  'change #unggahTugas': function(event, template) {
    event.preventDefault();
    const checkFile = event.currentTarget.files;

    if ( checkFile && checkFile.length > 0 ) {
      
      template.currentUpload.set(checkFile);
      
      _.each(checkFile, function(file){
  
        const upload = ujianFiles.insert({
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
          template.ujianFilesList.push(fileId);
        });
  
        upload.start();
  
      });
      template.currentUpload.set(false);
    }
  },
  'click .remove-image'(event, template) {
    event.preventDefault()
    const fileId = event.target.attributes.buttondata.value.toString();
    const lockAnswer = template.lockAnswer.get()
    if(lockAnswer){
      failAlert('Jawaban telah dikunci')
    }
    else{
      // enterLoading();
      //HalfDone filenya kehapus tapi ada error di servernya yang bikin tidak return kesini
      //solusi tercepat, jangan dikasih loading
      Meteor.call('deleteUjianFile', fileId, function (error, result) {
        if (error) {
            failAlert(error)
            // exitLoading(true);
          } else {
            // alert('File "' + fileObj.name + '" successfully uploaded');
            successAlert('Sukses menghapus file')
            // exitLoading(true);
          }
      });
    }
  }
});





Template.ujianGrade.onCreated(function(){
  const paramId = Router.current().params._id;
  const studentId = Router.current().params.studentId;
  this.canvasJson = new ReactiveVar([]);
  this.tempFiles = new ReactiveVar([]);
  this.currentId = new ReactiveVar("");

  this.nowLoading = new ReactiveVar(true);
  let stillLoading = this.nowLoading;

  const handles = [
    Meteor.subscribe('ujianDetails', paramId, function(){
      console.log("ujian detail is ready");
    }),
    Meteor.subscribe('currentStudent', studentId, function(){
      console.log("student detail is ready");
    }),
  ];

  Tracker.autorun(() => {
    const areReady = handles.every(handle => handle.ready());
    console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
    console.log(areReady)
    if ( areReady === true ) {
      console.log("everything is ready");
      stillLoading.set(false);
      setTimeout(function(){
        fireSummernote()
      }, 200);
    }
  });
});

Template.ujianGrade.helpers({
  stillLoading(){
    return Template.instance().nowLoading.get()
  },
  sdata(){
    const studentsList = this.students;
    const userId = Router.current().params.studentId;

    const sdata = _.findWhere(studentsList, { "studentId": userId });
    return sdata;
  },
  thisFile (ujian) {
    const self = ujian.fileId;
    const image = ujianFiles.findOne({
      "_id": self
    });
    if ( self && image ) {
      return image;
    }
  },
  submitted(){
    const studentsList = this.students;
    const userId = Router.current().params.studentId;

    // let checkExisting = _.findIndex(studentsList, function(x){
   //    return x.studentId === userId;
   //  });

    let sdata = _.findWhere(studentsList, { "studentId": userId });

    if ( sdata.dateSubmitted ) {
      return true
    }
  },
  parentInstance(){
    return Template.instance();
  },
  tempFiles(){
    return Template.instance().tempFiles.get();
  }
});

function dataURLtoFile(dataurl, filename) {
 
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
      
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, {type:mime});
}

Template.ujianGrade.events({
  "change .unggahTugas": function (e, t) {
    const id = this._id;
    const tempFiles = t.tempFiles.get();
    const prevIndex = tempFiles.findIndex(x => {
      return x.id === id;
    })
    if(prevIndex === -1){
      tempFiles.push({
        id: id,
        file: e.target.files[0]
      });
    }
    else{
      tempFiles[prevIndex] = {
        id: id,
        file: e.target.files[0]
      }
    }
    t.tempFiles.set(tempFiles);
  },
  'click #submit-form': async function (e, t) {
    e.preventDefault();
    const currentId = t.currentId.get();
    if(!currentId || currentId === ""){
      enterLoading();
      const ujianId = Router.current().params._id;
      const studentId = Router.current().params.studentId;
      const score = parseInt($('#score').val());
      const note = $('#note').val();
      const canvasJson = t.canvasJson.get();
      const tempFiles = t.tempFiles.get();
      const newFileId = [];
      const realEditedId = [];
  
      if(tempFiles.length > 0){
        await new Promise((resolve, reject) => {
          _.each(tempFiles, function(data){
            const upload = ujianFiles.insert({
              file: data.file,
              streams: 'dynamic',
              chunkSize: 'dynamic'
            }, false);
            upload.on('start', function () {
            });
            upload.on('end', function (error, fileObj) {
              if (error) {
                console.log(error);
                reject(error);
              }
              const fileId = fileObj._id;
              newFileId.push({
                id: data.id,
                editedId: fileId,
              });
              if(newFileId.length === tempFiles.length){
                resolve();
              }
            });
            upload.start();
          });
        })
      }
      
      if(canvasJson.length > 0){
        await new Promise((resolve, reject) => {
          _.each(canvasJson, function(data){
            const file = dataURLtoFile(data.editedImage, data.id + "_edited.jpg");
            const upload = ujianFiles.insert({
              file: file,
              streams: 'dynamic',
              chunkSize: 'dynamic'
            }, false);
            upload.on('start', function () {
            });
            upload.on('end', function (error, fileObj) {
              if (error) {
                console.log(error);
                reject(error);
              }
              const fileId = fileObj._id;
              realEditedId.push({
                id: data.id,
                editedId: fileId,
                editedJson: data.canvas
              });
              if(realEditedId.length === canvasJson.length){
                resolve();
              }
            });
            upload.start();
          });
        })
      }
  
      const studentsList = this.students;
      const userId = Router.current().params.studentId;
      const sdata = _.findWhere(studentsList, { "studentId": userId });
  
      sdata.ujianFile.forEach(element => {
        const id = element.fileId;
        const getFile = ujianFiles.findOne({
          _id: id
        });
        if(getFile.isImage){
          element.description = $("#" + id + "-description").val();
          const getEdited = realEditedId.find(x => {
            return x.id === id;
          })
          if(getEdited){
            element.editedId = getEdited.editedId;
            element.editedJson = JSON.stringify(getEdited.editedJson);
          } 
        }
        // jika ada file video tambahkan else if
        // else ini untuk docx dan pdf
        else{
          const getEdited = newFileId.find(x => {
            return x.id === id;
          })
          if(getEdited){
            Meteor.call('deleteUjianFile', id);
            element.fileId = getEdited.editedId;
          }
        }
      });
  
      if (score) {
        Meteor.call('gradeUjian', ujianId, studentId,
                     score, note, sdata.ujianFile, function (error, result) {
          if (error) {
            failAlert(error)
            exitLoading(false);
          } else {
            successAlert()
            exitLoading(true);
            Router.go('home');
          }
        });
      } else {
        failAlert('Harap kerjakan dulu.')
        exitLoading(false);
      }
    }
    else{
      failAlert('Masih ada gambar yang sedang diedit')
      exitLoading(false);
    }
  }
});

Template.gradingCanvas.onDestroyed(function () {
  const canvas = Template.instance().canvas.get();
  $(canvas.wrapperEl).remove()
});

Template.gradingCanvas.onCreated( function(){
  const ujianFile = this.data.ujianFile;
  this.ujianFilesList = new ReactiveArray();
  this.currentId = new ReactiveVar("");
  this.canvasJson = new ReactiveVar([]);
  this.prevId = new ReactiveVar();
  this.canvasHeight = new ReactiveVar();
  this.canvasWidth = new ReactiveVar();
  this.originalImage = new ReactiveVar([]);
  this.parentInstance = this.data.parentInstance;
  this.imageExist = new ReactiveVar(false);
  const thisExist = this.imageExist;
  const thisImage = this.originalImage.get();
  const thisUjian = this.ujianFilesList;
  ujianFile.forEach(element => {
    thisUjian.push(element);
  });
  thisUjian.array().forEach(element => {
    thisImage.push(element.fileId);
  });
  this.originalImage.set(thisImage);
  const checkImage = ujianFiles.find({
    "_id": {
      $in: thisImage
    }
  }).fetch();
  for (let index = 0; index < checkImage.length; index++) {
    const element = checkImage[index];
    if(element.isImage === true){
      thisExist.set(true);
      break;
    }
  }
});

Template.gradingCanvas.onRendered( function(){
    const loggedInUser = Meteor.user();
    const imageExist = Template.instance().imageExist.get();
    if(Roles.userIsInRole(loggedInUser, ['admin', 'dosen', 'superadmin']) && imageExist){
      const canvas = new fabric.Canvas('scoring-canvas', {
        isDrawingMode: false
      });
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = "#B22222";
      this.canvas = new ReactiveVar(canvas);
      $(".canvas-container").addClass("display-none");
    }
    else{
      console.log("No Canvas");
    }
});

Template.gradingCanvas.helpers({
  imageExist(){
    return Template.instance().imageExist.get();
  },
  ujianFilesList () {
    return Template.instance().ujianFilesList.array();
  },
  thisFile (data) {
    const self = data.fileId.toString();
    const image = ujianFiles.findOne({
      "_id": self
    });
    if ( self && image ) {
      return image;
    }
  },
  editedFile (data) {
    try {
      const self = data.editedId;
      if ( self) {
        const image = ujianFiles.findOne({
          "_id": self
        });
        return image;
      }
      else{
        return false
      } 
    } catch (error) {
      console.log(error);
    }
  },
  currentId(){
    return Template.instance().currentId.get(); 
  },
  checkEdited(id){
    const prevJson = Template.instance().canvasJson.get();
    const prevIndex = prevJson.findIndex(x => {
      return x.id === id;
    })
    if(prevIndex > -1){
      return prevJson[prevIndex].editedImage;
    }
    else{
      return false;
    } 
  },
  originalImage(id){
    const originalImage = Template.instance().originalImage.get();
    const prevIndex = originalImage.findIndex(x => {
      return x === id;
    })
    if(prevIndex > -1){
      return true;
    }
    else{
      return false;
    } 
  }
});

Template.gradingCanvas.events({
  'click #clear-canvas': function(e, t){
    e.preventDefault();
    const canvas = t.canvas.get();
    canvas.clear();
    const id = t.currentId.get();
    setBackImage(id, canvas, t);
    canvas.renderAll();
  },
  'change #drawing-color': function(e, t){
    const canvas = t.canvas.get();
    const brush = canvas.freeDrawingBrush;
    brush.color = e.target.value;
    if (brush.getPatternSrc) {
      brush.source = brush.getPatternSrc.call(brush);
    }
  },
  'change #drawing-line-width': function(e, t){
    const canvas = t.canvas.get();
    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10) || 1;
    e.target.previousSibling.innerHTML = e.target.value;
  },
  'click .btn-original': function(e, t){
    const id = this._id;
    const originalImage = t.originalImage.get();
    const prevIndex = originalImage.findIndex(x => {
      return x === id;
    })
    if(prevIndex === -1){
      originalImage.push(id);
    }
    else{
      originalImage.splice(prevIndex, 1);
    }
    t.originalImage.set(originalImage);
  },
  'click .canvas-close': function(e, t){
    const id = this._id;
    storePrevJson(t, id);
    t.currentId.set();
    t.parentInstance.currentId.set();
    t.canvas.isDrawingMode = false;
    $(".canvas-container").addClass("display-none");
    $("#canvas-control").addClass("display-none");
  },
  'click .canvas-open': function(e, t){
    e.preventDefault();

    const id = this._id;
    const prevJson = t.canvasJson.get();
    const canvas = t.canvas.get();
    canvas.isDrawingMode = true;
    $(".canvas-container").removeClass("display-none");
    if(!$(".canvas-container").parent()[0].className.includes("fieldset")){
      const prevId = t.prevId.get();
      storePrevJson(t, prevId);
    }
    t.prevId.set(id);
    t.currentId.set(id);
    t.parentInstance.currentId.set(id);

    // bukan hanya canvasnya yang diappend, tetapi container yang dihasilkan oleh fabric.js-nya
    jQuery(".canvas-container").detach().appendTo("#" + id + "-container");
    $("#canvas-control").removeClass("display-none");

    // bersihkan canvas dari editan sebelumnya
    canvas.clear();

    t.canvasHeight.set($("#" + id + "-canvas-image").height());
    t.canvasWidth.set($("#" + id + "-canvas-image").width());

    // sesuaikan width dan height canvasnya
    canvas.setHeight(t.canvasHeight.get());
    canvas.setWidth(t.canvasWidth.get());

    const prevIndex = prevJson.findIndex(x => {
      return x.id === id;
    });
    const serverJson = t.ujianFilesList.array().find(x => {
      return x.fileId === id;
    })
    if(prevIndex > -1){
      canvas.loadFromJSON(prevJson[prevIndex].canvas);
    }
    // ini dengan asumsi jsonnya pasti kesimpan setelah save atau pindah gambar
    else if(prevIndex === -1 && serverJson && serverJson.editedJson){
      canvas.loadFromJSON(JSON.parse(serverJson.editedJson));
    }

    setBackImage(id, canvas, t);

    canvas.renderAll();
  },
});

function storePrevJson(template, id){
  const prevJson = template.canvasJson.get();
  const canvas = template.canvas.get();
  const prevIndex = prevJson.findIndex(x => {
    return x.id === id;
  })
  const dataURL = canvas.toDataURL({
    format: 'jpeg'
  });
  if(prevIndex === -1){
    prevJson.push({
      id: id,
      canvas: canvas.toJSON(),
      editedImage: dataURL,
    });
  }
  else{
    prevJson[prevIndex] = {
      id: id,
      canvas: canvas.toJSON(),
      editedImage: dataURL,
    }
  }
  template.canvasJson.set(prevJson);
  template.parentInstance.canvasJson.set(prevJson);
}

function setBackImage(id, canvas, template){
  const canvasWidth = template.canvasWidth.get();
  const canvasHeight = template.canvasHeight.get();

  const canvasImage = $("#" + id + "-canvas-image").attr('src');
  const image = new Image();
  image.src = canvasImage;

  const canvasAspect = canvasWidth / canvasHeight;
  const imgAspect = image.width / image.height;
  let left, top, scaleFactor;

  if (canvasAspect >= imgAspect) {
      scaleFactor = canvasWidth / image.width;
      left = 0;
      top = -((image.height * scaleFactor) - canvasHeight) / 2;
  } else {
      scaleFactor = canvasHeight / image.height;
      top = 0;
      left = -((image.width * scaleFactor) - canvasWidth) / 2;
  }
  canvas.setBackgroundImage(canvasImage, canvas.renderAll.bind(canvas), {
      top: top,
      left: left,
      originX: 'left',
      originY: 'top',
      scaleX: scaleFactor,
      scaleY: scaleFactor
  });
}


Template.ujianScoreTable.helpers({
  canSee: function (sdata) {
    const loggedInUser = Meteor.user();
    const userId = Meteor.userId();
    const ujianId = Router.current().params._id;

    const thisUjian = Template.instance().data;

    const activeMatkulId = thisUjian.activeMatkulId;

    let thisAcmatkul = ActiveMatkuls.findOne({
      "_id": activeMatkulId
    });


    const myown = function(){
      if (userId === thisAcmatkul.dosenId || userId === sdata.studentId) {
        return true;
      }
    }

    if (thisAcmatkul !== undefined ) {
      if ( myown() || Roles.userIsInRole(loggedInUser, ['admin', 'dosen', 'superadmin']) ) {
        return true
      };
    }
  }
});