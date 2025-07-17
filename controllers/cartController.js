const con = require('../config/db');
const cartModel = require('../models/cartModel');

exports.getCart = async (req, res) => {
    try {
        const {user_id} = req.query
        const result = await cartModel.getAll(user_id);
        res.json(result.rows);
    }
    catch(err){
        res.status(500).json({
            message: "Can not retrieve data!",
            error: err.message
        });
        console.error(err);
    }
}

exports.addCart = async (req, res) => {
    try {
        const {product_id, quantity, user_id } = req.body;
        //Nếu ID không tồn tại trong bảng product thì không thể thêm vào cart
        //ID trong cart đối chiếu cho product với foreign key
        const checkProduct = await con.query('Select * from "productTable" where id = $1',[product_id]);
        if(checkProduct.rowCount === 0) {
            return res.status(400).send("ID not exist!");
        }

        if(!product_id || !quantity || !user_id) {
            return res.status(400).send("Missing product_id, quantity or user_id")
        }

        const result = await cartModel.add(product_id, quantity, user_id);
        res.status(201).json({
            message: "Add successfully",
            data: result.rows[0]
        });

    }
    catch(err){
         res.status(500).json({
            message: "Can not add to cart!",
            error: err.message
        });
    }
}

exports.updateCart = async (req, res) => {
    try {
        //Không phải {id} = req.params.id vì khi chọn id thì nó đã là string
        //Nếu muốn destructure => {id} = req.params
        const {product_id} = req.params;
        const {quantity, user_id}= req.body;

        if(!product_id || !quantity || !user_id) {
            return res.status(400).send("Missing product_id, quantity or user_id")
        }

        const result = await cartModel.update(product_id, quantity, user_id);
        res.status(200).send("Update successfully");
    }
    catch(err){
         res.status(500).json({
            message: "Can not update cart!",
            error: err.message
        });
    }
}

exports.deleteCart = async (req, res) => {
    try {
        const {user_id} = req.body
        const {product_id} = req.params;

        if(!product_id || !user_id) {
            return res.status(400).send("Missing product_id or user_id")
        }

        const result = await cartModel.delete(product_id, user_id);
        if(result.rowCount > 0) {
            res.status(200).send("Delete successfully");
        }
        else {
            res.status(404).send("Can not find items");
        }

    }
    catch(err){
         res.status(500).json({
            message: "Can not delete item!",
            error: err.message
        });
    }
}

exports.clearCart = async (req, res) => {
    try {
        const {user_id} = req.body

        if(!user_id) {
            return res.status(400).send("Missing user_id")
        }
        const result = await cartModel.clear(user_id);
        res.status(200).send("Clear successfully");
    }
    catch(err){
        res.status(500).json({
            message: "Can not clear data!",
            error: err.message
        });
        console.error(err);
    }
}