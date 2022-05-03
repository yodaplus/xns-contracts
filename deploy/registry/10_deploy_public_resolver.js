const { ethers } = require("hardhat");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ens = await ethers.getContract('ENSRegistry')

    await deploy('PublicResolver', {
        from: deployer, 
        args: [ens.address, ZERO_ADDRESS],
        log: true
    })

    
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