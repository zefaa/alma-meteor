
import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _ from 'underscore';

import { CimCurriculas } from '../../../api/alma-v1/db/collections-cimCenter';
import { MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';

import Quill from 'quill';
import slugify from 'slugify';
const arr = new ReactiveArray([
]);

import './curricula.html';
import { CoursePrograms } from '../../../api/coursePrograms/coursePrograms';

Template.curriculaList.onCreated(function(){
    this.curriculumForm = new ReactiveVar(false);
    Tracker.autorun(() => {
      Meteor.subscribe("matkulList", function(){
        console.log("matkulList is ready");
      });
      Meteor.subscribe("cimCurricula", function(){
        console.log("Cim Curricula is ready");
      });
      Meteor.subscribe('coursesList', function(){
        console.log('kursus list ready now');
      });
    });
  });

Template.curriculaList.helpers({
    formCollection () {
      return Curricula;
    },
    showCurriculumForm(){
      return Template.instance().curriculumForm.get();
    },
    curriculum () {
      return CimCurriculas.find({}, {
        sort: {
          "name": 1
        }
      });
    },
  });

Template.curriculaList.events({
    'click #toggle-curriculum-form': function (event, template) {
      event.preventDefault();
      template.curriculumForm.set( !template.curriculumForm.get());
    },
});


  Template.curriculaForm.onCreated( function(){
    arr.clear();
    this.allMks = new ReactiveVar();
    this.selectedMk = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);
    const handles = [
      Meteor.subscribe('coursesList', function(){
        console.log('kursus list ready now');
      }),
    ];

    Tracker.autorun(() => {
      const areReady = handles.every(handle => handle.ready());
      console.log(`Handles are ${areReady ? 'ready' : 'not ready'}`);
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

  Template.curriculaForm.onRendered( function(){
    if(this.submitType.get() === 2){
        const _id = Router.current().params._id
        const getCurricula = CimCurriculas.findOne({
          _id
        })
        if(getCurricula){
            $('#input-name').val(getCurricula.name);
            $('#slug').val(getCurricula.slug)
            $('#input-excerpt').val(getCurricula.excerpt);
            _.each(getCurricula.courseList, function(x){
                let cpId = new Meteor.Collection.ObjectID(x._id);
                let thiscp = CoursePrograms.findOne({"_id": cpId });
                if ( thiscp ) {
                    _.extend(thiscp, {
                        "cpId": x._id
                    });
                    arr.push(thiscp);
                }
            })
            initEditor(Template.instance(),{
              content: getCurricula.description
            })
         }
        // ini hanya berguna jika tidak auto publish
        else{
          history.back();
        }
      }
      else{
        initEditor(Template.instance())
      }
  })

  Template.curriculaForm.helpers({
    matkuls(){
      return CoursePrograms.find({});
    },
    pushedMks(){
      return arr.array();
    }
  });

  Template.curriculaForm.events({
    "input #input-name" (e, t){
      const value = e.target.value
      const slug = slugify(value, {
          lower: true,
          strict: true,
      })
      $('#slug').val(slug);
    },
    'click #push-cp': function (e, t) {
      e.preventDefault();
      let cpId = $('#select-cp').val();

      let checkExisting = _.findIndex(arr.array(), function(x){
        return x.cpId === cpId;
      });
      // console.log(checkExisting)
      const objectId = new Meteor.Collection.ObjectID(cpId);
      let thiscp = CoursePrograms.findOne({"_id": objectId });

      if ( ( checkExisting < 0 ) && thiscp ) {
        arr.push(thiscp);
        $('#select-cp').val('');
      } else {
        failAlert('Program Kursus sudah di dalam daftar.')
      }
    },
    'click .delete-matkul': function(e, t){
      e.preventDefault();
      arr.remove(this);
    },
    'click #submit-form': function(e, t ) {
      e.preventDefault();
      const _id = Router.current().params._id
      checkSlug('cimCurriculas', {
        editId: _id
      }).then((result)=>{
        if(result){
          const slug = result
          const name = $('#input-name').val();
          const excerpt = $('#input-excerpt').val();
          const description = t.editor.get().getData()
          const cpData = arr.array();
          const body = {
            name,
            excerpt,
            description,
            slug
          }
          const submitType = t.submitType.get();
          let postRoute = 'cimCurriculasCreate';
          if(submitType === 2) {
            postRoute = 'cimCurriculasEdit';
            body._id = Router.current().params._id;
          }
          const courseList=[];
          _.each(cpData, function(x){
              const nameCourses = x.name;
              const slugCourses = x.slug;
              const id = x._id;
              const objectId = id.toHexString();
              courseList.push({
                  _id : objectId,
                  name : nameCourses,
                  slug : slugCourses,
                  excerpt: x.excerpt
              })
          })
          body.courseList = courseList;
          Meteor.call(postRoute, body, function (error, result) {
            if (error) {
              failAlert(error)
            } else {
              successAlertBack('Tersimpan!')
            }
          });
        }
      })
    }
  });
