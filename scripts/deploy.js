const { ethers, run, network } = require("hardhat")

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying contract...")
    const simpleStorage = await SimpleStorageFactory.deploy()
    await simpleStorage.deployed()
    console.log(`Deployed Contract at: ${simpleStorage.address}`)

    // what happens wehn we deploy to our hardhat network?
    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block txs.....")
        await simpleStorage.deployTransaction.wait(6)
        await verify(simpleStorage.address, [])
    }
    const currentValue = await simpleStorage.retrieve()
    console.log(`Current Value is: ${currentValue}`)
    //update the current value
    const transactionResponse = await simpleStorage.store(6)
    await transactionResponse.wait(1)
    const updatedValue = await simpleStorage.retrieve()
    console.log(`New value is: ${updatedValue}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying Contract.....")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
