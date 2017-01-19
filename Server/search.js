var database = require('./database');

exports.getImages = function (keyword, page, success, error) {
    if (page == undefined || page == null) {
        page = 0;
    }

    database.findImages(keyword, page, success, error);
}