var database = require('./database');

exports.getImages = function (keyword) {
    var res = [];
    console.log(keyword);
    console.log(database.getQueryForKeyword(keyword));
    return res;
}