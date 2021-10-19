const signalR = require("@microsoft/signalr")
const socket = require('socket.io')
const cors = require('cors');
const express = require('express')
const app = express();

let _range = 1

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cors({
    origin:'*',
    methods:['GET','POST']
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

const server = app.listen(process.env.PORT || 3000, ()=>{
    console.log(`server is running on port : ${process.env.PORT}`)
})

const io = socket(server, {'transports': ['websocket', 'polling'], allowEIO3: true});

io.on('connection', socket => {
    console.log('User online')
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
    socket.priceRange = '1'
    
    socket.on('change_range', data => {
        socket.priceRange = data.priceRange
        console.log(`User asked new threshold : ${socket.priceRange}`)
        _range = data.priceRange
    })

    socket.on('new_message', data => {
        console.log('New message!');
        io.sockets.emit('receive_message', {message:data.message, username:socket.username})
    })
});


const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.tzkt.io/v1/events")
    .build();

async function init() {
    await connection.start();
    await connection.invoke("SubscribeToHead");
    await connection.invoke("SubscribeToOperations", {
        address: 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn',
        types : "transaction"
    });
};

connection.onclose(init);

connection.on("head", (msg) => {
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
            console.log(`${users.length} users connected.`)
        }

    })
    let _msg = msg
    for (let key of Object.keys(_msg)){
        //console.log(msg[key])
        for (let val of Object.values(msg[key])){
            //console.log(val['parameter'])
            if (val['parameter'].entrypoint == 'swap'){
                let price;
                let actualPrice = Number(val['parameter'].value['xtz_per_objkt'])
                
                if (actualPrice == 0){
                    price = 0
                } else {
                    price = Number(val['parameter'].value['xtz_per_objkt']) / 1000000
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
                    console.log(`Found a (near) zero OBJKT! at ${price} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`)
                    let msssg = `Found a (near) zero OBJKT! at ${price} $XTZ, with OBJKT ID : ${objktid}, for #${editions} editions.`
                    io.sockets.emit('receive_message', {message:_mesg, username:'Hicetnunc', obid:objktid, price:price, editions:editions, users:users.length})

                }
            }
        }
            
    }
});

init();