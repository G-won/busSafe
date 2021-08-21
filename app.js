const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const apiRouter = require('./routes/router')
const path = require('path')
const expressSession = require('express-session')

app.set('views' , path.resolve(__dirname+'/views'))
app.set('view engine' , 'ejs')
app.engine('html', require('ejs').renderFile)


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(expressSession({
    secret:"mySecret",
    resave:true,
    saveUninitialized:true
}))

app.use(apiRouter)

var port = 8080
app.listen(port , ()=>{
    console.log(`Server is Running at http://localhost:${port}`)
})