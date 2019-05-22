// https://mariadb.com/kb/en/library/connector-nodejs-callback-api/ 
const mariadb = require('mariadb/callback');
const mariadbConfig = require('../mariadb-config.json');

class DAO {
    constructor(tableName, fields, primaryKey) {
        this._tableName = tableName;
        this._fields = fields;
        this._pk = primaryKey;
    }

    get connectionOptions() {
        return mariadbConfig;
    }

    get tableName() {
        return this._tableName;
    }

    get fields() {
        return this._fields;
    }

    open(callback) {
        let conn = mariadb.createConnection(mariadbConfig);
        conn.connect(err => {
            if (err) {
                console.error("not connected due to error: " + err);
                callback(err, null);
            } else {
                callback(null, conn);
            }
        });
    }

    /**
     * List all the fields separated by camma
     */
    get fieldList() {
        return this._fields.join(',');
    }

    /**
     * Escape identifier name from SQL keywords
     * @param {*} name 
     */
    escape(name) {
        return '`' + name + '`';
    }

    unEscape(name) {
        if (name.substr(name.length - 1) == '`') {
            if (name.substr(0, 1) == '`') {
                return name.substr(1, name.length - 2);
            }
        }
        return name;
    }

    dateToString(d) {
        var options = {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        return d.toLocaleDateString('zh-Tw', options);
    }
}

module.exports.DAO = DAO;