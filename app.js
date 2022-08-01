require('dotenv').config()
const signalR = require("@microsoft/signalr")
const socket = require('socket.io')
const cors = require('cors');
const express = require('express')
const app = express();
var server_port = process.env.PORT || process.env.YOUR_PORT || 80;
var server_host = process.env.HOST || '0.0.0.0'

let _range = 1

let market = '';
let watchHen = true;
let watchObjkt = true;

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cors({
    origin:'*', // this was '*'
    methods:['GET','POST'],
    credentials:true,
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.get('/', (req,res)=>{
    res.render('index')
})
app.get('/about', (req,res)=>{
    res.render('about')
})

const server = app.listen(server_port, server_host, ()=>{ // || process.env.port
    console.log(`server is running on port : %d`, server_port)
})

const io = socket(server, {'transports': ['websocket', 'polling'], allowEIO3: true});

io.on('connection', socket => {
    console.log('User online!')
    // var clients = io.sockets;
    // var users = []
    // clients.sockets.forEach(function(data,counter){
    //     // var socketid = data.id;
    //     // var isConnected = data.connected;
    //     if (data.id && data.connected){
    //         users.push(data.id)
    //         console.log(`${users.length} users connected.`)
    //     }

    // })
    socket.username = 'Anon';
    socket.use_port = process.env.PORT;
    socket.priceRange = '1'
    socket.watchHen = true
    socket.watchObj = true
    //console.log('default watchers : ', socket.watchHen, socket.watchObj)
    socket.on('change_range', data => {
        socket.priceRange = data.priceRange
        console.log(`User asked for new threshold : ${socket.priceRange}`)
        _range = data.priceRange
    })

    socket.on('new_message', data => {
        console.log('New message!');
        io.sockets.emit('receive_message', {message:data.message, username:socket.username})
    })
    
    socket.on('market_watch', data=>{
        if (data.market == 'HEN'){
            if (data.watchingHen == true){
                socket.watchHen = true
                watchHen = true
            } else {
                socket.watchHen = false
                watchHen = false
            }
        }
        if(data.market == 'OBJKT') {
            if(data.watchingObjkt == true){
                socket.watchObj = true
                watchObjkt = true
            } else {
                socket.watchObj = false
                watchObjkt = false
            }
        }
        //console.log('watch hen: ', socket.watchHen, 'watch objkt: ', socket.watchObj)
    })
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.tzkt.io/v1/events")
    .build();

const connection2 = new signalR.HubConnectionBuilder()
    .withUrl("https://api.tzkt.io/v1/events")
    .build();

async function init() {
    // init objkt.com marketplace wathcer
    await connection.start();
    await connection.invoke("SubscribeToHead");
    await connection.invoke("SubscribeToOperations", {
        // 'KT1FvqJwEDWb1Gwc55Jd1jjTHRVWbYKUUpyq' old contract ? 
        
        address: "KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC",
        types : "transaction"
    });
    // init hen marketplace wathcer
    await connection2.start();
    await connection2.invoke("SubscribeToHead");
    await connection2.invoke("SubscribeToOperations", {
        // "'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn'" old hen. now TEIA
        
        address:"KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w" ,
        types : "transaction"
    });

};


connection.onclose(init);
connection2.onclose(init)

connection.on("head", (msg) => {
    //console.log(msg);

});
connection2.on("head", (msg) => {
    //console.log(msg);

});

connection.on("operations", (msg) => {
    //console.log(msg);
    var clients = io.sockets;
    var users = []
    clients.sockets.forEach(function(data,counter){
        // var socketid = data.id;
        // var isConnected = data.connected;
        if (data.id && data.connected){
            users.push(data.id)
            console.log('Watching OBJKT marketplace...')
        }

    })
    let _msg = msg
    for (let key of Object.keys(_msg)){
        for (let val of Object.values(msg[key])){
            if (val['parameter'].entrypoint == 'ask'){
                //console.log(val)
                //console.log(val['parameter'])

                let actualPrice = Number(val['parameter'].value['amount']) / 1000000
                let thisContract = val['parameter'].value.token['address']
                let thisTokenId = val['parameter'].value.token['token_id']
                let ask_id = Number(val['storage'].next_ask_id) - 1
              
                if(actualPrice <= _range){
                    let collectionAddress = thisContract
                    let objktid = thisTokenId
                    let editions = val['parameter'].value['editions']
                    let _mesg = ''
                    if (actualPrice == 0){
                        _mesg = `Found a zer0 OBJKT!`
                    } else {
                        _mesg = `Found a (near) zer0 OBJKT!`
                    }
                    //console.log(`Found a (near) zero OBJKT! at ${actualPrice} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`)
                    let msssg = `Found a (near) zero OBJKT! at ${actualPrice} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`
                    if (watchObjkt == true){
                        //console.log('objectId from OBJKT : ', objktid)
                        io.sockets.emit('receive_message', {message:_mesg, username:'OBJKT', obid:objktid, price:actualPrice, textPrice:actualPrice ,editions:editions, users:users.length, ask_id:ask_id ,fa2:collectionAddress})
                    } else {
                        console.log('skipping objkt market')
                    }
                    
                } else {
                    console.log('skipped')
                }
            }
        }
            
    }
});
connection2.on("operations", (msg) => {
    var clients = io.sockets;
    var users = []
    clients.sockets.forEach(function(data,counter){
        // var socketid = data.id;
        // var isConnected = data.connected;
        if (data.id && data.connected){
            users.push(data.id)
            console.log('Watching HEN marketplace...')
        }
    })
    let _msg = msg
    for (let key of Object.keys(_msg)){
        //console.log("NOW RUNNING INSIDE CONNECTION 2 ASDADLAKJDALKDJALKDJALKSDJALKDJALKSDJALKDJ")
        //console.log(msg[key])
        for (let val of Object.values(msg[key])){
            //console.log(val)

            if (val['parameter'].entrypoint == 'swap'){
                console.log('found swap : ', val)

                //console.log('hen contract : ', val['parameter'])
                let swapId = val['storage']['counter']
                console.log('swap Id', swapId)
                let price = '';
                let actualPrice = val['parameter'].value['xtz_per_objkt']
                let comparePrice = actualPrice / 1000000
                console.log("price: ", actualPrice)
                console.log(typeof(actualPrice))
                
                if (actualPrice == 0){
                    price = 0;
                } else {
                    price = comparePrice
                }
                
                if(price <= _range){
                    let objktid = val['parameter'].value['objkt_id']
                    let editions = val['parameter'].value['objkt_amount']
                    let _mesg = ''
                    if (price == 0){
                        _mesg = `Found a zer0 OBJKT!`
                    } else {
                        _mesg = `Found a (near) zer0 OBJKT!`
                    }
                    //console.log(`Found a (near) zero OBJKT! at ${price} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`)
                    let msssg = `Found a (near) zero OBJKT! at ${price} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`
                    if(watchHen == true){
                        console.log('objectId from HEN : ', objktid)
                        io.sockets.emit('receive_message', {message:_mesg, username:'HicEtNunc', obid:objktid, price:actualPrice, textPrice:comparePrice,editions:editions, users:users.length, swapId:swapId})
                    } else {
                        console.log('skipping hen marketplace')
                    }
                    

                }
            }
        }
            
    }
});

init();
//init2();