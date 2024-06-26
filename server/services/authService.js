const {User, Product} = require('../sqlmodels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config/config');

async function registerUser(userData) {
    let { name, email, gender, phoneNumber, password, repeatPassword } = userData;
    let errors = [];
    let checkUser = await User.findOne({ 
        where: {
            email: email,
        },
     });
    if (checkUser) errors.push('This email address is already in use; ');
    if (name.length < 3 || name.length > 50) errors.push('Name should be at least 3 characters long and max 50 characters long; ')
    //if (/(\+)?(359|0)8[789]\d{1}(|-| )\d{3}(|-| )\d{3}/.test(phoneNumber) == false) errors.push('Phone number should be a valid BG number; ' );
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false) errors.push("Please fill a valid email address; " );
    if (password !== repeatPassword) errors.push("Passwords should match; " );
    if (password.length < 8) errors.push("Password should be at least 8 characters long; " );
    if (password.length > 20) errors.push("Password should be at max 20 characters long; " );
    if (errors.length >= 1) throw {message: [errors]}
    
    let user = new User(userData);
    return await user.save();
}

async function loginUser({ email, password }) {
    let user = await User.findOne({ 
        raw: true,
        where: {
            email: email,
        },
    });
    //console.log(2);
    if (!user) throw { message: 'Invalid email or password' };

    let hasValidPass = (password === user.password);
    if (!hasValidPass) throw { message: "Invalid email or password" }
    //console.log(3);
    let token = jwt.sign({ _id: user.id, email: user.email, phoneNumber: user.phoneNumber, createdSells: 0, avatar: user.avatar }, SECRET);
    //console.log(4);
    return token;
}

async function getUser(id) {
    return await User.findByPk(id);
}

module.exports = {
    registerUser,
    loginUser,
    getUser
}