import * as tck from "@hashgraph/tck-chai";
import { SimpleRestSigner } from  "../src/index.js";


describe("tck", async function() {
    it("should work", async function() {
        this.timeout(60000);

        const signer = await SimpleRestSigner.connect();
        await tck.test(signer);
    });
});
