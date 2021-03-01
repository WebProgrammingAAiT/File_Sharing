import CategoryCollection from '../models/categoryModel.js';
import ResourceCollection from '../models/resourceModel.js';
import fs from 'fs';

export const createCategory = (req, res) => {
    const { name, type } = req.body;
    let categoryObject = {
        name,
        type
    }
    if (req.body.parentId) {
        categoryObject.parentId = req.body.parentId
    }

    CategoryCollection.create(categoryObject, (err, category) => {
        if (err) {
            res.status(500).send(err.message)
        } else {
            res.status(201).json({ message: "Category created successfully", category: category });
        }
    });
}
export const getCategories = (req, res) => {
    CategoryCollection.find({}, (err, categories) => {
        if (err) {
            res.status(500).json(err)
        } else {
            // const sortedCategories = sortCategories(categories);
            res.status(200).json(categories)
        }
    })
}

export const updateCategory = (req, res) => {
    const { id } = req.params
    if (id) {
        CategoryCollection.findOneAndUpdate({ _id: id }, { name: req.body.name }, { new: true }, (err, updatedCategory) => {
            if (err) {
                res.status(500).json({ message: err })
            } else {
                res.status(200).json(updatedCategory)
            }
        });
    } else {
        res.status(400).json({ message: 'Category id required' })
    }
}

export const deleteCategory = (req, res) => {
    const { id } = req.params
    const { categoryType } = req.query
    if (id && categoryType) {

        ResourceCollection.find({ [categoryType]: id }, (err, resources) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (resources) {

                let resourcePromiseArray = []
                resources.forEach(resource => {
                    resourcePromiseArray.push(deleteResource(resource))
                })
                Promise.all(resourcePromiseArray)
                    .then(response => {
                        CategoryCollection.findOneAndDelete({ _id: id }, function (err, deletedCategory) {
                            if (err) {
                                console.log(err)
                                throw (err)
                            } else {
                                res.status(204).send();
                            }
                        });
                    })
                    .catch(error => res.status(500).json({ message: error }));


            } else {
                res.status(404).json({ message: 'Resources created by the given user not found' })

            }
        })




        // CategoryCollection.findOneAndDelete({ _id: id }, { new: true }, (err, deletedCategory) => {
        //     if (err) {
        //         res.status(500).json({ message: err })
        //     } else {
        //         res.status(200).json(deletedCategory)
        //     }
        // });
    } else {
        res.status(400).json({ message: 'Category id and category type required' })
    }
}

const deleteFileFromStorage = (filename) => {
    return new Promise((resolve, reject) => {
        try {
            fs.unlinkSync(filename);
            resolve("File is deleted.");
        } catch (error) {
            console.log(error)

            reject(error);
        }
    })
}

const deleteResource = (resource) => {
    return new Promise((resolve, reject) => {
        try {
            const files = resource.files;
            let promiseArray = [];

            files.forEach((file) => {
                promiseArray.push(deleteFileFromStorage(`./src/uploads/${file.name}`))
            })

            Promise.all(promiseArray)
                .then(response => {
                    ResourceCollection.findOneAndDelete({ _id: resource._id }, function (err, deletedResource) {
                        if (err) {
                            console.log(err)
                            throw (err)
                        } else (resolve(response))
                    });
                })
                .catch(error => {
                    console.log(error)
                    reject(error)
                });

        } catch (error) {
            console.log(error)
            reject(error);
        }
    })
}
