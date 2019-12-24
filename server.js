const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

//DB config
const db = require("./config/keys").mongoURI;

//Connect to mongodb
mongoose.connect(db)
    .then(()=>console.log("已成功连接到 MongoDB"))
    .catch((err)=>console.log(err));

// 使用body-parser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const Alipay = require('./routes/alipay');
const utl = require('./routes/utl');
const outTradeId = Date.now().toString();
const path = require('path');

const http = require('http');
const https = require('https');
const fs = require('fs');

//同步读取密钥和签名证书
const options = {
    key: fs.readFileSync('./ssl/key.key'),
    cert: fs.readFileSync('./ssl/pem.pem')
}

const Http = http.createServer(app).listen(900);
const Https = https.createServer(options, app).listen(9000);

const index = fs.readFileSync('www/index.html');
app.get("/",(req,res,next)=>{
    res.write(index);
    res.end()
})

const Pay = new Alipay({
    appId: '2017022705915274',//2016090900472698 沙箱 2017022705915274正式
    notifyUrl: 'https://it97xy.cn:8000/api/alpay/notify',
    rsaPrivate: path.resolve("./routes/pem/private_key.pem"),
    rsaPublic: path.resolve("./routes/pem/public_key.pem"),
    // sandbox: true,
    signType: 'RSA2'
});

app.get('/pay', function(req, res, next) {
    // pc网页支付入参
    // let url =  Pay.pay({
    //     body: "测试订单",
    //     subject: "测试订单",
    //     outTradeId: "201o503200101201022211",
    //     timeout: '90m',
    //     amount: "0.1",
    //     sellerId: '',
    //     product_code: 'FAST_INSTANT_TRADE_PAY',
    //     goods_type: "1",
    //     return_url:"127.0.0.1:300",
    // })
    // let url_API = 'https://openapi.alipay.com/gateway.do?'+url;
    // res.json(url_API);
    let dt=new Date();
    let yy=dt.getFullYear();
    let mm=dt.getMonth()+1;
    let dd=dt.getDate();
    let hh=dt.getHours();
    let mi=dt.getMinutes();
    let ss=dt.getSeconds();
    let dy=dt.getDay();
    let nowDate = yy+"-"+mm+"-"+dd+" "+hh+":"+mi+":"+ss;
    // console.log(nowDate,'3')
    /* 测试当面付 */
    let url = Pay.createQRPay({
            body: "测试订单",
            subject: "测试订单",
            outTradeId: nowDate,
            timeout: '90m',
            amount: "0.1",
    })
    let url_API = 'https://openapi.alipay.com/gateway.do?'+ url
    res.json(url)
});

app.listen(Http,Https,()=>{
    console.log(`Server is Running on http: 900,https:9000 webSite on http://localhost:900 and https://localhost:9000`);
})
