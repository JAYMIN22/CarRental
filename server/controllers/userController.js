import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";


// Generate JWT Token
const generateToken = (userId)=>{
    return jwt.sign({id: userId}, process.env.JWT_SECRET)
}

// Register User (new user) or add role (existing user)
export const registerUser = async (req, res)=>{
    try {
        const {name, email, password, role, roles: rolesBody} = req.body

        if(!name || !email || !password || password.length < 8){
            return res.json({success: false, message: 'Fill all the fields'})
        }

        const allowedRoles = ['renter', 'client', 'driver'];
        let requestedRoles = Array.isArray(rolesBody) ? rolesBody : (role ? [role] : ['renter']);
        requestedRoles = requestedRoles.filter(r => allowedRoles.includes(r));
        if (requestedRoles.length === 0) requestedRoles = ['renter'];

        const userExists = await User.findOne({email});

        if (userExists) {
            // Same user adding another role: verify password, add role(s), return token
            const isMatch = await bcrypt.compare(password, userExists.password);
            if (!isMatch) {
                return res.json({success: false, message: 'Invalid password. Use correct password to add a role to this account.'});
            }
            const currentRoles = Array.isArray(userExists.roles) ? userExists.roles : [userExists.role].filter(Boolean);
            let updated = false;
            for (const r of requestedRoles) {
                if (!currentRoles.includes(r)) {
                    currentRoles.push(r);
                    updated = true;
                }
            }
            userExists.roles = currentRoles;
            userExists.role = currentRoles[0]; // primary
            userExists.name = name; // allow name update
            await userExists.save();
            const token = generateToken(userExists._id.toString());
            return res.json({success: true, token, message: updated ? 'Role(s) added successfully' : 'You already have these roles'});
        }

        // New user
        const hashedPassword = await bcrypt.hash(password, 10);
        const primaryRole = requestedRoles[0];
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: primaryRole,
            roles: requestedRoles
        });
        const token = generateToken(user._id.toString());
        res.json({success: true, token});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Login User 
export const loginUser = async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({success: true, token})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) =>{
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get All Cars for the Frontend
export const getCars = async (req, res) =>{
    try {
        const cars = await Car.find({isAvaliable: true})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}