import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TipJar } from "../target/types/tip_jar";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Buffer } from "node:buffer";
import assert from "node:assert";

const TIP_JAR_SEED = "tipJar";
const TIP_RECORD_SEED = "tip-record";

describe("tip-jar", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.tipJar as Program<TipJar>;
  const connection = provider.connection;

  it("should initialize a creators tip jar", async () => {
    const keyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, keyPair.publicKey);

    const [_, tipJarPda, bump] = await createTipJar(program, keyPair);

    const tipJar = await program.account.tipJar.fetch(tipJarPda);
    assert.strictEqual(tipJar.creator.toString(), keyPair.publicKey.toString());
    assert.equal(tipJar.bump, bump);
  });

  it("should succeed tipping a creator", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda, __] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    const tipAmount = 0.5 * LAMPORTS_PER_SOL;
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda, tipRecordBump] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );
    anchor.web3.SystemProgram.nonceInitialize;

    const prevCreatorLamports = (
      await connection.getAccountInfo(creatorKeyPair.publicKey, "confirmed")
    ).lamports;

    await tipCreator(
      program,
      tipAmount,
      tipperKeyPair,
      creatorKeyPair,
      tipJarPda,
      tipRecordPda,
    );

    const tipRecord = await program.account.tipRecord.fetch(tipRecordPda);
    assert.strictEqual(
      tipRecord.tipper.toString(),
      tipperKeyPair.publicKey.toString(),
      "Tipper key mismatch",
    );
    assert.strictEqual(
      tipRecord.tipJar.toString(),
      tipJarPda.toString(),
      "Tip jar key mismatch",
    );
    assert.strictEqual(
      tipRecord.totalTips.toNumber(),
      tipAmount,
      "Tip amount mismatch",
    );
    const curCreatorLamports = (
      await connection.getAccountInfo(creatorKeyPair.publicKey, "confirmed")
    ).lamports;
    assert.strictEqual(
      curCreatorLamports,
      prevCreatorLamports + tipAmount,
      "Creator wallet amount  mismatch",
    );
    assert.strictEqual(tipRecord.bump, tipRecordBump, "Tip bump mismatch");
  });

  it("should succeed tipping a creator multiple times and have correct amount", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    const tipAmount = 0.15 * LAMPORTS_PER_SOL;
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    await tipCreator(
      program,
      tipAmount,
      tipperKeyPair,
      creatorKeyPair,
      tipJarPda,
      tipRecordPda,
    );

    await airdrop(connection, tipperKeyPair.publicKey);

    await tipCreator(
      program,
      tipAmount,
      tipperKeyPair,
      creatorKeyPair,
      tipJarPda,
      tipRecordPda,
    );

    const tipRecord = await program.account.tipRecord.fetch(tipRecordPda);
    assert.strictEqual(
      tipRecord.totalTips.toNumber(),
      tipAmount * 2,
      "Tip amount mismatch",
    );
  });

  it("should fail tipping 0 lamports", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    const tipAmount = 0;
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    try {
      await tipCreator(
        program,
        tipAmount,
        tipperKeyPair,
        creatorKeyPair,
        tipJarPda,
        tipRecordPda,
      );
    } catch ({ error }) {
      assert.strictEqual(error?.errorCode?.code, "ZeroTipAmount");
    }
  });

  it("should fail tipping more than tipper has", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    const tipAmount = 1000 * LAMPORTS_PER_SOL;
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    try {
      await tipCreator(
        program,
        tipAmount,
        tipperKeyPair,
        creatorKeyPair,
        tipJarPda,
        tipRecordPda,
      );
    } catch ({ error }) {
      assert.strictEqual(error?.errorCode?.code, "NotEnoughLamports");
    }
  });

  it("should succeed deleting tip record", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    const tipAmount = 0.1 * LAMPORTS_PER_SOL;
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    await tipCreator(
      program,
      tipAmount,
      tipperKeyPair,
      creatorKeyPair,
      tipJarPda,
      tipRecordPda,
    );

    const prevTippersLamports = (
      await connection.getAccountInfo(tipperKeyPair.publicKey)
    ).lamports;

    await program.methods
      .deleteTipRecord()
      .accounts({
        tipper: tipperKeyPair.publicKey,
        creator: creatorKeyPair.publicKey,
        tipRecord: tipRecordPda,
        tipJar: tipJarPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tipperKeyPair])
      .rpc({ commitment: "confirmed" });

    const curTippersLamports = (
      await connection.getAccountInfo(tipperKeyPair.publicKey)
    ).lamports;

    assert(curTippersLamports > prevTippersLamports);
  });

  it("should fail to initialize a tip jar for the same creator twice", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);

    await createTipJar(program, creatorKeyPair);

    try {
      await createTipJar(program, creatorKeyPair);
      assert.fail("Should have failed to initialize the same tip jar twice");
    } catch (e) {
      assert(e, "An error should have been thrown");
    }
  });

  it("should fail to tip if the wrong creator is provided", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, tipperKeyPair.publicKey);

    const fakeCreatorKeyPair = anchor.web3.Keypair.generate();

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    try {
      await program.methods
        .tip(new anchor.BN(0.1 * LAMPORTS_PER_SOL))
        .accounts({
          tipper: tipperKeyPair.publicKey,
          creator: fakeCreatorKeyPair.publicKey,
          tipJar: tipJarPda,
          systemProgram: anchor.web3.SystemProgram.programId,
          tipRecord: tipRecordPda,
        })
        .signers([tipperKeyPair])
        .rpc({ commitment: "confirmed" });
      assert.fail("Should have failed due to wrong creator");
    } catch ({ error }) {
      assert.strictEqual(error?.errorCode?.code, "ConstraintHasOne");
    }
  });

  it("should fail to delete a tip record that does not exist", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, tipperKeyPair.publicKey);

    const [tipRecordPda] = generateTipRecordPda(
      tipperKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );

    try {
      await program.methods
        .deleteTipRecord()
        .accounts({
          tipper: tipperKeyPair.publicKey,
          creator: creatorKeyPair.publicKey,
          tipRecord: tipRecordPda,
          tipJar: tipJarPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tipperKeyPair])
        .rpc({ commitment: "confirmed" });
      assert.fail("Should have failed to delete a non-existent record");
    } catch ({ error }) {
      assert.strictEqual(error?.errorCode?.code, "AccountNotInitialized");
    }
  });

  it("should fail to delete another user's tip record", async () => {
    const creatorKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, creatorKeyPair.publicKey);
    const [_, tipJarPda] = await createTipJar(program, creatorKeyPair);

    const tipperOneKeyPair = anchor.web3.Keypair.generate();
    await airdrop(connection, tipperOneKeyPair.publicKey);
    const [tipRecordPda] = generateTipRecordPda(
      tipperOneKeyPair.publicKey,
      tipJarPda,
      program.programId,
    );
    await tipCreator(
      program,
      0.1 * LAMPORTS_PER_SOL,
      tipperOneKeyPair,
      creatorKeyPair,
      tipJarPda,
      tipRecordPda,
    );

    const tipperTwoKeyPair = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .deleteTipRecord()
        .accounts({
          tipper: tipperTwoKeyPair.publicKey,
          creator: creatorKeyPair.publicKey,
          tipRecord: tipRecordPda,
          tipJar: tipJarPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tipperTwoKeyPair])
        .rpc({ commitment: "confirmed" });
      assert.fail("Should have failed to delete another user's tip record");
    } catch ({ error }) {
      assert.strictEqual(error?.errorCode?.code, "ConstraintSeeds");
    }
  });
});

