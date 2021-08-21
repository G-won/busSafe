var route = require('express').Router()
var mysql = require('mysql');
require('dotenv').config()

const Caver = require('caver-js')
const BusSafe = require('../build/contracts/BusSafe.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

var walletAddress=process.env.walletAddress
var walletPrivateKey=process.env.walletPrivateKey
var accessKeyId = process.env.accessKeyId
var secretAccessKey = process.env.secretAccessKey
var user= process.env.USER
var password = process.env.password
const smartcontract = new cav.klay.Contract(BusSafe.abi, BusSafe.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey(walletAddress,walletPrivateKey)
cav.klay.accounts.wallet.add(account)


var connection = mysql.createConnection({
    host     : 'localhost',
    user     : user,
    password : password,
    database : 'masan'
});

// connection.connect();
const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS()


const chainId = 1001 // 클레이튼 테스트 네트워크 접속 ID 

caver.initKASAPI(chainId, accessKeyId, secretAccessKey) //KAS console 초기화

const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey(walletPrivateKey)
keyringContainer.add(keyring)

async function create_wallet(){     //wallet 생성 function
    const wallet = await caver.kas.wallet.createAccount()   //wallet 생성
    // console.log(wallet);
    return wallet.address
}


async function token_trans(_address, _token){       //token 송금 function
    const kip7 = new caver.kct.kip7('0xDDf9DB55c8fcD18270442409A01892f8E0FDf255')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정        
    const receipt = await kip7.transfer(_address, _token, { from: keyring.address })       //transfer('토큰 받는 주소', 토큰 양, {from:'트랜젝션을 일으키는 주소'})
    console.log(receipt);
}

async function balanceOf(_address){
    const kip7 = new caver.kct.kip7('0xDDf9DB55c8fcD18270442409A01892f8E0FDf255')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정  
    const receipt = await kip7.balanceOf(_address)  //balanceOf('토큰 조회할 주소')
    console.log(receipt);
    return receipt
}



function loggedInOnly (req ,res , next) {
    console.log(req.session.user)
    if (req.session.user === undefined) res.redirect('/login')

    else next()
}

function adminLoggedInOnly (req , res , next) {
    if (req.session.user === undefined) res.redirect('/login')

    else if (req.session.user.email !='1@naver.com') {
        console.log(req.session.user.email)
        res.redirect('/login')
    } 

    else next()
}

// balanceOf('0xbA054505f41656053822e8f03B5E6563E4B91C50')
// smartcontract.methods.AddCheckList("fw","fewf","fwfwe",20210821).send({
//     from:"0x719b2be80ca80f7f5a01921d86e60ac59c1f5d1a",
//     gas:8500000
// }).then(result=>{
//     token_trans(req.session.address,'10' )
//     console.log(result)
// }).then(receipt=>{
//     console.log(receipt)
// })

route.get('/register', (req, res)=>{
    res.render("register.html")
})

route.post('/register', async (req, res)=>{
    console.log(req.body.username)
    var username  = req.body.username
    var email  = req.body.email
    var password = req.body.password
    connection.query(`SELECT email FROM users WHERE email = '${email}'` , (err, result)=>{
        if (result.length == 0) {
            create_wallet().then(
                userWallet => {
               
                console.log(userWallet)
                connection.query(`INSERT INTO users (username, email, password, address) VALUES ('${username}', '${email}','${password}', '${userWallet}');`, (error, results) =>{
                    if (error) {
                        console.error(error);
                        res.send(error)
                    }
                    console.log(results);
                    res.redirect('/login')
                });
                // connection.end();
            })
            // console.log("NOTHING")
        } else {
            console.log("중복된 이메일입니다.")
            res.redirect("/register")
        }
   })
})

route.get('/login', (req, res)=>{
    res.render('login.html')
})

route.post('/login', (req , res)=>{
    var email = req.body.email
    var password = req.body.password

    // sql = "SELECT * FROM users WHERE email =" +"'"+ email +"'"
    sql = `SELECT * FROM users WHERE email ='${email}'`
    // console.log(sql)
    connection.query(sql, (err ,result )=>{
        if (err) {
            console.error(err)
        } else {
            if (result.length == 0) {
                console.log("user is not exist")
                res.redirect('/login')
            } else {
                console.log(result[0].password)
                if (result[0].password == password) {
                    req.session.user = {
                        username:result[0].username,
                        email:result[0].email,
                        address:result[0].address,
                        authenticated : true

                    }
                    res.render("index.html" , {user:req.session.user})
                } else {
                    console.log('password is invaild')
                    res.redirect('/login')
                }
            }
        }
    })

})

route.get('/sendtoken',adminLoggedInOnly, (req, res)=>{
    res.render('sendtoken.html', {name:req.session.user.username})
})



route.post('/sendtoken' ,adminLoggedInOnly , (req, res)=>{
    var email = req.body.email
    var token = req.body.token
    var sql = `SELECT * FROM users WHERE email='${email}'`
    connection.query(sql , (err, result)=>{
        if (err) {
            console.error(err)
            res.redirect('/sendtoken')
        } else {
            if (result.length ==0){
                console.log('유저가 없습니다.')
                res.redirect('/sendtoken')
            } else {
                token_trans(result[0].address,token ).then(
                    sendResult=>{
                        console.log(sendResult)
                        res.send(`${result[0].username} 에게 ${token} 보냈습니다.`)
                    }
                )
            }
        }
    })
})

route.get('/tokenamount',loggedInOnly, (req, res)=>{
    res.render('tokenamount.html', {user:req.session.user , address:req.session.user.address})
})

route.post('/tokenamount', loggedInOnly, (req, res)=>{
    // var email = req.body.email
    // var sql = `SELECT * FROM users WHERE email='${email}'`

    // console.log(sql)
    // connection.query(sql, (err, result)=>{
    //     var address = result[0].address
    //     console.log(address)
    //     balanceOf(address).then(
    //         tokenData => {
    //              res.render('tokenresult.html' , {data:tokenData})
    //         }
    //     )

    // })
    var address = req.body.address
    balanceOf(address).then(
        tokenData => {
             res.render('tokenresult.html' , {data:tokenData , name:req.session.user.username})
        }
    )
})


route.get('/working' , loggedInOnly, (req, res)=>{
    res.render('working.html')
})


route.post('/working',loggedInOnly,  (req, res)=>{
    var carId = req.body.carID
    var checkList = req.body.checkList
    var checkEtc = req.body.checkEtc
    var start = Date.now()
    console.log(carId)
    smartcontract.methods.AddCheckList(`${carId}`,`${checkList}`,`${checkEtc}`,parseInt(start)).send({
        from:"0x719b2be80ca80f7f5a01921d86e60ac59c1f5d1a",
        gas:8500000
    }).then(result=>{
        // console.log(result)
        token_trans(req.session.user.address,'10' )
        
    }).then(receipt=>{
        // console.log(receipt)
        res.send("Success")
    })


})

route.get('/checks', (req, res)=>{
    res.render('checks.html')
})


route.post('/checks', async (req, res)=>{
    // var resultArray = []
    // smartcontract.methods.TotalCount().call().then(
    //     data=>{
    //         console.log(typeof(data))
    //         for (i=0;i<parseInt(data);i++){
    //             console.log(i)
    //             smartcontract.methods.GetCheck(i).call().then(
    //                result =>{
    //                     console.log(result)
    //                     resultArray.push(result)                       
    //                 }
    //             )     
    //         }
    //     console.log(resultArray)
    //     }
    // )

    var num = req.body.number

    smartcontract.methods.GetCheck(parseInt(num)).call().then(data=> {
        console.log(data)
        res.render('checklist.html', {data:data})
    })

})

module.exports = route;