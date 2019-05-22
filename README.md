# 關聯式資料庫應用範例

訂單管理，使用 MariaDB 資料庫

## Prepare Database 

1. Install [MariaDB](https://downloads.mariadb.org/)
1. Login to MariaDB by `mysql -u root -p`
1. Run `CREATE DATABASE DrinkShop CHARACTER SET utf8 COLLATE utf8_general_ci;`
1. Run `CREATE USER 'joseph'@'localhost' IDENTIFIED BY '1qaz@WSX';`
1. Run `GRANT ALL PRIVILEGES ON DrinkShop.* TO 'joseph'@'localhost';`
1. Run `FLUSH PRIVILEGES;`

## Run locally

1. Install [Node.js and npm](https://nodejs.org/)
1. Run `git clone https://github.com/ywdeng/wp19-node-32-order.git`
1. Run `cd wp19-node-32-order`
1. Run `npm install`
1. Run `npm run test`
1. Visit [http://localhost:3456](http://localhost:3456)
