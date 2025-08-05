const jwt = require('jsonwebtoken');

exports.verifyToken = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        console.log(err, user);
        if(err) return res.sendStatus(403);
        next();
    })
}