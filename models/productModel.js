const con = require('../config/db') // Kết nối đến cơ sở dữ liệu

// Hàm để lấy tất cả sản phẩm
const productModel = {
    getAll: () => con.query('select * from "productTable" order by id asc'),

    getById: (id) => con.query('select * from "productTable" where id = $1', [id]),

    getByName: (name) => {
        return con.query('select * from "productTable" where name ILIKE $1', [`%${name}%`]);
    },

    getAllSorted: (sortBy, order) => {
        const validSortBy = ['id', 'name', 'price']; // Các trường hợp hợp lệ để sắp xếp
        const validOrder = ['asc', 'desc']; // Các thứ tự hợp lệ

        const safeSortBy = validSortBy.includes(sortBy) ? sortBy : 'id'; // Mặc định là 'id' nếu không hợp lệ
        const safeOrder = validOrder.includes(order) ? order : 'asc'; // Mặc định là 'asc' nếu không hợp lệ
        return con.query(`select * from "productTable" order by ${safeSortBy} ${safeOrder}`);
    },

    create: (name, id, price, stock_quantity) => con.query('insert into "productTable" (name, id, price, stock_quantity) values ($1, $2, $3, $4)', [name, id, price, stock_quantity]),
    
    update: (id, name, price, stock_quantity) => con.query('update "productTable" set name = $1, price = $2, stock_quantity = $3 where id = $4', [name, price, stock_quantity, id]),

    delete: (id) => con.query('delete from "productTable" where id = $1', [id]), 
}

module.exports = productModel; 
// Xuất mô hình sản phẩm để sử dụng trong các phần khác của ứng dụng