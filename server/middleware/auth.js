import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    const token = req.headers.authorization;
    if(!token){
        return res.json({success: false, message: "not authorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(!decoded || !decoded.id){
            return res.json({success: false, message: "not authorized"})
        }
        req.user = await User.findById(decoded.id).select("-password")
        next();
    } catch (error) {
        return res.json({success: false, message: "not authorized"})
    }
}

// Role-based authorization middleware (supports multiple roles per user)
export const authorizeRoles = (...requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.json({ success: false, message: "not authorized" });
        }

        const primary = req.user.role;
        const extra = Array.isArray(req.user.roles) ? req.user.roles : [];

        const normalize = (r) => {
            if (!r) return null;
            if (r === "user") return "renter";
            if (r === "owner") return "client";
            return r;
        }

        const allRoles = new Set();
        [primary, ...extra].forEach(r => {
            const n = normalize(r);
            if (n) allRoles.add(n);
        });

        const ok = requiredRoles.some(r => allRoles.has(r));
        if (!ok) {
            return res.json({ success: false, message: "not authorized" });
        }

        next();
    };
}