import { useWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import Head from "next/head";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTipJarHooks } from "hooks/useTipJarHooks";
import { useEffect } from "react";

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
  }, [wallet.connected]);

  useEffect(() => {
    if (tipJar) {
      getTipRecordsByJar();
    }
  }, [tipJar]);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Creator Space</title>
        <meta name="description" content="Manage your Tip Jar" />
      </Head>

      <h1 className="text-3xl font-bold text-center mb-8">Creator Space</h1>

      {!wallet.connected ? (
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <p className="text-xl">
            Please connect your wallet to manage your tip jar.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 p-6 bg-base-200 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Tip Jar</h2>
            {!tipJar ? (
              <div>
                <p className="mb-4">
                  You don&apos;t have a tip jar yet. Create one to start
                  receiving tips!
                </p>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    const tx = await createTipJar();
                    alert(`Tip jar created: ${tx}. Fetching tip jar.`);
                    getTipJar();
                  }}
                >
                  Create Tip Jar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg">Your tip jar address:</p>
                <p className="font-mono bg-base-300 p-2 rounded break-all">
                  {tipJar?.publicKey?.toString()}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Associated with wallet: {tipJar.creator.toString()}
                </p>
              </div>
            )}
          </div>

          {tipJar && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Tip Records</h2>
              {tipJarTipRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[20vh] overflow-y-auto">
                  {tipJarTipRecords.map((tipRecord) => (
                    <div
                      className="p-4 bg-base-200 rounded-lg shadow-md"
                      key={tipRecord.publicKey.toString()}
                    >
                      <p className="font-semibold">Tipper:</p>
                      <p className="font-mono text-sm break-all mb-2">
                        {tipRecord.account.tipper.toString()}
                      </p>
                      <p className="font-semibold">Total Tips:</p>
                      <p className="text-lg">
                        {tipRecord.account.totalTips.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </p>
                    </div>
                  ))}
                  {tipJarTipRecords.map((tipRecord) => (
                    <div
                      className="p-4 bg-base-200 rounded-lg shadow-md"
                      key={tipRecord.publicKey.toString()}
                    >
                      <p className="font-semibold">Tipper:</p>
                      <p className="font-mono text-sm break-all mb-2">
                        {tipRecord.account.tipper.toString()}
                      </p>
                      <p className="font-semibold">Total Tips:</p>
                      <p className="text-lg">
                        {tipRecord.account.totalTips.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </p>
                    </div>
                  ))}
                  {tipJarTipRecords.map((tipRecord) => (
                    <div
                      className="p-4 bg-base-200 rounded-lg shadow-md"
                      key={tipRecord.publicKey.toString()}
                    >
                      <p className="font-semibold">Tipper:</p>
                      <p className="font-mono text-sm break-all mb-2">
                        {tipRecord.account.tipper.toString()}
                      </p>
                      <p className="font-semibold">Total Tips:</p>
                      <p className="text-lg">
                        {tipRecord.account.totalTips.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </p>
                    </div>
                  ))}
                  {tipJarTipRecords.map((tipRecord) => (
                    <div
                      className="p-4 bg-base-200 rounded-lg shadow-md"
                      key={tipRecord.publicKey.toString()}
                    >
                      <p className="font-semibold">Tipper:</p>
                      <p className="font-mono text-sm break-all mb-2">
                        {tipRecord.account.tipper.toString()}
                      </p>
                      <p className="font-semibold">Total Tips:</p>
                      <p className="text-lg">
                        {tipRecord.account.totalTips.toNumber() /
                          LAMPORTS_PER_SOL}{" "}
                        SOL
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No tips received yet.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreatorSpace;
