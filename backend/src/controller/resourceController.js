import ResourceCollection from '../models/resourceModel.js';

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
}


export const getResourceById = (req, res) => {
    const { resourceId } = req.params
    if (resourceId) {
        ResourceCollection.findOne({ _id: resourceId }, (err, resource) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (resource) {
                let resourceObj = { _id: resource.id, name: resource.name, fileType: resource.fileType, files: resource.files, fileSize: resource.fileSize, createdBy: resource.createdBy, year: resource.year, department: resource.department, subject: resource.subject };
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
        })
    }
}