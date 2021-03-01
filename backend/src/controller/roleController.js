import RoleCollection from '../models/roleModel.js';
import UserCollection from '../models/userModel.js';


export const createRole = (req, res) => {
    const { name } = req.body;


    RoleCollection.create({ name }, (err, role) => {
        if (err) {
            res.status(500).send(err.message)
        } else {
            res.status(201).json({ message: "Role created successfully", role });
        }
    });
}
export const getRoles = (req, res) => {
    RoleCollection.find({}, (err, roles) => {
        if (err) {
            res.status(500).json(err)
        } else {
            res.status(200).json(roles)
        }
    })
}
export const getRole = (req, res) => {
    const { id } = req.params
    if (id) {
        RoleCollection.findOne({ _id: id }, (err, role) => {
            if (err) {
                res.status(500).json(err)
            } else {
                res.status(200).json(role)
            }
        })
    } else {
        res.status(400).json({ message: 'Role id required' })

    }
}

export const updateRole = (req, res) => {
    const { id } = req.params
    if (id) {
        RoleCollection.findOneAndUpdate({ _id: id }, { name: req.body.name }, { new: true }, (err, updatedRole) => {
            if (err) {
                res.status(500).json({ message: err })
            } else {
                res.status(200).json(updatedRole)
            }
        });
    } else {
        res.status(400).json({ message: 'Role id required' })
    }
}

export const deleteRole = (req, res) => {
    const { id } = req.params

    if (id) {

        RoleCollection.findOneAndDelete({ _id: id }, (err, role) => {
            if (err) {
                res.status(500).json({ message: err })
            } else if (role) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Role not found' })
            }
        })

    } else {
        res.status(400).json({ message: 'Role id is required' })
    }
}

export const assignUserRole = (req, res) => {
    const { userId } = req.params
    const roleId = req.query.roleId
    if (userId && roleId) {
        UserCollection.findOneAndUpdate({ _id: userId }, { role: roleId }, { new: true }, (err, updatedUser) => {
            if (err) {
                res.status(500).json({ message: err })
            } else {
                res.status(201).json(updatedUser)
            }
        });
    } else {
        res.status(400).json({ message: 'Role id and user Id required' })
    }
}
