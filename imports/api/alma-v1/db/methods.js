import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'
import { generalPics, documentPics, documentFiles, profilePics } from './collections-files.js';
import { Roles } from 'meteor/alanning:roles';
import { HTTP } from 'meteor/http';
import _ from 'underscore';
import { Documents } from './collections-landing.js';
import { AppProfiles, AppUsers, RolesTemp, RolesParent, TempData } from './collections-profiles';
import { Curricula } from './collections-siakad.js';
import { CimCurriculas } from './collections-cimCenter.js';
import { RegistrationRequests, Dioceses } from './collections.js';
import { CoursePrograms, CourseProgramsActive, AcpMaterials } from '../../coursePrograms/coursePrograms.js';
import { Outlet } from './collections-outlet.js';
import { Sessions, Categorys, Parokis } from './collections-komsosCenter.js';


process.env.NETLIFY_HOOKURL = Meteor.settings.NETLIFY_HOOKURL;
process.env.NETLIFY_HOOKURL_CIM = Meteor.settings.NETLIFY_HOOKURL_CIM;
process.env.NETLIFY_HOOKURL_CIM_MY = Meteor.settings.NETLIFY_HOOKURL_CIM_MY;
process.env.APP_IDCLIENT = Meteor.settings.APP_IDCLIENT;
process.env.APP_SECRETCLIENT = Meteor.settings.APP_SECRETCLIENT;
process.env.PAROKI_NETLIFYHOOK = Meteor.settings.PAROKI_NETLIFYHOOK;
process.env.KOMSOS_NETLIFYHOOK = Meteor.settings.KOMSOS_NETLIFYHOOK;

