import mongoose from "mongoose";

// NOTE:
// We keep legacy roles "owner" and "user" in the enum for backward-compatibility
// but new code should use: "renter", "client", "driver", "admin".
const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true },
    password: {type: String, required: true },
    role: {
        type: String,
        enum: ["owner", "user", "renter", "client", "driver", "admin"],
        default: "renter",
    },
    // New: allow multiple roles per user
    roles: {
        type: [String],
        enum: ["owner", "user", "renter", "client", "driver", "admin"],
        default: function () {
            // Seed roles array from primary role for existing users
            return [this.role || "renter"];
        }
    },
    image: {type: String, default: ''},
},{timestamps: true})

const User = mongoose.model('User', userSchema)

export default User