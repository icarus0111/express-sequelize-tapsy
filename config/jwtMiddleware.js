let jwt = require('jsonwebtoken');
const config = require('./staticValues');

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase 
    // console.log('token from header :.............', token);

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        jwt.verify(token, config.secret, {
            algorithm: config.algorithm,
            expiresIn: config.expiresIn,
            audience: config.audience,
            issuer: config.issuer
        }, (err, decoded) => {
            if (err) {
                return res.json({
                    status: false,
                    message: 'Token is not valid'
                });
            } else {
                console.log();
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            status: false,
            message: 'Auth token is not supplied'
        });
    }
};




module.exports = checkToken;