function tipCreator(
  program: anchor.Program<TipJar>,
  tipAmount: number,
  tipperKeyPair: anchor.web3.Keypair,
  creatorKeyPair: anchor.web3.Keypair,
  tipJarPda: anchor.web3.PublicKey,
  tipRecordPda: anchor.web3.PublicKey,
): Promise<string> {
  return program.methods
    .tip(new anchor.BN(tipAmount))
    .accounts({
      tipper: tipperKeyPair.publicKey,
      creator: creatorKeyPair.publicKey,
      tipJar: tipJarPda,
      systemProgram: anchor.web3.SystemProgram.programId,
      tipRecord: tipRecordPda,
    })
    .signers([tipperKeyPair])
    .rpc({ commitment: "confirmed" });
}

async function airdrop(
  connection: anchor.web3.Connection,
  address: PublicKey,
  amount = 1000000000,
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed",
  );
}

async function createTipJar(
  program: anchor.Program<TipJar>,
  creatorKeyPair: anchor.web3.Keypair,
): Promise<[string, PublicKey, number]> {
  const [tipJarPda, bump] = generateTipJarPda(
    creatorKeyPair.publicKey,
    program.programId,
  );

  const transaction = await program.methods
    .initialize()
    .accounts({
      creator: creatorKeyPair.publicKey,
      tipJar: tipJarPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([creatorKeyPair])
    .rpc({ commitment: "confirmed" });

  return [transaction, tipJarPda, bump];
}

function generateTipRecordPda(
  tipper: PublicKey,
  tipJar: PublicKey,
  programId: anchor.web3.PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TIP_RECORD_SEED), tipper.toBuffer(), tipJar.toBuffer()],
    programId,
  );
}

function generateTipJarPda(
  creatorPublicKey: PublicKey,
  programId: anchor.web3.PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TIP_JAR_SEED), creatorPublicKey.toBuffer()],
    programId,
  );
}
