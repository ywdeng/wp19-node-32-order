const baseClass = require('./dao');
const crypto = require('crypto');

const DDL_USERS = `
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(50) NOT NULL PRIMARY KEY, 
    name VARCHAR(50) NOT NULL, 
    tel VARCHAR(50) NOT NULL, 
    addr VARCHAR(50) NOT NULL, 
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0)
`;

/**
 * 帳號資料存取
 */
class UserDAO extends baseClass.DAO {
    constructor() {
        super("Users", ["id", "name", "tel", "addr", "password", "isAdmin"], "id");
        this.open((err, conn) => {
            if (err) throw err;
            conn.query(DDL_USERS, (err, result) => {
                if (err) throw err;
                console.log("Table " + this.tableName + " created.");
            });
            conn.query("SELECT COUNT(*) AS NUM FROM " + this.tableName, (err, rows) => {
                if (err) throw err;
                let num = Number(rows[0].NUM);
                if (num === 0) {
                    console.log(this.tableName + " create an administrator account for empty table.");
                    this.insert({
                        id: "0000000000",
                        name: "店長",
                        tel: "02-8662-1688",
                        addr: "台北市羅斯福路六段218號10樓",
                        password: "1qaz@WSX",
                        isAdmin: true
                    });
                }
            });
        });
    }

    mapper(row) {
        if (row) {
            return {
                id: row.id,
                name: row.name,
                tel: row.tel,
                addr: row.addr,
                password: row.password,
                isAdmin: (row.isAdmin == 1)
            }
        }
        return {};
    }

    findAll(callback) {
        var sql = "SELECT " + this.fieldList + " FROM " + this.tableName + " ORDER BY id";
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
            entity.name,
            entity.tel,
            entity.addr,
            entity.password,
            (entity.isAdmin ? 1 : 0)
        ];
        return data;
    }

    toArrayWithId(entity) {
        var data = [
            entity.id,
            entity.name,
            entity.tel,
            entity.addr,
            entity.password,
            (entity.isAdmin ? 1 : 0)
        ];
        return data;
    }

    toArrayWithIdLast(entity) {
        var data = [
            entity.name,
            entity.tel,
            entity.addr,
            entity.password,
            (entity.isAdmin ? 1 : 0),
            entity.id
        ];
        return data;
    }

    update(entity, callback) {
        var sql = "UPDATE " + this.tableName + " SET name=?, tel=?, addr=?, isAdmin=? WHERE id=?";
        var data = [entity.name, entity.tel, entity.addr, (entity.isAdmin ? 1 : 0), entity.id];
        if (entity.password) { // 更新資料包含改密碼            
            entity.password = this.passwordHash(entity.id, entity.password);
            sql = "UPDATE " + this.tableName + " SET name=?, tel=?, addr=?, password=?, isAdmin=? WHERE id=?";
            data = [entity.name, entity.tel, entity.addr, entity.password, (entity.isAdmin ? 1 : 0), entity.id];
        }
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

    /**
     * 增加使用者
     * @param {*} entity 新使用者
     */
    insert(entity, callback) {
        entity.password = this.passwordHash(entity.id, entity.password);
        var sql = "INSERT INTO " + this.tableName + " VALUES (?,?,?,?,?,?)";
        var data = this.toArrayWithId(entity);
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
                    console.log(this.tableName + " inserts " + result.affectedRows + " row.");
                }
            });
        });
    }

    delete(entity, callback) {
        var sql = "DELETE FROM " + this.tableName + " WHERE id=?";
        this.open((err, conn) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            conn.query(sql, [entity.id], (err1, result) => {
                if (err1) {
                    console.error(err1);
                    if (callback) callback(err1, null);
                } else if (callback) {
                    callback(null, result.affectedRows);
                } else {
                    console.log(this.tableName + " deletes " + result.affectedRows + " row.");
                }
            });
        });
    }

    /**
     * 將電話號碼轉換成 ID：只取數字，去除 ()-+，前置補 0，長度 10 碼
     * @param {*} tel 
     */
    tel2ID(tel) {
        var id = '';
        var n = tel.match(/\d+/g); // extract digits
        if (n) {
            id = Array.isArray(n) ? n.join('') : n;
        }
        if (id.length < 10) {
            id = "00000000000" + id;
        }
        id = id.substr(id.length - 10);
        return id;
    }

    /**
     * 建立用戶密碼的雜湊值
     * @param {*} userId 
     * @param {*} passwordPlaintext 
     */
    passwordHash(userId, passwordPlaintext) {
        var hash = crypto.createHash('sha256');
        var salted = userId + passwordPlaintext;
        hash.update(salted);
        var cipher = hash.digest('hex');
        return cipher;
    }

    /**
     * 驗證帳號密碼
     * @param {*} id 帳號
     * @param {*} passwd 密碼
     * @param {*} callback 後續處理函式
     */
    authenticate(id, passwd, callback) {
        this.findByID(id, (err, u) => {
            if (err) return callback(err);
            let pwd = this.passwordHash(id, passwd);
            if (u && u.password && (pwd === u.password)) {
                return callback(null, u);
            }
            return callback(new Error("帳號或密碼錯誤!"));
        });
    }

    /**
     * 進入受管制的頁面前，強制用戶登入
     * @param {*} req Request
     * @param {*} res Response
     * @param {*} next Next
     */
    forceLogin(req, res, next) {
        if (req.session && req.session.user) {
            //console.log('User ' + req.session.user.id + ' already login.');
            next();
        } else {
            req.session.pageAfterLogin = req.originalUrl;
            res.redirect("/login");
        }
    }
}

module.exports = new UserDAO();