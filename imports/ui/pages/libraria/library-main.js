import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { studentIndex } from '../../../api/alma-v1/db/collections.js';
import { BooksIndex } from '../../../api/alma-v1/db/collections-libraria.js';
import { Books } from '../../../api/alma-v1/db/collections-libraria.js';
import SimpleSchema from 'simpl-schema';
import _ from 'underscore';


import './library-main.html';

Accounts.onLogin(function(){
  // let user = Meteor.userId();
  // if (Roles.userIsInRole(user, ['libraryStation'])) {
  //   Router.go("libraryStationHome");
  // }
});

const arr = new ReactiveArray([
]);

Template.libraryStationHome.onCreated( function(){
  this.borrowingForm = new ReactiveVar(true);
})

Template.libraryStationHome.helpers({
  borrowingForm () {
    return Template.instance().borrowingForm.get();
  }
});

Template.libraryStationHome.events({
  'click #setBorrow': function (event, template) {
    event.preventDefault();
    template.borrowingForm.set(true);
  },
  'click #setReturn': function (event, template) {
    event.preventDefault();
    template.borrowingForm.set(false);
  }
});

Template.stationBorrowForm.onCreated(function() {
  let instance = this;
  let userId = Meteor.userId();
  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log("userSearch is ready");
    });
  });
  arr.clear();
  this.theBorrower = new ReactiveVar();
  this.searchUser = new ReactiveVar(true);
});

Template.stationBorrowForm.onRendered( function(){
  // $(".select2").select2().select2('open');
})

Template.stationBorrowForm.helpers({
  user () {
    return Meteor.users.find();
  },
  bookBorrowing(){
    return arr.list();
  },
  searchUser(){
    return Template.instance().searchUser.get();
  },
  username(){
    let theBorrower = Template.instance().theBorrower.get();
    return theBorrower.username;
  }
});

Template.stationBorrowForm.events({
  'change #selectBorrowerId': function(event, template) {
    event.preventDefault();
    console.log(event.target.value)
    template.borrowerId.set(event.target.value);
  },
  'click .status-10-selectThisBook': function (event, template) {
    event.preventDefault();
    let thisBookId = this._id;
    
    let checkExisting = _.findIndex(arr, function(x){
      return x._id == thisBookId;
    });

    let validateProduct = function(){
      if ( thisBookId == null ) {
        return false;
      } else {
        return true;
      }
    }

    if (checkExisting < 0 && validateProduct()) {
      arr.push(this);
      // console.log("boleh push")
      $('#search-book').val("");
    } else {
      failAlert('Buku sudah ada dalam daftar Anda!')
    }
  },
  'click .status-20-selectThisBook': function (event, template) {
    event.preventDefault();
    failAlert('Buku sedang dipinjam...')
  },
  'click .select-this-guy': function (event, template) {
    event.preventDefault();
    let thisGuyId = this._id;

    let students = Meteor.users.find().fetch();
    let checkExisting = _.findIndex(students, function(x){
      return x._id == thisGuyId;
    });

    let validateUser = function(){
      if ( thisGuyId == null ) {
        return false;
      } else {
        return true;
      }
    }

    if (checkExisting > -1 && validateUser()) {
      template.theBorrower.set(this);
      template.searchUser.set(false);
    } else {
      failAlert('Pilih namamu BROOOOH!!')
    }
  },
  'click #submit-borrow-form': function(event, template) {
    event.preventDefault();
    let books = arr.array();
    let theBorrower = template.theBorrower.get();
    let borrowerId = theBorrower._id;
    let borrowerName = theBorrower.username;
    console.log(borrowerId)
    console.log(borrowerName)
    if ( arr.array().length < 1 ) {
      failAlert('Silahkan pilih buku dulu BROH!')
    } else {
      Meteor.call('borrowBooks', borrowerId, borrowerName, books, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert()
          location.reload();
        }
      });
    }
  },
  'click .remove-item': function(event, template) {
    event.preventDefault();
    return arr.remove(this);
    console.log(arr.array())
  },
  'click #cancel-user': function(event, template){
    event.preventDefault();
    arr.clear();
    template.theBorrower.set(null);
    template.searchUser.set(true);
  },
  

});


SimpleSchema.debug = true;





Template.stationReturnForm.onCreated(function() {
  let instance = this;
  let userId = Meteor.userId();
  Tracker.autorun(() => {
    Meteor.subscribe('userSearch', function(){
      console.log("userSearch is ready");
    });
    Meteor.subscribe('booksList', function(){
      console.log("books ready")
    })
  });
  arr.clear();
  this.theBorrower = new ReactiveVar();
  this.searchUser = new ReactiveVar(true);
});

Template.stationReturnForm.onRendered( function(){
  // $(".select2").select2().select2('open');
})

Template.stationReturnForm.helpers({
  user () {
    return Meteor.users.find();
  },
  searchUser(){
    return Template.instance().searchUser.get();
  },
  username(){
    let theBorrower = Template.instance().theBorrower.get();
    return theBorrower.username;
  },
  borrowedBook(){
    let theBorrower = Template.instance().theBorrower.get();
    return Books.find({
      "status": 20,
      // "borrowHistory.borrowerId": theBorrower._id,
      "borrowHistory.returnTimestamp": null
    }, {
      sort: {
        "title": 1
      },
    });
  }
});


Template.stationReturnForm.events({
  'change #selectBorrowerId': function(event, template) {
    event.preventDefault();
    console.log(event.target.value)
    template.theBorrower.set(event.target.value);
  },
  'click .select-this-guy': function (event, template) {
    event.preventDefault();
    let thisGuyId = this._id;

    let students = Meteor.users.find().fetch();
    let checkExisting = _.findIndex(students, function(x){
      return x._id == thisGuyId;
  });

    let validateUser = function(){
      if ( thisGuyId == null ) {
        return false;
      } else {
        return true;
      }
    }

    if (checkExisting > -1 && validateUser()) {
      template.theBorrower.set(this);
      template.searchUser.set(false);
    } else {
      failAlert('Pilih namamu BROOOOH!!')
    }
  },
  'click .return-this-book': function(event, template){
    // console.log("clicked")
  },
  'click #cancel-user': function(event, template){
    event.preventDefault();
    arr.clear();
    template.theBorrower.set(null);
    template.searchUser.set(true);
  },
  'click #submit-return-form': function(event, template){
    event.preventDefault();
    let theBorrower = template.theBorrower.get();
    let borrowerId = theBorrower._id;
    const formData = $('#book-return-form').serializeArray();
    console.log(formData);
    if ( formData.length < 1 ) {
      failAlert('Silahkan pilih bukunya dulu BROH!')
    } else {
      Meteor.call('returnBooks', borrowerId, formData, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert()
          location.reload();
        }
      });
    }
  }
});
