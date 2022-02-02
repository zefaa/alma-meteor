
import { Meteor } from 'meteor/meteor';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import SimpleSchema from 'simpl-schema';

import _, { result } from 'underscore';

import { CimCurriculas } from '../../../api/alma-v1/db/collections-cimCenter';
import { Curricula, MataKuliahs } from '../../../api/alma-v1/db/collections-siakad.js';
import { CoursePrograms, CourseProgramsActive } from '/imports/api/coursePrograms/coursePrograms.js';

import { documentFiles, documentPics, profilePics } from '../../../api/alma-v1/db/collections-files.js';


import slugify from 'slugify';
const arr = new ReactiveArray([
]);

import './courses.html';
import { AppProfiles } from '../../../api/alma-v1/db/collections-profiles';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor';
import { AcpMaterials } from '../../../api/coursePrograms/coursePrograms';

  Template.coursesList.onCreated(function(){
    this.curriculumForm = new ReactiveVar(false);
    Tracker.autorun(() => {
      Meteor.subscribe("matkulList", function(){
        console.log("matkulList is ready");
      });
      Meteor.subscribe("cimCourses", function(){
        console.log("Cim Courses is ready");
      });
    });
  });

  Template.coursesList.helpers({
    formCollection () {
      return Curricula;
    },
    showCurriculumForm(){
      return Template.instance().curriculumForm.get();
    },
    courses() {
      return CoursePrograms.find({}, {
        sort: {
          "name": 1
        }
      });
    },
  });

  Template.coursesList.events({
    'click #toggle-curriculum-form': function (event, template) {
      event.preventDefault();
      template.curriculumForm.set( !template.curriculumForm.get());
    },
  });

  Template.acpCertificateCreate.onCreated(function () {
    arr.clear();
    const id = Router.current().params._acpId;
    this.allMks = new ReactiveVar();
    this.selectedMk = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.editor2 = new ReactiveVar();
    this.description = new ReactiveVar();
    Meteor.call('getAcpDetail', id, function(error, result){
      if(result){
        $('#input-certificatenum').val(result.certificateNumber);
        $('#input-acpname').val(result.name);   
        $('#select-lecturers').val(result.name).attr("selected", "selected");
        _.each(result.lecturers, function(x){
          try{
            const id = x.profileId
            const user = Meteor.users.findOne({
              profileId: id
            });
            x.email = user.emails[0].address
          }
          catch (e){
            x.email = 'Belum Ada Email'
          }
          arr.push(x);
        $('#select-lecturers').append($("<option />").val(x.profileId).text(x.fullName))
        })    
      }
    });
    console.log(arr.length)
  })

  Template.acpCertificateCreate.helpers({
    pushedLecturers(){
      return arr.array();
    }
  })

  Template.acpCertificateCreate.events({
    'click #submit-form': function(e, t ) {
      e.preventDefault();
      const lecturers = arr.array()
      lecturers.forEach(element => {
        const postRoute = 'certificateCreate'
        const idCertificate = $('#input-certificatenum').val();
        const name = element.fullName;
        const email = element.email;
        const acpName = $('#input-acpname').val();
        const acpMaterials = $('#input-materials').val();
        const identifier = 'pembicara'
        const body = {
          idCertificate,
          name,
          email,
          acpName,
          acpMaterials,
          identifier
        }
        if (!checkValid(acpName) || !checkValid(idCertificate) || !checkValid(name) || !checkValid(acpMaterials)|| email === 'Belum Ada Email'){
          failAlert('Periksa Kembali field yang diisi dan email pembicara')
          throw 'Periksa kembali field yang diisi dan pembicara'
        }
        Meteor.call(postRoute, body, function (error, result) {
          if (error) {
            failAlert(error)
          } else {
            successAlert()
            history.back();
          }
        });
      })
      
    },
    'change #select-lecturers': function(e, t ) {
      e.preventDefault();
      const id = $('#select-lecturers').val()
      Meteor.call('getEmailPembicara',id, function(error, result){
        if(result){
          $('#input-email').val(result)
        }
      });
    }
  })
  
  Template.coursesForm.onCreated( function(){
    arr.clear();
    this.allMks = new ReactiveVar();
    this.selectedMk = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);
  });

  Template.coursesForm.onRendered( function(){
    if(this.submitType.get() === 2){
        const id = Router.current().params._id;
        const objectId = new Meteor.Collection.ObjectID(id);
        const getCourses = CoursePrograms.findOne({
          _id : objectId
        })
        if(getCourses){
            $('#input-name').val(getCourses.name);
            $('#slug').val(getCourses.slug)
            $('#input-excerpt').val(getCourses.excerpt);
            $('#input-registrasiLink').val(getCourses.registrasiLink);
            initEditor(Template.instance(), {
              content: getCourses.description
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

  Template.coursesForm.events({
    "input #input-name" (e, t){
      const value = e.target.value
      const slug = slugify(value, {
          lower: true,
          strict: true,
      })
      $('#slug').val(slug);
    },
    'click #submit-form': function(e, t ) {
      e.preventDefault();
      const _id = Router.current().params._id
      checkSlug('coursePrograms', {
        editId: _id
      }).then((result)=>{
        if(result){
          const slug = result
          const name = $('#input-name').val();
          const excerpt = $('#input-excerpt').val();
          const registerLink = $('#input-registrasiLink').val();
          let postRoute = 'coursesCreate'
          const description = t.editor.get().getData()
          const body = {
            name,
            excerpt,
            description,
            slug,
            registerLink
          }
          const submitType = t.submitType.get();
          if(submitType === 2) {
            postRoute = 'coursesEdit';
            body._id = Router.current().params._id;
          }
          Meteor.call(postRoute, body, function (error, result) {
            if (error) {
              failAlert(error)
            } else {
              successAlert()
              history.back();
            }
          });
        }
      })
    }
  });

  Template.activeCoursesList.onCreated(function(){
    this.curriculumForm = new ReactiveVar(false);
    Tracker.autorun(() => {
      Meteor.subscribe("cimActiveCourses", function(){
        console.log("Cim Active Courses is ready");
      });
      Meteor.subscribe('cimCourses', function(){
        console.log('cimCourses list ready now');
      }),
      Meteor.subscribe("cimCurricula", function(){
        console.log("Cim Curricula is ready");
      })
    });
  });

  Template.activeCoursesList.helpers({
    formCollection () {
      return Curricula;
    },
    showCurriculumForm(){
      return Template.instance().curriculumForm.get();
    },
    activeCourses() {
      return CourseProgramsActive.find({
      }, {
        sort : {
          'curriculaName' : 1,
          'name': 1
        }
      });
    },
  });

  Template.activeCoursesList.events({
    'click #toggle-curriculum-form': function (event, template) {
      event.preventDefault();
      template.curriculumForm.set( !template.curriculumForm.get());
    },
  });


  Template.activeCoursesForm.onCreated( function(){
    arr.clear();
    this.allMks = new ReactiveVar();
    this.selectedMk = new ReactiveVar();
    this.editor = new ReactiveVar();
    this.editor2 = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);
    this.description = new ReactiveVar();

    this.options2 = {
      editorEl : "editor2",
      toolbarEl : "toolbar-container2",
      templateField : "editor2"
    };
    this.options = {
      editorEl : "editor",
      toolbarEl : "toolbar-container",
    };

    this.lecturers = new ReactiveVar([])

    const self = this
    Meteor.call('appProfiles-getLecturers', function(error, result) {
      if ( result ) {
        self.lecturers.set(result)
        initSelect2()
      }else{
        failAlert(error)
      }
    })
  });

  Template.activeCoursesForm.onRendered( function(){
    const checkCurriculaReady = CimCurriculas.find({}).count()
    if(checkCurriculaReady > 0){
      if(this.submitType.get() === 2){
        $('#select-course').attr('disable',true);
        const id = Router.current().params._id;
        const objectId = new Meteor.Collection.ObjectID(id);
        const getActiveCourses = CourseProgramsActive.findOne({
          _id : objectId
        });
        if (getActiveCourses){
            if(getActiveCourses.lecturers){
              lecturers = getActiveCourses.lecturers;
            }
            $('#input-name').val(getActiveCourses.name);
            $('#input-excerpt').val(getActiveCourses.excerpt);
            $('#select-curricula').val(getActiveCourses.curriculaId).attr("selected", "selected");
            _.each(getActiveCourses.lecturers, function(x){
              arr.push(x);
            })
            $('#finalDate').val(getActiveCourses.finalDate)
            this.options2.content = getActiveCourses.description;
            initEditor(Template.instance(), this.options2);
            initEditor(Template.instance(), {
              content: getActiveCourses.schedule
            })
            $('#certificate').val(getActiveCourses.certificateNumber);
         }
        // ini hanya berguna jika tidak auto publish
        else{
          history.back();
        }
      }
      else{
        initEditor(Template.instance(), this.options2);
        initEditor(Template.instance(), this.options);
      }
    } else{
      history.back();
    }
  })

  Template.activeCoursesForm.helpers({
    courses(){
      return CoursePrograms.find({});
    },
    curriculas(){
      return CimCurriculas.find({}, {
        sort: {
          "name": 1
        }
      });
    },
    lecturers() {
      return Template.instance().lecturers.get();
    },
    submitKey() {
      return Template.instance().submitType.get();
    },
    pushedLecturers(){
      return arr.array();
    }
    // oldNewRadio (id){
    //   const data = CoursePrograms.find({}).fetch();
    //   console.log(data);
    //   let options = [];
    //   _.each(data, function(x) {
    //     const content = {
    //       radioId : x._id,
    //       radioText : x.name,
    //       radioDescription : x.description
    //     };
    //     options.push(content);
    //   })
    //   return options;
    // },
  });

  Template.activeCoursesForm.events({
    'change #select-course' : function(e,t) {
      const courseId = $('#select-course').val();
      const objectId = new Meteor.Collection.ObjectID(courseId);
      const courseChoose =  CoursePrograms.findOne({
        _id : objectId
      });
      //name courses
      $('#input-name').val(courseChoose.name);
      //excertp
      $('#input-excerpt').val(courseChoose.excerpt);
      //description
      t.editor2.get().setData(courseChoose.description);
    },
    'change #select-lecturers': function(e,t) {
      let lecturerId = $('#select-lecturers').val();
      let checkExisting = _.findIndex(arr.array(), function(x){
        return x.profileId === lecturerId;
      });

      // tidak bisa pakai findWhere
      // console.log(t.lecturers.get())
      const thisLecturer = _.find(t.lecturers.get(), function(data) { 
        return data._id._str === lecturerId;
      });

      if ( checkExisting < 0 ) {
        // dipaksa begini karena di nuxtnya ada yang buat menampilkan dosennya
        if(checkValid(thisLecturer.slug)){
          const temp =  {
            profileId: thisLecturer._id.toHexString(),
            fullName: thisLecturer.fullName,
            imageLink: thisLecturer.imageLink,
            excerpt: thisLecturer.excerpt,
            slug: ''
          }
          // console.log(temp)
          arr.push(temp);
          $('#select-lecturers').val('');
        } else {
          failAlert('Silahkan isi profil dosen di Profil Dosen List dahulu')
        }
      } else {
        failAlert('Pengajar sudah di dalam daftar.')
      }

    },
    'click .delete-lecturer': function(e, t){
      e.preventDefault();
      arr.remove(this);
    },
    'click #submit-form': function(e, t ) {
      e.preventDefault();
      //get data kursus
      const idKursus = $('#select-course').val();
      const nameCourse = $('#input-name').val();
      const excerpt = $('#input-excerpt').val();
      const certificateNumber = $('#certificate').val();
      const finalDate = $('#finalDate').val()
      const description = t.editor2.get().getData();
      const objectId = new Meteor.Collection.ObjectID(idKursus);
      const coursesChoose =  CoursePrograms.findOne({
        _id : objectId
      });
      //kurikulum
      const idKurikulum = $('#select-curricula').val();
      const cimCurricula = CimCurriculas.findOne({
        _id  : idKurikulum
      });
      if(cimCurricula){
        //dosen
        const lecturers = arr.array();
        //schedule
        const schedule = t.editor.get().getData();
        const submitType = t.submitType.get();
        let postRoute = 'activeCoursesCreate';
        const body = {
          name  : nameCourse,
          excerpt,
          description,
          schedule : schedule,
          lecturers,
          curriculaId : idKurikulum,
          curriculaName  : cimCurricula.name,
          certificateNumber,
        }
        if (submitType === 2) {
          postRoute = 'activeCoursesEdit';
          body._id = Router.current().params._id;
          body.name = $('#input-name').val();
          body.lecturers = lecturers;
          body.finalDate = finalDate
          console.log(body)
        }else if (submitType === 1){
          if(coursesChoose){
            body.cpId = idKursus;
            body.cpName = coursesChoose.name;
          }else{
            alert('kursus kosong');
            return false;
          }
        }
        Meteor.call (postRoute, body, function(error, result) {
          if ( result ) {
            successAlert('Data berhasil disimpan');
            history.back();
          }else{
            failAlert('Data gagal disimpan')
          }
        })
      } else {
        failAlert('Kurikulum harus diisi')
      }
    }
  });

  Template.acpMaterialList.onCreated( function() {
    const self = this;
    const acpId = Router.current().params._acpId;
    self.Materials = new ReactiveVar([]);

    Tracker.autorun(() => {
      Meteor.subscribe("cimActiveCourses", function(){
        console.log("Cim Active Courses is ready");
      }),
      Meteor.subscribe("documentFileList", function(){
        console.log("document file list is ready");
      }),
      Meteor.subscribe("documentPicList", function(){
        console.log("document pic is ready");
      }),
      Meteor.subscribe("cimActiveCoursesMaterials", function(){
        console.log("Materials Cim Active Courses is ready");
      })
    });
  });

  Template.acpMaterialList.helpers( {
    currentAcp() {
      const _id = new Mongo.Collection.ObjectID(Router.current().params._acpId);
      return CourseProgramsActive.findOne({
       _id
      })
    }
  });

  Template.acpMaterialForm.onCreated( function(){
    arr.clear();
    this.currentUpload = new ReactiveVar(false);
    this.imageFile = new ReactiveVar();
    this.imageDir = new ReactiveVar();
    this.currentUpload2 = new ReactiveVar(false);
    this.docFile = new ReactiveVar();
    this.fileDir = new ReactiveVar();
    this.submitType = new ReactiveVar(this.data.submitType);
    this.editor = new ReactiveVar();
    this.acpName = new ReactiveVar();
  });

  Template.acpMaterialForm.onRendered( function(){
    const acpId = Router.current().params._acpId;
    const checkAcp = CourseProgramsActive.findOne({
      _id: new Mongo.Collection.ObjectID(acpId)
    });
    if(checkAcp){
      this.acpName.set(checkAcp.name)
      if(this.submitType.get() === 2){
          const _id = Router.current().params._id;

          const thisMaterial = AcpMaterials.findOne({
            _id
          })

          if(thisMaterial){
            $('#input-name').val(thisMaterial.name);
            initEditor(Template.instance(), {
              content : thisMaterial.description
            });
            this.imageFile.set(thisMaterial.imageId);
            this.docFile.set(thisMaterial.fileId);
          }else{
            history.back();
          }

      }
      else{
        initEditor(Template.instance())
      }
    }else{
      history.back();
    }
  })

  Template.acpMaterialForm.events({
    'change #uploadImage': function(event, template) {
      event.preventDefault();
      const checkFile = event.currentTarget.files;

      if ( checkFile && checkFile.length > 0 ) {

        template.currentUpload.set(checkFile);

        _.each(checkFile, function(file){

          const upload = documentPics.insert({
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
            template.imageFile.set(fileId);
          });

          upload.start();

        });
        template.currentUpload.set(false);
      }
    },
    'click .remove-image'(event, template) {
      event.preventDefault()
      const fileId = event.target.attributes.buttondata.value.toString();
      template.imageDir.set(undefined)
      template.imageFile.set(undefined)
      Meteor.call('deleteDocPics', fileId);
    },
    'change #uploadFile': function(event, template) {
      event.preventDefault();
      const checkFile = event.currentTarget.files;

      if ( checkFile && checkFile.length > 0 ) {

        template.currentUpload2.set(checkFile);

        _.each(checkFile, function(file){

          const upload = documentFiles.insert({
            file: file,
            streams: 'dynamic',
            chunkSize: 'dynamic'
          }, false);

          upload.on('start', function () {
          });

          upload.on('end', function (error, fileObj) {
            if (error) {
              exitLoading(false)
            } else {
              exitLoading(true);
            }
            const fileId = fileObj._id;
            template.docFile.set(fileId);
          });

          upload.start();

        });
        template.currentUpload2.set(false);
      }
    },
    'click .remove-file'(event, template) {
      event.preventDefault()
      const fileId = event.target.attributes.buttondata.value.toString();
      Meteor.call('deleteDocFile', fileId);
      template.fileDir.set(undefined)
      template.docFile.set(undefined)
    },
    'click #submit-form': function(e, t ) {
      e.preventDefault();
      const acpId = Router.current().params._acpId;
      const acpName = t.acpName.get();
      const name = $('#input-name').val();
      const description = t.editor.get().getData();

      const data = {
        acpId,
        acpName,
        name,
        description
      };

      if(t.imageFile.get()){
        data.imageFile = t.imageDir.get().link();
        data.imageId = t.imageFile.get();
      } else {
        data.imageFile = "";
        data.imageId = "";
      }
      if(t.docFile.get()) {
        data.fileLink = t.fileDir.get().link();
        data.fileId = t.docFile.get();
      } else {
        data.fileLink = "";
        data.fileId = "";
      }
      const submitType = t.submitType.get();
      let postRoute = 'acpMaterialCreate';
      if(submitType === 2) {
        postRoute = 'acpMaterialEdit';
        data.idMaterial = Router.current().params._id;
      }
      Meteor.call(postRoute, data, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert()
          history.back();
        }
      });
    }
  });

  Template.acpMaterialForm.helpers({
    imageFile(){
      return Template.instance().imageFile.get();
    },
    thisFile () {
      const image = documentPics.findOne({
        "_id": Template.instance().imageFile.get()
      });
      if ( self && image ) {
        Template.instance().imageDir.set(image)
        return image;
      }
    },
    docFile(){
      return Template.instance().docFile.get();
    },
    thisDocFile () {
      const doc = documentFiles.findOne({
        "_id": Template.instance().docFile.get()
      });

      if ( self && doc ) {
        Template.instance().fileDir.set(doc)
        return doc;
      }
    },
    currentUpload() {
      return Template.instance().currentUpload.get();
    },
    currentUpload2() {
      return Template.instance().currentUpload2.get();
    },
  })

  Template.acpParticipantList.onCreated( function() {
    const self = this;
    const acpId = Router.current().params._acpId;
    this.students = new ReactiveVar([]);
    this.dataDetail = new ReactiveVar({})
    this.scoreMode = new ReactiveVar(false)
    this.createMode = new ReactiveVar(false)

    const context = this;
    Meteor.call('getCimParticipants', function(error, result){
      if(result){
        const temp = _.filter(result, function(data){
          return data.roles.includes('cimStudent')
        })
        context.students.set(temp);
      }
    });

    Meteor.call('getAcpDetail', acpId, function(error, result){
      if(result){
        result.participantList = _.sortBy(result.participantList, function(data){
          return data.fullName 
        });
        context.dataDetail.set(result);
      }
    });

    // Tracker.autorun(() => {
    //   Meteor.subscribe("cimActiveCourses", function(){
    //     console.log("Cim Active Courses is ready");
    //   }),
    //   Meteor.subscribe("documentFileList", function(){
    //     console.log("document file list is ready");
    //   }),
    //   Meteor.subscribe("documentPicList", function(){
    //     console.log("document pic is ready");
    //   }),
    //   Meteor.subscribe("cimActiveCoursesMaterials", function(){
    //     console.log("Materials Cim Active Courses is ready");
    //   })
    // });
  });

  Template.acpParticipantList.onRendered( function() {
    setTimeout(() => {
      $('.select2').select2({
        width: '100%'
      });
    }, 100)
  });

  Template.acpParticipantList.helpers( {
    students(){
      return Template.instance().students.get();
    },
    dataDetail(){
      return Template.instance().dataDetail.get();
    },
    scoreMode(){
      return Template.instance().scoreMode.get();
    },
    createMode(){
      return Template.instance().createMode.get();
    },
  });

  Template.acpParticipantList.events({
    'click #toggle-create': function(e, t ) {
      t.createMode.set(!t.createMode.get())
    },
    'click #toggle-score': function(e, t ) {
      t.scoreMode.set(!t.scoreMode.get())
    },
    'click #save-score': function(e, t ) {
      const dataDetail = t.dataDetail.get()
      const participantList = dataDetail.participantList
      participantList.forEach(element => {
        element.finalScore = $('#score-' + element.enrollmentId).val()
      });
      const body = {
        participantList,
        acpId: dataDetail._id.toHexString()
      }
      Meteor.call('enrollment-save-score', body, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert('Nilai akhir berhasil disimpan')
          Meteor.call('getAcpDetail', dataDetail._id.toHexString(), function(error, result){
            if(result){
              t.dataDetail.set(result);
            }
          });
        }
      })
    },
    'click #submit-participants': function(e, t ) {
      e.preventDefault();
      const profileIds = [];
      const dataDetail = t.dataDetail.get()
      const selected = $('#new-participants').select2("data");
      for (let index = 0; index < selected.length; index++) {
        const element = selected[index];
        // console.log(element.text.trim());
        // console.log(element.id);
        profileIds.push({
          profileId: element.id.trim(),
          fullName: element.text.trim()
        })
      }
      const body = {
        profileIds,
        psId: dataDetail.psId,
        psName: dataDetail.psName,
        cpId: dataDetail.cpId,
        cpName: dataDetail.cpName,
        acpId: dataDetail._id.toHexString(),
        acpName: dataDetail.name,
        curriculaId: dataDetail.curriculaId,
        curriculaName: dataDetail.curriculaName
      }
      Meteor.call('enrollment-create-batch', body, function (error, result) {
        if (error) {
          failAlert(error)
        } else {
          successAlert('Peserta kursus berhasil ditambahkan')
          Meteor.call('getAcpDetail', dataDetail._id.toHexString(), function(error, result){
            if(result){
              t.dataDetail.set(result);
            }
          });
        }
      });
    }
  });
