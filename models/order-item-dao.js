const baseClass = require('./dao');

const DDL_ORDER_ITEMS = `
CREATE TABLE IF NOT EXISTS OrderItems (
    rowid INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    orderId INTEGER NOT NULL, 
    name VARCHAR(50) NOT NULL, 
    size VARCHAR(50) NOT NULL, 
    price INTEGER NOT NULL, 
    qty INTEGER NOT NULL,
    sum INTEGER NOT NULL,
    note TEXT)
`;

/**
 * 訂單資料存取
 */
class OrderItemDAO extends baseClass.DAO {
    constructor() {
        super("OrderItems", ["orderId", "name", "size", "price", "qty", "sum", "note"], ["rowid", "orderId"]);
        this.open((err, conn) => {
            if (err) throw err;
            conn.query(DDL_ORDER_ITEMS, (err, result) => {
                if (err) throw err;
                console.log("Table " + this.tableName + " created.");
            });
        });
    }

    mapper(row) {
        if (row) {
            return {
                /* orderId: row.orderId, */
                name: row.name,
                size: row.size,
                price: row.price,
                qty: row.qty,
                sum: row.sum,
                note: row.note
            }
        }
        return {};
    }

    findByOrderId(orderId, callback) {
        var sql = "SELECT " + this.fieldList + " FROM " + this.tableName + " WHERE orderId=? ";
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

    toArrayWithoutId(entity) {
        var data = [
            entity.orderId,
            entity.name,
            entity.size,
            entity.price,
            entity.qty,
            entity.sum,
            entity.note

        ];
        return data;
    }

    insert(entity, callback) {
        var sql = "INSERT INTO " + this.tableName + " (orderId, name, size, price, qty, sum, note) VALUES (?,?,?,?,?,?,?)";
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

    insertWithOrderId(orderId, entities, callback) {
        var sql = "INSERT INTO " + this.tableName + " (orderId, name, size, price, qty, sum, note) VALUES (?,?,?,?,?,?,?)";
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            let count = 0;
            entities.forEach(e => {
                e.orderId = orderId;
                let data = this.toArrayWithoutId(e);
                conn.query(sql, data, (err1, result) => {
                    if (err1) {
                        console.error(err1);
                        return callback(err1, null);
                    }
                    count++;
                });
            });
            if (callback) {
                callback(null, count);
            } else {
                console.log(this.tableName + " inserts " + count + " rows.");
            }
        });
    }
}

module.exports = new OrderItemDAO();