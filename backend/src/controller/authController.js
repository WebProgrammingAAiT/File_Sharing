import UserCollection from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { customAlphabet } from 'nanoid';
const alphabet = '0123456789';

export const signUp = (req, res) => {
    const nanoid = customAlphabet(alphabet, 3);
    const { firstName, lastName, email, password } = req.body;

    // *Checking if user exists
    UserCollection.findOne({ email: email }, async (err, user) => {
        if (user) {
            res.status(400).json({ message: 'Email already in use' })
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            UserCollection.create({
                firstName: firstName, lastName: lastName, email: email, hashPassword, username: firstName + nanoid()
            }, async (err, createdUser) => {
                if (err) {
                    res.status(500).send(err.message)
                } else {
                    try {
                        const user = await UserCollection.findOne({ _id: createdUser._id })
                            .populate({ path: 'role', select: 'name ' })
                            .exec()
                        if (user) {
                            const secretKey = process.env.JWT_SECRET || 'somethingSecret'
                            const roleName = user.role.name
                            const token = jwt.sign({ _id: user._id, role: roleName }, secretKey, { expiresIn: '7d' });
                            const { _id, firstName, lastName, email, fullName, username, role, profilePicture } = user;
                            res.status(200).send({ token, user: { _id, firstName, lastName, email, role, fullName, username, profilePicture } })
                        }
                    } catch (e) {
                        res.status(500).json({ message: e.toString() })
                    }
                }
            });


        }
    });

}

export const signin = async (req, res) => {

    try {
        const user = await UserCollection.findOne({ email: req.body.email })
            .populate({ path: 'role', select: 'name ' })
            .exec()
        if (user) {
            const validCredential = await bcrypt.compare(req.body.password, user.hashPassword)
            if (validCredential) {
                const secretKey = process.env.JWT_SECRET || 'somethingSecret'
                const roleName = user.role.name

                const token = jwt.sign({ _id: user._id, role: roleName }, secretKey, { expiresIn: '7d' });
                const { _id, firstName, lastName, email, fullName, profilePicture, role } = user;
                res.status(200).send({ token, user: { _id, firstName, lastName, email, role, fullName, profilePicture } })

            }
            else {
                res.status(404).json({ message: 'Invalid credentials' })
            }
        } else {
            res.status(404).json({ message: 'Invalid credentials' })
        }

    } catch (e) {
        res.status(500).json({ message: e.toString() })
    }



}