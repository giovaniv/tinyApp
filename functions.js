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

  // funcs.checkData(users, 'email', email)

  // Function to check if some information already exist in field of database
  checkData(database, field, information) {
    if (!information) {
      console.log('caiu aqui');
      return false;
    }
    else {
      for (let item in database) {
        let info = database[item][field];
        console.log(info);
        if (information.toLowerCase() === info.toLowerCase()) {
          return database[item];
        }
      }
    }
    return false;
  }

};