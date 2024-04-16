const {Product,User} = require('../sqlmodels');
//const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { CLOUDINARY_STORAGE } = require('../config/config');

async function getAll() {
    const page = 1; // 가져올 페이지 번호
    const pageSize = 10; // 페이지당 항목 수
    return await Product.findAndCountAll({
        offset: (page - 1) * pageSize,
        limit: pageSize
    });
    //Product.paginate();
}

async function findByCategory(category) {
    return await Product.findAll({
        where: {
            category: category
        }
    });
}

async function findById(id) {
    return await Product.findByPk(id);
}

async function edit(id, data) {
    return await Product.update(data, {
        where: {
            id: id
        }
    });
}

async function create(data, userId) {
    let product = new Product({...data})
    await product.save();

    return await User.updateOne({ _id: userId }, { $push: { createdSells: product } });
}

async function uploadImage(image) {
    const uploadResponse = await cloudinary.uploader.upload(image, {
        upload_preset: CLOUDINARY_STORAGE,
    }, { quality: "auto" });

    let imageUrl = uploadResponse.url;
    let index = (imageUrl.indexOf('upload/')) + 6;

    let compressedImg = imageUrl
        .substring(0, index) +
        "/c_fit,q_auto,f_auto,w_800" +
        imageUrl.substring(index);

    return compressedImg;
}

async function userCollectionUpdate(userId, product) {
    return await User.updateOne({ _id: userId }, { $push: { createdSells: product } });
}

async function findUserById(id) {
    return await User.findByPk(id);
}

module.exports = {
    create,
    getAll,
    findByCategory,
    findById,
    edit,
    uploadImage,
    userCollectionUpdate,
    findUserById
}
