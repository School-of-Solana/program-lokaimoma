/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tip_jar.json`.
 */
export type TipJar = {
  "address": "DthHhMcvU2VX1uT8HUCbqBjbjC3hktVyPpUPSUxmKtMa",
  "metadata": {
    "name": "tipJar",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteTipRecord",
      "discriminator": [
        216,
        91,
        229,
        19,
        103,
        20,
        170,
        36
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "relations": [
            "tipJar"
          ]
        },
        {
          "name": "tipRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  45,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "tipper"
              },
              {
                "kind": "account",
                "path": "tipJar"
              }
            ]
          }
        },
        {
          "name": "tipJar"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipJar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  74,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "tip",
      "discriminator": [
        77,
        164,
        35,
        21,
        36,
        121,
        213,
        51
      ],
      "accounts": [
        {
          "name": "tipper",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator",
          "docs": [
            "The `has_one` constraint on the `tip_jar` account ensures that the `creator`",
            "account provided is the legitimate owner of the tip jar."
          ],
          "writable": true,
          "relations": [
            "tipJar"
          ]
        },
        {
          "name": "tipRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  45,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "tipper"
              },
              {
                "kind": "account",
                "path": "tipJar"
              }
            ]
          }
        },
        {
          "name": "tipJar",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "tipJar",
      "discriminator": [
        1,
        2,
        42,
        158,
        102,
        246,
        174,
        210
      ]
    },
    {
      "name": "tipRecord",
      "discriminator": [
        43,
        243,
        62,
        130,
        183,
        4,
        81,
        185
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notEnoughLamports",
      "msg": "Tipper has fewer lamports than what he want's to tip."
    },
    {
      "code": 6001,
      "name": "overflow",
      "msg": "You've reached your max tipping limit for this creator. Reset your record to tip again."
    },
    {
      "code": 6002,
      "name": "zeroTipAmount",
      "msg": "You cannot tip zero lamports."
    }
  ],
  "types": [
    {
      "name": "tipJar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tipRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipper",
            "type": "pubkey"
          },
          {
            "name": "tipJar",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalTips",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    },
    {
      "name": "tipJarSeed",
      "type": {
        "array": [
          "u8",
          6
        ]
      },
      "value": "[116, 105, 112, 74, 97, 114]"
    },
    {
      "name": "tipRecordSeed",
      "type": {
        "array": [
          "u8",
          10
        ]
      },
      "value": "[116, 105, 112, 45, 114, 101, 99, 111, 114, 100]"
    }
  ]
};
