//Product
export const createProductSchema = {
    name: {
        isLength: {
            options:{
                min: 5,
                max: 32
            },
            errorMessage: "Name must be between 5 and 32 characters long"
        },
        notEmpty: {
            errorMessage: "Name cannot be empty"
        },
        isString: {
            errorMessage: "Name must be a string"
        },   
        trim: true // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    },
    id: {
        isInt: {
            errorMessage: "ID must be a positive integer"
        },
        notEmpty: {
            errorMessage: "ID cannot be empty"
        },
        toInt: true // Chuyển đổi chuỗi sang số nguyên
    },
    price: {
        isFloat: {
            options: {
                min: 0
            },
            errorMessage: "Price must be a positive number"
        },
        toFloat: true, // Chuyển đổi chuỗi sang số thực
        notEmpty: {
            errorMessage: "Price cannot be empty"
        }
    }
}

export const getProductSchema = {
    filter: {
        optional: true, //Trường này không bắt buộc phải có
        isIn: {
            options: [['Apple', 'Banana', 'Orange']],
            errorMessage: "Filter must be one of the allowed values: Apple, Banana, Orange"
        }
    }
}


//Cart
export const addCartSchema = {
    product_id: {
        notEmpty: {
            errorMessage: "Product id is required!",
        },
        isInt: {
           
        }
    },
    quantity: {
        isInt: {
            optional: {
                min: 1
            },
            errorMessage: "Quantity must be an integer"
        },
        notEmpty: {
            errorMessage: "Quantity is required!"
        }
    }
    
}

export const updateCartSchema = {
    product_id: {
        isInt: {
            options: {
                min: 1
            },
            errorMessage: "Product id must be integer and positive"
        }
    },
    quantity: {
        notEmpty: {
            errorMessage: "Quantity is required!"
        },
        isInt: {
             options: {min: 1},
            errorMessage: "Quantity must be integer and positive"
        }
    }
}