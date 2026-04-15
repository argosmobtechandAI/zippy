import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
    }
    
    try {
        const tokenWithoutBearer = token.split(' ')[1];
        const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        req.userType = decodedToken.type;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', success: false });
    }
}

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userType || !allowedRoles.includes(req.userType)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges', success: false });
        }
        next();
    };
};