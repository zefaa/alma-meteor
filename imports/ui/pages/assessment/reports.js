import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';


import { ScoreSheets } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItemGroups } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringTemplates } from '../../../api/alma-v1/db/collections-assessment.js';
import { ItemAnswers } from '../../../api/alma-v1/db/collections-assessment.js';
import { ScoringItems } from '../../../api/alma-v1/db/collections-assessment.js';

import { Tingkats } from '../../../api/alma-v1/db/collections.js';
import { PeriodeStudis } from '../../../api/alma-v1/db/collections.js';



// import '../main.html';
// import './reports.html';

SimpleSchema.debug = true;

const loadingDone = function(){
  Template.instance().nowLoading.set(false)
}

Template.periodeReport.onCreated(function(){
  let template = Template.instance();
  this.itemsByGroups = new ReactiveVar();
  this.reportPerItem = new ReactiveVar();
  Tracker.autorun(() => {
    Meteor.subscribe("answers", function(){
      console.log("answers is ready");
    });
    Meteor.subscribe("scoringItemsList", function(){
      console.log("scoringItemsList is ready");
    });
  });
});


Template.periodeReport.onRendered( () => {
  // let thisPeriodeStudi = PeriodeStudis.findOne({
  //   "status": true
  // });
  let subjectId = Router.current().params._id;
  console.log(subjectId)
  // aggregateSheets( subjectId, Template.instance() );
  // console.log()
});


Template.periodeReport.helpers({
  qitemQuestion(){
    let thisItemId = this.itemId;

    if (thisItemId === "groupnote" ) {
      return "catatan " + this.groupTitle;
    } else if ( thisItemId === "formator" ) {
      return "catatan formator"
    } else if ( thisItemId === "rekomendasi" ) {
      return "rekomendasi formator"
    } else {
      const thisQitem = ScoringItems.findOne({
        "itemId": thisItemId
      });
      return thisQitem.question;
    }
  },
  student(){
    return Meteor.users.find({}).fetch();
  }
});

Template.periodeReport.events({
});


Template.studentSheetItem.helpers({
  groupItem(){
    let formData = this.formData;
    // console.log(formData)
    const result = _.groupBy(formData, "groupTitle");
    // console.log(result);
    let iteratedResults = [];
    // for (var key in result) iteratedResults.push({name:key,value:result[key]});
    _.each(result, function(e, k){
      iteratedResults.push({
        "title": k,
        "items": e
      });
    });
    // console.log(iteratedResults)
    return iteratedResults;
  },
  qitemQuestion(){
    let thisItemId = this.itemId;

    if (thisItemId === "groupnote" ) {
      return "catatan " + this.groupTitle;
    } else if ( thisItemId === "formator" ) {
      return "catatan formator"
    } else if ( thisItemId === "rekomendasi" ) {
      return "rekomendasi formator"
    } else {
      const thisQitem = ScoringItems.findOne({
        "itemId": thisItemId
      });
      return thisQitem.question;
    }
  },
  answerItem(){
    let formData = this.formData;
    let iteratedResults = [];
    const result = _.groupBy(formData, "value");
    function isNumber(n){
      return typeof n == 'number' && !isNaN(n - n);
    }
    _.each(result, function(e, k){

      if ( isNumber(parseInt(k))) {
        iteratedResults.push({
          "title": k,
          "items": e
        });
      }
    });
    // console.log(iteratedResults)
    return iteratedResults;
  },
  valueNumberName(){
    if (isNaN(this.name)) {
      return ""
    } else {
      return this.name;
    }
  }
});


let aggregateStudentSheets = ( subjectId, template ) => {
  Meteor.call('reportPerItem', subjectId, (error, result) => {
    if (error) {
      console.log(error.reason);
    } else {
      console.log(result)
      template.reportPerItem.set(result);
    }
  });
}



Template.studentReport.onCreated(function(){
  let template = Template.instance();
  var self = this;
  this.itemsByGroups = new ReactiveVar();
  this.reportPerItem = new ReactiveVar();
  this.nowLoading = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe("answers", function(){
      console.log("answers is ready");
    });
    Meteor.subscribe("scoringItemsList", function(){
      console.log("scoringItemsList is ready");
    });
    Meteor.subscribe('periodeStudis');
    Meteor.subscribe('currentStudent', currentStudentId );
  });
});


Template.studentReport.onRendered( () => {
  // let thisPeriodeStudi = PeriodeStudis.findOne({
  //   "status": true
  // });
  let subjectId = Router.current().params._id;
  console.log(subjectId)
  aggregateStudentSheets( subjectId, Template.instance() );
  // console.log( aggregateStudentSheets( subjectId, Template.instance() ) )
});

