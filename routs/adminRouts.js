const express = require ('express');
const adminController = require ('../Controller/adminController');

const router = express.Router();

router.get('/admin', adminController.getSignInPage)
router.post('/admin', adminController.signIn)
router.get('/admin/logout', adminController.logOut)
router.get('/productsList', adminController.getProductsList)
router.get('/addProducts', adminController.getAddProducts)
router.post('/addProducts', adminController.postAddProducts)
router.get('/userList', adminController.getUserList)
router.get('/activeProduct:id', adminController.activeProduct)
router.get('/inactiveProduct:id', adminController.inactiveProduct)
router.get('/editProduct:id', adminController.getEditProduct)
router.post('/editProduct', adminController.editProduct)
router.get('/block:id', adminController.blockUser)
router.get('/unblock:id', adminController.unBlockUser)
router.get('/orders', adminController.getOrdersList)
router.get('/odrconfirm', adminController.confirmOrder)
router.get('/shipped', adminController.itemShipped)
router.get('/outfordelivery', adminController.outForDelivery)
router.get('/delivered', adminController.itemDelivered)
router.get('/headers', adminController.getHeaders)
router.post('/changeHeader', adminController.changeHeader)
router.get('/coupon', adminController.getCoupon)
router.get('/addCoupon', adminController.getAddCoupon)
router.post('/addCoupon', adminController.addCoupon)
router.get('/getChartData', adminController.getChartData)
router.get('/getCategory', adminController.getCategory)
router.post('/addCategory', adminController.addCategory)



module.exports = router;