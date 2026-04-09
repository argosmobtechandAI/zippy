import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = (req, res, next) => {


    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized', success: false });
    }
    const tokenWithoutBearer = token.split(' ')[1];
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.userId = decodedToken.id;
    next();
}