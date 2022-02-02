// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.
import { Roles } from 'meteor/alanning:roles';

checkAllowAccess = function(roles){
    const loggedInUser = Meteor.user();
    if (!loggedInUser || !Roles.userIsInRole(loggedInUser, roles)) {
      throw new Meteor.Error(403, 'Not authorized!')
    }
    // tetap kefire jika error
    return loggedInUser;
}

// berguna jika outlet yang ingin dicek adalah hasil inputan dari suatu form
// contohnya seperti proses insert
checkOutletByInput = function(dataOutlets){
  const userOutlets = Meteor.user().outlets
  let isForbidden = false
  for (let index = 0; index < dataOutlets.length; index++) {
    const element = dataOutlets[index];
    if(!userOutlets.includes(element)){
      isForbidden = true
      break
    }
  }
  if(isForbidden){
    throw new Meteor.Error(403, 'Outlet not authorized!')
  } else {
    return true
  }
}

// berguna jika outlet yang ingin dicek adalah outlets dari suatu data collection
// contohnya seperti update

// ini agar tidak capek mesti findone melulu sebelum mengecek outletnya
// sehingga bisa saja pakai yang checkOutletByInput tapi mesti findone dahulu
// diasumsikan nama field yang berhubungan dengan outletnya selalu outlets
checkOutletByCol = function(collectionToUse, query){
  const getData = collectionToUse.findOne(query)
  // tidak dikasih pengecekan getData.outlets karena bisa saja ini update untuk mengisi outletnya
  if(getData){
    let dataOutlets = []
    if(getData.outlets){
      dataOutlets = getData.outlets
    }
    checkOutletByInput(dataOutlets)
  } else {
    throw new Meteor.Error(403, 'Item not authorized!')
  }
}