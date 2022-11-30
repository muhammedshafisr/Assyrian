
const Users = require('../model/user')
require("dotenv").config()
const authToken = process.env.authToken
const accountSID = process.env.accountSID
const serviceID = process.env.serviceID
const client = require('twilio')(accountSID, authToken)


// validating singup and getting data from user
const sendotp = (req, res) => {

    const{

        username,
        phone,
        email,
        password,
        confirmPassword
        
    } = req.body

    // mail validation symbols, numbers
    const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    if( username == '' || phone == ''|| email == '' || password == '' || confirmPassword == ''){

        res.render('user/signup', { err : 'Input box cannot be empty ! '});

    }else if(!email.match(re)){
        res.render('user/signup', { err : 'Plese enter a valid email'})
    }
    else if(password != confirmPassword){

        res.render('user/signup', { err : 'Password must be the same ! '})
    }

    else{

        Users
        .findOne({ email : email })
        .then((resolve) => {

            if ( resolve == null ) {

                Users
                .findOne({ phone : phone })
                .then((resolve) => {

                    if( resolve == null ){
                    const users = new Users({
                    username : username,
                    email : email,
                    phone : phone,
                    password : password,
                    userStatus : 'active'
                });
    
                users.save()
                .then((resolve) => {
                    client
                    .verify
                    .services(serviceID)
                    .verifications
                    .create({
                        to : '+91'+phone,
                        channel : 'sms'
                    })
                         res.render('user/signupOtpAuth', { phone : phone})
                   
                })
                .catch((err) => {
                    console.log(err)
                });

                }else{
                    res.render('user/signup', { alertPhone : 'this phone number already exists'})
                }
                })
                .catch((err) => {
                    console.log(err)
                })

            }
            else{
                res.render('user/signup', { err : 'This email is already exists'})
                
            }
            
        })
        .catch((err) => {
            console.log(err)
        })
    };

};

// ! validating singup and getting data from user !

// waiting list

const verifySignup = (req, res) => {

    const {

        indexOne,
        indexTwo,
        indexThree,
        indexFour
    } = req.body
    
    const phone = req.query.num

    let code = [indexOne, indexTwo, indexThree, indexFour].join('')


        client
        .verify
        .services(serviceID)
        .verificationChecks
        .create({
            to : '+91'+phone,
            code : code
        })
        .then((resolve) => {
            console.log('i am here')
            console.log(resolve);
            
            if ( resolve.valid == true ) {
                res.render('user/signupSuccess')
            }
            else {
                res.render('user/signupOtpAuth', { phone : phone , alertOne : 'Please enter a valid otp'})
            }
    })
        .catch((err) => {
            console.log('i am here two', err)
            res.render('user/signupOtpAuth', { phone : phone })
        })
    
    
}



module.exports = {
    sendotp,
    verifySignup
}