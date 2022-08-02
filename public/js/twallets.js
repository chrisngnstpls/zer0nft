
const dAppClient = new beacon.DAppClient({ name: "zer0Nft" });



// This code should be called every time the page is loaded or refreshed to see if the user has already connected to a wallet.


async function ConnectWallet(){
  const activeAccount = await dAppClient.getActiveAccount();
  let myAddress= ''
  if (activeAccount) {
    // If defined, the user is connected to a wallet.
    // You can now do an operation request, sign request, or send another permission request to switch wallet
    console.log("Already connected:", activeAccount.address);
    myAddress = activeAccount.address;
  } else {
    const permissions = await dAppClient.requestPermissions();
    console.log("New connection:", permissions.address);
    myAddress = permissions.address;
  }
  return await myAddress;

}
async function checkConnected(){
  try{
    const activeAccount = await dAppClient.getActiveAccount()
    if(activeAccount){
      console.log('existing account')
      return true
    } else if(!activeAccount){
      console.log('account unavailable')
      return false
    }
  }catch(err){
    console.log(err)
    return err
  }
}

async function getMyAddress(){
  try{
    const myAdd = await dAppClient.getActiveAccount();
    return myAdd
  } catch (err){
    console.log(err)
  }
}
async function disconnect(){
  try{
    await dAppClient.clearActiveAccount()
    const activeAccount = await dAppClient.getActiveAccount()
    if(activeAccount){
      console.log('active account : ', activeAccount.address)
      return false
    } else {
      return true
      console.log('user disconnected')
    }
  }catch(err){
    console.log(err)
  }

}


export {dAppClient, ConnectWallet, checkConnected, disconnect, getMyAddress}

