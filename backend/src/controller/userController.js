import UserCollection from '../models/userModel.js';
import bcrypt from 'bcrypt'



export const getUserById = async (req, res) => {
    const { userId } = req.params

    if (userId) {
        try {
            const user = await UserCollection.findOne({ _id: userId })
                .populate({ path: 'year', select: 'name ' })
                .populate({ path: 'department', select: 'name' })
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


export const getUsers = (req, res) => {
    UserCollection.find({}, (err, users) => {
        if (err) {
            res.status(500).json(err)
        } else {
            res.status(200).json(users)
        }
    })
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