const { ethers } = require("hardhat");


module.exports = async ({getNamedAccounts, deployments, network}) => {
    const {deploy} = deployments;
    const {deployer, owner} = await getNamedAccounts();

    const ens = await ethers.getContract('ENSRegistry')

    const publicResolver = await deploy('DefaultReverseResolver', {
        from: deployer, 
        args: [ens.address],
        log: true
    })



}

module.exports.tags = ['reverse-resolver'];
module.exports.dependencies = ['registry']