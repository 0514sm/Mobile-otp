const express =require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const unirest = require('unirest')
const OTPmodel=require('./otp.schema.js')
//const { response } = require('express')
require('dotenv').config();

mongoose.connect(process.env.MONGO,{useUnifiedTopology:true,useNewUrlParser:true,}).then(()=>{
    console.log("mongo is connected");
}).catch(()=>{
    console.log("cannot connected");
})
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname+"/public/index.html"));
})
app.get("/check",(req,res)=>{
    res.sendFile(path.join(__dirname+"/public/check.html"));
})


app.post("/otp",function(req,res){
    var requestof2s = unirest("POST", "https://www.fast2sms.com/dev/bulk");

    requestof2s.headers({
    "content-type": "application/x-www-form-urlencoded",
    "cache-control": "no-cache",
    "authorization": "API_KEY_FAST2SMS"
    });
const otpid = Math.floor(Math.random()*100000);
    requestof2s.form({
    "sender_id": "FSTSMS",
    "language": "english",
    "route": "qt",
    "numbers": req.body.number,
    "message": "FAST2SMS_templete_ID",
    "variables": "{#BB#}",
    "variables_values": otpid,
    });

    requestof2s.end(function (responsef2s) {
    if (responsef2s.error) throw new Error(responsef2s.error);
    if(responsef2s.body.request_id){
        OTPmodel.create({
            phone:req.body.number,
            otp:otpid,
        }).then(()=>res.send("check messege"))
    }
    });

})

app.post("/check",function(req,res){
const otp  = req.body.otp;
const phone = req.body.number;

OTPmodel.find({phone,otp}).lean().then(function(responseCheck){
    console.log(responseCheck);
    if(responseCheck){
        res.json(responseCheck);
    }
}).catch(function(error){
    res.json({
        error:"error occured",
    })
})

})


app.listen(3000,()=>{
    console.log("app started");
})
