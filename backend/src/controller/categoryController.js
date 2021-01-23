import CategoryCollection from '../models/categoryModel.js';

export const createCategory = (req, res) => {
    const { name } = req.body;
    let categoryObject = {
        name: name
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
            const sortedCategories = sortCategories(categories);
            res.status(200).json(sortedCategories)
        }
    })
}

function sortCategories(categories, parentId) {
    const categoriesList = [];
    let variyingCategoryList;
    if (parentId == null) {
        variyingCategoryList = categories.filter(cat => cat.parentId == undefined)
    } else {
        variyingCategoryList = categories.filter(cat => cat.parentId == parentId)
    }

    for (let cat of variyingCategoryList) {
        categoriesList.push({ id: cat._id, name: cat.name, parentId: cat.parentId, children: sortCategories(categories, cat._id) })
    }

    return categoriesList;
}