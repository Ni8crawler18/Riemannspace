const RiemannVerifier = artifacts.require("RiemannVerifier");

module.exports = function (deployer) {
    deployer.deploy(RiemannVerifier);
};