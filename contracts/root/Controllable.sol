pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Controllable is Ownable {
    mapping(address => bool) public controllers;

    event ControllerChanged(address indexed controller, bool enabled);

    modifier onlyController() {
        console.log("onlyController");
        console.log(controllers[msg.sender]);
        require(
            controllers[msg.sender],
            "Only controller can call this function"
        );
        _;  
    }

    function setController(address controller, bool enabled) public onlyOwner {
        controllers[controller] = enabled;
        emit ControllerChanged(controller, enabled);
    }
}
