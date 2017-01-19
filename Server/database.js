var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var configuration = require('./config');

var config = {
    userName: configuration.database.username,
    password: configuration.database.password,
    server: configuration.database.server,
    // When you connect to Azure SQL Database, you need these next options.  
    options: { encrypt: true, database: configuration.database.database }
};

var connection = new Connection(config);

connection.on('connect', function (err) {
    // If no error, then good to proceed.  
    console.log("Database Connected", err);
});

connection.on('error', function (err) {
    console.log(err);
})

var sql = require('sql');

sql.setDialect(configuration.database.dialect);

var image = sql.define({
    name: 'image',
    columns: ['hash', 'format', 'description']
});

var image_tag = sql.define({
    name: 'image_tag',
    columns: ['id', 'image_hash', 'tag']
});

exports.findImages = function (keyword, page, success, error) {
    var image_keyword_query = image
        .select(image.star())
        .from(image.join(image_tag).on(image.hash.equals(image_tag.image_hash)))
        .where(
            image.description.like('%')
        )
        .or(
            image_tag.tag.like('%')
        )
        .limit(configuration.database.page_size)
        .offset(page * configuration.database.page_size)
        .order(image.hash)
        .toQuery();

    request = new Request(image_keyword_query.text, function (err) {
        if (err) {
            console.log(err);
            error(500, err.message);
        }
    });

    console.log(image_keyword_query);

    request.addParameter('1', TYPES.VarChar, keyword);
    request.addParameter('2', TYPES.VarChar, keyword);

    var result = "";
    var found = [];
    request.on('row', function (columns) {
        var current = {};
        console.log(columns);
        found.push(columns);
        result = "";
    });

    request.on('done', function (rowCount, more) {
        console.log(rowCount + ' rows returned');

        success(found);
    });

    connection.execSql(request);
}
