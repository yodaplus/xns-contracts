const { ethers } = require("hardhat");

// const ethernal = require('hardhat-ethernal');

const namehash = require('eth-ens-namehash');

module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ens = await ethers.getContract('ENSRegistry')

    await deploy('BaseRegistrarImplementation', {
        from: deployer, 
        args: [ens.address, namehash.hash('avax')],
        log: true
    })
}


module.exports.tags = ['baseregistrar'];
module.exports.dependencies = ['registry']