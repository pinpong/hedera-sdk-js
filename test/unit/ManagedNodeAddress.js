import ManagedNodeAddress from "../../src/ManagedNodeAddress.js";
import { Network as NodeNetwork } from "../../src/client/NodeClient.js";
import { Network as WebNetwork } from "../../src/client/WebClient.js";

describe("ManagedNodeAddress", function () {
    it("fromString", function () {
        const ipAddress = ManagedNodeAddress.fromString("35.237.200.180:50211");
        expect(ipAddress.address).to.be.equal("35.237.200.180");
        expect(ipAddress.port).to.be.equal(50211);
        expect(ipAddress.toString()).to.be.equal("35.237.200.180:50211");

        const ipAddressSecure = ipAddress.toSecure();
        expect(ipAddressSecure.address).to.be.equal("35.237.200.180");
        expect(ipAddressSecure.port).to.be.equal(50212);
        expect(ipAddressSecure.toString()).to.be.equal("35.237.200.180:50212");

        const ipAddressInsecure = ipAddressSecure.toInsecure();
        expect(ipAddressInsecure.address).to.be.equal("35.237.200.180");
        expect(ipAddressInsecure.port).to.be.equal(50211);
        expect(ipAddressInsecure.toString()).to.be.equal(
            "35.237.200.180:50211"
        );

        const urlAddress = ManagedNodeAddress.fromString(
            "0.testnet.hedera.com:50211"
        );
        expect(urlAddress.address).to.be.equal("0.testnet.hedera.com");
        expect(urlAddress.port).to.be.equal(50211);
        expect(urlAddress.toString()).to.be.equal("0.testnet.hedera.com:50211");

        const urlAddressSecure = urlAddress.toSecure();
        expect(urlAddressSecure.address).to.be.equal("0.testnet.hedera.com");
        expect(urlAddressSecure.port).to.be.equal(50212);
        expect(urlAddressSecure.toString()).to.be.equal(
            "0.testnet.hedera.com:50212"
        );

        const urlAddressInsecure = urlAddressSecure.toInsecure();
        expect(urlAddressInsecure.address).to.be.equal("0.testnet.hedera.com");
        expect(urlAddressInsecure.port).to.be.equal(50211);
        expect(urlAddressInsecure.toString()).to.be.equal(
            "0.testnet.hedera.com:50211"
        );

        const mirrorNodeAddress = ManagedNodeAddress.fromString(
            "hcs.mainnet.mirrornode.hedera.com:5600"
        );
        expect(mirrorNodeAddress.address).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com"
        );
        expect(mirrorNodeAddress.port).to.be.equal(5600);
        expect(mirrorNodeAddress.toString()).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com:5600"
        );

        const mirrorNodeAddressSecure = mirrorNodeAddress.toSecure();
        expect(mirrorNodeAddressSecure.address).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com"
        );
        expect(mirrorNodeAddressSecure.port).to.be.equal(433);
        expect(mirrorNodeAddressSecure.toString()).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com:433"
        );

        const mirrorNodeAddressInsecure = mirrorNodeAddressSecure.toInsecure();
        expect(mirrorNodeAddressInsecure.address).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com"
        );
        expect(mirrorNodeAddressInsecure.port).to.be.equal(5600);
        expect(mirrorNodeAddressInsecure.toString()).to.be.equal(
            "hcs.mainnet.mirrornode.hedera.com:5600"
        );

        let err = false;
        try {
            ManagedNodeAddress.fromString(
                "this is a random string with spaces:433"
            );
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("fromString did not error");
        }

        err = false;
        try {
            ManagedNodeAddress.fromString(
                "hcs.mainnet.mirrornode.hedera.com:notarealport"
            );
        } catch {
            err = true;
        }

        if (!err) {
            throw new Error("fromString did not error");
        }
    });

    it("NodeNetwork parses", function () {
        Object.keys(NodeNetwork.MAINNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );

        Object.keys(NodeNetwork.TESTNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );

        Object.keys(NodeNetwork.PREVIEWNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );
    });

    it("WebNetwork parses", function () {
        Object.keys(WebNetwork.MAINNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );

        Object.keys(WebNetwork.TESTNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );

        Object.keys(WebNetwork.PREVIEWNET).map((address) =>
            ManagedNodeAddress.fromString(address)
        );
    });
});
