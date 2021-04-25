const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
    constructor(senderAdress, receiverAdress, amount) {
        this.senderAdress = senderAdress;
        this.receiverAdress = receiverAdress;
        this.amount = amount;
    }
    calculateHash() {
        return SHA256(this.senderAdress + this.receiverAdress + this.amount).toString();
    }
    signTransaction(signingKey) {
        if (signingKey.getPublic("hex") !== this.senderAdress) {
            throw new Error("You cant sign transactions for other wallets");
        }

        const hashTransaction = this.calculateHash();
        const sign = signingKey.sign(hashTransaction, "base64");
        this.signature = sign.toDER("hex");
    }
    isValid() {
        if (this.senderAdress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error("No signature in this transaction");
        }
        const publicKey = ec.keyFromPublic(this.senderAdress, "hex");
        return publicKey.verfy(this.calculateHash(), this.signature);
    }
}
class Block {
    constructor(timestamp, transactions, previousHash = "") {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = "";
        this.nonce = 0;
    }
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined " + this.hash);
    }
    hasValidTransaction() {
        for (const tx of this.transactions) {
            if (!tx.isValid) {
                return false;
            }
        }
        return true;
    }
}
class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        return new Block("2021-04-17", "Genesis block", "0");
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAdress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("Block succesfully mined");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAdress, this.miningReward)
        ]
    }
    addTransaction(transaction) {
        if (!transaction.senderAdress || !transaction.receiverAdress) {
            throw Error("Transaction must include sender and receiver adress");
        }
        if (!transaction.isValid) {
            throw Error("Can't add invalid transaction to chain");
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAdress(adress) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.senderAdress == adress) {
                    balance -= transaction.amount;
                }
                if (transaction.receiverAdress == adress) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }
    isChainValid() {
        for (var i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransaction()) return false;
            if (currentBlock.hash !== currentBlock.calculateHash()) return false
            if (currentBlock.previousHash !== previousBlock.hash) return false
        }
        return true;
    }

}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;