import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';

import { PeriodeStudis } from '/imports/api/alma-v1/db/collections.js';

import { CoursePrograms, CourseProgramsActive } from '/imports/api/coursePrograms/coursePrograms.js';
import { CimUjians, CimUjianSheets } from '/imports/api/ujians/ujians.js';

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
const type = [
  {value : 'quiz'},
  {value : 'uts'},
  {value : 'uas'}
]

Template.acpUjianList.onCreated(function(){
  const self = this;
  const acpId = Router.current().params._acpId;
  self.Materials = new ReactiveVar([]);

  Tracker.autorun(() => {
    Meteor.subscribe("cimActiveCourses", function(){
      console.log("Cim Active Courses is ready");
    }),
    Meteor.subscribe('cimUjians', function() {
      console.log('cim ujians ready')
    })
  });
});

Template.acpUjianList.helpers({
  ujians: function () {
    const acpId = Router.current().params._acpId;
    return CimUjians.find({
      "acpId": acpId,
    }, {
      sort: {
        "date": -1
      }
    });
  },
  currentAcp (){
    const acpId = Router.current().params._acpId;
    const objectId = new Mongo.Collection.ObjectID(Router.current().params._acpId);
    return CourseProgramsActive.findOne({
      _id : objectId
    })
  }
});

