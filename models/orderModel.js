const con = require('../config/db');

const cartModel = {
    getAll: (user_id) => con.query(
    `SELECT c.product_id, p.name, p.price, c.quantity, 
    (p.price * c.quantity) as total_price,
    to_char(c.created_at, 'dd/MM/yy HH24:mm:ss') as created_at
    FROM "cartTable" c
    JOIN "productTable" p ON c.product_id = p.id
    WHERE c.user_id = $1`,
    [user_id] //Lấy thông tin sản phẩm theo id của từng user theo 2 bảng
    ),

    //Sync số lượng trực tiếp từ kho và cart => giảm kho, tăng cart
    add: async (product_id, quantity, user_id) => {
        //Kiểm tra số lượng trong kho
        const checkStock = await con.query(
            'select * from "productTable" where id = $1', [product_id]
        );
        //TH1: không có sản phẩm
        if(checkStock.rows.length === 0) {
            throw new Error("Product not found!");
        }
        //TH2: Sản phẩm quá so với còn lại
        const stock = checkStock.rows[0].stock_quantity;
        if(stock < quantity) throw new Error("Not enough stock!");

        //Update kho => Giảm số lượng
        await con.query(
            'update "productTable" set stock_quantity = stock_quantity - $1 where id = $2',
            [quantity, product_id]
        );

        //Update cart => Tăng số lượng
        const existing = await con.query('select * from "cartTable" where product_id = $1 and user_id = $2', [product_id, user_id]);

        let result;
        if(existing.rows.length > 0) {
            result = await con.query('update "cartTable" set quantity = quantity + $1 where product_id = $2 and user_id = $3', [quantity, product_id, user_id]);
        } else {
            result = await con.query(
                'insert into "cartTable" (product_id, quantity, user_id) values ($1, $2, $3)',
                [product_id, quantity, user_id]
            )
        }
        return result;
    },

    update: async (product_id, quantity, user_id) => {
        //Lấy số lượng giỏ hiện tại
        const result = await con.query('select quantity from "cartTable" where product_id = $1 and user_id = $2',[product_id, user_id])
        const stockQty = await con.query('select stock_quantity from "productTable" where id = $1', [product_id]);

        if(result.rows.length === 0) return {rowCount: 0};

        const oldQty = result.rows[0].quantity;
        const stock = stockQty.rows[0].stock_quantity;
        const diff = quantity - oldQty;
        //Kiểm tra stock nếu là tăng số lượng => không vượt quá stock
        if(diff > stock) throw new Error("Not enough stock!");
        //Tính toán phần chênh lệch => tăng hay giảm phụ thuộc vào diff và cập nhật stock trong product
        if(diff > 0){
            await con.query(
                'update "productTable" set stock_quantity = stock_quantity - $1 where id = $2',
                [diff, product_id]
            )
        }
        else if(diff < 0) {
            await con.query(
                'update "productTable" set stock_quantity = stock_quantity + $1 where id = $2',
                [-diff, product_id]
            )
        }
        else {
            return;
        }
       
        //Cập nhật cart
        return await con.query(
            'update "cartTable" set quantity = quantity + $1 where product_id = $2 and user_id = $3',
            [diff, product_id, user_id]
        )
    },

    delete: async (product_id, user_id) => {
        //Lấy số lượng cần xóa
        const result = await con.query(
            'select quantity from "cartTable" where product_id = $1 and user_id = $2',
            [product_id, user_id]
        )

        if(result.rows.length === 0) return {rowCount: 0};

        const qty = result.rows[0].quantity;

        //Trả lại kho
        await con.query(
            'update "productTable" set stock_quantity = stock_quantity + $1 where id = $2',
            [qty, product_id]
        )

        //Xóa khỏi cart
        return await con.query('delete from "cartTable" where product_id = $1 and user_id = $2', [product_id, user_id]);
    },

    clear: (user_id) => con.query('delete from "cartTable" where user_id = $1', [user_id])
}

module.exports = cartModel;