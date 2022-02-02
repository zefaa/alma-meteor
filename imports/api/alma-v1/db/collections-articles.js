import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
export const Article = new Mongo.Collection( 'articles', { idGeneration: 'MONGO' } );

Meteor.methods({
    'insertArticle': function(data){
      checkAllowAccess(['cmsArticleCreate'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      return Article.insert(data)
    },
    'updateArticle':function (data) {
      checkAllowAccess(['cmsArticleEdit'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByCol(Article, { _id })
      const updateQuery = {
        $set: data
      }
      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return Article.update({ _id }, updateQuery);
    },
    'toggleArticle': function (data) {
      checkAllowAccess(['cmsArticleDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Article, {'_id': data.id})
      return Article.update({ _id },
      {$set: {'status': data.status}}
      )
    },
    'featuredArticle': function (data) {
      checkAllowAccess(['cmsArticleFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Article, {'_id': data.id})
      return Article.update({ _id },
        {$set: {'featured': data.status}}
      )
    }
});