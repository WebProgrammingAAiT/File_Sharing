import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'FirstName is required'],
        trim: true,
        maxlength: 20
    },
    lastName: {
        type: String,
        required: [true, 'LastName is required'],
        trim: true,
        maxlength: 20
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        index: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        lowercase: true
    },
    hashPassword: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: '603bfa643524d23a18957f23'
    },
    year: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category'
    },
    profilePicture: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);