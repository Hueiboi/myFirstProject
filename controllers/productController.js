const con = require('../config/db.js');
const product = require('../models/productModel.js');

//Get all products and filter by name if provided
exports.getAllProducts = async (req, res) => {
    try {
        const {sortBy, order} = req.query;

        const result = await product.getAllSorted(sortBy, order);
        res.status(200).json({status: "success", data: result.rows, msg: "get successfully"});
    }
    catch(err) {
        res.status(500).json({message: "Error retrieving products"}) 
        console.error(err);
        //Nên trả về {} là cách chuẩn, json("error") không sai nhưng không đầy đủ
    }
}
//Get product by name
exports.getAllByName = async (req, res) => {
    try {
        const {filter} = req.query;

        const result = await product.getByName(filter);
        res.status(200).json({status: "success", data: result.rows, msg: "get by name successfully"});
    }
    catch(err) {
        res.status(500).json({message: "Error retrieving products"})
        console.error(err);
    }
}

//Get 1 product by id
exports.getProductsById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await product.getById(id);
        if(result.rowCount > 0) {
            res.json(result.rows[0]);
        } 
        else {
            res.status(404).send("Product not found");
            console.error("Product not found with ID:", id);
        }
    }
    catch(err) {
        res.status(500).json({message: "Error retrieving products"})
        console.error(err);
    }
}
//Get products by name
// exports.getProductByName = async(req, res) => {
//     try {
//         const {filter} = req.query;
//         const result = await product.getByName(filter);
//         if(result.rewCount > 0) {
//             res.status(200).json({data: result.rows});
//         }
//         else {
//             res.status(404).send("No products found with that name");
//             console.log("No products found with name:", filter);
//         }
//     }
//     catch(err) {
//         res.status(500).json({message: "Error retrieving products"}) name");
//         console.error(err);
//     }
// }


//Create 1 product
exports.createProduct = async (req, res) => {
    try {
        const {name, id, price, stock_quantity} = req.body;

        if(!name || !id || !price || !stock_quantity) {
            return res.status(400).json({status: "error", msg: "lack of required info"})
        }

        if(typeof name !== "string",
            typeof id !== "string",
            typeof price !== "number",
            typeof stock_quantity !== "number"
        ) {
            res.status(400).json({status: "error", msg: "invalid data type"})
        }

        const result = await product.create(name, id, price, stock_quantity);
        res.status(201).send("Product created successfully");
    }
    catch(err) {
        res.status(500).json({message: "Error creating product"})
        console.error(err);
    } 
}
//Many products
exports.createManyProducts = async (req, res) => {
    try {
        const products = req.body;
        if(!Array.isArray(products) || products.length === 0) {
            return res.status(400).send("Invalid input: expected an array of products");
        }
        const insertProducts = await Promise.all(
            products.map( async p => {
                const {name, id, price, stock_quantity} = p;
                try {
                    await product.create(name, id, price, stock_quantity);
                    return {name, id, price, stock_quantity, status: 'created many products successfully'};
                }
                catch(err){
                    console.error(err);
                    return {name, id, price, stock_quantity, status: 'failed to create product'};
                }
            })
        )
    }
    catch(err) {
        res.status(500).json({message: "Error creating products"})
        console.error(err);
    }
}

exports.updateProduct = async (req, res) => {//Update 1 trường mà không gây lỗi các trường khác
    try {
        const id = req.params.id;
        const {name, price, stock_quantity} = req.body;

        if(!id) return res.status(400).json({message: "Missing product ID"});


        const fieldsToUpdate = ['name', 'price', 'stock_quantity'];
        const values = [];
        const fields = [];
        let index = 1;

        for(const field of fieldsToUpdate) {
            if(req.body[field] !== undefined) {
                fields.push(`${field} = $${index++}`);
                values.push(req.body[field]);
            }
        }

        // if(name !== undefined){
        //     fields.push(`name = $${index++}`);
        //     values.push(name);
        // }

        // if(price !== undefined){
        //     fields.push(`price = $${index++}`);
        //     values.push(price);
        // }

        // if(stock_quantity !== undefined){
        //     fields.push(`stock_quantity = $${index++}`);
        //     values.push(stock_quantity);
        // }

        if(fields.length === 0) return res.status(400).json({message: "No fields to update"});

        values.push(id);

        const query = `update "productTable" set ${fields.join(',')} where id = $${index}`
        const result = await con.query(query, values);

        if(result.rowCount === 0) return res.status(404).json({message: "Product not found"});

        res.status(200).json({message: "Update successfully"});
    }
    catch(err) {
        res.status(500).json({message: "Error updating products"})
        console.error(err);
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await product.delete(id);

        if(!id) {
            return res.status(400).json({status: "error", msg: "Need an exact ID"})
        }

        if(result.rowCount > 0) {
            res.status(201).send("Product deleted successfully");
        } else {
            res.status(404).send("Product not found");
            console.error("Product not found with ID:", id);
        }
    }
    catch(err) {
        res.status(500).json({message: "Error retrieving products"})
        console.error(err);
    }
}