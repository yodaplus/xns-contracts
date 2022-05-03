const { ethers } = require("hardhat");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const baseRegistrar = await ethers.getContract('BaseRegistrarImplementation');

    const priceOracle = await ethers.getContract('StablePriceOracle');

    const reverseRegistrar = await ethers.getContract('ReverseRegistrar')

    await deploy('ETHRegistrarController', {
        from: deployer, 
        args: [baseRegistrar.address, priceOracle.address, 600, 86400, reverseRegistrar.address, ZERO_ADDRESS],
        log: true
    })  

}

module.exports.tags = ['eth-registrar'];
module.exports.dependencies = ['registry', 'oracles', 'reverse-registrar']