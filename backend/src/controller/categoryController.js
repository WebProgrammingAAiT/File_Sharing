import CategoryCollection from '../models/categoryModel.js';

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
//TODO delete category
// export const deleteCategory = (req, res) => {
//     const { id } = req.params
//     if (id) {
//         CategoryCollection.findOneAndDelete({ _id: id }, { new: true }, (err, deletedCategory) => {
//             if (err) {
//                 res.status(500).json({ message: err })
//             } else {
//                 res.status(200).json(deletedCategory)
//             }
//         });
//     } else {
//         res.status(400).json({ message: 'Category id required' })
//     }
// }
// function sortCategories(categories, parentId) {
//     const categoriesList = [];
//     let variyingCategoryList;
//     if (parentId == null) {
//         variyingCategoryList = categories.filter(cat => cat.parentId == undefined)
//     } else {
//         variyingCategoryList = categories.filter(cat => cat.parentId == parentId)
//     }

//     for (let cat of variyingCategoryList) {
//         categoriesList.push({ id: cat._id, name: cat.name, parentId: cat.parentId, children: sortCategories(categories, cat._id) })
//     }

//     return categoriesList;
// }