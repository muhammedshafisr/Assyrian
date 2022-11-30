const mongoose = require('mongoose')
const { ObjectId } = require("mongodb");
const productModel = require('../model/products');
const Users = require('../model/user');
const cartModel = require('../model/cart');
const wishlistModel = require('../model/wishlist');
const orderModel = require('../model/order');
const headerModel = require('../model/header');
const couponModel = require('../model/coupon');
require("dotenv").config()
const authToken = process.env.authToken
const accountSID = process.env.accountSID
const serviceID = process.env.serviceID
const client = require('twilio')(accountSID, authToken);
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const userCouponModel = require('../model/userCoupon');
const categoryModel = require('../model/category');
const { resolve } = require('path');

var instance = new Razorpay({ key_id: 'rzp_test_99ev8foDTy64Tk', key_secret: 'btuL1bQteuZrjOOScnkIpD0x' })



let user = [];
//getHomePage!
const requestingForHomePage = (req, res) => {
    productModel.find().then((resolve) => {
        const items = resolve
        headerModel.find().then((resolve) => {
            const header = resolve
            if (req.session.userloggedIn) {
                const userId = req.session.user._id
                couponModel.find().then((resolve) => {
                    const coupons = resolve
                    cartModel.findOne({userId: userId}).then((resolve) => {
                        if (resolve) {
                            const cartItems = resolve
                            categoryModel.find().then((resolve) => {
                                const categories = resolve
                                res.render('user/home', {
                                    username: user,
                                    items: items,
                                    cart: cartItems.products,
                                    header,
                                    coupons,
                                    categories
                                })
                            })
                        } else {
                            categoryModel.find().then((resolve) => {
                                const categories = resolve
                                res.render('user/home', {
                                    username: user,
                                    items: items,
                                    cart: null,
                                    header,
                                    coupons,
                                    categories
                                })
                            })
                        }
                    }).catch((err) => {
                        console.log(err)
                    })

                })

            } else {
                categoryModel.find().then((resolve) => {
                    const categories = resolve
                    res.render('user/home', {
                        items: items,
                        cart: null,
                        header,
                        categories
                    })
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    }).catch((err) => {
        console.log(err)
    })

}




// signIN
const signInPost = (req, res) => {

    const {userEmail, userPassword} = req.body
    Users.findOne({email: userEmail}).then(async (resolve) => {
        if (resolve == null) {
            console.log(typeof parseInt(userEmail) == 'number')
            console.log(isNaN(userEmail))
            if (isNaN(userEmail)) {
                res.render('user/login', {mssgOne: 'This email / mobile is not registered'})
            } else if (parseInt(userEmail) == 'number' || typeof parseInt(userEmail) == 'number') {
                Users.findOne({phone: userEmail}).then(async (ress) => {

                    if (ress == null) {
                        res.render('user/login', {mssgOne: 'This email / mobile is not registered'})
                    } else if (ress.userStatus == 'block') {
                        res.render('user/login', {mssgOne: 'This user is blocked'})
                    } else {

                        user = ress
                        const auth = await bcrypt.compare(userPassword, user.password);
                        if (auth) {
                            req.session.user = ress
                            req.session.userloggedIn = true
                            res.redirect('/')
                        } else {
                            res.render('user/login', {mssgTwo: 'Password is incorrect'})
                        }
                    }
                })
            } else {
                res.render('user/login', {mssgOne: 'This email / mobile is not registered'})
            }

        } else {
            user = resolve
            if (resolve.userStatus == 'block') {
                res.render('user/login', {mssgOne: 'This user is blocked'})
            } else {

                const auth = await bcrypt.compare(userPassword, user.password);
                if (auth) {
                    req.session.user = resolve
                    req.session.userloggedIn = true
                    res.redirect('/')
                } else {
                    res.render('user/login', {mssgTwo: 'Password is incorrect'})
                }
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

// SIGNIN END


// OTP LogIN
const sendOTP = (req, res) => {

    const userEmail = req.body.email
    Users.findOne({email: userEmail}).then((resolve) => {
        if (resolve == null) {
            Users.findOne({phone: userEmail}).then((resolve) => {
                if (resolve == null) {
                    resolve.render('user/login', {mssgOne: 'This email / mobile is not registered'})
                } else if (resolve.userStatus == 'block') {
                    reolves.render('user/login', {mssgOne: 'This user is blocked'})
                } else {

                    user = resolve.username
                    phone = resolve.phone

                    Users.findOne({phone: phone}).then((resolve) => {

                        if (resolve == null) {
                            resolve.render('user/login', {mssgOne: 'This email / mobile is not registered'})
                        } else {
                            client.verify.services(serviceID).verifications.create({
                                to: '+91' + phone,
                                channel: 'sms'
                            })
                            res.render('user/otpAuth', {phone: phone})
                        }
                    }).catch((err) => {
                        console.log(err, 'here')
                        res.render('user/loginWithOtp', {alertOne: 'please check your internet'})
                    })
                }
            })

        } else {
            user = resolve.username
            phone = resolve.phone
            if (resolve.userStatus == 'block') {
                res.render('user/login', {mssgOne: 'This user is blocked'})
            } else {
                client.verify.services(serviceID).verifications.create({
                    to: '+91' + phone,
                    channel: 'sms'
                })
                res.render('user/otpAuth', {phone: phone})
            }
        }
    })
}



// OTP logIN verifying
const verifyOtpLogin = (req, res) => {

    const {indexOne, indexTwo, indexThree, indexFour} = req.body
    const phone = req.params.id
    let code = [indexOne, indexTwo, indexThree, indexFour].join('')
    console.log(code, req.params.id, phone);
    client.verify.services(serviceID).verificationChecks.create({
        to: '+91' + phone,
        code: code
    }).then((resolve) => {
        if (resolve.valid == true) {
            Users.findOne({phone: phone}).then((resolve) => {
                user = resolve
                req.session.user = resolve
                req.session.userloggedIn = true
                res.redirect('/')
            }).catch((err) => {
                console.log(err)
            })
        } else {
            res.render('user/otpAuth', {
                phone: phone,
                alertOne: 'Please enter a valid otp'
            })
        }
    }).catch((err) => {
        console.log('i am here two', err)
        res.render('user/otpAuth', {
            phone: phone,
            alertOne: 'Please enter a valid otp'
        })
    })

}

//single product view
const productView = (req, res) => {
    let id = req.url.slice(12)
    if (mongoose.isValidObjectId(id)) {
        productModel.findOne({ _id: ObjectId(id) }).then((resolve) => {
            const items = resolve
            console.log('he')
            if (req.session.userloggedIn) {
                const userId = req.session.user._id
                cartModel.findOne({ userId: req.session.user._id }).then((resolve) => {
                    const cart = resolve
                    cartModel.findOne({ userId: userId, 'products.productId': id }).then((resolve) => {
                        if (resolve) {
                            res.render('user/productView', {
                                username: user,
                                items: items,
                                cart: cart,
                                status: true
                            })
                        } else {
                            res.render('user/productView', {
                                username: user,
                                items: items,
                                cart: cart,
                                status: false
                            })
                        }

                    })
                })
            } else {
                res.render('user/productView', { items: items })
            }

        }).catch((err) => {
            console.log(err)
            res.render('user/404')
        })
    } else {
        res.render('user/404')
    }
}


// get cart products anytime!
const getCartProducts = (id) => {
    const userId = id
    return new Promise((resolve, reject) => {
        const cartProducts = cartModel.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    productId: '$products.productId',
                    quantity: '$products.quantity',
                    productName: '$products.productName'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1,
                    quantity: 1,
                    products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }

        ])

        resolve(cartProducts)
    })
}


// get cart
const getCart = (req, res) => {
    if (req.session.userloggedIn) {
        const userId = user._id.valueOf()
        cartModel.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    productId: '$products.productId',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    item: 1,
                    quantity: 1,
                    products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }

        ]).then(async (resolve) => {
            if (resolve.length === 0) {
                res.render('user/shoppingCart', {
                    username: user,
                    items: 'newCart'
                })
            } else {
                let total = await getTotalAmount(userId)
                res.render('user/shoppingCart', {
                    username: user,
                    items: resolve,
                    cart: resolve,
                    total: total.total
                })
            }
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.render('user/shoppingCart', {messOne: 'notLoggedIn'})
    }
}


// add to cart
const addToCart = (req, res) => {
    console.log('1')
    if (req.session.userloggedIn) {
        const { count, productId } = req.body
        const userId = req.session.user._id
        productModel.findOne({ _id: productId }).then((resolve) => {
            const { productName } = resolve
            cartModel.findOne({ userId: userId }).then((resolve) => {
                if (!resolve) {
                    cart = new cartModel({

                        userId: userId,
                        products: {
                            productId: productId,
                            quantity: count
                        }
                    })

                    cart.save().then((resolve) => {
                        wishlistModel.findOne({
                            userId: userId,
                            'products.productId': ObjectId(productId)
                        }).then((resolve) => {
                            if (!resolve) {
                                res.json({ status: 'itemAddedToTheCart', productName: productName })
                            }
                            else {
                                wishlistModel.updateOne({
                                    userId: userId
                                }, {
                                    $pull: {
                                        products: {
                                            productId: ObjectId(productId)
                                        }
                                    }
                                })
                                    .then((resolve) => {
                                        res.json({ status: 'itemAddedToTheCart', productName: productName })
                                    })
                            }
                        })
                    }).catch((err) => {
                        console.log(err)
                    })
                } else {
                    console.log(2)
                    cartModel.findOne({
                        userId: userId,
                        'products.productId': ObjectId(productId)
                    })
                        .then((resolve) => {
                            if (!resolve) {
                                console.log(3)
                                cartModel.updateOne({
                                    userId: userId
                                }, {
                                    $push: {
                                        products: {
                                            productId: productId,
                                            quantity: count
                                        }
                                    }
                                }).then((resolve) => {
                                    wishlistModel.findOne({
                                        userId: userId,
                                        'products.productId': ObjectId(productId)
                                    }).then((resolve) => {
                                        if (!resolve) {
                                            res.json({ status: 'itemAddedToTheCart', productName: productName })
                                        }
                                        else {
                                            wishlistModel.updateOne({
                                                userId: userId
                                            }, {
                                                $pull: {
                                                    products: {
                                                        productId: ObjectId(productId)
                                                    }
                                                }
                                            })
                                                .then((resolve) => {
                                                    res.json({ status: 'itemAddedToTheCart', productName: productName })
                                                })
                                        }
                                    })
                                }).catch((err) => {
                                    console.log(err)
                                })
                            }
                            else {
                                console.log(4)
                                res.json({ status: 'redirect' })
                            }

                        })
                }

            })
        })

    } else {
        res.json({ status: 'notLogged' })
    }

}


// remove cart item
const removeCartItem = (req, res) => {
    let id = req.params.id
    let userId = user._id.valueOf()
    if (req.session.userloggedIn) {
        cartModel.findOne({ userId: userId }).then((resolve) => {
            console.log(resolve, id)
            if (resolve.products.length == 1) {
                cartModel.deleteOne({ userId: userId }).then((resolve) => {
                    res.redirect('/shoppingCart')
                })
            } else {
                console.log('hiih')
                cartModel.updateOne({
                    userId: userId
                }, {
                    $pull: {
                        products: {
                            productId: ObjectId(id)
                        }
                    }
                }).then((resolve) => {
                    cartModel.find().then((resolve) => {
                        console.log(resolve)
                    })

                    res.redirect('/shoppingCart')
                })

            }
        })
    } else {
        res.redirect('/shoppingCart')
    }

}


// changing quantity
const changeQuantity = (req, res) => {
    const { userId, productId, count } = req.body
    cartModel.aggregate([
        {
            $match: {
                userId: userId
            }
        }, {
            $unwind: '$products'
        }, {
            $match: {
                'products.productId': ObjectId(productId)
            }
        }
    ]).then(async (resolve) => {
        if (resolve[0].products.quantity <= 1 && count == -1) {
            let totalAmount = await getTotalAmount(userId)
            res.json({ status: 'blockTheButton', totalAmount })
        } else if (count == + 1) {
            cartModel.updateOne({
                userId: userId, 'products.productId': productId
            }, {
                $inc: {
                    'products.$.quantity': + 1
                }
            }).then(async (resolve) => {
                let totalAmount = await getTotalAmount(userId)
                res.json({ status: 'incDone', totalAmount })
            }).catch((err) => {
                console.log(err)
            })

        } else {
            cartModel.updateOne({
                userId: userId,
                'products.productId': productId
            }, {
                $inc: {
                    'products.$.quantity': -1
                }
            }).then(async (resolve) => {
                let totalAmount = await getTotalAmount(userId)
                res.json({ status: 'decDone', totalAmount })
            }).catch((err) => {
                console.log(err)
            })
        }
    }
    ).catch((err) => {
        console.log(err)
    })
}


// get myAccount
const getMyAccount = (req, res) => {
    const id = req.session.user._id
    Users.findOne({ _id: id }).then((resolve) => {
        console.log(resolve)
        res.render('user/myAccount', { resolve, username: user })
    }).catch((err) => {
        console.log(err)
    })
}


// edit profile
const editProfile = (req, res) => {
    const id = req.session.user._id
    const { username, phone, email, image } = req.body

    Users.updateOne({
        _id: id
    }, {
        $set: {
            username: username,
            phone: phone,
            email: email,
            image: image
        }
    }).then(() => {
        Users.findOne({ _id: id }).then((resolve) => {
            res.render('user/myAccount', {
                value: 'Successfully saved',
                resolve,
                username: user
            })
        })
    }).catch((err) => {
        res.render('user/myAccount', {
            err: 'Something went wrong !',
            resolve,
            username: user
        })
    })

}


// change password
const changePassword = (req, res) => {
    const id = req.session.user._id
    let { oldpassword, newpassword, confirmpassword } = req.body
    Users.findOne({ _id: id }).then(async (resolve) => {
        const auth = await bcrypt.compare(oldpassword, resolve.password);
        if (auth) {
            if (!newpassword == confirmpassword) {
                res.render('user/login', { msgTwo: 'Password does not match' })
            } else {
                async function hello() {
                    const salt = await bcrypt.genSalt();
                    newpassword = await bcrypt.hash(newpassword, salt);

                    Users.updateOne({
                        _id: id
                    }, {
                        $set: {
                            password: newpassword
                        }
                    }).then((data) => {
                        res.render('user/myAccount', {
                            value: 'Password changed successfully',
                            resolve,
                            username: user
                        })
                    }).catch((err) => {
                        console.log(err)
                    })
                };
                hello();
            }
        } else {
            res.render('user/login', { msgOne: 'Password is incorrect' })
        }
    }).catch((err) => {
        console.log(err)
    })

}


// WishList
const getWishList = (req, res) => {
    if (req.session.userloggedIn) {
        const userId = req.session.user._id
        wishlistModel.findOne({ userId: userId })
            .then((resolve) => {
                if (!resolve) {
                    res.render('user/wishlist', { items: null })
                }
                else {
                    wishlistModel.aggregate([
                        {
                            $match: {
                                userId: userId
                            }
                        },
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
                        }
                    ])
                        .then((resolve) => {
                            res.render('user/wishlist', { items: resolve })
                        })
                }
            })
    }
    else {
        res.redirect('/sign-in')
    }
}


// Add to wishlist
const addToWishList = (req, res) => {
    if (req.session.userloggedIn) {
        let productId = req.params.id
        const userId = req.session.user._id
        productModel.findOne({ _id: productId }).then((resolve) => {
            wishlistModel.findOne({ userId: userId }).then((resolve) => {
                if (!resolve) {
                    wishlist = new wishlistModel({
                        userId: userId,
                        products: {
                            productId
                        }
                    })

                    wishlist.save().then(() => {
                        res.redirect('/wishlist')
                    })
                } else {
                    wishlistModel.findOne({
                        userId: userId,
                        'products.productId': ObjectId(productId)
                    })
                        .then((resolve) => {
                            if (!resolve) {
                                wishlistModel.updateOne({
                                    userId: userId
                                }, {
                                    $push: {
                                        products: {
                                            productId
                                        }
                                    }
                                })
                                    .then((resolve) => {
                                        res.redirect('/wishlist')
                                    })
                            }
                            else {
                                res.redirect('/wishlist')
                            }
                        })
                }
            })
        })
    }
    else {
        res.redirect('/sign-in')
    }
}

//remove wishlist
const removeWishListItem = (req, res) => {
    if (req.session.userloggedIn) {
        const productId = req.query.id
        const userId = req.session.user._id

        wishlistModel.findOne({
            userId: userId
        })
            .then((resolve) => {
                if (resolve.products.length == 1) {
                    wishlistModel.deleteOne({
                        userId : userId
                    })
                    .then((resolve) => {
                        res.redirect('/wishlist')
                    })
                }
                else {
                    wishlistModel.updateOne({
                        userId: userId
                    }, {
                        $pull: {
                            products: {
                                productId: ObjectId(productId)
                            }
                        }
                    })
                        .then((resolve) => {
                            res.redirect('/wishlist')
                        })
                }
            })
    } else {
        res.redirect('/sign-in')
    }
}


// get total amount
const getTotalAmount = (userId) => {
    return new Promise(async (resolve, reject) => {

        const getTotal = await cartModel.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    productId: '$products.productId',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $project: {
                    productId: 1,
                    quantity: 1,
                    products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }, {
                $project: {
                    total: {
                        $sum: {
                            $multiply: ['$quantity', '$products.price']
                        }
                    }
                }
            }

        ])
        let total = 0
        getTotal.forEach((A) => {
            total += A.total
        })

        resolve({ getTotal, total })

    })
}

// get checkoutPage
const getCheckOut = async (req, res) => {
    const userId = req.session.user._id
    const user = req.session.user
    let cartProducts = await getCartProducts(userId)
    let totalAmount = await getTotalAmount(userId)
    let address = await getAddress(userId)
    res.render('user/checkout', { cartProducts, totalAmount, username: user, address })
}

// generateRazorpay
const generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        var option = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId
        };

        instance.orders.create(option, function (err, order) {
            resolve(order)
        })
    })
}


