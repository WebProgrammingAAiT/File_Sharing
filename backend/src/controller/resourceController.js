import ResourceCollection from '../models/resourceModel.js';
import mongoose from 'mongoose'

export const createResource = (req, res) => {
    const { name, department, fileType, year, subject } = req.body;
    let files = []
    if (req.files.length > 0) {
        files = req.files.map(file => {
            return { name: file.filename };
        })
    }
    const newResource = {
        name,
        fileType,
        files,
        year,
        department,
        subject,
        createdBy: req.userId
    }

    if (req.headers['content-length']) {
        newResource.fileSize = req.headers['content-length'];
    }
    ResourceCollection.create(newResource, (err, resource) => {
        if (err) res.status(500).json({ error: err });
        else res.status(201).json({ resource })
    })
}

export const getResources = async (req, res) => {
    try {

        const resources = await ResourceCollection.find()
            .select('_id name fileType likes dislikes  files fileSize createdBy year department subject')
            .populate({ path: 'year', select: 'name ' })
            .populate({ path: 'department', select: 'name' })
            .populate({ path: 'subject', select: ' name' })
            .populate({ path: 'createdBy', select: ' username' })
            .exec();

        //! useful for getting like value

        let sendableResources = [];

        resources.forEach(resource => {
            const resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, createdBy: resource.createdBy, year: resource.year, department: resource.department, subject: resource.subject };
            if (resource.likes.includes(req.userId)) {
                sendableResources.push({ ...resourceObj, isLiked: true, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: false });
            } else if (resource.dislikes.includes(req.userId)) {
                sendableResources.push({ ...resourceObj, isLiked: false, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: true });
            } else {
                sendableResources.push({ ...resourceObj, isLiked: false, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: false });
            }
        });

        res.status(200).json(sendableResources);
    } catch (e) {
        res.status(500).json({ message: e.toString() })
    }
}


export const getResourceById = async (req, res) => {
    const { resourceId } = req.params
    if (resourceId) {
        try {
            const resource = await ResourceCollection.findOne({ _id: resourceId })
                .populate({ path: 'createdBy', select: 'username profilePicture ' })
                .exec();
            if (resource) {
                let createdBy = { username: resource.createdBy.username, profilePicture: resource.createdBy.profilePicture }
                let resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, createdBy, year: resource.year, department: resource.department, subject: resource.subject };
                if (resource.likes.includes(req.userId)) {
                    resourceObj = { ...resourceObj, isLiked: true, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: false };
                } else if (resource.dislikes.includes(req.userId)) {
                    resourceObj = { ...resourceObj, isLiked: false, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: true };
                } else {
                    resourceObj = { ...resourceObj, isLiked: false, likes: resource.likes.length, dislikes: resource.dislikes.length, isDisliked: false };
                }
                res.status(200).json(resourceObj)
            } else {
                res.status(404).json({ message: 'Resource not found' })
            }

        } catch (e) {
            res.status(500).json({ message: e.toString() })
        }

    }
}


export const likeDislikeResource = (req, res) => {
    const { action } = req.query;
    const { resourceId } = req.params

    const { userId } = req;
    if (action && resourceId) {
        let update = {}
        switch (action) {
            case 'like':
                update = { "$push": { "likes": userId } }
                break;
            case 'dislike':
                update = { "$push": { "dislikes": userId } }
                break;
            case 'removeLike':
                update = { $pull: { likes: userId } }
                break;
            case 'removeDislike':
                update = { $pull: { dislikes: userId } }
                break;
            case 'removeLikeThenDislike':
                update = { $pull: { likes: userId }, "$push": { "dislikes": userId } }
                break;
            case 'removeDislikeThenLike':
                update = { $pull: { dislikes: userId }, "$push": { "likes": userId } }
                break;

        }

        ResourceCollection.findOneAndUpdate({ _id: resourceId }, update, { new: true }, (err, updatedResource) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (updatedResource) {
                let resourceObj = { _id: updatedResource.id, name: updatedResource.name, fileType: updatedResource.fileType, files: updatedResource.files, fileSize: updatedResource.fileSize, createdBy: updatedResource.createdBy, year: updatedResource.year, department: updatedResource.department, subject: updatedResource.subject };
                if (updatedResource.likes.includes(userId)) {
                    resourceObj = { ...resourceObj, isLiked: true, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: false };
                } else if (updatedResource.dislikes.includes(req.userId)) {
                    resourceObj = { ...resourceObj, isLiked: false, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: true };
                } else {
                    resourceObj = { ...resourceObj, isLiked: false, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: false };
                }
                res.status(201).json(resourceObj)
            } else {
                res.status(404).json({ message: 'Resource not found' })
            }
        })
    }
}

