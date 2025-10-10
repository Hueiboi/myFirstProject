const { body } = require('express-validator');

const createMenuSchema = {
  'products.*.name': {
    isString: true,
    isLength: { options: { min: 5, max: 32 } },
    trim: true,
    errorMessage: 'Name must be a string between 5 and 32 characters'
  },
  'products.*.id': {
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: 'ID must be a positive integer'
  },
  'products.*.price': {
    isFloat: { options: { min: 0 } },
    toFloat: true,
    errorMessage: 'Price must be a positive number'
  },
  'products.*.stock_quantity': {
    isInt: { options: { min: 0 } },
    toInt: true,
    errorMessage: 'Stock quantity must be a non-negative integer'
  },
  'products.*.category': {
    isString: true,
    optional: true,
    errorMessage: 'Category must be a string'
  }
};

const createOrderSchema = {
    table_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Table ID must be a positive integer'
    },
    promotion_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        optional: ({nullable: true}),
        errorMessage: 'Promotion ID must be a positive integer'
    }
};

const addItemToOrderSchema = {
    product_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Product ID must be a positive integer'
    },
    quantity: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Quantity must be a positive integer'
    }
};

const updateItemInOrderSchema = {
    quantity: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Quantity must be a positive integer'
    }
};

const payOrderSchema = {
    payment_method: {
        isString: true,
        isIn: { options: [['cash', 'card', 'e-wallet']] },
        errorMessage: 'Method must be one of: cash, card, e-wallet'
    }
};

const createTableSchema = {
    table_number: {
        isString: true,
        isLength: { options: { min: 1, max: 50 } },
        trim: true,
        errorMessage: 'Table number must be a string between 1 and 50 characters'
    }
};

const updateTableSchema = {
    status: {
        isString: true,
        isIn: { options: [['available', 'occupied']] },
        errorMessage: 'Status must be either available or occupied'
    }
};

const createPromotionSchema = {
    name: {
        isString: true,
        isLength: { options: { min: 1, max: 255 } },
        trim: true,
        errorMessage: 'Name must be a string between 1 and 255 characters'
    },
    discount_percentage: {
        isFloat: { options: { min: 0, max: 100 } },
        toFloat: true,
        errorMessage: 'Discount percentage must be between 0 and 100'
    },
    start_date: {
        isISO8601: true,
        errorMessage: 'Start date must be a valid ISO 8601 date'
    },
    end_date: {
        isISO8601: true,
        errorMessage: 'End date must be a valid ISO 8601 date'
    }
};

const registerSchema = {
    username: {
        isString: true,
        isLength: { options: { min: 3, max: 50 } },
        trim: true,
        errorMessage: 'Username must be a string between 3 and 50 characters'
    },
    password: {
        isString: true,
        isLength: { options: { min: 6 } },
        errorMessage: 'Password must be at least 6 characters'
    },
    email: {
        isEmail: true,
        errorMessage: 'Email must be a valid email address'
    },
    address: {
        isString: true,
        optional: true,
        errorMessage: 'Address must be a string'
    }
};

const getOrderByTableCompletedSchema = {
  table_id: {
    in: ['params'],
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: 'Table ID must be a positive integer'
  }
}


const getOrderByOrderCodeSchema = {
    order_code: {
        isString: true,
        isLength: { options: { min: 1, max: 50 } },
        trim: true,
        errorMessage: 'Order code must be a string between 1 and 50 characters'
    }
};

module.exports = {
    createMenuSchema,
    createOrderSchema,
    addItemToOrderSchema,
    updateItemInOrderSchema,
    payOrderSchema,
    createTableSchema,
    updateTableSchema,
    createPromotionSchema,
    registerSchema,
    getOrderByTableCompletedSchema,
    getOrderByOrderCodeSchema
};