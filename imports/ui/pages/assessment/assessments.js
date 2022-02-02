import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';
import textareaAutoSize from 'textarea-autosize';


import { ScoreSheets } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItemGroups } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItems } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringTemplates } from '../../../api/alma-v1/db/collections-assessment.js';
import { ItemAnswers } from '../../../api/alma-v1/db/collections-assessment.js';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';


import { saDict } from '../../../api/alma-v1/db/dict-assessment.js';
import { sagDict } from '../../../api/alma-v1/db/dict-assessment.js';
import { fbDict } from '../../../api/alma-v1/db/dict-assessment.js';


// import '../main.html';
// import './sheets.html';
import './assessments.html';

SimpleSchema.debug = true;

function enterLoading() {
  $('body').toggleClass('loading');
  $('button').attr("disabled", true);
}

function exitLoading(successStatus, callback) {
  if ( !successStatus ) {
    failAlert('Error nih...')
    if (callback && typeof(callback) === "function") {
      callback();
    }
    $('body').toggleClass('loading');
    $('button').attr("disabled", false);
  } else {
    failAlert('Sukses!')
    if (callback && typeof(callback) === "function") {
      callback();
    }
    $('body').toggleClass('loading');
    $('button').attr("disabled", false);
  }
}

function getGid(formItem){
  let itemId = formItem.name;
  return itemId.slice(0,1);
}

function sliceGid(value) {
  return value.slice(0,1);
}

const arr = new ReactiveArray([
]);


Template.amkAssessmentForm.onCreated(function(){
  let paramId = Router.current().params._id;
  this.nowLoading = new ReactiveVar(true);
  let loadingStatus = this.nowLoading;
  this.yetAssessed = new ReactiveVar(false);
  let vResult = this.yetAssessed;
  Meteor.call('checkAssExist', paramId, function (error, result) {
    if ( error ) {
      failAlert('Gagal memvalidasi form...')
    } else {
      vResult.set(!result)
      loadingStatus.set(false)
    }
  });
})

Template.amkAssessmentForm.onRendered(function(){

})

Template.amkAssessmentForm.helpers({
  stillLoading(){
    return Template.instance().nowLoading.get();
  },
  yetAssessed(){
    let vResult = Template.instance().yetAssessed.get();
    if ( vResult ) {
      return Template.instance().yetAssessed.get();
    }
  },
  assGroup(){
    return sagDict;
  },
  questionsInGroup(){
    let gId = parseInt(this.id);
    let questionsInGroup = _.filter(saDict, function(x){
      return x.gid === gId;
    })
    return questionsInGroup;

  },
});

Template.amkAssessmentForm.events({
  "click #submitAss": function(event, template) {
    event.preventDefault();

    let amkId = Router.current().params._id;



    function validateForm() {
      let checkedRadio = 0;
      $('input[type=radio]:checked').each(function() {
        checkedRadio += 1;
      });

      let n = saDict.length;
      // console.log(n)
      // console.log(checkedRadio)

      return ( n === checkedRadio );
    }

    if ( !validateForm() ) {
      failAlert('Mohon lengkapi semua isian.')
    } else {
      enterLoading();
      const rawFormData = $('#amk-form').serializeArray();

      Meteor.call('submitAss', amkId, rawFormData, function (error, result) {
        if (error) {
          failAlert(error)
          exitLoading(false, function(){
            // console.log('gagal broh ini callback nya exitLoading!')
          });
        } else {
          successAlert(result)
          // console.log(result)
          exitLoading(true, function(){
            // console.log('sukses broh ini callback nya exitLoading!');
            Router.go('amkFeedbackForm', {'amkId': amkId , 'sheetId': result });
          });
        }
      });
    }
  }
});




// ****************************************************************************
// *                               FEEDBACK FORM                              *
// ****************************************************************************


Template.amkFeedbackForm.onCreated( function() {
  let sheetId = Router.current().params.sheetId;

  this.nowLoading = new ReactiveVar(true);
  this.yetAssessed = new ReactiveVar(false);
  let vResult = this.yetAssessed;
  let loadingStatus = this.nowLoading;

  Meteor.call('checkAssFbExist', sheetId, function (error, result) {
    if ( error ) {
      failAlert('Gagal memvalidasi form...',)
    } else {
      vResult.set(!result);
      loadingStatus.set(false);
    }
  });
});

Template.amkFeedbackForm.onRendered(function(){

});



Template.amkFeedbackForm.helpers({
  feedbackItem(){
    return fbDict;
  },
  stillLoading(){
    return Template.instance().nowLoading.get();
  },
  yetAssessed(){
    let vResult = Template.instance().yetAssessed.get();
    if ( vResult ) {
      return Template.instance().yetAssessed.get();
    }
  },
})

