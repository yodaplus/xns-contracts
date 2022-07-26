const { ethers } = require("hardhat");
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const sha3 = require("web3-utils").sha3;
const namehash = require("eth-ens-namehash");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const ens = await ethers.getContract("ENSRegistry");
  //   const nameresolve = await ethers.getContract("NameResolver");
  const resolver = await ethers.getContract("PublicResolver");
  console.log("Deploying Reverse Registrar...");
  await deploy("ReverseRegistrar", {
    from: deployer,
    args: [ens.address, resolver.address],
  });
  const reverseRegistrar = await ethers.getContract("ReverseRegistrar");

  const transactions = [];
  const t1 = await ens.setSubnodeOwner(ZERO_HASH, sha3("reverse"), deployer);
  await t1.wait();
  const t2 = await ens.setSubnodeOwner(
    namehash.hash("reverse"),
    sha3("addr"),
    reverseRegistrar.address
  );
  await t2.wait();
  console.log(
    `Waiting on settings to take place of reverse registrar ${transactions.length}`
  );
  await Promise.all(transactions.map((tx) => tx.wait()));
};

module.exports.tags = ["reverse-registrar"];
module.exports.dependencies = ["registry", "public-resolver"];
