# DeployPage

**Turn Any Contract Into a Landing Page** — AI-powered landing page generator for smart contracts.

## Live Contract (Base Sepolia Testnet)

| Field | Value |
|-------|-------|
| **Network** | Base Sepolia Testnet |
| **Chain ID** | 84532 |
| **Contract** | [`0xB720952ae3c1dA89C0C452cDEeE47b99F1A8E69D`](https://sepolia.basescan.org/address/0xB720952ae3c1dA89C0C452cDEeE47b99F1A8E69D) |
| **Owner** | `0x715C44484d1c126b75c8989dA40489c7B38592FD` |
| **Deploy Tx** | [`0xedebd6c6906e55f...`](https://sepolia.basescan.org/tx/0xedebd6c6906e55f66e89236857d61d7c6d9e4759f636cb993c01e8cc57fb043e) |
| **Deployed** | 2026-04-03 |
| **Fee** | Free (testnet phase) |

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
├── deployments/
│   └── base-sepolia.json     # Deployment record
├── hardhat.config.js
├── vercel.json
├── .env.example
└── package.json
```

---

## Contract Functions

| Function | Description |
|---|---|
| `createPage(address, title, description, symbol, pageType, ctaLabel, ctaUrl)` | Register a new landing page |
| `getPage(address)` | Read page data |
| `updatePage(address, title, description, ctaLabel, ctaUrl)` | Update page (creator/owner only) |
| `deactivatePage(address)` | Deactivate a page |
| `getPagesBy(creator)` | Get all pages by creator |
| `totalPages()` | Total registered pages |
| `getPagesPaginated(offset, limit)` | Paginated listing |

---

## Deploy to Vercel

```bash
git clone https://github.com/yusufsafary/deploypage
cd deploypage
npx vercel
```

Set Vercel env vars:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xB720952ae3c1dA89C0C452cDEeE47b99F1A8E69D
NEXT_PUBLIC_CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

---

## API Endpoints (Vercel Serverless)

- **GET** `/api/health` — Service status
- **GET** `/api/page?action=info` — Contract info (total pages, fee)
- **GET** `/api/page?address=0x...` — Read page data for a contract

---

## License

MIT — Owner: `0x715C44484d1c126b75c8989dA40489c7B38592FD`
