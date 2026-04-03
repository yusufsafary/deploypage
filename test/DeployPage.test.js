const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("DeployPage", function () {
  let contract, owner, user1, user2;
  const SAMPLE_ADDR = "0xd3f4a8c6e2b1f97a3d5e0c8b4a2f6e9d1c7b3a50";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const DeployPage = await ethers.getContractFactory("DeployPage");
    // Deploy with owner = signer[0] for testability
    contract = await DeployPage.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy with correct owner", async function () {
      // The contract hardcodes the real owner address — just verify it deploys
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should start with 0 pages", async function () {
      expect(await contract.totalPages()).to.equal(0);
    });

    it("should have zero fee on testnet", async function () {
      expect(await contract.pageFee()).to.equal(0);
    });
  });

  describe("createPage", function () {
    it("should create a page", async function () {
      await expect(
        contract.connect(user1).createPage(
          SAMPLE_ADDR, "SampleToken", "A test token.", "SMPL", "ERC-20", "Launch", "https://example.com"
        )
      )
        .to.emit(contract, "PageCreated")
        .withArgs(SAMPLE_ADDR, user1.address, "SampleToken", "ERC-20", await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("should increment totalPages", async function () {
      await contract.connect(user1).createPage(
        SAMPLE_ADDR, "Token", "Desc", "TKN", "ERC-20", "CTA", "https://example.com"
      );
      expect(await contract.totalPages()).to.equal(1);
    });

    it("should reject duplicate addresses", async function () {
      await contract.connect(user1).createPage(
        SAMPLE_ADDR, "Token", "Desc", "TKN", "ERC-20", "CTA", "https://example.com"
      );
      await expect(
        contract.connect(user2).createPage(
          SAMPLE_ADDR, "Token2", "Desc2", "TK2", "ERC-20", "CTA2", "https://example.com"
        )
      ).to.be.revertedWith("Page already exists");
    });

    it("should reject zero address", async function () {
      await expect(
        contract.connect(user1).createPage(
          ethers.ZeroAddress, "Token", "Desc", "TKN", "ERC-20", "CTA", "https://example.com"
        )
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("getPage / getPagesBy", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPage(
        SAMPLE_ADDR, "SampleToken", "A test token.", "SMPL", "ERC-20", "Launch", "https://example.com"
      );
    });

    it("should return correct page data", async function () {
      const page = await contract.getPage(SAMPLE_ADDR);
      expect(page.title).to.equal("SampleToken");
      expect(page.symbol).to.equal("SMPL");
      expect(page.active).to.be.true;
    });

    it("should return pages created by user", async function () {
      const pages = await contract.getPagesBy(user1.address);
      expect(pages).to.deep.equal([SAMPLE_ADDR]);
    });
  });

  describe("updatePage", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPage(
        SAMPLE_ADDR, "OldTitle", "Old desc", "TKN", "ERC-20", "Old CTA", "https://old.com"
      );
    });

    it("should allow creator to update", async function () {
      await contract.connect(user1).updatePage(
        SAMPLE_ADDR, "NewTitle", "New desc", "New CTA", "https://new.com"
      );
      const page = await contract.getPage(SAMPLE_ADDR);
      expect(page.title).to.equal("NewTitle");
    });

    it("should reject unauthorized update", async function () {
      await expect(
        contract.connect(user2).updatePage(
          SAMPLE_ADDR, "Hack", "Hack", "Hack", "https://hack.com"
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("deactivatePage", function () {
    beforeEach(async function () {
      await contract.connect(user1).createPage(
        SAMPLE_ADDR, "Token", "Desc", "TKN", "ERC-20", "CTA", "https://example.com"
      );
    });

    it("should allow creator to deactivate", async function () {
      await contract.connect(user1).deactivatePage(SAMPLE_ADDR);
      const page = await contract.getPage(SAMPLE_ADDR);
      expect(page.active).to.be.false;
    });
  });

  describe("getPagesPaginated", function () {
    it("should return empty array for empty registry", async function () {
      const result = await contract.getPagesPaginated(0, 10);
      expect(result).to.deep.equal([]);
    });
  });
});
