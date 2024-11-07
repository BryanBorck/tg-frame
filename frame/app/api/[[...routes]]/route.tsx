/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput, parseEther } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { FundTokenABI } from "@/utils/abi/FundToken";
import { FundABI } from "@/utils/abi/Fund";
import { Address } from "viem";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
  initialState: {
    contractAddresses: [
      "0xfD6F674817e311F0928D6AD40B35809cA20415db",
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    ],
  },
});

app.use("/*", serveStatic({ root: "./public" }));

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

// Home frame
app.frame("/", (c) => {
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>aaaa</div>
    ),
    intents: [<Button action="/">PLAY 🕹️</Button>],
  });
});

// Frame to capture user's favorite fruit.
app.frame("/:artist/:id", (c) => {
  const { artist } = c.req.param();

  const index = Number(c.req.param("id")) || 0;

  const contractAddresses = [
    "0xfD6F674817e311F0928D6AD40B35809cA20415db",
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  ];

  const boundedIndex =
    ((index % contractAddresses.length) + contractAddresses.length) %
    contractAddresses.length;

  const contractAddress = contractAddresses[boundedIndex] as Address;

  return c.res({
    action: "/submit",
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        {artist} {contractAddress}
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter Amount in ETH" />,
      <Button.Transaction action="/submit" target={`/transaction`}>
        Send Ether
      </Button.Transaction>,
    ],
  });
});

app.transaction("/transaction", async (c) => {
  const { inputText } = c;
  // const contract = c.req.param("contract") as `0x${string}`;
  const contract = "0xfD6F674817e311F0928D6AD40B35809cA20415db";
  // Ensure inputText is defined and of type string

  // Contract transaction response.
  return c.contract({
    abi: FundABI,
    chainId: "eip155:11155111",
    functionName: "fund",
    // to: contract,
    to: contract,
    value: parseEther("0.001"),
  });
});

// Frame to display user's response.
app.frame("/submit", (c) => {
  const { buttonValue } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Selected: {buttonValue}
      </div>
    ),
    intents: [<Button>Go</Button>, <Button.Reset>Reset</Button.Reset>],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
