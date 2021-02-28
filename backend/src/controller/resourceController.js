import ResourceCollection from '../models/resourceModel.js';
import mongoose from 'mongoose'
import fs from 'fs';

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
            .select('_id name fileType likes dislikes  files fileSize createdBy year department subject createdAt')
            .populate({ path: 'year', select: 'name ' })
            .populate({ path: 'department', select: 'name' })
            .populate({ path: 'subject', select: ' name' })
            .populate({ path: 'createdBy', select: ' username profilePicture' })
            .exec();

        //! useful for getting like value

        let sendableResources = [];
        resources.forEach(resource => {
            let createdBy = { _id: resource.createdBy._id, username: resource.createdBy.username, profilePicture: resource.createdBy.profilePicture }
            const resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, year: resource.year, department: resource.department, subject: resource.subject, createdBy, createdAt: resource.createdAt };
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


export const updateResource = async (req, res) => {
    const { resourceId } = req.params
    const { name } = req.body
    if (resourceId && name) {
        try {
            const updatedResource = await ResourceCollection.findOneAndUpdate({ _id: resourceId }, { name: name }, { new: true })
                .populate({ path: 'createdBy', select: 'username profilePicture ' })
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'subject', select: ' name' })
                .exec();
            if (updatedResource) {
                let createdBy = { _id: updatedResource.createdBy._id, username: updatedResource.createdBy.username, profilePicture: updatedResource.createdBy.profilePicture }
                let updatedResourceObj = { _id: updatedResource.id, name: updatedResource.name, fileType: updatedResource.fileType, files: updatedResource.files, fileSize: updatedResource.fileSize, createdBy, year: updatedResource.year, department: updatedResource.department, subject: updatedResource.subject, createdAt: updatedResource.createdAt };
                if (updatedResource.likes.includes(req.userId)) {
                    updatedResourceObj = { ...updatedResourceObj, isLiked: true, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: false };
                } else if (updatedResource.dislikes.includes(req.userId)) {
                    updatedResourceObj = { ...updatedResourceObj, isLiked: false, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: true };
                } else {
                    updatedResourceObj = { ...updatedResourceObj, isLiked: false, likes: updatedResource.likes.length, dislikes: updatedResource.dislikes.length, isDisliked: false };
                }
                res.status(201).json(updatedResourceObj)
            } else {
                res.status(404).json({ message: 'Resource not found' })
            }

        }
        catch (e) {
            res.status(500).json({ message: e.toString() })
        }

    } else {
        res.status(400).json({ message: 'Resource id with new name required' })
    }
}

const deleteFileFromStorage = (filename) => {
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(filename);
            resolve("File is deleted.");
        } catch (error) {
            reject(error);
        }
    })
}

export const deleteResource = (req, res) => {
    const { resourceId } = req.params
    if (resourceId) {
        ResourceCollection.findOne({ _id: resourceId }, (err, resource) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (resource) {
                const files = resource.files;
                let promiseArray = [];

                files.forEach((file) => {
                    promiseArray.push(deleteFileFromStorage(`./src/uploads/${file.name}`))
                })

                Promise.all(promiseArray)
                    .then(response => {
                        ResourceCollection.findOneAndDelete({ _id: resourceId }, function (err, deletedResource) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.status(204).send();
                            }
                        });
                    })
                    .catch(error => res.status(500).json({ message: error }));

            } else {
                res.status(404).json({ message: 'Resource not found' })

            }
        })

    } else {
        res.status(400).json({ message: 'Resource id required' })
    }
}

export const getResourceById = async (req, res) => {
    const { resourceId } = req.params
    if (resourceId) {
        try {
            const resource = await ResourceCollection.findOne({ _id: resourceId })
                .populate({ path: 'createdBy', select: 'username profilePicture ' })
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'subject', select: ' name' })
                .exec();
            if (resource) {
                let createdBy = { _id: resource.createdBy._id, username: resource.createdBy.username, profilePicture: resource.createdBy.profilePicture }
                let resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, createdBy, year: resource.year, department: resource.department, subject: resource.subject, createdAt: resource.createdAt };
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

export const getResourcesByUserId = async (req, res) => {
    const { userId } = req.params
    if (userId) {
        try {

            const resources = await ResourceCollection.find({ createdBy: userId })
                .select('_id name fileType likes dislikes  files fileSize createdBy year department subject createdAt')
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'subject', select: ' name' })
                .populate({ path: 'createdBy', select: ' username profilePicture' })
                .exec();

            //! useful for getting like value

            let sendableResources = [];
            resources.forEach(resource => {
                let createdBy = { _id: resource.createdBy._id, username: resource.createdBy.username, profilePicture: resource.createdBy.profilePicture }
                const resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, year: resource.year, department: resource.department, subject: resource.subject, createdBy, createdAt: resource.createdAt };
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
}


export const likeDislikeResource = async (req, res) => {
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

        try {
            const updatedResource = await ResourceCollection.findOneAndUpdate({ _id: resourceId }, update, { new: true })
                .populate({ path: 'createdBy', select: 'username profilePicture ' })
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'subject', select: ' name' })
                .exec();
            if (updatedResource) {
                let createdBy = { _id: updatedResource.createdBy._id, username: updatedResource.createdBy.username, profilePicture: updatedResource.createdBy.profilePicture }
                let resourceObj = { _id: updatedResource.id, name: updatedResource.name, fileType: updatedResource.fileType, files: updatedResource.files, fileSize: updatedResource.fileSize, createdBy, year: updatedResource.year, department: updatedResource.department, subject: updatedResource.subject, createdAt: updatedResource.createdAt };
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
        } catch (e) {
            res.status(500).json({ message: e.toString() })

        }

    }
}

export const getResourcesBySubject = async (req, res) => {
    const { subjectId } = req.params
    if (subjectId) {
        try {

            const resources = await ResourceCollection.find({ subject: subjectId })
                .select('_id name fileType likes dislikes  files fileSize createdBy year department subject createdAt')
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'subject', select: ' name' })
                .populate({ path: 'createdBy', select: ' username profilePicture' })
                .exec();

            //! useful for getting like value

            let sendableResources = [];
            resources.forEach(resource => {
                let createdBy = { _id: resource.createdBy._id, username: resource.createdBy.username, profilePicture: resource.createdBy.profilePicture }
                const resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, year: resource.year, department: resource.department, subject: resource.subject, createdBy, createdAt: resource.createdAt };
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
}