//getAddress
const getAddress = async (userId) => {
    const address = await Users.aggregate([
        {
            $match: {
                _id: ObjectId(userId)
            }
        },
        {
            $project: {
                address: 1,
                _id: 0
            }
        }
    ])

    return address
}


// checkout
const checkOut = async (req, res) => {
    const {
        name,
        phone,
        locality,
        district,
        city,
        state,
        pin,
        email,
        method,
        couponCod,
        ds_amount,
        oldAddress
    } = req.body
    console.log(oldAddress)
    const userId = req.session.user._id
    let totalAmount = await getTotalAmount(userId)
    console.log(userId, 'hello')
    cartModel.aggregate([
        {

            $match: {
                userId: userId
            }
        }, {
            $unwind: '$products'
        },
        {
            $project: {
                productId: '$products.productId',
                quantity: '$products.quantity'
            }
        }
    ]).then(async (resolve) => {
        const products = resolve

        const applyCoupon = Math.floor(parseInt(ds_amount) / products.length)
        products.forEach((x) => {
            x.status = 'pending'
            x.percentage = 0
            x.applyCoupon = applyCoupon
        })

        if (method == 'COD') {
            if (oldAddress == 'active') {
                let address = await getAddress(userId)
                const {
                    username,
                    phone,
                    locality,
                    district,
                    city,
                    state,
                    pincode,
                    email
                } = address[0].address
                console.log(address, email, username, phone, pincode)
                orders = new orderModel({
                    userId: userId,
                    deliveryDetails:
                    {
                        username,
                        phone,
                        locality,
                        district,
                        city,
                        state,
                        pincode,
                        email,
                        paymentMethod: method
                    }
                    ,
                    products
                })
                orders.save().then((resolve) => {
                    const orderId = resolve._id
                    if (applyCoupon > 0) {
                        userCouponModel.deleteOne({
                            userId: ObjectId(userId),
                            couponId: ObjectId(couponCod)
                        })
                            .then((resolve) => {
                                res.json({ status: 'orderPlaced', orderId })
                            })
                    } else {
                        res.json({ status: 'orderPlaced', orderId })
                    }
                })
            }
            else {

                orders = new orderModel({
                    userId: userId,
                    deliveryDetails:
                    {
                        username: name,
                        phone: phone,
                        locality: locality,
                        district: district,
                        city: city,
                        state: state,
                        pincode: pin,
                        email: email,
                        paymentMethod: method
                    }
                    ,
                    products
                })
                orders.save().then((resolve) => {
                    const orderId = resolve._id
                    if (applyCoupon > 0) {
                        userCouponModel.deleteOne({
                            userId: ObjectId(userId),
                            couponId: ObjectId(couponCod)
                        })
                            .then((resolve) => {
                                res.json({ status: 'orderPlaced', orderId })
                            })
                    } else {
                        res.json({ status: 'orderPlaced', orderId })
                    }
                })
            }

        }
        else if (method == 'online') {
            console.log(method)
            if (oldAddress == 'active') {
                let address = await getAddress(userId)
                const {
                    username,
                    phone,
                    locality,
                    district,
                    city,
                    state,
                    pincode,
                    email
                } = address[0].address

                orders = new orderModel({
                    userId: userId,
                    deliveryDetails:
                    {
                        username,
                        phone,
                        locality,
                        district,
                        city,
                        state,
                        pincode,
                        email,
                        paymentMethod: method
                    }
                    ,
                    products
                })
                orders.save()
                    .then(async (resolve) => {

                        if (applyCoupon > 0) {
                            console.log(userId, couponCod)
                            userCouponModel.deleteOne({
                                userId: ObjectId(userId),
                                couponId: ObjectId(couponCod)
                            })
                                .then(async (resolve) => {
                                    const razorpay = await generateRazorpay(resolve._id, totalAmount.total - parseInt(ds_amount))
                                    res.json(razorpay)
                                })
                        } else {
                            const razorpay = await generateRazorpay(resolve._id, totalAmount.total)
                            res.json(razorpay)
                        }
                    })
            }
            else {
                orders = new orderModel({
                    userId: userId,
                    deliveryDetails:
                    {
                        username: name,
                        phone: phone,
                        locality: locality,
                        district: district,
                        city: city,
                        state: state,
                        pincode: pin,
                        email: email,
                        paymentMethod: method
                    }
                    ,
                    products
                })
                orders.save()
                    .then(async (resolve) => {

                        if (applyCoupon > 0) {
                            console.log(userId, couponCod)
                            userCouponModel.deleteOne({
                                userId: ObjectId(userId),
                                couponId: ObjectId(couponCod)
                            })
                                .then(async (resolve) => {
                                    const razorpay = await generateRazorpay(resolve._id, totalAmount.total - parseInt(ds_amount))
                                    res.json(razorpay)
                                })
                        } else {
                            const razorpay = await generateRazorpay(resolve._id, totalAmount.total)
                            res.json(razorpay)
                        }
                    })
            }

        }
        else {
            console.log('something wrong')
        }
    })

}

