const {User} = require('../sqlmodels');


async function edit(userId, userData) {
    //return await User.updateOne({ _id: userId }, { $set: { ...userData } });
    return await User.update(userData, {
        where: {
            id: userId
        }
    });
}

async function getUserById(userId) {
    return await User.findByPk(userId);
}

module.exports = {
    edit,
    getUserById
    // userCollectionUpdate,
    // findUserById
}