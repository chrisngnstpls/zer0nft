
(async function wal(){
    //console.log(taquitoBeaconWallet.BeaconWallet)
    const options = {
    name: 'zer0nft',
    preferredNetwork: "mainnet",
    eventHandlers: {
        PERMISSION_REQUEST_SUCCESS: {
        handler: async (data) => {
            console.log('permission data:', data);
        },
        },
    },
    };
    const wallet = new taquitoBeaconWallet.BeaconWallet({name:'localWallet'});

    // The Beacon wallet requires an extra step to set up the network to connect to and the permissions:
    await wallet.requestPermissions({
    network: {
        type: 'mainnet',
    },
    });

    const Tezos = new TezosToolkit('https://mainnet.api.tez.ie');
    Tezos.setWalletProvider(wallet);
})();