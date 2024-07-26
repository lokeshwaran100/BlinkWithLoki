import { ActionGetRequest, ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from "@solana/actions";
import { clusterApiUrl, ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const GET = (req: Request) => {
    const payload: ActionGetResponse = {
        icon: new URL("https://cdn.vectorstock.com/i/1000v/58/82/solana-sol-coin-icon-isolated-on-white-background-vector-39325882.jpg", new URL(req.url).origin).toString(),
        label: "Transfer Sol to another Solana Wallet",
        description: "A Test Action",
        title: "Demo",
    }

    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
    });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const body: ActionPostRequest = await req.json()
        let account: PublicKey;

        //getting the account address
        try {
            account = new PublicKey(body.account);
        }
        catch (err) {
            return Response.json("Invalid account Provided", {
                status: 400,
                headers: ACTIONS_CORS_HEADERS
            });
        }

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1000,
            }),
            new TransactionInstruction({
                programId: new PublicKey(MEMO_PROGRAM_ID),
                data: Buffer.from("this is a test action", "utf-8"),
                keys: []
            })
        );
        transaction.feePayer = account;
        const connection = new Connection(clusterApiUrl("devnet"));
        transaction.recentBlockhash = (await connection.getLatestBlockhash({ commitment: "finalized" })).blockhash;
        const serialTx = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

        const payload: ActionPostResponse = {
            transaction: serialTx
        }
        return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
    }
    catch (err) {
        return Response.json("An Unknown Internal Error Has Occured", { status: 400 });
    }
}