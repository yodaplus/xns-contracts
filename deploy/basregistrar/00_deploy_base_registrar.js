const { ethers } = require("hardhat");
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// const ethernal = require('hardhat-ethernal');

const sha3 = require("web3-utils").sha3;
const namehash = require("eth-ens-namehash");

module.exports = async ({ getNamedAccounts, deployments, network, config }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const ens = await ethers.getContract("ENSRegistry");

  await deploy("BaseRegistrarImplementation", {
    from: deployer,
    args: [ens.address, namehash.hash(config.tld)],
    log: true,
  });

  const base = await ethers.getContract("BaseRegistrarImplementation");

  const transactions = [];
  const t1 = await base.addController(deployer);
  await t1.wait();
  console.log(
    "setting " + config.tld + " owner to registrar address " + base.address
  );
  const t2 = await ens.setSubnodeOwner(
    ZERO_HASH,
    sha3(config.tld),
    base.address
  );
  await t2.wait();

  console.log(
    `Waiting on ${transactions.length} transactions setting base registrar`
  );
  await Promise.all(transactions.map((tx) => tx.wait()));
};

module.exports.tags = ["baseregistrar"];
module.exports.dependencies = ["registry"];
