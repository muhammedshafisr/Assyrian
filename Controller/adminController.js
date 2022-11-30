const { ObjectID, ObjectId } = require('mongodb');
const { response } = require('express');
const Admin = require('../model/admin');
const productModel = require('../model/products');
const orderModel = require('../model/order');
const couponModel = require('../model/coupon')
const User = require('../model/user');
const headerModel = require('../model/header');
const categoryModel = require('../model/category')

let path;

// getting signInPage
const getSignInPage = (req, res) => {
    if (req.session.adminloggedIn) {
        res.render('admin/adminDashboard', { path: path })
    } else {
        res.render('admin/adminLogin')
    }
}

//getChartData
const getChartData = (req, res) => {
    orderModel.aggregate([
        {
            $project : {
                "day" : { "$dayOfMonth": "$createdAt" },
                "month" : { "$month": "$createdAt" },
                'year' : { "$year" : '$createdAt' }
            }
        },
        {
            $group: {
                _id: { 
                    day : '$day',
                    month : '$month',
                    year : '$year'
                },
                count: { $count: {} }
            }
        }
        ,{
            $limit: 7
        },
        {
            $sort : { _id : 1 }
        }
    ])
        .then((resolve) => {
            res.json(resolve)
        })

}

// admin signingIn
const signIn = (req, res) => {

    const { username, password } = req.body

    if (username == '' || password == '') {
        res.render('admin/adminLogin', { alertOne: 'inputbox cannot be empty' });
    } else {

        Admin.findOne({ username: username }).then((resolve) => {

            if (resolve == null) {
                res.render('admin/adminLogin', { alertOne: 'username or password is incorrect' });
            } else if (resolve.password != password) {
                res.render('admin/adminLogin', { alertOne: 'username or password is incorrect' });
            } else {
                path = resolve.path
                req.session.adminloggedIn = true;
                res.redirect('/admin')
            }

        }).catch((err) => {
            console.log(err)
        })

    }
}


// admin logout
const logOut = (req, res) => {

    req.adminloggedIn = false;
    res.render('admin/adminLogin')
}


// get productsList
const getProductsList = (req, res) => {

    productModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            res.render('admin/productsList', {
                path: path,
                items: items
            })
        }
    });

}

// add products

const getAddProducts = (req, res) => {

    categoryModel.find()
    .then((resolve) => {
        res.render('admin/addProducts', { path, resolve })
    })
}

const postAddProducts = (req, res) => {

    const {

        productname,
        category,
        sleeve,
        fabric,
        ideal,
        size,
        price,
        packof,
        imageOne,
        imageTwo,
        description

    } = req.body

    const products = new productModel({

        productName: productname,
        category: category,
        sleeve: sleeve,
        fabric: fabric,
        idealFor: ideal,
        size: size,
        price: price,
        packOf: packof,
        imageOne: imageOne,
        imageTwo: imageTwo,
        description: description

    })

    products.save().then((resolve) => {
        res.redirect('/productsList')

    }).catch((err) => {
        console.log(err)
    })


}

// userlist

const getUserList = (req, res) => {

    User.find().then((resolve) => {
        res.render('admin/userList', {
            path: path,
            items: resolve
        })
    }).catch((err) => {
        console.log(err)
    })

}

// active products

const activeProduct = (req, res) => {

    let id = req.url.slice(14)
    productModel.updateOne({
        _id: ObjectID(id)
    }, {
        $set: {
            status: 'instock'
        }
    }).then((resolve) => {
        res.redirect('/productsList')
    }).catch((err) => {
        console.log(err)
    })


}


// inactive product

const inactiveProduct = (req, res) => {

    let id = req.url.slice(16)
    console.log(id)
    productModel.updateOne({
        _id: ObjectID(id)
    }, {
        $set: {
            status: 'out of stock'
        }
    }).then((resolve) => {
        res.redirect('/productsList')

    }).catch((err) => {
        console.log(err)
    })

}

// get edit product

const getEditProduct = (req, res) => {

    let id = req.url.slice(12)
    productModel.findOne({ _id: ObjectID(id) }).then((resolve) => {

        res.render('admin/editProduct', {
            product: resolve,
            path: path
        })
    }).catch((err) => {
        console.log(err)
    })

}

// edit product work in progress!

const editProduct = (req, res) => {
    const {
        productname,
        category,
        sleeve,
        fabric,
        ideal,
        size,
        price,
        packof,
        imageOne,
        imageTwo,
        description,
        productId

    } = req.body

    productModel.updateOne({
        _id : ObjectId(productId)
    },
    {
        $set : {
        productname,
        category,
        sleeve,
        fabric,
        ideal,
        size,
        price,
        packof,
        imageOne,
        imageTwo,
        description,
        }
    })
    .then((resolve) => {
        res.redirect('/productsList')
    })
}

// block user
const blockUser = (req, res) => {

    let id = req.url.slice(6)
    User.updateOne({
        _id: ObjectID(id)
    }, {
        $set: {
            userStatus: 'block'
        }
    }).then((resolve) => {
        res.redirect('/userList')
    }).catch((err) => {
        console.log(err)
    })

}

// unblock user
const unBlockUser = (req, res) => {

    let id = req.url.slice(8)
    console.log(id)
    User.updateOne({
        _id: ObjectID(id)
    }, {
        $set: {
            userStatus: 'active'
        }
    }).then((resolve) => {
        res.redirect('/userList')
    }).catch((err) => {
        console.log(err)
    })

}

// get ordersList
const getOrdersList = (req, res) => {
    orderModel.aggregate([
        {
            $unwind: '$products'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'result'
            }
        },
        {
            $sort : {
                _id : -1
            }
        }
    ]).then((resolve) => {
        res.render('admin/orders', { resolve })
    })
}

