import * as web3 from "@solana/web3.js"
import * as token from "@solana/spl-token"
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
    const secretKey = Uint8Array.from(secret);
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);

    const mint = await createNewMint(
      connection,
      keypairFromSecretKey,
      keypairFromSecretKey.publicKey,
      keypairFromSecretKey.publicKey,
      0
    );

    const tokenAccount = await createTokenAccount(
      connection,
      keypairFromSecretKey,
      mint,
      keypairFromSecretKey.publicKey
    );

    await mintTokens(
      connection,
      keypairFromSecretKey,
      mint,
      tokenAccount.address,
      keypairFromSecretKey,
      5
    );

    console.log("Whitelist Token Address:", mint.toString());
}

main()
    .then(() => {
        console.log("Finished successfully")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })



async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number
): Promise<web3.PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(
      `Create Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  )

  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  console.log(
      `Create Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  )

  return tokenAccount;
}

async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount
  );

  console.log(
      `Mint Tokens: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}