Meteor.methods({
    'getAllDioceses' : function (){
      return Dioceses.find({}, {sort: {name: 1}}).fetch()
    },
    'getParoki' : function (_id){
      return Parokis.find({
        dioceseCode: _id
      },{sort: {churchName: 1}}).fetch()
    },
    'registration-update': function(_id, status){
      const id = new Meteor.Collection.ObjectID(_id)
      return RegistrationRequests.update({
        _id: id
      }, {
        $set: {
          "status": status
        }
      });
    },
    "deleteGeneralPic": function(fileId) {
      check(fileId, String);
      const loggedInUser = Meteor.user();
      if (!loggedInUser) {
        throw new Meteor.Error(403, "Access denied")
      };

      if ( !Roles.userIsInRole(loggedInUser, ['dosen', 'admin', 'superadmin'])) {
        throw new Meteor.Error(403, "Denied. You do not own this file.")
      };

      return generalPics.remove({"_id": fileId});

    },
    "certificateCreate": function (body){
      try{
        const response = HTTP.call('POST', 'http://localhost:3005/cim/users/save-piagam-pdf/', {
          headers: {
              Id: process.env.APP_IDCLIENT,
              Secret: process.env.APP_SECRETCLIENT
          },
          data: body
        })
      }
      catch(e){
        console.log(e)
      }
    },
    "deleteDocPics": function(fileId) {
        check(fileId, String);
        const loggedInUser = Meteor.user();
        if (!loggedInUser) {
          throw new Meteor.Error(403, "Access denied")
        };

        if ( !Roles.userIsInRole(loggedInUser, ['dosen', 'admin', 'superadmin'])) {
          throw new Meteor.Error(403, "Denied. You do not own this file.")
        };

        return documentPics.remove({"_id": fileId});

      },

      "deleteDocFile": function(fileId) {
        check(fileId, String);
        const loggedInUser = Meteor.user();
        if (!loggedInUser) {
          throw new Meteor.Error(403, "Access denied")
        };

        if ( !Roles.userIsInRole(loggedInUser, ['dosen', 'admin', 'superadmin'])) {
          throw new Meteor.Error(403, "Denied. You do not own this file.")
        };

        return documentFiles.remove({"_id": fileId});

      },

      "documentCreate": function(body){
        checkAllowAccess(['cmsDocumentCreate']);
        // checkOutletByInput(body.outlets)
        check(body, Object);
        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        return Documents.insert(body);
      },

      "documentEdit": function(body){
        checkAllowAccess(['cmsDocumentEdit']);
        // checkOutletByInput(body.outlets)
        // checkOutletByCol(Documents, {
        //   '_id' : body._id
        // })
        check(body, Object);
        const _id = body._id
        delete body._id
        return Documents.update({
          _id
        }, {
          $set: body
        });
      },

      "documentDelete": function(_id){
        checkAllowAccess(['cmsDocumentDelete']);
        // checkOutletByInput(body.outlets)
        // checkOutletByCol(Documents, {
        //   '_id' : body._id
        // })
        check(_id, String);
        return Documents.update({
          _id
        }, {
          $set: {
            status: false
          }
        });
      },

      "lecturerLandingEdit": function(body){
        checkAllowAccess(['cmsLecturerProfile']);
        // checkOutletByInput(body.outlets)

        check(body, Object);
        const _id = body._id
        delete body._id
        //check app profiles
        const checkerAppProfiles = Meteor.users.findOne({
          _id
        });

        const appProfile = {
          fullName : body.fullname,
          excerpt : body.keterangan,
          description : body.description,
          imageLink : body.imageLink,
          imageId : body.imageId,
          slug: body.slug
        }
        if(checkerAppProfiles.profileId){
          //konversi dulu profileId dari string ke ObjectId
          const objectId = new Meteor.Collection.ObjectID(checkerAppProfiles.profileId);
          AppProfiles.update({
            _id : objectId
          }, {
            $set : appProfile
          })
        }else{
          _.extend(appProfile, {
            profileType : 'dosen',
            // userId : _id
          })
          try{
            const response = HTTP.call('POST', 'https://api.imavi.org/cim/users/meteor-profile', {
              headers: {
                  Id: process.env.APP_IDCLIENT,
                  Secret: process.env.APP_SECRETCLIENT
              },
              data: appProfile
            })
            const idAppProfile = JSON.parse(response.content);

            //update profileId untuk setiap users

              Meteor.users.update({
                _id
              },{
                $set : {
                  profileId : idAppProfile.insertedId
                }
              })



          } catch (error) {
              console.log(error)
                throw new Meteor.Error('Gagal terkoneksi dengan server')
          }
        }
        // return Meteor.users.update({
        //   _id
        // }, {
        //   $set: body
        // });
      },
      'getLecturer':function(id){
        check(id, String);
        const objectId = new Meteor.Collection.ObjectID(id);
        return AppProfiles.findOne({
          _id : objectId,
          profileType: 'dosen'
        });
      },
      'getLecturersAll':function(){
        return AppProfiles.find({
          profileType : "dosen"
        }, {
          sort :{
            "fullName" : 1
          }
        }).fetch();
      },

      'featuredLecturer': function (data) {
        checkAllowAccess(['cmsLecturerProfile']);
        // checkOutletByInput(data.outlets)
        // checkOutletByCol(Meteor.users, {
        //   '_id' : data.id
        // })
        Meteor.users.update({'_id': data.id},
          {$set: {'featured': data.status}}
        )
        //konversi id to Object Id
        const objectId = new Meteor.Collection.ObjectID(data.profileId);

        AppProfiles.update({
          _id : objectId
        }, {
          $set : {
            featured : data.status
          }
        })

      },

      "deleteLandingProPic": function(fileId) {
        check(fileId, String);
        const loggedInUser = Meteor.user();
        if (!loggedInUser) {
          throw new Meteor.Error(403, "Access denied")
        };

        if ( !Roles.userIsInRole(loggedInUser, ['dosen', 'admin', 'superadmin'])) {
          throw new Meteor.Error(403, "Denied. You do not own this file.")
        };

        return profilePics.remove({"_id": fileId});

      },
      'rebuildWebsite' (siteId) {
        check(siteId, String);
        let url;
        console.log(siteId)
        if (siteId === 'imavi') {
          url = process.env.NETLIFY_HOOKURL;
        } else if (siteId === 'cim') {
          url = process.env.NETLIFY_HOOKURL_CIM;
        } else if (siteId === 'cim-my') {
          url = process.env.NETLIFY_HOOKURL_CIM_MY;
        } else if (siteId === 'paroki') {
          url = process.env.PAROKI_NETLIFYHOOK;
        } else if (siteId === 'komsos') {
          url = process.env.KOMSOS_NETLIFYHOOK;
        }
        console.log(url);
        if (url && url.length > 0) {
          const options = {
            timeout: 5000
          };

          HTTP.post(url, options, function (error, response) {
            if (error) {
              throw new Meteor.Error(500, error);
            } else {
              console.log('rebuild request successful');
            }
          })
        } else {
          throw new Meteor.Error(404, "No hook url found.");
        }
      },
      // 'alanningAdd' (name){
      //   return Roles.createRole(name);
      // },
      'initiateRoles' () {
        // Roles.createRole('tiPenjawab');
        // Roles.createRole('tiEditor');
        // Roles.createRole('tiAdmin');
        // Roles.createRole('tiSuper');
        // Roles.addRolesToParent('tiPenjawab', 'tiSuper');
        // Roles.addRolesToParent('tiEditor', 'tiSuper');
        // Roles.addRolesToParent('tiAdmin', 'tiSuper');
        // Roles.addUsersToRoles(Meteor.userId(), 'tiSuper');

        // Eksperimen apakah jika tiSuper ditambahkan ke superadmin
        // , superadminnya bisa mengakses juga dari tiPenjawab hingga tiSuper?
        // 16 November 2021 Jawabannya iya bisa
        // Roles.setUserRoles(Meteor.userId(), ['superadmin'])
        // Roles.addRolesToParent('tiSuper', 'superadmin');
      },
      'cobaRoles': function() {
        const tempRoles = RolesTemp.find().fetch()
        tempRoles.forEach(element => {
          Roles.createRole(element.code);
        })
        return true
      },
      'roles-list': function(_id) {
        return RolesTemp.find({}).fetch()
      },
      'parentRoles-list': function(_id) {
        return RolesParent.find({}).fetch()
      },
      'parentRoles-detail': function(_id) {
        return RolesParent.findOne({
          _id
        })
      },
      'parentRoles-create': function(body) {
        const name = body.name
        const checkExists = RolesParent.findOne({
          name
        })
        if(!checkExists || checkExists === null){
          Roles.createRole(name);
          body.roles.forEach(element => {
            Roles.addRolesToParent(element, name);
          });
          return RolesParent.insert(body)
        } else {
          throw new Meteor.Error('error', 'Silahkan gunakan nama role yang lain')
        }
      },
      'parentRoles-edit': function(body) {
        const { prevName, name, _id, roles } = body
        const checkExists = RolesParent.findOne({
          _id: { $ne: _id },
          name
        })
        if(!checkExists || checkExists === null){
          const thisRoleUsers = Meteor.users.find({
            'roles._id': {
              $in: [prevName]
            }
          }).fetch()
          Roles.deleteRole(prevName)
          Roles.createRole(name);
          body.roles.forEach(element => {
            Roles.addRolesToParent(element, name);
          });
          console.log(thisRoleUsers)
          for (const user of thisRoleUsers) {
            console.log(user)
            console.log(name)
            Roles.addUsersToRoles(user._id, name);
          }
          return RolesParent.update({
            _id
          }, {
            $set: {
              name,
              roles
            }
          })
        } else {
          throw new Meteor.Error('error', 'Silahkan gunakan nama role yang lain')
        }
      },
      'getTempRoles': function() {
        return RolesTemp.find().fetch()
      },
      // 'tempDataRun': function () {
      //   // 'https://api.imavi.org/cim/users/alumni-register'
      //   const tempData = TempData.find({}).fetch()
      //   // console.log(tempData)
      //   const response = HTTP.call('POST', 'http://localhost:3005/cim/users/alumni-register', {
      //     headers: {
      //         Id: process.env.APP_IDCLIENT,
      //         Secret: process.env.APP_SECRETCLIENT
      //     },
      //     data: tempData
      //   })
      //   // console.log(response)
      //   return true
      // },
      'initiateAppProfiles': function() {
        //variabel penyimpan data yang belum memiliki profile
        const dataAppProfiles = [];
        //get all users
        const users = Meteor.users.find().fetch();
      //looping per users
      _.each(users, function(x){
          //cek profileId
          if(x.profileId){
            // throw new Meteor.Error('error','User sudah memiliki profil')
          }else{
            if(x.fullname){

              //input fullname & description
              let description = '';
              let excerpt = '';
              let profileType = 'student';
              if(x.description){
                description = x.description;
              }
              if(x.excerpt){
                excerpt = x.excerpt;
              }
              if(x.roles){
                // roles 2.0 sekarang array of object
                for (let index = 0; index < x.roles.length; index++) {
                  const element = x.roles[index]._id;
                  profileType = element;
                  if(element === 'dosen'){
                    break;
                  }
                }
              }
              const data = {
                fullName: x.fullname,
                description,
                profileType,
                excerpt,
                userId: x._id
              }
              //cek imagelink
              if(x.imageLink){
                _.extend(data, {
                  imageLink : x.imageLink
                })
              }
              //cek imageId
              if(x.imageId){
                _.extend(data, {
                  imageId : x.imageId
                })
              }
              //push ke array
              dataAppProfiles.push(data);
            }
          }
      })
      try{
        // 'http://localhost:3005/cim/users/meteor-profile-batch'
        // 'https://api.imavi.org/cim/users/meteor-profile-batch'
        const response = HTTP.call('POST', 'https://api.imavi.org/cim/users/meteor-profile-batch', {
          headers: {
              Id: process.env.APP_IDCLIENT,
              Secret: process.env.APP_SECRETCLIENT
          },
          data: dataAppProfiles
        })
        const idUsers = response.data.insertedIds;
        //update profileId untuk setiap users
        _.each(idUsers, function(x){
          Meteor.users.update({
            "_id" : x.userId
          },{
            $set : {
              profileId : x.profileId
            }
          })
        })
        console.log(idUsers)
        } catch (error) {
          console.log(error)
          throw new Meteor.Error('Gagal terkoneksi dengan server')
        }

      },

      'cimCurriculasCreate': function(body){
        checkAllowAccess(['cimCurriculumCreate']);
        check(body, Object);
        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();
        body.outlets = ['cim'];
        body.status = true;
        return CimCurriculas.insert(body);

      },
      'cimCurriculasEdit': function(body){
        check(body, Object);
        checkAllowAccess(['cimCurriculumEdit']);
        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();
        body.outlets = ['cim'];
        body.status = true;

        const _id = body._id;
        delete body._id;

        return CimCurriculas.update({
          _id
        },{
          $set : body
        });
      },
      'coursesCreate': function(body){
        checkAllowAccess(['cimCoursesCreate']);
        check(body, Object);

        const loggedInUser = Meteor.user();

        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();
        body.outlets = ['cim'];
        body.status = true;
        return CoursePrograms.insert(body);

      },
      'coursesEdit': function(body){
        checkAllowAccess(['cimCoursesEdit']);
        check(body, Object);

        const loggedInUser = Meteor.user();

        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();
        body.outlets = ['cim'];
        body.status = true;

        const id = body._id;
        delete body._id;

        const objectId = new Meteor.Collection.ObjectID(id);


        return CoursePrograms.update({
          _id : objectId
        },{
          $set : body
        });
      },
      'activeCoursesEdit': function(body){
        checkAllowAccess(['cimAcpEdit']);
        check(body, Object);
        const id = body._id;
        delete body._id;
        console.log(body)
        const objectId = new Meteor.Collection.ObjectID(id);
        return CourseProgramsActive.update({
          _id : objectId
        },{
          $set : body
        });
      },
      'activeCoursesCreate' : function (body) {
          checkAllowAccess(['cimAcpCreate']);
          check (body, Object);

          const loggedInUser = Meteor.user();
          //create ke active program kursus
          body.createdBy = loggedInUser.emails[0].address;
          body.createdAt = new Date();
          body.status = true;

          console.log(body);
          const id = body.curriculaId;
          delete body.id;


          const idCourseActive = CourseProgramsActive.insert(body);

          const acp = {
            _id : idCourseActive.toHexString(),
            name : body.name,
            excerpt : body.excerpt
          }
          return CimCurriculas.update({
            _id : id
          },{
            $addToSet: {
              acpList : acp
            }
          });
      },
      'getActiveCourse': function (_id) {
        check ( _id , String );
        const objectId = new Meteor.Collection.ObjectID( _id );
        return CourseProgramsActive.findOne({
          '_id' : objectId
        });
      },
      'acpMaterialCreate': function (body) {
        checkAllowAccess(['cimAcpEdit']);
        check ( body, Object);
        const loggedInUser = Meteor.user();
        const _id = body.acpId;
        delete body.acpId;
        console.log(_id)

        const objectId = new Meteor.Collection.ObjectID(_id);

        body.createdAt = new Date();
        body.createdBy = loggedInUser.emails[0].address;


        AcpMaterials.insert(body, function(error, result){
          if(result) {
            const materials = {
              _id: result,
              name: body.name
            };
            CourseProgramsActive.update({
              "_id": objectId
            }, {
              $addToSet: {
                materials
              }
            });
          }
        })

      },
      'acpMaterialEdit': function (body) {
        checkAllowAccess(['cimAcpEdit']);
        check ( body, Object);
        const loggedInUser = Meteor.user();
        const idMaterial = body.idMaterial;
        const acpId = new Mongo.Collection.ObjectID(body.id);

        delete body.idMaterial;
        delete body.id;

        return AcpMaterials.update({
          _id : idMaterial
        }, {
          $set : body
        }, function(error, result){
          if(result) {
            const acp = CourseProgramsActive.findOne({
              _id : acpId,
            });
            const index = _.findIndex(acp.materials, {
              '_id' : idMaterial
            });
            const update = acp.materials;
            update[index].name  = body.name;
            CourseProgramsActive.update({
              _id : acpId
            }, {
              $set : {
                materials : acp.materials
              }
            })
          }
        })

      },
      'getMaterialsById' : function ( _id ){
        console.log(_id)
        check (_id, String);

        return AcpMaterials.findOne({
          _id
        });
      },
      'participantCreate' : function (body) {
        checkAllowAccess(['cimParticipantCreate']);
        check (body, Object);
        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();
        let response;
        try{
          // https://api.imavi.org/cim/users/
          // http://localhost:3005/cim/users/
          response = HTTP.call('POST', 'http://localhost:3005/cim/users/register', {
            headers: {
                Id: process.env.APP_IDCLIENT,
                Secret: process.env.APP_SECRETCLIENT
            },
            data: body
          });
        } catch (error) {
          console.log(error)
          throw new Meteor.Error('Gagal terkoneksi dengan server')
        }
        return response;
      },
      'participantEdit' : async function (body) {
        checkAllowAccess(['cimParticipantEdit']);
        check (body, Object);

        const id = body._id;
        const query = {
          email: body.email,
          profileId: { '$ne': id }
        }
        const checkEmailExist = await AppUsers.findOne(query)
        if(!checkEmailExist){
          const profileQuery = {
            studentNumber: body.studentNumber,
            _id: { '$ne': new Meteor.Collection.ObjectID(id) }
          }
          const checkProfileExists = await AppProfiles.findOne(profileQuery)
          if(body.studentNumber === '' || !checkProfileExists){
            delete body._id;
            let roles  = body.roles;
            let teamList = body.teamList;

            const appUser  = {
              fullname: body.fullName,
              email: body.email,
              roles,
              teamList,
              outlets: body.outlets
            }
            const appProfile = {
              fullName: body.fullName,
              phoneNumber: body.phoneNumber,
              studentNumber: body.studentNumber,
              dob: body.dob
            }

            AppProfiles.update({
              _id: new Meteor.Collection.ObjectID(id)
            },{
              $set: appProfile
            });
            return AppUsers.update({
              profileId: id
            },{
              $set: appUser
            });
          } else {
            throw new Meteor.Error('Error', 'Mohon gunakan no peserta yang lain')
          }
        } else {
          throw new Meteor.Error('Error', 'Mohon gunakan alamat email yang lain')
        }
      },
      'getAppUser' : function(profileId) {
        check (profileId, String);

        return AppUsers.findOne({
          profileId
        })
      },
      'getAllOutlets' : function() {
        return Outlet.find({}).fetch()
      },
      'getAcpDetail' : function(_id) {
        return CourseProgramsActive.findOne({
          _id: new Meteor.Collection.ObjectID(_id)
        })
      },
      'getAllAcp' : function() {
        return CourseProgramsActive.find({}).fetch()
      },
      'getRegistrationRequests' : function() {
        return RegistrationRequests.find({}).fetch()
      },
      'getAppProfile' : function(_id){
        return AppProfiles.findOne(_id)
      },
      'getDetailRegistrationRequest' : function(_id) {
        return RegistrationRequests.findOne({
          _id: new Meteor.Collection.ObjectID(_id)
        })
      },
      "registrationConfirm": function (body,profileId){
        try{
          const response = HTTP.call('POST', 'http://localhost:3005/cim/users/register/', {
            headers: {
                Id: process.env.APP_IDCLIENT,
                Secret: process.env.APP_SECRETCLIENT
            },
            data: body
          })
        }
        catch(e){
          console.log(e)
        }
      },
      'getCimParticipants' : function() {
        return AppUsers.aggregate([
          {
            '$addFields': {
              'profileObjectId': {
                '$toObjectId': '$profileId'
              }
            }
          }, {
            '$lookup': {
              'from': 'appProfiles',
              'localField': 'profileObjectId',
              'foreignField': '_id',
              'as': 'profile'
            }
          }, {
            '$unwind': {
              'path': '$profile'
            }
          }, {
            '$addFields': {
              'fullName': '$profile.fullName',
              'studentNumber': '$profile.studentNumber'
            }
          }, {
            '$project': {
              'profileObjectId': 0,
              '_id': 0,
              'username': 0,
              'email': 0,
              'password': 0,
              'profile': 0,
            }
          }, {
            '$sort': {
              'fullName': 1
            }
          }
        ]);
      },
      'getCimTanyaIvan' : function () {
        return AppUsers.aggregate([
          {
            '$match': {
              'roles': {
                '$ne': [
                  'cimStudent'
                ]
              }
            }
          }, {
            '$addFields': {
              'profileObjectId': {
                '$toObjectId': '$profileId'
              }
            }
          }, {
            '$lookup': {
              'from': 'appProfiles',
              'localField': 'profileObjectId',
              'foreignField': '_id',
              'as': 'profile'
            }
          }, {
            '$unwind': {
              'path': '$profile'
            }
          }, {
            '$project': {
              'profileObjectId': 0,
              '_id': 0,
              'username': 0,
              'email': 0,
              'password': 0,
              'profile._id': 0,
              'profile.dob': 0,
              'profile.phoneNumber': 0
            }
          }
        ]);
      },

      "createUserMain": function(body){
        // check(email, String)

        const loggedInUser = Meteor.user();
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser, ['superadmin']) ) {
          throw new Meteor.Error(403, "Access denied")
        }
        const profile = {
          fullname: body.fullname,
          // "roles": body.roles,
          "outlets": body.outlets,
          "createdBy": Meteor.userId()
        }

        const newAccountData = {
          "username": body.email,
          "email": body.email,
          "password": "password123"
        }
        const _id = Accounts.createUser(newAccountData)
        for (const element of body.roles) {
          Roles.addUsersToRoles(_id, element);
        }

        return Meteor.users.update({
          _id
        },{
          $set : profile
        });
      },

      "editUserMain": function(body){
        // check(email, String)

        const loggedInUser = Meteor.user();
        if (!loggedInUser ||
            !Roles.userIsInRole(loggedInUser, ['superadmin']) ) {
          throw new Meteor.Error(403, "Access denied")
        }

        const newAccountData = {
          "username": body.email,
          "emails.0.address": body.email,
          fullname: body.fullname,
          "roles": [],
          "outlets": body.outlets
        }
        // Jika rolesnya nanti sudah yang baru
        // $set kosong dahulu rolesnya
        // Lalu looping body.roles dan gunakan Roles.blabla-nya
        Meteor.users.update({
          _id: body._id
        },{
          $set : newAccountData
        })

        for (const element of body.roles) {
          Roles.addUsersToRoles(body._id, element);
        }

        return true
      },

      "createCategory": function(body){
        check (body, Object);
        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();

        return Categorys.insert(body);
      },
      "editCategory" : function(body) {
        check (body, Object);
        const idCategory = body._id;
        const name = body.name;

        return Categorys.update({
          '_id' : idCategory
        },{
          $set : {
            name
          }
        })
      },
      "deleteCategory" : function (id) {
        check (id, ObjectID);
        return Categorys.remove({
          '_id' : id
        })
      },
      "createSession" : function (body) {
        checkAllowAccess (['sessionCrud'])
        check (body, Object);

        const idCC = new Mongo.Collection.ObjectID(body.categoryId);


        const category = Categorys.findOne({
          '_id' : idCC
        });
        body.categoryName = category.name;
        const paroki = Parokis.findOne({
          '_id' : body.parokiId
        });
        body.parokiName = paroki.name;

        const loggedInUser = Meteor.user();
        body.createdBy = loggedInUser.emails[0].address;
        body.createdAt = new Date();

        return Sessions.insert(body);
      },
      "editSession" : function (body) {
        checkAllowAccess (['sessionCrud'])
        check (body, Object);
        const idSessions = body._id;
        delete body._id;

        return Sessions.update({
          "_id" : idSessions
        }, {
          $set : body
        })
      },
      "deleteSession" : function (id) {
        check (id,String);
        const _id = new Meteor.Collection.ObjectID(id);
        return Sessions.remove({
          '_id' : _id
        })
      }
})