//verify payment
const verifyPayment = (req, res) => {
    const crypto = require('crypto');
    console.log(req.body)
    let hmac = crypto.createHmac('sha256', 'btuL1bQteuZrjOOScnkIpD0x');
    hmac.update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id);
    hmac = hmac.digest('hex')

    if (hmac == req.body.payment.razorpay_signature) {
        res.json({ status: 'success', orderId: req.body.order.receipt })
    }
    else {
        res.json({ status: 'failed' })
    }

}


// order placed
const orderPlaced = async (req, res) => {
    const userId = user._id.valueOf()
    const orderId = req.query
    const orderItem = await currentOrderItem(orderId)

    orderModel.findOne({ _id: ObjectId(orderId) })
        .then((resolve) => {
            const username = resolve.deliveryDetails.username
            cartModel.deleteOne({ userId: userId })
                .then((resolve) => {
                    res.render('user/orderplaced', { username, products: orderItem.items, totalAmount: orderItem.total })
                })
        })
}


// get order
const getOrder = (req, res) => {
    const userId = user._id.valueOf()

    orderModel.aggregate([
        {
            $match: {
                userId: userId
            }
        }
    ])
        .then((resolve) => {
            orderModel.aggregate([
                {
                    $match: {
                        userId: userId
                    }
                }, {
                    $unwind: '$products'
                },
                {
                    $project: {
                        deliveryDetails: '$deliveryDetails',
                        productId: '$products.productId',
                        quantity: '$products.quantity',
                        status: '$products.status',
                        percentage: '$products.percentage'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {
                        deliveryDetails: 1,
                        productId: 1,
                        quantity: 1,
                        status: 1,
                        percentage: 1,
                        products: {
                            $arrayElemAt: ['$products', 0]
                        }
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ])
                .then((resolve) => {
                    res.render('user/orderdetails', { resolve })
                })
        })
}

//trackOrder
const trackOrder = (req, res) => {
    const {
        productId,
        id
    } = req.query

    orderModel.aggregate([
        {
            $match: {
                _id: ObjectId(id)
            }
        },
        {
            $unwind: '$products'
        },
        {
            $match: {
                'products.productId': ObjectId(productId)
            }
        },
        {
            $project: {
                _id: '$_id',
                userId: '$userId',
                deliveryDetails: '$deliveryDetails',
                products: '$products',
                date: '$createdAt'

            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'result'
            }
        }
    ])
        .then((resolve) => {
            console.log(resolve)
            res.render('user/trackOrder', { resolve })
        })
}


// cancel order
const cancelOrder = (req, res) => {
    const {
        productId,
        id
    } = req.query

    orderModel.updateOne(
        {
            _id: ObjectId(id),
            'products.productId': ObjectId(productId)
        },
        {
            $set: {
                'products.$.status': 'cancelled'
            }
        }
    )
        .then((resolve) => {
            res.redirect('/getOrder')
        })
}


//search products
const searchItem = (req, res) => {
    const {
        text
    } = req.body
    console.log(text)
    productModel
        .find(
            { $text: { $search: text } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .then((resolve) => {
            res.render('user/searchItems', { resolve, text })
        })
        .catch((err) => {
            console.log(err)
        })
}

//getCoupon
const getCoupon = (req, res) => {
    const userId = req.session.user._id
    couponModel.find({ users: { $nin: userId } })
        .then((resolve) => {
            const coupon = resolve
            userCouponModel.find({ userId: userId })
                .then((resolve) => {
                    res.render('user/coupon', { resolve, coupon })
                })
        })
}

//claimcoupon
const claimCoupon = (req, res) => {
    const userId = req.session.user._id
    const couponId = req.query.id
    console.log(couponId)

    couponModel.findOneAndUpdate(
        {
            _id: couponId
        },
        {
            $push: {
                users: userId
            }
        }
    )
        .then((resolve) => {
            const {
                couponName,
                amount,
                requiredAmount,
                image
            } = resolve

            userCoupon = new userCouponModel({
                userId,
                couponName,
                amount,
                requiredAmount,
                image,
                couponId
            })
            userCoupon.save()
                .then((resolve) => {
                    console.log(resolve)
                    res.redirect('getCoupon')
                })
        })
}

// apply coupon
const applyCoupon = (req, res) => {
    const userId = req.session.user._id
    const {
        couponCod,
        totalAmount
    } = req.body
    console.log(couponCod)
    userCouponModel.findOne({
        userId: ObjectId(userId), couponId: ObjectId(couponCod)
    })
        .then((resolve) => {
            if (!resolve) {
                res.json({ status: 'couponCodeIsNotValid' })
            } else {
                const {
                    requiredAmount,
                    amount
                } = resolve
                console.log(resolve, requiredAmount)
                if (!resolve) {
                    res.json({ status: 'couponCodeIsNotValid' })
                }
                else if (requiredAmount >= totalAmount) {
                    res.json({ status: 'cantApply', requiredAmount })
                }
                else {
                    let total = totalAmount - amount
                    res.json({ status: 'success', total, amount })
                }
            }

        })
}

//add address
const addAddress = (req, res) => {
    const userId = req.session.user._id

    Users.aggregate([
        {
            $match: {
                _id: ObjectId(userId)
            }
        },
        {
            $project: {
                _id: 0,
                address: 1
            }
        }
    ])
        .then((resolve) => {
            const address = resolve
            if (!resolve) {
                res.render('user/addAddress')
            }
            else {
                res.render('user/addAddress', { address })
            }
        })
}


// get signin
const getSignIn = (req, res) => {
    if (req.session.userloggedIn) {
        res.redirect('/')
    } else {
        res.render('user/login')
    }
}


//get currentorderItems
const currentOrderItem = (userId) => {
    return new Promise(async (resolve, reject) => {
        const items = await orderModel.aggregate([
            {
                $match: {
                    _id: ObjectId(userId)
                }
            }, {
                $unwind: '$products'
            },
            {
                $project: {
                    productId: '$products.productId',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    products: {
                        $arrayElemAt: ['$products', 0]
                    }
                }
            }

        ])
        let total = 0
        items.forEach((A) => {
            console.log(A.products.price, A.quantity)
            total += (A.products.price) * (A.quantity)
        })
        console.log(total)
        resolve({ items, total })
    })
}

//getCategory
const getCategory = (req, res) => {
    const category = req.query.name
    categoryModel.find()
        .then((resolve) => {
            const categories = resolve
            productModel.aggregate([
                {
                    $match: {
                        category
                    }
                }
            ])
                .then((resolve) => {
                    console.log(resolve)
                    res.render('user/categorySearch', { categories, resolve })
                })
        })
}

//save addresss
const saveAddress = (req, res) => {
    console.log(req.body)
    const {
        username,
        phone,
        locality,
        district,
        city,
        state,
        pincode,
        email
    } = req.body
    const userId = req.session.user._id

    Users.updateOne({
        _id: ObjectId(userId)
    },
        {
            $set: {
                address: {
                    username,
                    phone,
                    locality,
                    district,
                    city,
                    state,
                    pincode,
                    email
                }
            }
        })
        .then((resolve) => {
            res.json({ status: true })
        })
        .catch((err) => {
            console.log(err)
        })

}

// logout section
const logOut = (req, res) => {
    req.session.userloggedIn = false
    res.redirect('/')

}

module.exports = {
    requestingForHomePage,
    signInPost,
    sendOTP,
    verifyOtpLogin,
    logOut,
    productView,
    addToCart,
    getCart,
    getSignIn,
    removeCartItem,
    checkOut,
    getCheckOut,
    getMyAccount,
    editProfile,
    changePassword,
    getWishList,
    addToWishList,
    changeQuantity,
    orderPlaced,
    getOrder,
    cancelOrder,
    trackOrder,
    verifyPayment,
    searchItem,
    getCoupon,
    claimCoupon,
    applyCoupon,
    addAddress,
    getCategory,
    saveAddress,
    removeWishListItem
}
