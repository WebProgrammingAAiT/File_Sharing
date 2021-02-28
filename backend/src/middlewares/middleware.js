import jwt from 'jsonwebtoken'

const secretKey = process.env.JWT_SECRET || 'somethingSecret'

export const isAuthorized = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send("Authorization required");
    }
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            res.status(500).json({ message: err })
        } else {
            req.userId = user._id;
            req.role = user.role;
            next();
        }
    });

}

export const isAdmin = (req, res, next) => {

    if (req.role !== "admin") {
        res.status(401).send("Unauthorized admin")
    } else {
        next();
    }
}

export const isDeleteOperationAuthorized = (req, res, next) => {
    if (req.role == 'admin' || req.userId == req.params.userId) {
        next();
    } else {
        res.status(401).send("Unauthorized operation")
    }
}

export const isUser = (req, res, next) => {

    if (req.role !== "user") {
        res.status(401).send("Unauthorized user")
    } else {
        next();
    }
}