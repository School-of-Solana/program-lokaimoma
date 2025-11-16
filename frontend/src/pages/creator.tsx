import { useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Program,
  BN,
  web3,
  utils,
  AnchorProvider,
  setProvider,
} from "@coral-xyz/anchor";
import { TipJarIDL, TipJar } from "components/anchorProgramGenerated";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useTipJarHooks } from "hooks/useTipJarHooks";
import { useEffect } from "react";

const programId = new PublicKey(TipJarIDL.address);

const CreatorSpace: NextPage = (props) => {
  const {
    createTipJar,
    tipJar,
    getTipJar,
    wallet,
    tipJarTipRecords,
    getTipRecordsByJar,
  } = useTipJarHooks();

  useEffect(() => {
    if (wallet.connected) {
      getTipJar();
    }
  }, [wallet]);

  useEffect(() => {
    if (tipJar) {
      getTipRecordsByJar();
    }
  }, [tipJar]);

  return (
    <div>
      <Head>
        <title>Creator space</title>
        <meta name="description" content="Basic Functionality" />
      </Head>
      {wallet.connected ? (
        <>
          <div>
            <h3>Creator space</h3>
            {!tipJar && (
              <button
                className="btn"
                onClick={async () => {
                  const tx = await createTipJar();
                  alert(`Tip jar created: ${tx}. Fetching tip jar.`);
                  getTipJar();
                }}
              >
                Create tip jar
              </button>
            )}
            {tipJar && (
              <p>
                You have a tip jar connected to your wallet(
                {tipJar.creator.toString()})
              </p>
            )}
          </div>

          <div className="flex flex-col overflow-scroll gap-6">
            <p>Tip records</p>
            {tipJarTipRecords.map((tipRecord) => (
              <div
                className="flex flex-col gap-2"
                key={tipRecord.publicKey.toString()}
              >
                <p>
                  Tipper: <span>{tipRecord.account.tipper.toString()}</span>
                </p>
                <p>
                  Total tips:{" "}
                  <span>
                    {tipRecord.account.totalTips.toNumber() / LAMPORTS_PER_SOL}{" "}
                    sol(s)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  );
};

export default CreatorSpace;
