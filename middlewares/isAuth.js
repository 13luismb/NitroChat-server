module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send({
            status: 400,
            response: 'Debes de haber iniciado sesion'
        });
    }
}
module.exports.isLogged = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.send({
            status: 304,
            response: 'Ya existe una sesion'
        });
    } else {
        next();
    }
}

module.exports.isValidToken = function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({
            message: 'invalid token...',
            status: 401
        });
    }
}