const {ChatRoom} = require('../sqlmodels')

async function createChatRoom(buyer, seller) {
    /*let chatRoom = new ChatRoom({ buyer, seller})
    console.log(chatRoom)
    return await chatRoom.save();*/
    return await ChatRoom.create({ buyer, seller});
}

module.exports = {
    createChatRoom
}