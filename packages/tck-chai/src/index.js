// import { expect } from "chai";
import * as tck from "@hashgraph/tck";

/**
 * @typedef {import("@hashgraph/sdk").Signer} Signer
 */

/**
 * @param {Signer} signer
 * @returns {Promise<void>}
 */
export async function test(signer) {
    const expects = await tck.test(signer);

    for (const e of expects) {
        console.log(e.name, e.condition);
        // expect(e.condition, e.name).to.be.true;
    }
}
