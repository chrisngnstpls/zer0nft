

(function connect() {


    
    //let socket = io.connect('http://localhost:3000')
    let socket = io.connect('/')

    let messageList = document.querySelector('#message-list')
    let newPriceBtn = document.querySelector('#setprice')
    let newPrice = document.querySelector('#price')
    let footer = document.querySelector('#footerSticky')

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


    socket.on('receive_message', data => {
        var newAudio = new Audio('sound/ding.mp3');
        newAudio.volume = 0.2;      
        let firstRun = document.getElementById('mainBlock').attributes[0]
        
        if (firstRun.value == 'card invisible'){
            newAudio.muted = true
        }
        let _text =''
        if (data.price == 0) {
            _text = data.username + ": " + data.message + `OBJKT ID : ` + data.obid + `,  ${data.editions} `
        } else {
            _text = data.username + ": " + data.message + ` With price : ${data.price} $XTZ, ${data.editions} `
        }

        axios.get('https://api.better-call.dev/v1/tokens/mainnet/metadata?token_id=' + data.obid.toString())
            .then((response) => {
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
                if( response.data[0]['artifact_uri'] == undefined) {
                    console.log(`URI for objkt with ID: ${data.obid} came empty!`)
                    direct_uri = ''
                    uriArray = ['','']
                } else {
                    direct_uri = response.data[0]['artifact_uri'] 
                    uriArray = direct_uri.split("//")
                }
                
                let fullUri = 'https://cloudflare-ipfs.com/ipfs/' + uriArray[1] 
                document.createElement('div')
                let buyButton = document.createElement('button')
                let linkToObjkt = 'https://hicetnunc.xyz/objkt/' + data.obid
                buyButton.setAttribute('class', "btn btn-dark btn-sm")
                buyButton.setAttribute('onclick', 'window.open("'+linkToObjkt+'");')
                buyButton.setAttribute('style', "padding : 5px")
                buyButton.textContent = 'Buy now!'
                listItem.innerHTML = _text + ` / ${response.data[0]['supply']} editions.  `
                let thumb = document.createElement('img')
                thumb.src=(fullUri)
                listItem.prepend(thumb)
                thumb.setAttribute('style', "width:3em; height:3em; padding:5px")
                thumb.setAttribute('onerror', "this.src='/img/robber.png'")
                listItem.append(buyButton)
                listItem.classList.add('list-group-item')
                messageList.prepend(listItem)
            }).catch(function(err) {
                console.log('error encountered!')
                console.log(err)
            })
    })
})();

