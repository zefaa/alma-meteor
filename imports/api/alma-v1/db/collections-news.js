import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

export const News = new Mongo.Collection( 'news', { idGeneration: 'MONGO' } );
Meteor.methods({
    'insertNews': function(data){
      checkAllowAccess(['cmsNewsCreate'])
      // checkOutletByInput(data.outlets)
      return News.insert(data)
    },
    'updateNews':function (data) {
      checkAllowAccess(['cmsNewsEdit'])
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByCol(News, { _id })
      const updateQuery = {
        $set: data
      }
      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return News.update({ _id }, updateQuery);
    },
    'toggleNews': function (data) {
      checkAllowAccess(['cmsNewsDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      return News.update({ _id },
        {$set: {'status': data.status}}
      )
    },
    'featuredNews': function (data) {
      checkAllowAccess(['cmsNewsFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(News, {
      //   '_id' : data.id
      // })
      News.update({ _id },
        {$set: {'featured': data.status}}
      )
    }
});