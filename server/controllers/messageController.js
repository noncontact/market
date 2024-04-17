const router = require('express').Router();
const { Op } = require('sequelize');
const {ChatRoom,Dialog} = require('../sqlmodels')
const messageService = require('../services/messageService')

router.post('/createChatRoom', async (req, res) => {
    const { message, receiver } = req.body;
    try {
        let chatRoom = await messageService.createChatRoom(req.user._id, receiver);
        const dialog=new Dialog({chat_id:chatRoom.id , user_id : req.user._id , message});
        await dialog.save();
        //await Dialog.updateOne({ _id: chatRoom._id }, { $push: { conversation: { senderId: req.user._id, message } } })
        res.status(200).json({ messageId: chatRoom.id })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/getUserConversations', async (req, res) => {
    //let allChats = await ChatRoom.find().populate("buyer").populate("seller");
    //let userChats = allChats.filter(x => x.buyer._id == req.user._id || x.seller._id == req.user._id)
    //let checkedChats = userChats.map(x => ({ chats: x, isBuyer: (x.buyer._id == req.user._id), myId: req.user._id }))
    let userChats = await ChatRoom.findAll({
        where: {
            [Op.or]: [{ buyer: req.user._id }, { seller: req.user._id }],
        },
        include:[{
            model: Dialog,
            
        },{ 
            model: User,
            as: 'buyer', // buyerId와 연결된 User 모델을 가져오기 위해 as 옵션을 사용합니다.
        },{ 
            model: User,
            as: 'seller', // buyerId와 연결된 User 모델을 가져오기 위해 as 옵션을 사용합니다.
        },],
    });
    const checkedChats = userChats.map(x=>{
        let chatroom = {
            _id : x.id,
            buyer: x.buyer,
            seller: x.seller,
            conversation: x.dialogs
        };

        return {chats:chatroom,isBuyer:(x.buyer==req.user._id),myId:req.user._id}
    });
    res.status(200).json(checkedChats)
})

router.post('/sendMessage', async (req, res) => {
    const { chatId, message } = req.body;
    //let chat = await ChatRoom.updateOne({ _id: chatId }, { $push: { conversation: { senderId: req.user._id, message } } })
    const dialog=new Dialog({chat_id:chatId , user_id : req.user._id , message});
    await dialog.save();

    //console.log(chat)
    res.status(200).json({ sender: req.user._id });
})

module.exports = router;