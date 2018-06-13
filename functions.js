module.exports = {

  generateRandomString: function(m) {
    s = '';
    r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i=0; i < m; i++) {
      s += r.charAt(Math.floor(Math.random() * r.length));
    }
    return s;
  }

};