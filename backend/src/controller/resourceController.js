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
    const resources = await ResourceCollection.find({})
        .select('_id name filetype likes dislikes  files fileSize createdBy year department subject')
        .populate({ path: 'year', select: '_id name' })
        .populate({ path: 'department', select: '_id name' })
        .populate({ path: 'subject', select: '_id name' })
        .populate({ path: 'createdBy', select: '_id username' })
        .exec();
    res.status(200).json(resources);
}


export const getResourceById = (req, res) => {
    const { resourceId } = req.params
    if (resourceId) {
        ResourceCollection.findOne({ _id: resourceId }, (err, resource) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (resource) {
                res.status(200).json(resource)
            } else {
                res.status(404).json({ message: 'Resource not found' })
            }
        })
    }
}