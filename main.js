const { BlockChain, Transaction } = require("./BlockChain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate("c6f4b5500bf707f4532a4746f6d1a66ca775dc2bb4ec00812f7b1f218eaf99d4");
const myWalletAdress = myKey.getPublic("hex");

let coin = new BlockChain();
const tx1 = new Transaction(myWalletAdress, "publickeygoeshere", 10);
tx1.signTransaction(myKey);
coin.addTransaction(tx1);

console.log("\n Starting the mining");
coin.minePendingTransactions(myWalletAdress);
console.log("\n Balance of miner is ", coin.getBalanceOfAdress(myWalletAdress));
console.log(coin.isChainValid());