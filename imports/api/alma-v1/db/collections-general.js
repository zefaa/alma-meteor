import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { PeriodeStudis } from './collections.js';
import { tDict } from './dict-assessment.js';

// SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);
export const General = new Mongo.Collection( 'generals' );
// export const User = new Mongo.Collection('users');
Meteor.methods({
	// 'getCurrentUser': function () {
	// 	return User.findOne({_id : Meteor.userId()});
	// }
    'insertGeneral': function(data){
      // const loggedInUser = Meteor.user();
      // if (!loggedInUser ||
      //     !Roles.userIsInRole(loggedInUser,
      //                         ['admin', 'superadmin'])) {
      //   throw new Meteor.Error(403, "Access denied")
      // }
        checkAllowAccess(['cmsGeneralCreate'])
        // checkOutletByInput(data.outlets)
        return General.insert(data)
      // } else {
        // throw new Meteor.Error(403, "Transcript exists!")
      },
      'updateGeneral':function (data) {
        checkAllowAccess(['cmsGeneralEdit'])
        // checkOutletByInput(data.outlets)
        // checkOutletByCol(General, {
        //   '_id' : data.id
        // })
        return General.update({'_id': data.id},
        {$set:{'title': data.title, 'code': data.code, 'value': data.value, 'subs': data.subs}});
      },
    // 'updateOutlet': function (data) {
    //     Outlet.update({'_id': data.id},
    //     {$set: {'name': data.name, 'code': data.code, 'details': data.details}}
    //     )
    // },
      'toggleGeneral': function (data) {
        checkAllowAccess(['cmsGeneralDelete'])
        // checkOutletByInput(data.outlets)
        // checkOutletByCol(General, {
        //   '_id' : data.id
        // })
        return General.update({
          '_id': data.id
        }, {
          $set: {'status': data.status}}
        )
      }

});
// Article = new SimpleSchema({
// 	"title": {
// 		type: String
// 	},
// 	"createdBy": {
// 		type: String
// 	},
// 	"creatorName": {
// 		type: String
// 	},
// 	"createdAt": {
// 		type: Date
// 		// autoValue: function(){
// 		// 	let templateId = this.siblingField("templateId").value;
// 		// 	return ScoringTemplates.findOne({"_id": templateId}).name;
// 		// }
// 	},
//     "publishDate": {
//         type: Date
//     },
//     "content": {
//         type: String
//     },
//     "status": {
//         type: Boolean
//     },
//     "outlet": {
//         type: Array,
//     },
//     "outlet.$": {
// 		type: Object
// 	},
// 		"outlet.$.idArticle": {
// 			type: String
// 		},
// 		"outlet.$.outletCode": {
// 			type: String
// 		},
//     "photo": {
//         type: String
//     }
// });

// Articles.attachSchema( Article );