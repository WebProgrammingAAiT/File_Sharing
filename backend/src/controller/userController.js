import UserCollection from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
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
                firstName: firstName, lastName: lastName, email: email, hashPassword, username: firstName + nanoid(), role: req.body.role ? req.body.role : 'user'
            }, (err, createdUser) => {
                if (err) {
                    res.status(500).send(err.message)
                } else {
                    const secretKey = process.env.JWT_SECRET || 'somethingSecret'
                    const token = jwt.sign({ _id: createdUser._id, role: createdUser.role }, secretKey, { expiresIn: '1d' });
                    const { _id, firstName, lastName, email, role, fullName, username } = createdUser;
                    res.status(200).send({ token, user: { _id, firstName, lastName, email, role, fullName, username } })
                }
            });


        }
    });

}

export const signin = (req, res) => {
    UserCollection.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            res.status(500).json({ message: err })
        } else if (user) {
            const validCredential = await bcrypt.compare(req.body.password, user.hashPassword)
            if (validCredential) {
                const secretKey = process.env.JWT_SECRET || 'somethingSecret'
                const token = jwt.sign({ _id: user._id, role: user.role }, secretKey, { expiresIn: '1d' });
                const { _id, firstName, lastName, email, role, fullName } = user;
                res.status(200).send({ token, user: { _id, firstName, lastName, email, role, fullName } })

            }
            else {
                res.status(404).json({ message: 'Invalid credentials' })
            }
        } else {
            res.status(404).json({ message: 'Invalid credentials' })
        }
    })
}