Template.acpUjianList.events({
  'click #delete-ujian': function (e, t) {
    e.preventDefault();
    const idAcp = Router.current().params._acpId;
    enterLoading();
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah anda yakin untuk menghapus ujian ini?',
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Iya',
      cancelButtonText: 'Tidak'
    }).then((result) => {
      if (result.value) {
        Meteor.call('acpUjianDelete', this._id, idAcp, function (error, result) {
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

Template.acpUjiansForm.onCreated( function() {
  this.submitType = new ReactiveVar(this.data.submitType);
  this.flag = new ReactiveVar(1);
  this.editor = new ReactiveVar();
  this.editor99 = new ReactiveVar();
  this.options = {
      editorEl : "editor",
      toolbarEl : "toolbar-container",
      templateField : "editor"
  };
  this.options1 = {
      editorEl : "editor99",
      toolbarEl : "toolbar-container99",
      templateField : "editor99"
  };
  Tracker.autorun(() => {
    Meteor.subscribe('cimUjians', function() {
      console.log('cim ujians ready')
    })
  })
});

Template.acpUjiansForm.onRendered(function(){
  const checkSuscribeAcp = CourseProgramsActive.find({}).count();
  if(checkSuscribeAcp > 0) {
    if(this.submitType.get() === 2){
      const ujianId  = new Mongo.Collection.ObjectID(Router.current().params._id);
      const ujianDetails = CimUjians.findOne({
        _id : ujianId
      });
      if (ujianDetails){
        console.log(ujianDetails)
        $('#selectTypeUjian').val(ujianDetails.ujianType);
        $('#inputname').val(ujianDetails.name);
        if(ujianDetails.startDate){
          $('#dateStart').val((ujianDetails.startDate).substring(0, 10));
        }
        if(ujianDetails.endDate){
          $('#dateEnd').val((ujianDetails.endDate).substring(0, 10));
        }
        $('#inputTime').val(ujianDetails.durationMinutes);
        this.options1.content = ujianDetails.hint;
        this.options.content = ujianDetails.questions[0].question;
        initEditor(Template.instance(), this.options1);
        initEditor(Template.instance(), this.options);



        for (let index = 1; index < ujianDetails.questions.length; index++) {
          const currentFlag = Template.instance().flag.get();
          const option = {
            editorEl : "editor"+index,
            toolbarEl : "toolbar-container"+index,
            templateField : "editor"+index,
            content : ujianDetails.questions[index].question
          }
          const newDiv = $('<div id="'+option.toolbarEl+'"></div> <div id="'+option.editorEl+'" class="ckeditor-content"></div><br>');
          $('#lembarSoal').append(newDiv);
          eval('this.'+option.editorEl+' = new ReactiveVar()');
          initEditor(Template.instance(), option);
          const nextFlag = currentFlag + 1;
          Template.instance().flag.set(nextFlag);
        }


      } else {
        history.back();
      }
    }else{
    initEditor(Template.instance(), this.options1);
    initEditor(Template.instance(), this.options);
    }
  }else{
    history.back();

  }
});

Template.acpUjiansForm.helpers({
  typeUjians() {
    return type;
  }
});

Template.acpUjiansForm.events({
  "click #addQuestion":function(e,t){
    const currentFlag = Template.instance().flag.get();

    const option = {
      editorEl : "editor"+currentFlag,
      toolbarEl : "toolbar-container"+currentFlag,
      templateField : "editor"+currentFlag
    };
    //add element div Wysywig
    const newDiv = $('<div id="'+option.toolbarEl+'"></div> <div id="'+option.editorEl+'" class="ckeditor-content"></div><br>');
    $('#lembarSoal').append(newDiv);
    //create variabel wysiwyg
    eval('t.'+option.editorEl+' = new ReactiveVar()');
    //initiasi wysywig
    initEditor(Template.instance(), option);
    //ubah flag untuk wysywyg berikutnya
    const nextFlag = currentFlag + 1;
    Template.instance().flag.set(nextFlag);
  },
  "click #saveQuestion" : function (e,t) {
    //collect data
    const acpId  = Router.current().params._acpId;
    const ujianType = $('#select-type').val();
    const name = $('#inputname').val();
    const startDate = new Date($('#dateStart').val()).toISOString();
    const endDate = new Date($('#dateEnd').val()).toISOString();
    const durationMinutes = $('#inputTime').val();

    //get data question
    const questions = [
      {
        number : 1,
        question : t.editor.get().getData()}
    ];
    const endQuestion = Template.instance().flag.get() - 1;

    for (let index = 1; index <= endQuestion; index++) {
      const editor = 'editor'+index;
      const temp = {
        number : index+1,
        question : t[editor].get().getData()
      }
      questions.push(temp);
    }
    let postRoute = 'acpUjianCreate';
    const data = {
      acpId,
      ujianType,
      name,
      startDate,
      endDate,
      durationMinutes,
      questions,
      hint : t.editor99.get().getData()
    };
    const submitType = t.submitType.get();
    if(submitType == 2){
      data.ujianId = Router.current().params._id;
      postRoute = 'acpUjianEdit';
    }

    Meteor.call(postRoute, data, function(error, result) {
      if(!error){
        successAlertBack('Sukses');
      } else {
        failAlert(error)
      }
    })

  }
});

Template.acpUjianSheetList.onCreated(function(){

  const self = this;
  const paramId = Router.current().params._id;

  self.thisUjian = new ReactiveVar();

  Meteor.call('cim.getUjianDetails', paramId, function(error, result) {
    if (result) {
      console.log(result);
      self.thisUjian.set(result);
    }
  });

  Tracker.autorun(() => {
    Meteor.subscribe('cim.ujianSheets.list', paramId, function(){
      console.log("cim.ujianSheets.list is ready");
    });
  });
});

Template.acpUjianSheetList.helpers({
  ujianSheets: function () {
    const paramId = Router.current().params._id;
    return CimUjianSheets.find({
      "ujianId": paramId,
    }, {
      sort: {
        "profileName": 1
      }
    });
  },
  thisUjian () {
    const thisUjian = Template.instance().thisUjian.get();

    if (thisUjian) {
      return thisUjian;
    }
  }
});

Template.acpUjianSheetDetail.onCreated(function(){

  const self = this;
  const paramId = Router.current().params._id;

  self.thisUjian = new ReactiveVar();
  self.gradingMode = new ReactiveVar(true);
  self.calculatedScore = new ReactiveVar();

  console.log(paramId)

  Meteor.call('cim.getUjianSheetDetails', paramId, function(error, result) {
    if (result) {
      console.log(result);
      self.thisUjian.set(result);
      self.calculatedScore.set(result.score);
    }
  });

  Tracker.autorun(() => {
    Meteor.subscribe('cim.ujianSheets.list', paramId, function(){
      console.log("cim.ujianSheets.list is ready");
    });
  });
});


Template.acpUjianSheetDetail.helpers({
  ujianSheets: function () {
    const paramId = Router.current().params._id;
    return CimUjianSheets.find({
      "ujianId": paramId,
    }, {
      sort: {
        "profileName": 1
      }
    });
  },
  thisUjian () {
    const thisUjian = Template.instance().thisUjian.get();
    // console.log(thisUjian);
    if (thisUjian) {
      return thisUjian;
    }
  },
  gradingMode () {
    const gradingMode = Template.instance().gradingMode.get();
    // console.log(gradingMode);
    if (gradingMode) {
      return gradingMode;
    }
  },
  calculatedScore () {
    const calculatedScore = Template.instance().calculatedScore.get();
    // console.log(calculatedScore);
    if (calculatedScore) {
      return calculatedScore;
    }
  },
  scoreValid () {
    const calculatedScore = Template.instance().calculatedScore.get();
    if (calculatedScore && calculatedScore < 101) {
      return true;
    } else {
      return false;
    }
  }
});

function calculateScore (t) {
  const inputs = $('.grade-input');
  // console.log(inputs);
  const finalScore = _.reduce(inputs, function(memo, num) {
    let thisScore = parseInt($(num).val());

    console.log(thisScore);
    if (!thisScore || isNaN(thisScore)) {
      thisScore = 0;
    }
    console.log(thisScore);

    return memo + thisScore;
  }, 0);

  console.log(finalScore);
  t.calculatedScore.set(finalScore);
}

Template.acpUjianSheetDetail.events({
  'click #toggle-grading' (e, t) {
    e.preventDefault();
    t.gradingMode.set(!t.gradingMode.get());
  },
  'keyup .grade-input' (e, t) {
    e.preventDefault();
    const val = $(e.currentTarget).val();
    // console.log(val);
    calculateScore(t);
  },
  'click #submit-grading' (e, t) {
    e.preventDefault();
    console.log('grading now')
    const paramId = Router.current().params._id;
    const score = t.calculatedScore.get();
    console.log(score)
    Meteor.call('cim.ujianSheets.grade', paramId, score, function(error, result) {
      if (error) {
        failAlert(error)
      } else {
        successAlertBack('Nilai tersimpan!')
      }
    })
  }
});
