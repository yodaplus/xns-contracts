const { ethers } = require("hardhat");
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// const ethernal = require('hardhat-ethernal');

const sha3 = require("web3-utils").sha3;
const namehash = require("eth-ens-namehash");

module.exports = async ({ getNamedAccounts, deployments, network, config }) => {
  const tlds = [];
  const configtlds = config.tlds;
  // run loop in configtlds
  configtlds.forEach((tld) => tlds.push(namehash.hash(tld)));

  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const ens = await ethers.getContract("ENSRegistry");

  await deploy("BaseRegistrarImplementation", {
    from: deployer,
    args: [ens.address, configtlds],
    log: true,
  });

  const base = await ethers.getContract("BaseRegistrarImplementation");

  const transactions = [];
  transactions.push(await base.addController(deployer));
  console.log(
    "setting " + config.tld + " owner to registrar address " + base.address
  );
  transactions.push(
    await ens.setSubnodeOwner(ZERO_HASH, sha3(config.tld), base.address)
  );

  console.log(
    `Waiting on ${transactions.length} transactions setting base registrar`
  );
  await Promise.all(transactions.map((tx) => tx.wait()));
};

module.exports.tags = ["baseregistrar"];
module.exports.dependencies = ["registry"];
