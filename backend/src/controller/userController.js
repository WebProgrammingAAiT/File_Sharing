import UserCollection from '../models/userModel.js';
import bcrypt from 'bcrypt'
import ResourceCollection from '../models/resourceModel.js';
import mongoose from 'mongoose'
import fs from 'fs';



export const getUserById = async (req, res) => {
    const { userId } = req.params

    if (userId) {
        try {
            const user = await UserCollection.findOne({ _id: userId })
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
                .populate({ path: 'role', select: 'name' })
                .exec()
            if (user) {
                res.status(200).json(user)
            } else {
                res.status(404).json({ message: 'User not found' })
            }

        } catch (e) {
            res.status(500).json({ message: e.toString() })
        }


    }
}


export const getUsers = async (req, res) => {
    try {
        const users = await UserCollection.find({})
            .select('_id profilePicture role username email')
            .populate({ path: 'role', select: 'name' })
            .exec()
        res.status(200).json(users)

    } catch (e) {
        res.status(500).json({ message: e.toString() })
    }


}

export const updateUser = (req, res) => {
    const { userId } = req.params
    const { firstName, username, currentPassword, newPassword, year, department } = req.body;
    let profilePicture
    if (req.file) {
        profilePicture = req.file.filename
    }
    let updateObj = {}
    if (userId) {

        UserCollection.findOne({ _id: userId }, async (err, user) => {
            if (err) {
                res.status(500).json(err)
            } else if (user) {
                if (newPassword !== undefined && newPassword !== '') {
                    const validCredential = await bcrypt.compare(currentPassword, user.hashPassword)
                    if (validCredential) {
                        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

                        if (year !== undefined && year !== '' && department !== undefined && department !== '') {
                            updateObj = { firstName, username, year, department, hashPassword: hashedNewPassword }
                        } else {
                            updateObj = { firstName, username, hashPassword: hashedNewPassword }
                        }
                        if (profilePicture !== undefined) {
                            updateObj.profilePicture = profilePicture
                        }
                        UserCollection.findOneAndUpdate({ _id: userId }, updateObj, { new: true }, (err, updatedUser) => {
                            if (err) {
                                res.status(500).json({ message: err })
                            } else {
                                res.status(201).json(updatedUser)
                            }
                        });
                    } else {
                        res.status(400).json({ message: 'Your current password is not correct' })

                    }
                } else if (year !== undefined && year !== '' && department !== undefined && department !== '') {
                    if (profilePicture !== undefined) {
                        updateObj.profilePicture = profilePicture
                    }
                    updateObj = { firstName, username, year, department }
                    UserCollection.findOneAndUpdate({ _id: userId }, updateObj, { new: true }, (err, updatedUser) => {
                        if (err) {
                            res.status(500).json({ message: err })
                        } else {
                            res.status(201).json(updatedUser)
                        }
                    });
                } else {
                    if (profilePicture !== undefined) {
                        updateObj = { firstName, username, profilePicture }
                    } else {
                        updateObj = { firstName, username }
                    }
                    UserCollection.findOneAndUpdate({ _id: userId }, updateObj, { new: true }, (err, updatedUser) => {
                        if (err) {
                            res.status(500).json({ message: err })
                        } else {
                            res.status(201).json(updatedUser)
                        }
                    });
                }

            } else {
                res.status(404).json({ message: 'User not found' })

            }
        })

    } else {
        res.status(400).json({ message: 'User id required' })
    }

}
export const deleteUser = (req, res) => {
    const userId = req.params.userId
    if (userId) {
        ResourceCollection.find({ createdBy: userId }, (err, resources) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (resources) {
                let resourcePromiseArray = []

                resources.forEach(resource => {
                    resourcePromiseArray.push(deleteResource(resource))
                })
                Promise.all(resourcePromiseArray)
                    .then(response => {
                        UserCollection.findOneAndDelete({ _id: userId }, function (err, deletedUser) {
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

    } else {
        res.status(400).json({ message: 'User id required' })
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

