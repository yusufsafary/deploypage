# DeployPage

**Turn Any Contract Into a Landing Page** — AI-powered landing page generator for smart contracts.

- **Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Owner address**: `0x715c44484d1c126b75c8989da40489c7b38592fd`
- **Explorer**: [sepolia.basescan.org](https://sepolia.basescan.org)

---

## Project Structure

```
deploypage/
├── contracts/
│   └── DeployPage.sol        # Main smart contract (Base Sepolia)
├── scripts/
│   ├── deploy.js             # Deployment script
│   └── interact.js           # Interaction examples
├── test/
│   └── DeployPage.test.js    # Contract tests
├── api/
│   ├── page.js               # Vercel serverless: /api/page
│   └── health.js             # Vercel serverless: /api/health
├── public/
│   └── index.html            # Landing page (static, Vercel-served)
├── deployments/              # Created after deploy (gitignored in .env)
├── hardhat.config.js
├── vercel.json
├── .env.example
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your private key and RPC URL
```

### 3. Deploy smart contract to Base Sepolia

```bash
npm run deploy:testnet
```

This will:
- Deploy `DeployPage.sol` to Base Sepolia testnet
- Save deployment info to `deployments/base-sepolia.json`
- Attempt contract verification on Basescan (if API key provided)

After deployment, copy the contract address to your Vercel environment variable:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your-deployed-address...
```

### 4. Run tests

```bash
npm test
```

### 5. Deploy to Vercel

```bash
npx vercel
```

Set these environment variables in Vercel dashboard:
- `BASE_SEPOLIA_RPC` — `https://sepolia.base.org`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — deployed contract address
- `NEXT_PUBLIC_CHAIN_ID` — `84532`

---

## Smart Contract

### `DeployPage.sol`

Deployed on **Base Sepolia** (Chain ID: 84532).

#### Key functions

| Function | Description |
|---|---|
| `createPage(address, title, description, symbol, pageType, ctaLabel, ctaUrl)` | Register a new landing page |
| `getPage(address)` | Read page data |
| `updatePage(address, title, description, ctaLabel, ctaUrl)` | Update page (creator or owner only) |
| `deactivatePage(address)` | Deactivate a page |
| `getPagesBy(creator)` | Get all pages by a creator |
| `totalPages()` | Total registered pages |
| `getPagesPaginated(offset, limit)` | Paginated list |

#### Page struct

```solidity
struct Page {
    address contractAddress;
    string  title;
    string  description;
    string  symbol;
    string  pageType;    // "ERC-20", "ERC-721", "ERC-1155", "CUSTOM"
    string  ctaLabel;
    string  ctaUrl;
    bool    active;
    uint256 createdAt;
    uint256 updatedAt;
}
```

#### Fee

Page creation is **free** during testnet phase. The owner can set a fee via `setFee()` before mainnet launch.

---

## Get Base Sepolia ETH (Testnet)

- [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [QuickNode Faucet](https://faucet.quicknode.com/base/sepolia)
- [Superchain Faucet](https://app.optimism.io/faucet)

---

## API Endpoints (Vercel Serverless)

### `GET /api/health`
Returns service status and contract address.

### `GET /api/page?action=info`
Returns contract info: total pages, fee, network.

### `GET /api/page?address=0x...`
Returns page data for a registered contract address.

---

## Vercel Deployment

The `vercel.json` is configured to:
- Serve `public/index.html` as the root static page
- Route `/api/*` to Vercel serverless functions
- Add security headers
- Support SPA-style routing

---

## License

MIT — Built by [DeployPage](https://deploypage.xyz)  
Owner: `0x715c44484d1c126b75c8989da40489c7b38592fd`