Template.amkFeedbackForm.events({
  'click #submitFeedback': function (event, template) {
    event.preventDefault();

    enterLoading();

    let sheetId = Router.current().params.sheetId;

    const rawFormData = $('#amk-feedback-form').serializeArray();
    // console.log(rawFormData);

    Meteor.call('feedbackAss', sheetId, rawFormData, function (error, result) {
      if (error) {
        failAlert(error)
        exitLoading(false, function(){
          // console.log('gagal broh ini callback nya exitLoading!')
        });
      } else {
        exitLoading(true, function(){
          successAlert('Terima kasih atas masukan Anda!')
          Router.go('home');
        });
      }
    });

  }
});

// ****************************************************************************
// *                                amk details                               *
// ****************************************************************************



Template.amkAssessmentDetail.helpers({
  assGroup(){
    return sagDict;
  },
  scoringItems(){
    let scoreData = Template.instance().data.scoreData;
    let gid = parseInt(this.id);
    let scoringItems = _.filter(scoreData, function(x){
      return x.groupId == gid;
    });
    return scoringItems;
  }
});




// ****************************************************************************
// *                                amk report                                *
// ****************************************************************************


Template.amkAssessmentReport.onCreated(function(){
  let paramId = Router.current().params._id;

  this.nowLoading = new ReactiveVar(0);
  let loadingStatus = this.nowLoading;
  this.reportPerGroup = new ReactiveVar();
  let calcResult = this.reportPerGroup;
  this.avgPerGroup = new ReactiveVar();
  let calcAvg = this.avgPerGroup;
  this.avgPerItem = new ReactiveVar();
  let itemAvg = this.avgPerItem;
  this.sheetCount = new ReactiveVar();
  let getSheetCount = this.sheetCount;
  this.feedbacks = new ReactiveVar();
  let getFeedbacks = this.feedbacks;

  Meteor.call('assReportAvgPerItem', paramId, function (error, result) {
    if ( error ) {
      failAlert('Failed building report... 1')
    } else {
      // console.log(result)
      itemAvg.set(result)
      loadingStatus.set(loadingStatus.get() + 1);
    }
  });
  Meteor.call('assReportPerGroup', paramId, function (error, result) {
    if ( error ) {
      failAlert('Failed building report... 2')
    } else {
      // console.log(result)
      calcResult.set(result)
      loadingStatus.set(loadingStatus.get() + 1);
    }
  });
  Meteor.call('assReportGroupAverage', paramId, function (error, result) {
    if ( error ) {
      failAlert('Failed building report... 3')
    } else {
      // console.log(result)
      calcAvg.set(result)
      loadingStatus.set(loadingStatus.get() + 1);
    }
  });
  Meteor.call('getSheetCount', paramId, function (error, result) {
    if ( error ) {
      failAlert('Failed building report... 4')
    } else {
      // console.log(result)
      getSheetCount.set(result)
      loadingStatus.set(loadingStatus.get() + 1);
    }
  });
  Meteor.call('getFeedbacks', paramId, function (error, result) {
    if ( error ) {
      failAlert('Failed building report... 5')
    } else {
      console.log(result)
      getFeedbacks.set(result)
      loadingStatus.set(loadingStatus.get() + 1);
    }
  });
});


Template.amkAssessmentReport.helpers({
  loadingCount(){
    return Template.instance().nowLoading.get();
  },
  group(){
    let resultData = Template.instance().reportPerGroup.get();
    let tingkatData = Template.instance().avgPerGroup.get();
    let sheetCount = Template.instance().sheetCount.get();

    // console.log(resultData)
    // console.log(tingkatData)

    function findX (value) {
      let theX = _.findWhere(tingkatData, {"_id" : value });
      // console.log(theX.groupAvg)
      return theX.groupAvg;
    }

    let extendedData = _.each(resultData, function(x){
      return _.extend(x, {
        "groupSelfAvg": x.groupScore/sheetCount.selfCount,
        "groupTingkatAvg": findX(x._id),
      });
    })

    let finalData = _.each(extendedData, function(x) {
      return _.extend(x, {
        "standing": (x.groupSelfAvg-x.groupTingkatAvg)/x.groupTingkatAvg*100
      })
    })
    // console.log(finalData);
    return finalData;
  },
  sheetCount(){
    return Template.instance().sheetCount.get();
  },
  groupedItems(){
    let resultData = Template.instance().avgPerItem.get();
    let groupedData = _.each(resultData, function(x){
      _.extend(x, { "groupId": sliceGid(x.itemId) });
    })

    // let groupedData = [];

    _.each(sagDict, function(x){
      let mappedX = _.filter(resultData, function(g) {
        return g.groupId == x.id;
      } )
      return _.extend(x, { "items": mappedX })
    })

    // console.log(resultData)
    return sagDict;

    // console.log(groupedData)
  },
  itemStanding(){
    let self = this;
    let standing = (self.myAvg - self.tingkatAvg)/self.tingkatAvg * 100;
    // console.log(standing)
    return standing;
  },
  sheets(){
    let paramId = Router.current().params._id;
    return ScoreSheets.find({
      "acmatkulId": paramId
    });
  },
  feedbackGroup(){
    return Template.instance().feedbacks.get();
  }
});

Template.assessmentList.helpers({
  assessments: function () {
    return ScoreSheets.find({},{
      sort: {
        timestamp: -1
      }
    });
  }
});
