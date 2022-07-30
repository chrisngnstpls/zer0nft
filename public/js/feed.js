import {dAppClient, ConnectWallet, checkConnected, disconnect} from './twallets.js'

(function connect() {

const objktContract = "KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC"
const henContract = "KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w"
const henNftContract = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton"
var myAddress=''
let watchingObjkt = true;
let watchingHen = true;

let messageList = document.querySelector('#message-list');
let newPrice = document.querySelector('#price');
let objktWatcher = document.querySelector('#ObjktWatch');
let HENWatcher = document.querySelector('#HENWatch');
let connectWalletBtn = document.getElementById("connect-wallet")



// var infoPopover = new bootstrap.Popover(document.querySelector('[data-bs-toggle="popover"'), {
//     placement:'bottom',
//     html:true,
//     template : '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
// })
// connectWalletBtn.setAttribute('data-bs-content', `Address : ${acct.address}\nConnected on :${acct.network.type} \nPrice Threshold set : ${price}`)
// infoPopover.setContent()


window.onload = async function(){
    // console.log('inside onload : ', infoPopover)
    let connected = await checkConnected()
    if(connected){
        connectWalletBtn.textContent = 'Connected'

        console.log('button content: ', connectWalletBtn.textContent)
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
        console.log('run disconnect')
        await checkConnected()
        connectWalletBtn.textContent = 'Connect Wallet'
    }
})

let socket = io.connect(`http://0.0.0.0:${process.env.PORT}`)
    //let socket = io.connect('/')
    setPriceBtn.addEventListener('click', e=> {
        if (newPrice.value == ''){
            newPrice.value = 1
        }
        console.log(`New price threshold @ ${newPrice.value} `)
        let sanityValue = Math.abs(newPrice.value)
        socket.emit('change_range', {priceRange : sanityValue} )
        newPrice.value = sanityValue
        let firstRun = document.getElementById('mainBlock').attributes[0]
        
        if (firstRun.value == 'card invisible'){
            document.getElementById('mainBlock').setAttribute('class', 'visible')
        }  
    });

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

    socket.on('receive_message', data => {

        console.log('incoming objkt : ', data)
        let bcdString = 'https://api.better-call.dev/v1/tokens/mainnet/metadata'
        let axiosQuery = ''
        let contract = ''
        let itemId = ''
        var newAudio = new Audio('sound/ding.mp3');
        newAudio.volume = 0.2;      
        let firstRun = document.getElementById('mainBlock').attributes[0]
        
        if (data.username == 'HicEtNunc'){ 
            axiosQuery = bcdString + '?contract=' +henNftContract.toString() + '&token_id='+data.obid.toString()
        } else if (data.username = 'OBJKT'){
            console.log(data.ask_id)
            axiosQuery = bcdString + '?contract=' + data.fa2.toString() + '&token_id=' + data.obid.toString()
        } else {
            console.log('Error bitchez')
        }
        
        if (firstRun.value == 'card invisible'){
            newAudio.muted = true
        }
        let _text =''
        if (data.price == 0) {
            _text = data.username + ": " + data.message + `OBJKT ID : ` + data.obid + `,  ${data.editions} `
        } else {
            _text = data.username + ": " + data.message + ` With price : ${data.price} $XTZ, ${data.editions} `
        }
        //console.log(axiosQuery)
        axios.get(axiosQuery)
        // axios.get('https://api.better-call.dev/v1/tokens/mainnet/metadata?token_id=' + data.obid.toString())
            .then((response) => {
                //console.log('response :', response)
                let linkToObjkt = ''
                let listItem = document.createElement('li')
                if (data.price == 0){
                    listItem.setAttribute("class", "p-3 mb-2 bg-danger text-white")
                    newAudio.play();
                } else {
                    listItem.setAttribute('class', "list-group-item list-group-item-light text-centered")
                }
                // console.log(response.data[0])
                // console.log(response.data[0]['artifact_uri'])
                let direct_uri = ''
                let uriArray = []
                //console.log(response.data)
                //console.log('artifact uri :' , response.data[0]['thumbnail_uri'])
                console.log('uri:', response.data[0])
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
                //buyButton.setAttribute('onclick', 'window.open("'+linkToObjkt+'");')
                buyButton.addEventListener('click', e => {
                    console.log('local Account : ', myAddress)
                    // window.open(("'+linkToObjkt+'"))
                    if (data.username == 'OBJKT') {
                        console.log('ask id:', data.ask_id)
                        let transPrice = data.price * 1000000
                        let sentPrice = transPrice.toString()
                        let askid = ''+data.ask_id
                        transPrice.toString
                        dAppClient.requestOperation({
                            operationDetails:[
                                {
                                    kind:beacon.TezosOperationType.TRANSACTION,
                                    source:myAddress,
                                    destination: objktContract,
                                    amount:sentPrice,
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
                    } else if (data.username =='HicEtNunc'){
                        let objktId = ''+data.obid
                        let henPrice = data.price * 1000000
                        //henPrice = ''+henPrice
                        console.log(typeof(henPrice), henPrice)
                        let testId = objktId - 663277
                        
                        dAppClient.requestOperation({
                            operationDetails:[
                                {
                                   kind:beacon.TezosOperationType.TRANSACTION,
                                   source:myAddress,
                                   destination: henContract,
                                   amount:henPrice,
                                   parameters:{
                                       entrypoint:'collect',
                                       value:{
                                           int:objktId
                                       }
                                    }
                                }
                            ]
                        })                        
                    }                                
                })
                buyButton.setAttribute('style', "padding : 5px")
                buyButton.textContent = 'Buy now!'
                listItem.innerHTML = _text + ` / ${response.data[0]['supply']} editions.  `
                let thumb = document.createElement('img')
                thumb.setAttribute('id', "source_thumbnail")
                thumb.setAttribute('onclick', 'window.open("'+linkToObjkt+'");')
                // let _thumbnail = document.querySelector('#source_thumbnail').src=(fullUri)
                
                //console.log(thumb)
                thumb.src=(fullUri)
                thumb.setAttribute('style', "width:3em; height:3em; padding:5px")
                thumb.setAttribute('onerror', "this.src='/img/robber.png'")
                // _thumbnail.setAttribute('style', "width:3em; height:3em; padding:5px")
                // _thumbnail.setAttribute('onerror', "this.src='/img/robber.png'")
                listItem.prepend(thumb)
                listItem.append(buyButton)
                listItem.classList.add('list-group-item')
                messageList.prepend(listItem)
            
            }).catch (function(err) {
                console.log('error encountered! Keeping on.', err)
            })
    })
})();

