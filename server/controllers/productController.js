const { Router } = require('express');
const router = Router();
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth')
const {Product,User, Wishlist} = require('../sqlmodels');
//const User = require('../models/User');
const moment = require('moment');

const productService = require('../services/productService');

router.get('/', async (req, res) => {
    const { page, search } = req.query;
    const pageSize = 10; // 페이지당 아이템 수
    const offset = (page - 1) * pageSize;
    try {
        let products;
        products = await Product.findAll({
            offset: offset, // 오프셋 설정
            limit: pageSize, // 페이지 크기 설정 
            raw: true,
            attributes: [
                ['id', '_id'], // 'id' 필드를 '_id'로 변경
                "title",
                "category",
                "description",
                "price",
                "city",
                "image",
                "addedAt",
                "seller",
                "active"
            // 다른 필드들
            ]});

        if(products.length!=0){
        if (search !== '' && search !== undefined) {
            products = products.filter(x => x.active == true)
            products = products.filter(x => x.title.toLowerCase().includes(search.toLowerCase()) || x.city.toLowerCase().includes(search.toLowerCase()))
            
        } else {
            products = products.filter(x => x.active == true)
        }
        }
        //console.log(products);
        res.status(200).json({ products, pages: page });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/:category', async (req, res) => {
    const { page } = req.query;
    const pageSize = 10; // 페이지당 아이템 수
    const offset = (page - 1) * pageSize;
    try {
        let products = await Product.findAll({
            offset: offset, // 오프셋 설정
            limit: pageSize, // 페이지 크기 설정 
            where: {
                category: req.params.category
            },
            raw: true,
            attributes: [
                ['id', '_id'], // 'id' 필드를 '_id'로 변경
                "title",
                "category",
                "description",
                "price",
                "city",
                "image",
                "addedAt",
                "seller",
                "active"
            // 다른 필드들
            ]
        });
        res.status(200).json({ products, pages: page });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/specific/:id', async (req, res) => {
    try {
        let product = (await Product.findByPk(req.params.id,{
            raw: true,
            attributes:[['id', '_id'], // 'id' 필드를 '_id'로 변경
                "title",
                "category",
                "description",
                "price",
                "city",
                "image",
                "addedAt",
                "seller",
                "active"]
        }))
        
        let seller = (await User.findByPk(product.seller,{raw: true,}))
        //console.log(seller);
        product.addedAt = moment(product.addedAt).format('d MMM YYYY (dddd) HH:mm')
        let jsonRes = {
            ...product,
            name: seller.name,
            phoneNumber: seller.phoneNumber,
            email: seller.email,
            createdSells: 5,
            avatar: seller.avatar,
            sellerId: seller.id,
            isAuth: false
        }
        if (req.user) {
            //let user = await User.findByPk(req.user._id);
            let wishlist = await Wishlist.findAll({
                raw: true,
                where: {
                    [Op.and]: [{ product_id: req.params.id }, { user_id: req.user._id }],
                }
            });
            jsonRes.isSeller = Boolean(req.user._id == product.seller);
            jsonRes.isWished = Boolean(wishlist.length!=0);
            jsonRes.isAuth = true
        }
        res.status(200).json(jsonRes);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.post('/create', async (req, res) => {
    let { title, price, description, city, category, image } = req.body;
    try {
        let errors = [];
        if (title.length < 3 || title.length > 50) errors.push('Title should be at least 3 characters long and max 50 characters long; ');
        if (isNaN(Number(price))) errors.push('Price should be a number; ');
        if (description.length < 10 || description.length > 1000) errors.push('Description should be at least 10 characters long and max 1000 characters long; ');
        if (/^[A-Za-z]+$/.test(city) == false) errors.push('City should contains only english letters; ')
        if (!image.includes('image')) errors.push('The uploaded file should be an image; ');
        if (!category) errors.push('Category is required; ');

        if (errors.length >= 1) throw { message: [errors] };

        let compressedImg = await productService.uploadImage(image);
        let product = new Product({
            title, price, description, city, category,
            image: compressedImg,
            addedAt: new Date(),
            seller: req.user._id
        })

        await product.save();
        //await productService.userCollectionUpdate(req.user._id, product);
        //console.log(product);
        res.status(201).json({ productId: product.id });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message })
    }
});

router.patch('/edit/:id', isAuth, async (req, res) => {
    //TODO: Rewrite this 
    let { title, price, description, city, category, image } = req.body;
    try {
        let user = await productService.findUserById(req.user._id);
        let product = await productService.findById(req.params.id);
        let errors = [];
        if (user.id.toString() !== product.seller.toString()) {
            errors.push('You have no permission to perform this action! ')
        }

        if (title.length < 3 || title.length > 50) errors.push('Title should be at least 3 characters long and max 50 characters long; ');
        if (isNaN(Number(price))) errors.push('Price should be a number; ');
        if (description.length < 10 || description.length > 1000) errors.push('Description should be at least 10 characters long and max 1000 characters long; ');
        if (/^[A-Za-z]+$/.test(city) == false) errors.push('City should contains only english letters; ')
        if (req.body.image) {
            if (!req.body.image.includes('image')) errors.push('The uploaded file should be an image; ');
        }
        if (!category || category == "Choose...") errors.push('Category is required; ');

        if (errors.length >= 1) throw { message: [errors] };

        if (req.body.image) {
            let compressedImg = await productService.uploadImage(req.body.image);
            await productService.edit(req.params.id, { title, price, description, city, category, image: compressedImg });
        } else {
            await productService.edit(req.params.id, { title, price, description, city, category });
        }
        res.status(201).json({ message: 'Updated!' });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
})

router.get('/sells/active/:id', async (req, res) => {
    try {
        let userId = '';
        if (req.params.id) {
            userId = req.params.id
        } else {
            userId = req.user._id
        }
        //let user = await (await User.findById(userId).populate('createdSells')).toJSON();
        let product = (await Product.findAll({
            where: {
                seller: userId ,
            },
            raw: true,
            attributes: [
                ['id', '_id'], // 'id' 필드를 '_id'로 변경
                "title",
                "category",
                "description",
                "price",
                "city",
                "image",
                "addedAt",
                "seller",
                "active"
            // 다른 필드들
            ]
        }));
        //console.log(product);
        res.status(200).json({ sells: product.filter(x => x.active) });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/sells/archived/', async (req, res) => {
    try {
        //console.log(req.user._id);
        let product = (await Product.findAll({
            where: {
                seller: req.user._id,
            },
            raw: true,
            attributes: [
                ['id', '_id'], // 'id' 필드를 '_id'로 변경
                "title",
                "category",
                "description",
                "price",
                "city",
                "image",
                "addedAt",
                "seller",
                "active"
            // 다른 필드들
            ]
        }));
        res.status(200).json({ sells: product.filter(x => x.active == false) });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/enable/:id', async (req, res) => {
    try {
        //await Product.updateOne({ _id: req.params.id }, { active: true });
        await Product.update({ active: true }, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Activated" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/archive/:id', async (req, res) => {
    try {
        //await Product.updateOne({ _id: req.params.id }, { active: false });
        await Product.update({ active: false }, {
            where: {
                id: req.params.id
            }
        });
        res.status(200).json({ msg: "Archived" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});


router.get('/wish/:id', async (req, res) => {
    try {
        //let user = await User.findByPk(req.user._id);
        let wishlist = await Wishlist.findAll({
            where: {
                [Op.and]: [{ product_id: req.params.id }, { user_id: req.user._id }],
            }
        });

        if (wishlist.length===0) {
            //await User.updateOne({ _id: req.user._id }, { $push: { wishedProducts: req.params.id } })
            //await Product.updateOne({ _id: req.params.id }, { $push: { likes: user } });
            let wish=new Wishlist({product_id : req.params.id , user_id : req.user._id});
            await wish.save();
            res.status(200).json({ msg: "wished" });
        } else {
            //await User.updateOne({ _id: req.user._id }, { $pull: { wishedProducts: req.params.id } })
            //await Product.updateOne({ _id: req.params.id }, { $pull: { likes: req.user._id } });
            await Wishlist.destroy({
                where: {
                    [Op.and]: [{ product_id: req.params.id }, { user_id: req.user._id }],
                }
            });
            res.status(200).json({ msg: "unwished" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.get('/wishlist/:id', async (req, res) => {
    try {
        //let user = await (await User.findById(req.user._id).populate('wishedProducts')).toJSON();
        let wishlist =await Wishlist.findAll({
            where: {
                user_id: req.user._id ,
            },
            raw:true,
            include:[{
                model: Product,
                //raw:true,
            },],
        });
        let products=wishlist.map(result => {
            return {
              _id: result[ 'Product.id'],
              title: result['Product.title'],
              category: result['Product.category'],
              description: result['Product.description'],
              price: result['Product.price'],
              city: result['Product.city'],
              image: result['Product.image'],
              addedAt: result['Product.addedAt'],
              seller: result['Product.seller'],
              active: result['Product.active']
        }});
        //console.log(products);
        res.status(200).json({ wishlist: products });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});


module.exports = router;