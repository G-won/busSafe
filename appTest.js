const web = require('web3')
const BusSafe = require('./build/contracts/BusSafe.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

const smartcontract = new cav.klay.Contract(BusSafe.abi, BusSafe.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("0x719b2be80ca80f7f5a01921d86e60ac59c1f5d1a", "0x5b8e84b6389c2cee6cf433399d358f577b3f200dd853c44c52d140ff3426cf72")
cav.klay.accounts.wallet.add(account)

// const accessKeyId = "KASKSHHATZX7DRANWSQVZUI0";
// const secretAccessKey = "q9e1LNqpQOqWHYC1CN1QhHCSrcm3-OYaIAykLJmb";

// const chainId = 1001 // 클레이튼 테스트 네트워크 접속 ID 

// caver.initKASAPI(chainId, accessKeyId, secretAccessKey) //KAS console 초기화

// const keyringContainer = new caver.keyringContainer()
// const keyring = keyringContainer.keyring.createFromPrivateKey('0x5b8e84b6389c2cee6cf433399d358f577b3f200dd853c44c52d140ff3426cf72')
// keyringContainer.add(keyring)       //klaytn Keyring 설정 


smartcontract.methods.AddCheckList("마산가1234", "엔진이상없음", "청결상태양호", 20210817).send({
    from: "0xA43a747C42b892B0Bf70E09711e0FA04e017E36D",
    gas: 8500000  
}).then(
    receipt=>console.log(receipt)
)

// smartcontract.methods.GetCheck(0)
// .call()
// .then(data=>console.log(data))