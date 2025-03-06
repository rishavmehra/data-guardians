// const anchor = require('@coral-xyz/anchor');
// const { PublicKey, SystemProgram } = anchor.web3;
// const { readFileSync } = require('fs');

// // Replace with your IDL file path and wallet keypair
// const idl = require('./lib/idl/content_attestation.json');
// const keypairFile = './wallet.json';

// // Optional: Patch the IDL to ensure the account type info is available for ContentAttestation.
// idl.accounts = idl.accounts.map(acc => {
//   if (acc.name === "ContentAttestation" && !acc.type) {
//     const typeDef = idl.types.find(t => t.name === "ContentAttestation");
//     if (typeDef) {
//       return { ...acc, type: typeDef.type };
//     }
//   }
//   return acc;
// });

// async function main() {
//   // Set up connection to devnet
//   const connection = new anchor.web3.Connection(
//     anchor.web3.clusterApiUrl('devnet'),
//     'confirmed'
//   );

//   // Load wallet from keypair file
//   const keypair = anchor.web3.Keypair.fromSecretKey(
//     Buffer.from(JSON.parse(readFileSync(keypairFile, 'utf-8')))
//   );
//   const wallet = new anchor.Wallet(keypair);

//   // Set up provider
//   const provider = new anchor.AnchorProvider(connection, wallet, {});
//   anchor.setProvider(provider);

//   // Initialize the program using only the IDL and the provider
//   const program = new anchor.Program(idl, provider);

//   // Input parameters for the registerContent instruction
//   const contentCid = 'bafybeia5ik4pkpz25aekzgyh7ahapiaxez3vaeu54lnrdhuyeosyuo2wmi';
//   const metadataCid = 'QmSfhHoUS6mWp8cc2CU4xPQXajc58ybQTzQNgiDnQSXaXG';
//   const contentType = 'image/png'; // This is now an image
//   const title = 'My Content Title';
//   const description = 'This is a description of my content';

//   // Derive PDA for the attestation account using the seeds defined in the program:
//   // - Constant seed: "attestation"
//   // - Creator's public key
//   // - Content CID
//   const [attestationPda] = await PublicKey.findProgramAddress(
//     [
//       Buffer.from('attestation'),
//       wallet.publicKey.toBuffer(),
//       Buffer.from(contentCid),
//     ],
//     program.programId
//   );

//   console.log('Attestation PDA:', attestationPda.toBase58());

//   // Execute the transaction to register the content
//   try {
//     const txSignature = await program.methods.registerContent(
//       contentCid,
//       metadataCid,
//       contentType,
//       title,
//       description
//     )
//       .accounts({
//         attestation: attestationPda,
//         creator: wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       })
//       .signers([wallet.payer])
//       .rpc();

//     console.log('Transaction signature:', txSignature);
//     console.log('Content registered successfully!');
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// main().catch(console.error);


const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram } = anchor.web3;
const { readFileSync } = require('fs');

// Replace with your IDL file path and wallet keypair
const idl = require('./lib/idl/content_attestation.json');
const keypairFile = './wallet.json';

// Optional: Patch the IDL to ensure the account type info is available for ContentAttestation.
idl.accounts = idl.accounts.map(acc => {
  if (acc.name === "ContentAttestation" && !acc.type) {
    const typeDef = idl.types.find(t => t.name === "ContentAttestation");
    if (typeDef) {
      return { ...acc, type: typeDef.type };
    }
  }
  return acc;
});

async function main() {
  // Set up connection to devnet
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl('devnet'),
    'confirmed'
  );

  // Load wallet from keypair file
  const keypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(keypairFile, 'utf-8')))
  );
  const wallet = new anchor.Wallet(keypair);

  // Set up provider
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  // Initialize the program using only the IDL and the provider
  const program = new anchor.Program(idl, provider);

  // Input parameters for the registerContent instruction
  const contentCid = 'bafybeia5ik4pkpz25aekzgyh7ahapiaxez3vaeu54lnrdhuyeosyuo2wmi';
  const metadataCid = 'QmSfhHoUS6mWp8cc2CU4xPQXajc58ybQTzQNgiDnQSXaXG';
  const contentType = 'image/png'; // This is now an image
  const title = 'My Content Title';
  const description = 'This is a description of my content';

  // Use only the first 5 characters (bytes) of contentCid
  const contentCidSliced = contentCid.slice(0, 5);  // Slice the first 5 characters
  const contentCidBuffer = Buffer.from(contentCidSliced, 'utf-8'); // Convert to buffer

  // Derive PDA for the attestation account using the seeds defined in the program:
  // - Constant seed: "attestation"
  // - Creator's public key
  // - Sliced Content CID (first 5 bytes only)
  const [attestationPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from('attestation'),
      wallet.publicKey.toBuffer(),
      contentCidBuffer, // Use the sliced contentCid here
    ],
    program.programId
  );

  console.log('Attestation PDA:', attestationPda.toBase58());

  // Check if the PDA account already exists
  const accountInfo = await connection.getAccountInfo(attestationPda);
  if (accountInfo !== null) {
    console.log('Attestation account already exists at this PDA:', attestationPda.toBase58());
    return;  // Skip creating the account if it already exists
  }

  // Execute the transaction to register the content
  try {
    const txSignature = await program.methods.registerContent(
      contentCid,  // Send the full contentCid to the program (if needed)
      metadataCid,
      contentType,
      title,
      description
    )
      .accounts({
        attestation: attestationPda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc();

    console.log('Transaction signature:', txSignature);
    console.log('Content registered successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
