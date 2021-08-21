var mysql = require('mysql');
// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다. 
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'masan'
});

const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS()

const accessKeyId = "KASKSHHATZX7DRANWSQVZUI0";
const secretAccessKey = "q9e1LNqpQOqWHYC1CN1QhHCSrcm3-OYaIAykLJmb";

const chainId = 1001 // 클레이튼 테스트 네트워크 접속 ID 

caver.initKASAPI(chainId, accessKeyId, secretAccessKey) //KAS console 초기화

const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey('0x5b8e84b6389c2cee6cf433399d358f577b3f200dd853c44c52d140ff3426cf72')
keyringContainer.add(keyring)       //klaytn Keyring 설정 

async function create_wallet(){     //wallet 생성 function
    const wallet = await caver.kas.wallet.createAccount()   //wallet 생성
    // console.log(wallet);
    return wallet.address
}

// create_wallet().then(
    
//     userWallet => {
//     connection.connect();
//     console.log(userWallet)
//     connection.query(`INSERT INTO users (username, email, address) VALUES ('Franci', '1@naver.com', '${userWallet}');`, (error, results) =>{
//         if (error) {
//             console.log(error);
//         }
//         console.log(results);
//     });
      
//     connection.end();}
// )

async function token_trans(_address){       //token 송금 function
    const kip7 = new caver.kct.kip7('0xDDf9DB55c8fcD18270442409A01892f8E0FDf255')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정        
    const receipt = await kip7.transfer(_address, '10', { from: keyring.address })       //transfer('토큰 받는 주소', 토큰 양, {from:'트랜젝션을 일으키는 주소'})
    console.log(receipt);
}

async function balanceOf(_address){
    const kip7 = new caver.kct.kip7('0xDDf9DB55c8fcD18270442409A01892f8E0FDf255')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정  
    const receipt = await kip7.balanceOf(_address)  //balanceOf('토큰 조회할 주소')
    console.log(receipt);
    return receipt
}



balanceOf('0xA43a747C42b892B0Bf70E09711e0FA04e017E36D')