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
    console.log("Database Connected");
    executeStatement();
});

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

function getQueryForKeyword(keyword) {
    var query = image
        .select(image.star())
        .from(image.join(image_tag).on(image.hash.equals(image_tag.image_hash)))
        .where(
            image.description.like('%' + keyword + '%')
        )
        .or(
            image_tag.tag.like('%' + keyword + '%')
        )
        .toQuery();
    return query.text;
}

function executeStatement(keyword) {
    request = new Request(getQueryForKeyword(keyword), function (err) {
        if (err) {
            console.log(err);
        }
    });
    var result = "";
    request.on('row', function (columns) {
        columns.forEach(function (column) {
            if (column.value === null) {
                console.log('NULL');
            } else {
                result += column.value + " ";
            }
        });
        console.log(result);
        result = "";
    });

    request.on('done', function (rowCount, more) {
        console.log(rowCount + ' rows returned');
    });
    connection.execSql(request);
}

exports.getQueryForKeyword = getQueryForKeyword;