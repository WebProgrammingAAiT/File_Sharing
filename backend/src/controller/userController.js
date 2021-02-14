import UserCollection from '../models/userModel.js';



export const getUserById = (req, res) => {
    const { userId } = req.params

    if (userId) {
        UserCollection.findOne({ _id: userId }, (err, user) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (user) {
                res.status(200).json(user)
            } else {
                res.status(404).json({ message: 'User not found' })
            }
        })
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
