module.exports = {

  // Function to generate a random alphanumeric string with X
  // length where X is the parameter
  generateRandomString: function(m) {
    let s = '';
    const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i=0; i < m; i++) {
      s += r.charAt(Math.floor(Math.random() * r.length));
    }
    return s;
  },

  // Function to check if some information already exist in field of database
  checkData: function(database, field, information) {
    if (!information) {
      return false;
    }
    else {
      for (let item in database) {
        let info = database[item][field];
        if (information.toLowerCase() === info.toLowerCase()) {
          return database[item];
        }
      }
    }
    return false;
  },

  urlsForUser: function(userID, database) {
    let result = {};
    if (!userID || !database) {
      return result;
    }
    else {
      for (item in database) {
        if (userID === database[item].userID) {
          result[item] = database[item];
        }
      }
      return result;
    }
  }

};