import './category.html'
import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';
import slugify from 'slugify';

import { Categorys } from '../../../api/alma-v1/db/collections-komsosCenter';


Template.categorysList.onCreated(function(){

    Tracker.autorun(() => {
      Meteor.subscribe("getCategorysList", function(){
        console.log("category is ready");
      });
    });
});

Template.categorysList.helpers({
    categorys () {
      return Categorys.find({}, {
        sort: {
          "name": 1
        }
      });
    }
});

Template.categoryForm.onCreated( function(){

    this.category = new ReactiveVar();
    this.paroki = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);

});

Template.categoryForm.onRendered( function(){
    if(this.submitType.get() === 2){
        const _id = Router.current().params._id
        const getCategory = Categorys.findOne({
          _id
        })
        if(getCategory){
            $('#input-name').val(getCategory.name);
        }
        // ini hanya berguna jika tidak auto publish
        else{
          history.back();
        }
      }
      else{
        initEditor(Template.instance())
      }
});

Template.categoryForm.helpers({
    matkuls(){
      return CoursePrograms.find({});
    },
    pushedMks(){
      return arr.array();
    }
});

Template.categoryForm.events({
    'click #submit-form': function(e, t ) {
        e.preventDefault();
        const name = $('#input-name').val();
        const roles = Meteor.user().roles[0];

        const body = {
          name
        }

        if (roles._id === 'komsos') {
          body.categoryType = 'komsosType';
        }

        let postRoute = 'createCategory';
        const submitType = t.submitType.get();
        if (submitType == 2) {
            postRoute = 'editCategory'
            body._id = Router.current().params._id;
        }

      Meteor.call(postRoute, body, function(error, result) {
        if (result) {
            successAlertBack('Kateogri Baru Tersimpan!')
        } else  {
            failAlert(error)
        }
      });
    }
});