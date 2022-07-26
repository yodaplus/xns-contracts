const { ethers } = require("hardhat");

const tld_map = {
  mainnet: ["xyz"],
  ropsten: ["xyz"],
  localhost: ["xyz"],
  apothem: ["xyz", "srx"],
};

const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

async function setTLDsOnRoot(owner, root, registrar, tlds) {
  console.log(
    "🚀 ~ file: 10_set_tlds.js ~ line 13 ~ setTLDsOnRoot ~ owner",
    owner
  );
  const rootOwner = await ethers.getContract("Root", owner);
  if (tlds === undefined) {
    return [];
  }

  const transactions = [];
  let t1;
  for (const tld of tlds) {
    const labelhash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tld));
    t1 = await rootOwner.setSubnodeOwner(labelhash, registrar.address);
    await t1.wait();
  }
  console.log(
    "🚀 ~ file: 10_set_tlds.js ~ line 23 ~ setTLDsOnRoot ~ transactions",
    transactions
  );
  return transactions;
}

async function setTLDsOnRegistry(owner, registry, registrar, tlds) {
  if (tlds === undefined) {
    return [];
  }

  const transactions = [];
  let t2;
  for (const tld of tlds) {
    const labelhash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tld));
    t2 = await registry.setSubnodeOwner(
      ZERO_HASH,
      labelhash,
      registrar.address
    );
    await t2.wait();
  }
  return transactions;
}

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const registrar = await ethers.getContract("DNSRegistrar");

  let transactions;
  if (network.tags.use_root) {
    const root = await ethers.getContract("Root");
    transactions = await setTLDsOnRoot(
      owner,
      root,
      registrar,
      tld_map[network.name]
    );
  } else {
    const registry = await ethers.getContract("ENSRegistry");
    transactions = await setTLDsOnRegistry(
      owner,
      registry,
      registrar,
      tld_map[network.name]
    );
  }

  if (transactions.length > 0) {
    console.log(
      `Waiting on ${transactions.length} transactions setting DNS TLDs`
    );
    await Promise.all(transactions.map((tx) => tx.wait()));
  }
};
module.exports.tags = ["dnsregistrar"];
module.exports.dependencies = ["registry", "root", "dnssec-oracle"];
