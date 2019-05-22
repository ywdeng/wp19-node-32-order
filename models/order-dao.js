const baseClass = require('./dao');
const orderItemDAO = require('../models/order-item-dao');
const orderHistoryDAO = require('../models/order-history-dao');

const DDL_ORDERS = `
CREATE TABLE IF NOT EXISTS Orders (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    custName VARCHAR(50) NOT NULL, 
    custTel VARCHAR(50) NOT NULL,
    custAddr VARCHAR(50) NOT NULL,  
    qty INTEGER NOT NULL, 
    total INTEGER NOT NULL, 
    orderDate BIGINT NOT NULL,
    userId VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT '新訂單')
`;

/**
 * 訂單資料存取
 */
class OrderDAO extends baseClass.DAO {
    constructor() {
        super("Orders", ["id", "custName", "custTel", "custAddr", "qty", "total", "orderDate", "userId", "status"], "id");
        this.open((err, conn) => {
            if (err) throw err;
            conn.query(DDL_ORDERS, (err, result) => {
                if (err) throw err;
                console.log("Table " + this.tableName + " created.");
            });
        });
    }

    /**
     * 訂單狀態名稱
     */
    get STATUS() {
        return ['新訂單', '已調製', '已出貨', '已送達', '已結清', '已取消'];
    }

    mapper(row) {
        if (row) {
            var d = {
                id: row.id,
                custName: row.custName,
                custTel: row.custTel,
                custAddr: row.custAddr,
                qty: row.qty,
                total: row.total,
                orderDate: new Date(row.orderDate),
                userId: row.userId,
                status: row.status,
                items: [],
                history: []
            }
            d.orderDateStr = this.dateToString(d.orderDate);
            return d;
        }
        return {};
    }

    findAll(callback) {
        var sql = "SELECT " + this.fieldList + " FROM " + this.tableName + " ORDER BY id DESC";
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, (err1, rows) => {
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

    findByID(value, callback) {
        var sql = 'SELECT ' + this.fieldList + ' FROM ' + this.tableName + ' WHERE id=?';
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, [value], (err1, row) => {
                if (err1) {
                    console.error(err1);
                    return callback(err1, null);
                }
                let entity = this.mapper(row[0]);
                return callback(null, entity);
            });
        });
    }

    toArrayWithoutId(entity) {
        var data = [
            entity.custName,
            entity.custTel,
            entity.custAddr,
            entity.qty,
            entity.total,
            entity.orderDate.valueOf(),
            entity.userId,
            entity.status
        ];
        return data;
    }

    toArrayWithIdLast(entity) {
        var data = [
            entity.custName,
            entity.custTel,
            entity.custAddr,
            entity.qty,
            entity.total,
            entity.orderDate.valueOf(),
            entity.userId,
            entity.status,
            entity.id
        ];
        return data;
    }

    update(entity, callback) {
        var sql = "UPDATE " + this.tableName + " SET " +
            "custName=?, custTel=?, custAddr=?, qty=?, total=?, orderDate=?, userId=?, status=? " +
            "WHERE id=?";
        var data = this.toArrayWithIdLast(entity);
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, data, (err1, result) => {
                if (err1) {
                    console.error(err1);
                    if (callback) callback(err1, null);
                } else if (callback) {
                    callback(null, entity);
                } else {
                    console.log(this.tableName + " updates " + result.affectedRows + " row.");
                }
            });
        });
    }

    insert(entity, callback) {
        var sql = "INSERT INTO " + this.tableName +
            " (custName, custTel, custAddr, qty, total, orderDate, userId, status) VALUES (?,?,?,?,?,?,?,?)";
        var data = this.toArrayWithoutId(entity);
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, data, (err1, result) => {
                if (err1) {
                    console.error(err1);
                    if (callback) callback(err1, null);
                } else if (callback) {
                    entity.id = result.insertId;
                    callback(null, entity);
                } else {
                    console.log(this.tableName + " inserts " + result.affectedRows + " row, lastID is " + result.insertId + ".");
                }
            });
        });
    }

    findByUserId(userId, callback) {
        var sql = 'SELECT ' + this.fieldList + ' FROM ' + this.tableName + ' WHERE userId=? ORDER BY id DESC';
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, [userId], (err1, rows) => {
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

    loadItems(entity, callback) {
        orderItemDAO.findByOrderId(entity.id, (err, data) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            } else {
                entity.items = data;
                callback(null, entity);
            }
        });
    }

    loadHistory(entity, callback) {
        orderHistoryDAO.findByOrderId(entity.id, (err, data) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            } else {
                entity.history = data;
                callback(null, entity);
            }
        });
    }
}

module.exports = new OrderDAO();