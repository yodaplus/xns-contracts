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

    const controller = await ethers.getContract('ETHRegistrarController')
    const transactions = []
    transactions.push(await baseRegistrar.addController(controller.address, {from: deployer}))
    // ESTIMATE GAS -->
    transactions.push(await controller.setPriceOracle(priceOracle.address, {from: deployer}));
    console.log(`Waiting on settings to take place ${transactions.length}`)
    await Promise.all(transactions.map((tx) => tx.wait()));
    




}

module.exports.tags = ['eth-registrar'];
module.exports.dependencies = ['registry', 'oracles']