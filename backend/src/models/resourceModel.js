import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    files: [
        { name: { type: String } }
    ],
    fileSize: { type: Number },
    fileType: {
        type: String,
        enum: ['image', 'pdf']
    }
}, { timestamps: true });

export default mongoose.model('Resource', ResourceSchema);