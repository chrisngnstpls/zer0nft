
(async function wal(){
    
    let connButton = document.getElementById('walletConnect')
    let balance, address;
    window.onload = () => {
    connButton.addEventListener('click', e=>{
        console.log('clicked')
        initWallet()
    })

    }

    const initWallet = async () => {
        try{
            const Tezos = new taquito.TezosToolkit('https://mainnet-tezos.giganode.io')
            const options = {
                name: 'zer0nft',
                iconUrl: 'https://tezostaquito.io/img/favicon.png',
                preferredNetwork: "mainnet",
                eventHandlers: {
                  PERMISSION_REQUEST_SUCCESS: {
                    handler: async (data) => {
                      console.log('permission data:', data);
                    },
                  },
                },
              };
            const wallet = new BeaconWallet.BeaconWallet(options)
            const network = 'mainnet'
            await wallet.requestPermissions({
                network:{
                    type:'mainnet'
                }
            })
            Tezos.setWalletProvider(wallet)
            address = wallet.permissions.address
            balance = await Tezos.tz.getBalance(address)
            console.log(address)

        } catch(err){
            console.log('error : ', err)
        }
    }

})();