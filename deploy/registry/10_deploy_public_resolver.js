const { ethers } = require("hardhat");
const sha3 = require("web3-utils").sha3;
const namehash = require("eth-ens-namehash");
const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async ({ getNamedAccounts, deployments, network, config }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const ens = await ethers.getContract("ENSRegistry");
  const baseRegistrar = await ethers.getContract("BaseRegistrarImplementation");

  await deploy("PublicResolver", {
    from: deployer,
    args: [ens.address, ZERO_ADDRESS],
    log: true,
  });

  const resolver = await ethers.getContract("PublicResolver");

  const transactions = [];
  const t1 = await ens.setSubnodeOwner(ZERO_HASH, sha3(config.tld), deployer);
  console.log("Waiting for t1 to complete...");
  await t1.wait();
  const t2 = await ens.setResolver(namehash.hash(config.tld), resolver.address);
  console.log("Waiting for t2 to complete...");
  await t2.wait();
  const t3 = await resolver["setAddr(bytes32,address)"](
    namehash.hash(config.tld),
    resolver.address
  );
  console.log("Waiting for t3 to complete...");
  await t3.wait();
  const t4 = await ens.setSubnodeOwner(
    ZERO_HASH,
    sha3(config.tld),
    baseRegistrar.address
  );
  console.log("Waiting for t4 to complete...");
  await t4.wait();
  console.log(
    `Waiting on settings to take place on resolvers ${transactions.length}`
  );
  await Promise.all(transactions.map((tx) => tx.wait()));

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
};

module.exports.tags = ["public-resolver"];
module.exports.dependencies = ["registry"];
