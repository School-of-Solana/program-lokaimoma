import { TipJarIDL, TipJar } from "components/anchorProgramGenerated";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  useConnection,
  useWallet,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import {
  Program,
  BN,
  web3,
  utils,
  AnchorProvider,
  setProvider,
} from "@coral-xyz/anchor";
import { useMemo, useState } from "react";

const programId = new PublicKey(TipJarIDL.address);

function getProvider(wallet: WalletContextState, connection: web3.Connection) {
  if (!wallet.connected) return null;
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions(),
  );

  setProvider(provider);

  return provider;
}

export function useTipJarHooks() {
  const [tipJars, setTipJars] = useState([]);
  const [tipJar, setTipJar] = useState(null);
  const [tipJarTipRecords, setTipJarTipRecords] = useState([]);
  const [tipRecords, setTipRecords] = useState([]);
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    return getProvider(wallet, connection);
  }, [wallet, connection]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<TipJar>(TipJarIDL, provider);
  }, [provider]);

  function createTipJar(): Promise<string> {
    try {
      if (!program) throw new Error("No wallet connected");

      const tx = program.methods
        .initialize()
        .accounts({ creator: provider.publicKey })
        .rpc({ commitment: "confirmed" });
      return tx;
    } catch (error) {
      console.error("[ERROR: Create tip jar] ", error);
    }
  }

  async function tipCreator(
    amount: number,
    tipJar: PublicKey,
  ): Promise<string> {
    try {
      if (!program) throw new Error("No wallet connected");
      console.log("AMOUNT: ", amount);

      return await program.methods
        .tip(new BN(amount * LAMPORTS_PER_SOL))
        .accounts({ tipper: provider.publicKey, tipJar: tipJar })
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      console.error("[ERROR: Create tipping creator] ", error);
    }
  }

  async function deleteTipRecord(tipJar: PublicKey): Promise<string> {
    try {
      if (!program) throw new Error("No wallet connected");

      return await program.methods
        .deleteTipRecord()
        .accounts({ tipper: provider.publicKey, tipJar: tipJar })
        .rpc({ commitment: "confirmed" });
    } catch (error) {
      console.error("[ERROR: Create tipping creator] ", error);
    }
  }

  async function getTipJars() {
    try {
      if (!program) throw new Error("No wallet connected");
      const tipJars = await program.account.tipJar.all();
      setTipJars(tipJars);
    } catch (error) {
      console.error("[ERROR: Get tip jars] ", error);
    }
  }

  async function getTipRecords() {
    try {
      if (!program) throw new Error("No wallet connected");

      const tipRecords = await program.account.tipRecord.all([
        { memcmp: { offset: 8, bytes: provider.publicKey.toBase58() } },
      ]);
      setTipRecords(tipRecords);
    } catch (error) {
      console.error("[ERROR: Get tip records] ", error);
    }
  }

  async function getTipJar() {
    try {
      if (!program) throw new Error("No wallet connected");

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tipJar"), provider.publicKey.toBuffer()],
        programId,
      );
      const tipJar = await program.account.tipJar.fetchNullable(tipJarPda);
      tipJar["publicKey"] = tipJarPda;
      setTipJar(tipJar);
    } catch (error) {
      console.error("[ERROR: Get tip jar] ", error);
    }
  }

  async function getTipRecordsByJar() {
    try {
      if (!program) throw new Error("No wallet connected");
      if (!tipJar) throw new Error("You're not a creator yet");

      const [tipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tipJar"), provider.publicKey.toBuffer()],
        programId,
      );

      const tipRecords = await program.account.tipRecord.all([
        { memcmp: { offset: 8 + 32, bytes: tipJarPda.toBase58() } },
      ]);
      setTipJarTipRecords(tipRecords);
    } catch (error) {
      console.error("[ERROR: Get tip records by jar] ", error);
    }
  }

  return {
    program,
    wallet,
    connection,
    provider,
    getProvider,
    createTipJar,
    tipCreator,
    deleteTipRecord,
    programId,
    getTipJars,
    getTipJar,
    getTipRecords,
    tipJars,
    tipRecords,
    tipJar,
    tipJarTipRecords,
    getTipRecordsByJar,
  };
}
