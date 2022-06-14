const { ethers } = require("hardhat");
async function main() {
  const controller = await ethers.getContract("ETHRegistrarController");
  console.log(await controller.rentPrice("test123", 20000000));
  const receipt = await controller.register(
    "test123",
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    20000000,
    "0x7465737431323300000000000000000000000000000000000000000000000000",
    {
      value: "3000000000000000000",
    }
  );
  console.log("🚀 ~ file: register.js ~ line 17 ~ main ~ receipt", receipt);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
