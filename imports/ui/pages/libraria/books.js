import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { studentIndex } from '../../../api/alma-v1/db/collections.js';
import { BooksIndex } from '../../../api/alma-v1/db/collections-libraria.js';
import { Books } from '../../../api/alma-v1/db/collections-libraria.js';
import { bookStatusOptions } from '../../../api/alma-v1/db/collections-libraria.js';

import SimpleSchema from 'simpl-schema';
import _ from 'underscore';



import './library-main.html';
import './books.html';



Template.searchBook.onCreated( function() {
  Tracker.autorun(() => {
    Meteor.subscribe('booksList', function(){
      console.log('booksList ready now');
    });
  });
});


Template.searchBook.onRendered( function() {
  $('.searchbox input').on('keyup keypress', function(e) {
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      return false;
      console.log('hayo mencet enter yaaa!!!')
    }
  });
  // setTimeout(function(){ 
    $(".searchbox input").focus();
  // }, 100);
});

Template.searchBook.helpers({
  bookIndex: () => BooksIndex,
  attributes(){
    return {
      placeholder: "Masukkan judul buku atau scan barcode"
    }
  },
});


Template.booksList.onCreated(function(){
  this.showCreateForm = new ReactiveVar(false);
  Tracker.autorun(() => {
    Meteor.subscribe('booksList', function(){
      console.log('booksList ready now');
    });
  });
});

Template.booksList.onRendered( function(){

});

Template.booksList.helpers({
  book: function () {
    return Books.find({});
  },
  formCollection(){
    return Books;
  },
  showCreateForm(){
    return Template.instance().showCreateForm.get();
  }
});

Template.booksList.events({
  'click #toggle-book-form': function (event, template) {
    event.preventDefault();
    template.showCreateForm.set( !template.showCreateForm.get());
  },
});

SimpleSchema.debug = true;
