// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const sha3 = require('web3-utils').sha3;
const namehash = require('eth-ens-namehash');


const {getNamedAccounts, hardhatArguments, deployments, web3, ethers, config} = hre;

const tld_map = {
    'mainnet': ['xyz'],
    'ropsten': ['xyz'],
    'localhost': ['xyz'],
}

async function setTLDsOnRoot(owner, root, registrar, tlds) {
    if(tlds === undefined){
        return [];
    }

    const transactions = []
    for(const tld of tlds) {
        const labelhash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tld));
        transactions.push(await root.setSubnodeOwner(labelhash, registrar.address, {from: owner}));
    }
    return transactions;
}

async function setTLDsOnRegistry(owner, registry, registrar, tlds) {
    if(tlds === undefined){
        return [];
    }

    const transactions = []
    for(const tld of tlds) {
        const labelhash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tld));
        transactions.push(await registry.setSubnodeOwner(ZERO_HASH, labelhash, registrar.address, {from: owner}));
    }
    return transactions;
}

async function main() {
    const {deployer, owner} = await getNamedAccounts();
    const getContract = async (name) => {
        const contract = await deployments.get(name);
        return ethers.getContractAt(contract.abi, contract.address);
    }

    const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    const ens = await getContract('ENSRegistry');
    const registrar = await getContract('BaseRegistrarImplementation');
    const reverse = await getContract('ReverseRegistrar');
    const controller = await getContract('ETHRegistrarController');
    const resolver = await getContract('PublicResolver');
    const priceOracle = await ethers.getContract('StablePriceOracle')


    console.log(`Waiting on ${transactions.length} transactions setting base registrar`);
    await registrar.addController(deployer)

    console.log('setting ' + config.tld + ' owner to registrar address ' + registrar.address);
    await ens.setSubnodeOwner(ZERO_HASH, sha3(config.tld), registrar.address);

    console.log('setting .reverse owner to deployer account address ' + deployer);
    await ens.setSubnodeOwner(ZERO_HASH, sha3('reverse'), deployer);

    console.log('setting addr.reverse owner to ReverseRegistrar address ' + reverse.address);
    await ens.setSubnodeOwner(namehash.hash('reverse'), sha3('addr'), reverse.address);

    console.log('adding ETHRegistrarController to the BaseRegistrar');
    await registrar.addController(controller.address, {from: deployer});
    // ESTIMATE GAS -->
    await controller.setPriceOracle(priceOracle.address, {from: deployer});

    console.log('use PublicResolver in the BaseRegistrar');
    await ens.setSubnodeOwner(ZERO_HASH, sha3(config.tld), deployer)
    await ens.setResolver(namehash.hash(config.tld), resolver.address)
    await resolver['setAddr(bytes32,address)'](namehash.hash(config.tld), resolver.address)
    await registrar.setResolver(resolver.address);

    // Optional for later setting ReverseRegistrar and ENSRegistry owners to burn address
    // console.log('Setting .reverse owner to burn address');
    // await ens.setSubnodeOwner(ZERO_HASH, web3.utils.sha3('reverse'), EMPTY_ADDRESS);
    //
    // console.log('Setting registry owner to burn address')
    // await ens.setOwner(ZERO_HASH, EMPTY_ADDRESS);
    const DNSRegistrar = await ethers.getContract('DNSRegistrar');

    let transactions;
    if(network.tags.use_root) {
        const root = await getContract('Root');
        transactions = await setTLDsOnRoot(owner, root, DNSRegistrar, tld_map[network.name]);
    } else {
        const registry = await getContract('ENSRegistry');
        transactions = await setTLDsOnRegistry(owner, registry, DNSRegistrar, tld_map[network.name]);
    }

    if(transactions.length > 0) {
        console.log(`Waiting on ${transactions.length} transactions setting DNS TLDs`)
        await Promise.all(transactions.map((tx) => tx.wait()));
    }

    console.log('Done!');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });