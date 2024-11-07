/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput, parseEther } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { FundTokenABI } from "@/utils/abi/FundToken";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

// Frame to capture user's favorite fruit.
app.frame("/:artist/:contract", (c) => {
  const { artist, contract } = c.req.param();
  return c.res({
    action: "/submit",
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        {artist} {contract}
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter your fruit..." />,
      <Button.Transaction target="/transaction">Send Ether</Button.Transaction>,
    ],
  });
});

app.transaction("/transaction", (c) => {
  const { inputText, initialPath } = c;
  // Ensure inputText is defined and of type string
  if (!inputText) {
    throw new Error("inputText is required");
  }

  // Contract transaction response.
  return c.contract({
    abi: FundTokenABI,
    chainId: "eip155:11155111",
    functionName: "mint",
    args: ["0xeB780C963C700639f16CD09b4CF4F5c6Bc952730", 1000000000000000n],
    to: "0x31f0C0642a14cC16F90daee6b2DDFda1A5906a61",
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
