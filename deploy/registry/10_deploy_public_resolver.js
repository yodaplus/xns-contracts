const { ethers } = require("hardhat");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000"
const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ens = await ethers.getContract('ENSRegistry')

    await deploy('PublicResolver', {
        from: deployer, 
        args: [ens.address, ZERO_ADDRESS],
        log: true
    })

    const resolver = await ethers.getContract('PublicResolver')

    const transactions = []
    transactions.push(await ens.setSubnodeOwner(ZERO_HASH, sha3('avax'), deployer))
    transactions.push(await ens.setResolver(namehash.hash('avax'), resolver.address))
    transactions.push(await resolver['setAddr(bytes32,address)'](namehash.hash('avax'), resolver.address))
    console.log(`Waiting on settings to take place on resolvers ${transactions.length}`)
    await Promise.all(transactions.map((tx) => tx.wait()));
    
    // const rootOwner = await ens.owner(ZERO_HASH);
    //     switch(rootOwner) {
    //     case deployer:
    //         // const tx = await base.addController(owner, {from: deployer});
    //         // console.log("Setting Controller on base (tx:${tx.hash})...");
    //         // await tx.wait();
    //         break;
    //     case owner:
    //         console.log('e')
    //         const tx = await ens.setSubnodeOwner(ZERO_HASH, sha3('avax'), owner, {from: deployer});
    //         console.log("Setting Controller on base (tx:${tx.hash})...");
    //         await tx.wait();
    //         break;
    //     default:
    //         console.log(`WARNING: ENS registry root is owned by ${rootOwner}; cannot transfer to owner`);
    //     }

    

}

module.exports.tags = ['public-resolver'];
module.exports.dependencies = ['registry']