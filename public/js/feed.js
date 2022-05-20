
(function connect() {


    
    let socket = io.connect('http://localhost:3000')
    //let socket = io.connect('/')
    let watchingObjkt = true;
    let watchingHen = true;
    let messageList = document.querySelector('#message-list');
    let newPrice = document.querySelector('#price');
    let objktWatcher = document.querySelector('#ObjktWatch');
    let HENWatcher = document.querySelector('#HENWatch');

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
            
            axiosQuery = bcdString + '?token_id='+data.obid.toString()
        } else if (data.username = 'OBJKT'){
            //console.log('received ok objkt')
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
        console.log(axiosQuery)
        axios.get(axiosQuery)
        // axios.get('https://api.better-call.dev/v1/tokens/mainnet/metadata?token_id=' + data.obid.toString())
            .then((response) => {
                console.log('response :', response)
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
                console.log('artifact uri :' , response.data[0]['thumbnail_uri'])
                if( response.data[0]['artifact_uri'] == undefined) {
                    console.log(`URI for objkt with ID: ${data.obid} came empty!`)
                    direct_uri = ''
                    uriArray = ['','']
                } else {
                    direct_uri = response.data[0]['artifact_uri'] 
                    uriArray = direct_uri.split("//")
                }
                
                let fullUri = 'https://ipfs.io/ipfs/' + uriArray[1] 
                document.createElement('div')
                let buyButton = document.createElement('button')
                if (data.username == 'OBJKT'){
                    linkToObjkt = 'https://objkt.com/asset/'+data.fa2+'/'+ data.obid
                } else {
                    linkToObjkt = 'https://hicetnunc.art/objkt/' + data.obid
                }
                
                buyButton.setAttribute('class', "btn btn-dark btn-sm")
                buyButton.setAttribute('onclick', 'window.open("'+linkToObjkt+'");')
                buyButton.setAttribute('style', "padding : 5px")
                buyButton.textContent = 'Buy now!'
                listItem.innerHTML = _text + ` / ${response.data[0]['supply']} editions.  `
                let thumb = document.createElement('img')
                thumb.setAttribute('id', "source_thumbnail")
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

