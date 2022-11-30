const express = require('express');
const loginController = require('../Controller/loginController');

const router = express.Router();


router.post ('/sign-in', loginController.signInPost)
router.get('/logout', loginController.logOut)
router.get ('/', loginController.requestingForHomePage)
router.post('/sendotp', loginController.sendOTP)
router.post('/login/verify:id', loginController.verifyOtpLogin)
router.get('/viewProduct:id', loginController.productView)
router.post('/addToCart', loginController.addToCart)
router.get('/shoppingCart', loginController.getCart)
router.get('/sign-in', loginController.getSignIn);
router.get('/removeCartItem/:id', loginController.removeCartItem)
router.get('/checkout', loginController.getCheckOut)
router.post('/placeOrder', loginController.checkOut)
router.get('/myAccount', loginController.getMyAccount)
router.post('/editProfile', loginController.editProfile)
router.post('/changePassword', loginController.changePassword)
router.post('/changequantity', loginController.changeQuantity)
router.get('/orderPlaced', loginController.orderPlaced)
router.get('/getOrder', loginController.getOrder)
router.get('/trackOrder', loginController.trackOrder)
router.get('/cancelOrder', loginController.cancelOrder)
router.post('/verifyPayment', loginController.verifyPayment)
router.post('/searchItem', loginController.searchItem)
router.get('/getCoupon', loginController.getCoupon)
router.get('/claimCoupon', loginController.claimCoupon)
router.post('/applyCoupon', loginController.applyCoupon)
router.get('/addAddress', loginController.addAddress)
router.get('/category', loginController.getCategory)
router.post('/saveAddress', loginController.saveAddress)
router.get('/removeWishlistItem', loginController.removeWishListItem)
router.get('/wishlist', loginController.getWishList)
router.post('/addToWishlist/:id', loginController.addToWishList)
router.get('/backtologin', (req, res) => {
    res.redirect('/sign-in')
})
router.get('/sign-up', (req, res) => {
    res.render('user/signup')
});

router.get('/loginwithotp', (req, res) => {
    res.render('user/loginWithOtp')
});





module.exports = router;