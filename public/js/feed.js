import {dAppClient, ConnectWallet, checkConnected, disconnect, getMyAddress} from './twallets.js'

(function connect() {

const objktContract = "KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC"
const henContract = "KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w"
const henNftContract = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton"
const teiaMktplace = "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn"
var myAddress=''
let watchingObjkt = true;
let watchingHen = true;

let messageList = document.querySelector('#message-list');
let newPrice = document.querySelector('#price');
let newEditions = document.querySelector("#editions")
let objktWatcher = document.querySelector('#ObjktWatch');
let HENWatcher = document.querySelector('#HENWatch');
let connectWalletBtn = document.getElementById("connect-wallet")
let usersOnline = document.getElementById("usersOnline")



window.onload = async function(){
    socket.editions = 99999999999999999999999999999999999
    let connected = await checkConnected()
    if(connected){
        connectWalletBtn.textContent = 'Connected'
        myAddress = await getMyAddress() 
        console.log(`status : ${connectWalletBtn.textContent} with address ${myAddress.address}.`)
    } else {
        connectWalletBtn.textContent = 'Connect Wallet'
    }
}

connectWalletBtn.addEventListener('click', async () => {
    if (connectWalletBtn.textContent == 'Connect Wallet'){
        try{
            await ConnectWallet()
            connectWalletBtn.textContent = 'Connected'
        } catch(err){
            
            console.log(err)
        }
    } else {
        await disconnect()
        await checkConnected()
        connectWalletBtn.textContent = 'Connect Wallet'
    }
})

var HOST = location.origin.replace(/^http/, 'ws')
let socket = io.connect(HOST)

    setPriceBtn.addEventListener('click', e=> {
        
        let sanitizedValue = 0
        
        if (newPrice.value == '' || newPrice.value == 0){
            socket.threshold = 0
        } else if(newPrice.value > 0){
            sanitizedValue  =Math.abs(newPrice.value)
            socket.threshold = sanitizedValue
        } 

        console.log(`New price threshold @ ${newPrice.value} `)

        socket.emit('change_range', {priceRange : socket.threshold} )
        
        let firstRun = document.getElementById('mainBlock').attributes[0]
        
        if (firstRun.value == 'card invisible'){
            document.getElementById('mainBlock').setAttribute('class', 'visible')
        }  
    });

    setEditionsBtn.addEventListener('click', e=> {
        //console.log('original editions : ', socket.editions)
        console.log(`Setting editions to ${newEditions.value}`)
        if (newEditions.value == '' || newEditions.value == 0){
            socket.editions = 9999999999999999999999999999999
            socket.emit('change_editions',{editions:socket.editions} )            

        } else {
            let cleanEditions = Math.abs(newEditions.value)
            socket.editions = cleanEditions
            socket.emit('change_editions',{editions:cleanEditions}) 
        }
    })

    objktWatcher.addEventListener('change', function(){
        if(this.checked) {
            watchingObjkt = true;
            socket.emit('market_watch', {market:'OBJKT', watchingObjkt:watchingObjkt})  
            console.log('Now watching objkt.com marketplace')
        } else {
            watchingObjkt = false;
            socket.emit('market_watch', {market:'OBJKT', watchingObjkt:watchingObjkt}) 
            console.log('Stopped watching objkt.com marketplace')
        }
    })
    HENWatcher.addEventListener('change', function(){
        if(this.checked) {
            watchingHen = true;
            socket.emit('market_watch', {market:'HEN', watchingHen:watchingHen}) 
            console.log('Now watching HEN marketplace')
        } else {
            watchingHen = false;
            socket.emit('market_watch', {market:'HEN', watchingHen:watchingHen}) 
            console.log('Stopped watching HEN marketplace')
        }
    })

    socket.on('users_update', data => {
        //console.log(data.users)
        usersOnline.innerHTML = `${data.users} users online.`
    })

    socket.on('receive_message', data => {

        //console.log('incoming objkt : ', data)
        let bcdString = 'https://api.better-call.dev/v1/tokens/mainnet/metadata'
        let axiosQuery = ''
        var newAudio = new Audio('sound/ding.mp3');
        newAudio.volume = 0.2;      
        let firstRun = document.getElementById('mainBlock').attributes[0]
        
        if (data.username == 'HicEtNunc'){ 
            axiosQuery = bcdString + '?contract=' +henNftContract.toString() + '&token_id='+data.obid.toString()
        } else if (data.username = 'OBJKT'){
            //console.log(data.ask_id)
            axiosQuery = bcdString + '?contract=' + data.fa2.toString() + '&token_id=' + data.obid.toString()
        } else {
            console.log('Error')
        }
        
        if (firstRun.value == 'card invisible'){
            newAudio.muted = true
        }

        let _text =''
        //console.log(`object price ${data.price} from ${data.username}`)
        let textPrice = (Number(data.price)  / 1000000);
        if (data.price == 0) {
            _text = data.username + ": " + data.message + `OBJKT ID : ` + data.obid + `,  ${data.editions} `
        } else {
            _text = data.username + ": " + data.message + ` With price : ${data.textPrice} $XTZ, ${data.editions} `
        }

        axios.get(axiosQuery)
            .then((response) => {
                //console.log('response :', response)
                let tokenSupply = response.data[0]['supply']
                
                //massive if statement coming
                
                if ((tokenSupply <= socket.editions) && (data.textPrice <= socket.threshold)){
                    let linkToObjkt = ''
                    let listItem = document.createElement('li')
                    if (data.price == 0){
                        listItem.setAttribute("class", "p-3 mb-2 bg-danger text-white")
                        newAudio.play();
                    } else {
                        listItem.setAttribute('class', "list-group-item list-group-item-light text-centered")
                    }
                    let direct_uri = ''
                    let uriArray = []
                    if( response.data[0]['thumbnail_uri'] == undefined) {
                        console.log(`URI for objkt with ID: ${data.obid} came empty!`)
                        direct_uri = ''
                        uriArray = ['','']
                    } else {
                        direct_uri = response.data[0]['thumbnail_uri'] 
                        uriArray = direct_uri.split("//")
                    }
                    
                    let fullUri = 'https://ipfs.io/ipfs/' + uriArray[1] 
                    document.createElement('div')
                    let buyButton = document.createElement('button')
                    if (data.username == 'OBJKT'){
                        linkToObjkt = 'https://objkt.com/asset/'+data.fa2+'/'+ data.obid
                    } else {
                        linkToObjkt = 'https://teia.art/objkt/' + data.obid
                    }
                    
                    buyButton.setAttribute('class', "btn btn-dark btn-sm")
                    buyButton.addEventListener('click', e => {
                        if (data.username == 'OBJKT') {
                            try{
                                let askid = ''+data.ask_id    
                                dAppClient.requestOperation({
                                    operationDetails:[
                                        {
                                            kind:beacon.TezosOperationType.TRANSACTION,
                                            source:myAddress,
                                            destination: objktContract,
                                            amount:`${data.price}`,
                                            storage_limit:"350",
                                            parameters:{
                                                entrypoint:"fulfill_ask",
                                                value:{
                                                    prim : "Pair",
                                                    args:[
                                                        {
                                                            int:askid
                                                        },
                                                        {
                                                            prim:"None"
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ]
                                })
                            } catch(err){
                                alert(err)
                            }

                        } if (data.username =='HicEtNunc'){
                            try{
                                
                                function calculateId(_id){
                                    let inId = Number(_id) - 1
                                    return String(inId)
                                }

                                let swap_id = calculateId(data.swapId)   
                                dAppClient.requestOperation({
                                    operationDetails:[
                                        {
                                           kind:beacon.TezosOperationType.TRANSACTION,
                                           destination: henContract,
                                           amount:data.price,
                                           storage_limit:"350",
                                           parameters:{
                                               entrypoint:"collect",
                                               value:{
                                                   int:swap_id
                                               }
                                            }
                                        }
                                    ]
                                }) 
                            } catch(err){
                                alert(err)
                            }
                       
                        }                                
                    })
                    buyButton.setAttribute('style', "padding : 5px")
                    buyButton.textContent = 'Buy now!'
                    listItem.innerHTML = _text + ` / ${response.data[0]['supply']} editions.  `
                    let thumb = document.createElement('img')
                    thumb.setAttribute('id', "source_thumbnail")
                    thumb.setAttribute('onclick', 'window.open("'+linkToObjkt+'");')
                    // let _thumbnail = document.querySelector('#source_thumbnail').src=(fullUri)
                    thumb.src=(fullUri)
                    thumb.setAttribute('style', "width:3em; height:3em; padding:5px")
                    thumb.setAttribute('onerror', "this.src='/img/robber.png'")
    
                    listItem.prepend(thumb)
                    listItem.append(buyButton)
                    listItem.classList.add('list-group-item')
                    messageList.prepend(listItem)
                }

            
            }).catch (function(err) {
                console.log('error encountered! Keeping on.', err)
            })
    })
})();

