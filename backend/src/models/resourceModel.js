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

    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', }
    ],
    dislikes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],


    files: [
        { name: { type: String } }
    ],
    fileSize: { type: Number },
    fileType: {
        type: String,
        required: true,
        enum: ['image', 'pdf']
    }
}, { timestamps: true });

export default mongoose.model('Resource', ResourceSchema);