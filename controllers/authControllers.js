const usersModel = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const {username, password} = req.body;
        const existing = await usersModel.findByUsername(username);

        if(existing.rows.length > 0) {
            return res.status(400).json({message: "Username already exists"}); //Object shorthand (tạo 1 biến từ biến cùng tên)
        }
    
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt) //Mã hóa mật khẩu
        
        const result = await usersModel.createUser(username, passwordHash);

        res.status(201).json({message: 'User registered', user: result.rows[0]})
    }
    catch(err) {
        res.status(500).json({error: err.message});
    }
}

exports.login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await usersModel.findByUsername(username);

        if(user.rows.length === 0) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        const valid = await bcrypt.compare(password, user.rows[0].password);
        if(!valid) return res.status(400).json({message: "Invalid credentials"});

        const accessToken = jwt.sign({user_id: user.rows[0].id}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});

        res.json({access_token: accessToken});
    }
    catch(err) {
        res.status(500).json({error: err.message});
    }
}