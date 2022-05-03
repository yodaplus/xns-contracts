const { ethers } = require("hardhat");
module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ens = await ethers.getContract('ENSRegistry');
    const resolver = await ethers.getContract('PublicResolver');

    await deploy('ReverseRegistrar', {
        from: deployer, 
        args:[ens.address, resolver.address]
    })
}

module.exports.tags = ['reverse-registrar'];
module.exports.dependencies = ['registry', 'public-resolver']