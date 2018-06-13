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
  }

};