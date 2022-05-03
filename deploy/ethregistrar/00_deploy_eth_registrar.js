const { ethers } = require("hardhat");


module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const baseRegistrar = await ethers.getContract('BaseRegistrarImplementation');

    const priceOracle = await ethers.getContract('StablePriceOracle')

    await deploy('ETHRegistrarController', {
        from: deployer, 
        args: [baseRegistrar.address, priceOracle.address, 600, 86400],
        log: true
    })  

}

module.exports.tags = ['eth-registrar'];
module.exports.dependencies = ['registry', 'oracles']