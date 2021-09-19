// import the Anchor library
import * as anchor from '@project-serum/anchor';
// Read the generated IDL
import idl from '../target/idl/basic_1.json';

// Configure the local cluster on nodejs
anchor.setProvider(anchor.Provider.local());

// Address of the deployed program.
const programId = new anchor.web3.PublicKey('3v1Y5wFi4fn3wij7W6hJztdYoLgVqR9a4n8ARpaGNqW9');

// Generate the program client from IDL.
const program = new anchor.Program(idl, programId);

export async function initialize() {
	// Execute the RPC.
	await program.rpc.initialize();
	console.log('Successfully intialized');
}