Template.studentReport.helpers({
  nowLoading(){
    return Template.instance().nowLoading.get()
  },
  groupedCountedItem(){
    const rawData = Template.instance().reportPerItem.get();
    let subjectId = Router.current().params._id;
    console.log(rawData)

    const iteratedResults=[];

    _.each(rawData, function(item){
      const scoringItems = item.scoringItems;
      const thisItemId = item._id.itemId;
      const thisItemName = item._id.name;

      function isNumber(n){
        return typeof n == 'number' && !isNaN(n - n);
      }

      // console.log(scoringItems)

      // _.each(scoringItems, function(d){
      //   console.log(d.value)
      // })

      const filteredItems = _.filter(scoringItems, function(e){
        if (e.value !== undefined ) {
          return isNumber(parseInt(e.value))
        }
      })

      // console.log(filteredItems)

      // inject self value

      // let mySelfSheet = ScoreSheets.findOne({
      //   "subjectId": subjectId,
      //   "createdBy": subjectId
      // });

      // _.each(mySelfSheet.formData, function(el) {
      //   // console.log(el.itemId)

      //   let checkExisting = _.findIndex(scoringItems, function(x){
      //     // console.log(x.itemId)
      //     return x.itemId == el.itemId;
      //   });
      //   // console.log(checkExisting)

      //   if ( checkExisting > -1 ) {
      //     let data = scoringItems[checkExisting];
      //     console.log(data.value)
      //     console.log(el.value)

      //     if (data.value = el.value ) {
      //       _.extend(data, {
      //         "self": true
      //       });
      //     }
      //     console.log(data)
      //     scoringItems.splice(checkExisting, 1, data);
      //   }
      // });
      // let checkExisting = _.findIndex(filteredItems, function(x){
      //   return x.itemId == itemId;
      // });

      // let data = mySelfSheet.formData[checkExisting];
      // console.log(scoringItems)



      const countedData = _.countBy(filteredItems, "value" );

      // console.log(countedData)

      const arrayedCountedData = [];
      const countedDataArray = _.each(countedData, function(key, value){
        // console.log(key)
        // console.log(value)
        arrayedCountedData.push({
          "answer": value,
          "count": key,
          // "self": isSelfAnswer()
        });
      });

      // console.log(countedDataArray)



      let mySelfSheet = ScoreSheets.findOne({
        "subjectId": subjectId,
        "createdBy": subjectId
      });
      // console.log(mySelfSheet)

      if (mySelfSheet !== undefined) {
        let myFormData = mySelfSheet.formData;

        console.log(myFormData)
        console.log(item._id)

        let checkIndex = _.findIndex(myFormData, function(i) {
          console.log(thisItemId)
          // console.log(i)
          console.log(i.itemId)
          // console.log(thisItemName)
          return i.name == thisItemName;
        })

        // console.log(checkIndex)

        if ( checkIndex > -1) {
          let data = myFormData[checkIndex];

          let myAnswer = data.value;
          console.log(myAnswer)
          // console.log(arrayedCountedData)

          let checkValueCount = _.findIndex(arrayedCountedData, function(cd) {
            return cd.answer == myAnswer;
          })

          if (checkValueCount > -1 && data) {
            let thisData = arrayedCountedData[checkValueCount];
            // console.log(thisData.answer)
            // console.log(myAnswer)
            _.extend(thisData, {
              "self": true
            })
          } else {
            console.log("nggak ada yg cocok")
          }
        }
      }

      // _.each(mySelfSheet.formData, function(el) {
      //   console.log(el.itemId)

      //   let checkExisting = _.findIndex(scoringItems, function(x){
      //     console.log(x.itemId)
      //     return x.itemId == el.itemId;
      //   });
      //   // console.log(checkExisting)

      //   if ( checkExisting > -1 ) {
      //     let data = scoringItems[checkExisting];
      //     console.log(data.value)
      //     console.log(el.value)

      //     if (data.value == el.value ) {
      //       _.extend(data, {
      //         "self": true
      //       });
      //     }
      //     console.log(data)
      //     scoringItems.splice(checkExisting, 1, data);
      //     console.log(scoringItems)
      //   }
      // });


      // const sortedArrayedCountedData = _.sortBy(arrayedCountedData, "answer")

      // if(arrayedCountedData.length > 0 ) {
        iteratedResults.push({
          "itemId": scoringItems[0].itemId,
          "groupId": scoringItems[0].groupId,
          "groupId": scoringItems[0].groupId,
          "groupTitle": scoringItems[0].groupTitle,
          scoringItems,
          "countedData": arrayedCountedData
        });
      // }
    });

    const groupedIteratedResults = _.groupBy(iteratedResults, "groupTitle");
    const groupedIteratedResultsData = [];
    _.each(groupedIteratedResults, function(e, k){
      groupedIteratedResultsData.push({
        "title": k,
        "items": e
      });
    });
    console.log(groupedIteratedResultsData);
    loadingDone();
    return groupedIteratedResultsData;
  },
  // selfAnswer(){
  //   let subjectId = Router.current().params._id;
  //   let mySelfSheet = ScoreSheets.findOne({
  //     "subjectId": subjectId,
  //     "createdBy": subjectId
  //   });
  //   // console.log(mySelfSheet)
  //   if ( mySelfSheet !== undefined ) {
  //     return mySelfSheet;
  //   } else {
  //     return "false"
  //   }
  // },
  qitemQuestion(){
    let thisItemId = this.itemId;

    if (thisItemId === "groupnote" ) {
      return "catatan " + this.groupTitle;
    } else if ( thisItemId === "formator" ) {
      return "catatan formator"
    } else if ( thisItemId === "rekomendasi" ) {
      return "rekomendasi formator"
    } else {
      const thisQitem = ScoringItems.findOne({
        "itemId": thisItemId
      });
      if (thisQitem !== undefined ) {
        return thisQitem.question;
      } else {
        return ""
      }
    }
  },
  title(){
    // let thisItemId = this.title;

    if (this.title === "null" ) {
      return "formator";
    } else {
      return this.title;
    }
  },
  nanValue(){
    let thisValue = this.value;
    if (thisValue === "true") {
      return "Lulus"
    } else if (thisValue === "false" ) {
      return "Tidak Lulus"
    } else {
      return thisValue;
    }
  }
});




Template.studentReportPrint.onCreated(function(){
});