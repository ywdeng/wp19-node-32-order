const baseClass = require('./dao');
const userDAO = require('../models/user-dao');

const DDL_ORDER_HISTORY = `
CREATE TABLE IF NOT EXISTS OrderHistory (
    rowid INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    orderId INTEGER NOT NULL, 
    fromStatus VARCHAR(50) NOT NULL, 
    toStatus VARCHAR(50) NOT NULL, 
    userId INTEGER NOT NULL,
    ctime BIGINT NOT NULL,
    note TEXT)
`;

/**
 * 訂單資料存取
 */
class OrderHistoryDAO extends baseClass.DAO {
    constructor() {
        super("OrderHistory", ["orderId", "fromStatus", "toStatus", "userId", "ctime", "note"], "rowid");
        this.open((err, conn) => {
            if (err) throw err;
            conn.query(DDL_ORDER_HISTORY, (err, result) => {
                if (err) throw err;
                console.log("Table " + this.tableName + " OK.");
            });
        });
    }

    mapper(row) {
        if (row) {
            var d = {
                /* orderId: row.orderId, */
                fromStatus: row.fromStatus,
                toStatus: row.toStatus,
                userId: row.userId,
                userName: row.userName,
                ctime: new Date(row.ctime),
                note: row.note
            }
            d.ctimeStr = this.dateToString(d.ctime);
            return d;
        }
        return {};
    }

    findByOrderId(orderId, callback) {
        var sql = "SELECT A.orderId, A.fromStatus, A.toStatus, A.userId, B.name AS userName, A.ctime, A.note FROM " +
            this.tableName + " A LEFT OUTER JOIN " + userDAO.tableName + " B ON A.userId=B.id " +
            "WHERE A.orderId=? ORDER BY A.ctime";
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, [orderId], (err1, rows) => {
                if (err1) {
                    console.error(err1);
                    return callback(err1, null);
                }
                let list = [];
                rows.forEach(row => {
                    let entity = this.mapper(row);
                    list.push(entity);
                });
                callback(null, list);
            });
        });
    }

    deleteByOrderId(orderId, callback) {
        var sql = "DELETE FROM " + this.tableName + " WHERE orderId=?";
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, [orderId], (err1, result) => {
                if (err1) {
                    console.error(err1);
                    return callback(err1, null);
                } else if (callback) {
                    callback(null, result.affectedRows);
                } else {
                    console.log(this.tableName + " deletes " + result.affectedRows + " row(s).");
                }
            });
        });
    }

    toArrayWithoutId(entity) {
        var data = [
            entity.orderId,
            entity.fromStatus,
            entity.toStatus,
            entity.userId,
            entity.ctime.valueOf(),
            entity.note
        ];
        return data;
    }

    insert(entity, callback) {
        var sql = "INSERT INTO " + this.tableName + " (orderId, fromStatus, toStatus, userId, ctime, note) VALUES (?,?,?,?,?,?)";
        var data = this.toArrayWithoutId(entity);
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, data, (err1, result) => {
                if (err1) {
                    console.error(err1);
                    return callback(err1, null);
                } else if (callback) {
                    callback(null, result.affectedRows);
                } else {
                    console.log(this.tableName + " inserts " + result.affectedRows + " row, lastID is " + result.insertId + ".");
                }
            });
        });
    }
}

module.exports = new OrderHistoryDAO();