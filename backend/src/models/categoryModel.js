import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parentId: { type: String },
    type: { type: String, enum: ['year', 'department', 'subject'], required: true }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);