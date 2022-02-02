// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Enrollments } from './enrollments';
import { RegistrationRequests } from '../../api/alma-v1/db/collections.js';
import { CourseProgramsActive } from '../coursePrograms/coursePrograms.js';
import _ from 'underscore';

Meteor.methods({
  'registration-confirmation': function (body){
    checkAllowAccess(['cimAcpEdit']);
    let response
    if (body.newUser){
      const loggedInUser = Meteor.user();
      body.createdBy = loggedInUser.emails[0].address;
      body.createdAt = new Date();
      body.newUser.password = 'centrumivan123'
      try{
        // https://api.imavi.org/cim/users/
        // http://localhost:3005/cim/users/
        response = HTTP.call('POST', 'https://api.imavi.org/cim/users/register', {
          headers: {
              Id: process.env.APP_IDCLIENT,
              Secret: process.env.APP_SECRETCLIENT
          },
          data: body.newUser
        });
        // console.log(response)
        for (const acpInsert of body.acp ){
          const { psId, psName, cpId, cpName, acpId, acpName, curriculaId, curriculaName } = acpInsert
          Enrollments.insert({
            psId,
            psName,
            cpId,
            cpName,
            acpId,
            acpName,
            curriculaId,
            curriculaName,
            studentId: response.data.profileId,
            studentName: body.newUser.fullName,
            status: true,
            createdAt: new Date(),
            createdBy: Meteor.userId()
          })
        }
        HTTP.call('POST', 'https://api.imavi.org/cim/enrollments/send-email', {
          headers: {
              Id: process.env.APP_IDCLIENT,
              Secret: process.env.APP_SECRETCLIENT
          },
          data: {
            identifier: 'User Baru',
            email: body.newUser.email,
            fullName: body.newUser.fullName
          }
        })
        prevEmail = body.newUser.email
        if (body.registrationRequest){
          const data = body.registrationRequest
          data.profileId = response.data.profileId
          response = RegistrationRequests.insert(data);
          if (typeof body.letterFile !== 'undefined'){
            data.letterFile = response+""
            RegistrationRequests.update({
              _id: response
            }, {
              $set: {
                "letterFile": data.letterFile
              }
            });
          }
          if (typeof body.letterFile !== 'undefined'){
            data.paymentFile = response+""
            RegistrationRequests.update({
              _id: response
            }, {
              $set: {
                "paymentFile": data.paymentFile
              }
            });
          }
          return response
        }
        else{
          const id = new Meteor.Collection.ObjectID(body._id)
          return RegistrationRequests.update({
            _id: id
          }, {
            $set: {
              "status": body.status
            }
          });
        }
       
      } catch (error) {
        console.log(error)
        throw new Meteor.Error(error)
      }    
    }
    else{
      let prevEmail
      for (const acpInsert of body.acp){
        const { psId, psName, cpId, cpName, acpId, acpName, curriculaId, curriculaName } = acpInsert
        const checkPrevEnrollment = Enrollments.findOne({
          acpId,
          studentId: acpInsert.profileId
        })
        if(!checkPrevEnrollment || checkPrevEnrollment === null){
          const enrollmentId = Enrollments.insert({
            psId,
            psName,
            cpId,
            cpName,
            acpId,
            acpName,
            curriculaId,
            curriculaName,
            studentId: acpInsert.profileId,
            studentName: acpInsert.fullName,
            status: true,
            createdAt: new Date(),
            createdBy: Meteor.userId()
          })
          acpInsert.enrollmentId = enrollmentId.toHexString()
          if (acpInsert.email && acpInsert.email != prevEmail){
            try{
              // https://api.imavi.org/cim/enrollments/
              // http://localhost:3005/cim/enrollments/
              const response = HTTP.call('POST', 'https://api.imavi.org/cim/enrollments/send-email', {
                headers: {
                    Id: process.env.APP_IDCLIENT,
                    Secret: process.env.APP_SECRETCLIENT
                },
                data: {
                  identifier: 'User Lama',
                  email: acpInsert.email,
                  fullName: acpInsert.fullName
                }
              })
              prevEmail = acpInsert.email
            }
            catch(e){
              console.log(e)
            }
          }
        } else {
          acpInsert.skipThis = true
        }
      }
      const newMembers = _.filter(body.acp, function(data){
        return !data.skipThis
      })
      const $push = {
        participantList: {
          $each: newMembers
        }
      }
      for (const update of newMembers){
        CourseProgramsActive.update({
          _id: new Meteor.Collection.ObjectID(update.acpId)
        }, {
          $push
        })    
      }
      const id = new Meteor.Collection.ObjectID(body._id)
        return RegistrationRequests.update({
          _id: id
        }, {
          $set: {
            "status": body.status
          }
        });
    }
  },
  'enrollment-create-batch' : function (body) {
    checkAllowAccess(['cimAcpEdit']);
    check (body, Object);
    const { psId, psName, cpId, cpName, acpId, acpName, curriculaId, curriculaName } = body
    const profileIds = body.profileIds
    let prevEmail
    for (const profile of profileIds) {
      const checkPrevEnrollment = Enrollments.findOne({
        acpId,
        studentId: profile.profileId
      })
      if(!checkPrevEnrollment || checkPrevEnrollment === null){
        const enrollmentId = Enrollments.insert({
          psId,
          psName,
          cpId,
          cpName,
          acpId,
          acpName,
          curriculaId,
          curriculaName,
          studentId: profile.profileId,
          studentName: profile.fullName,
          status: true,
          createdAt: new Date(),
          createdBy: Meteor.userId()
        })
        profile.enrollmentId = enrollmentId.toHexString()
        if (profile.email && profile.email != prevEmail){
          try{
            const response = HTTP.call('POST', 'https://api.imavi.org/cim/enrollments/send-email', {
              headers: {
                  Id: process.env.APP_IDCLIENT,
                  Secret: process.env.APP_SECRETCLIENT
              },
              data: {
                email: profile.email,
                fullName: profile.fullName
              }
            })
            prevEmail = profile.email
          }
          catch(e){
            console.log(e)
          }
        }
      } else {
        profile.skipThis = true
      }
    }
    // console.log(profileIds)
    const newMembers = _.filter(profileIds, function(data){
      return !data.skipThis
    })
    const $push = {
      participantList: {
        $each: newMembers
      }
    }
    return CourseProgramsActive.update({
      _id: new Meteor.Collection.ObjectID(acpId)
    }, {
      $push
    })
  },
  'enrollment-save-score' : function (body) {
    checkAllowAccess(['cimAcpEdit']);
    check (body, Object);
    const participantList = body.participantList
    for (const element of participantList) {
      Enrollments.update({
        _id: new Meteor.Collection.ObjectID(element.enrollmentId)
      }, {
        $set: {
          finalScore: element.finalScore
        }
      })
    }
    return CourseProgramsActive.update({
      _id: new Meteor.Collection.ObjectID(body.acpId)
    }, {
      $set: {
        participantList: body.participantList
      }
    })
  }
});