// confirmOrder
const confirmOrder = async (req, res) => {
    const { productId, id } = req.query
    const status = 'confirmed'
    const item = await statusChanger(id, productId, 16, status)
    res.redirect('/orders')
}

// itemshipped
const itemShipped = async (req, res) => {
    const { productId, id } = req.query
    const status = 'shipped'
    const item = await statusChanger(id, productId, 40, status)
    res.redirect('/orders')
}

// out for delivery
const outForDelivery = async (req, res) => {
    const { productId, id } = req.query
    const status = 'outForDelivery'
    const item = await statusChanger(id, productId, 65, status)
    res.redirect('/orders')
}


// itemDelivered
const itemDelivered = async (req, res) => {
    const { productId, id } = req.query
    const status = 'delivered'
    const item = await statusChanger(id, productId, 100, status)
    res.redirect('/orders')
}


// statusChanger
const statusChanger = async (id, productId, num, status) => {

    const changer = await orderModel.updateOne({
        _id: ObjectID(id),
        'products.productId': ObjectID(productId)
    }, {
        $set: {
            'products.$.percentage': num,
            'products.$.status': status
        }
    }).then((resolve) => {
        console.log(resolve)
        return resolve
    })

    return changer
}


// getHeaders
const getHeaders = (req, res) => {
    headerModel.find().then((resolve) => {
        console.log(resolve)
        res.render('admin/header', { resolve })
    })
}

// changeHeader
const changeHeader = (req, res) => {
    const id = req.query.id
    const {
        backgroundImage_1,
        smallTextImage_1,
        headImage_1,
        titleOne_1,
        titleTwo_1,
        titleThree_1,
        titleFour_1,
        backgroundImage_2,
        smallTextImage_2,
        headImage_2,
        titleOne_2,
        titleTwo_2,
        titleThree_2,
        titleFour_2
    } = req.body
    console.log(req.body)
    headerModel.find().then((resolve) => {
        console.log('this is the resolve')
        console.log(resolve)
        console.log('ended here...')
        if (!resolve) {
            console.log('not resolve')
            console.log('resolved')
            header = new headerModel({
                slider1: {
                    backgroundImage: backgroundImage_1,
                    smallTextImage: smallTextImage_1,
                    headImage: headImage_1,
                    titleOne: titleOne_1,
                    titleTwo: titleTwo_1,
                    titleThree: titleThree_1,
                    titleFour: titleFour_1
                },
                slider2: {
                    backgroundImage: backgroundImage_2,
                    smallTextImage: smallTextImage_2,
                    headImage: headImage_2,
                    titleOne: titleOne_2,
                    titleTwo: titleTwo_2,
                    titleThree: titleThree_2,
                    titleFour: titleFour_2
                }
            })
            header.save().then((resolve) => {
                res.redirect('/headers')
            })
        } else {
            headerModel.updateOne({
                _id: ObjectID(id)
            }, {
                $set: {

                    'slider1.backgroundImage': backgroundImage_1,
                    'slider1.smallTextImage': smallTextImage_1,
                    'slider1.headImage': headImage_1,
                    'slider1.titleOne': titleOne_1,
                    'slider1.titleTwo': titleTwo_1,
                    'slider1.titleThree': titleThree_1,
                    'slider1.titleFour': titleFour_1,
                    'slider2.backgroundImage': backgroundImage_2,
                    'slider2.smallTextImage': smallTextImage_2,
                    'slider2.headImage': headImage_2,
                    'slider2.titleOne': titleOne_2,
                    'slider2.titleTwo': titleTwo_2,
                    'slider2.titleThree': titleThree_2,
                    'slider2.titleFour': titleFour_2

                }
            }).then((resolve) => {
                console.log(resolve)
                res.redirect('/headers')
            }).catch((err) => {
                console.log(err)
            })
        }
    })

}

// get coupon
const getCoupon = (req, res) => {
    couponModel.find()
        .then((resolve) => {
            console.log(resolve)
            res.render('admin/coupon', { resolve })
        })
        .catch((err) => {
            console.log(err)
        })
}

//get coupon
const getAddCoupon = (req, res) => {
    res.render('admin/addCoupon')
}

//addCoupon
const addCoupon = (req, res) => {
    const {
        image,
        name,
        reqAmount,
        amount
    } = req.body

    coupon = new couponModel({
        image,
        amount,
        couponName: name,
        requiredAmount: reqAmount
    })

    coupon.save()
        .then((resolve) => {
            res.redirect('/coupon')
        })
        .catch((err) => {
            console.log(err)
        })
}

//category management
const getCategory = (req, res) => {
    categoryModel.find()
    .then((resolve) => {
        console.log(resolve)
        res.render('admin/categories', { resolve })
    })
}

//add category
const addCategory = (req, res) => {
    const {
        name
    } = req.body
    category = new categoryModel({
        category : name
    })

    category.save()
    .then((resolve) => {
        res.json({ status : true })
    })
}



module.exports = {
    getSignInPage,
    signIn,
    logOut,
    getProductsList,
    getAddProducts,
    postAddProducts,
    getUserList,
    activeProduct,
    inactiveProduct,
    getEditProduct,
    editProduct,
    blockUser,
    unBlockUser,
    getOrdersList,
    confirmOrder,
    itemShipped,
    outForDelivery,
    itemDelivered,
    getHeaders,
    changeHeader,
    getCoupon,
    getAddCoupon,
    addCoupon,
    getChartData,
    getCategory,
    addCategory
}
