// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DeployPage
 * @notice Registers contract addresses as landing pages on Base Sepolia testnet
 * @dev Deployed on Base Sepolia (chain ID: 84532)
 * @author DeployPage — 0x715C44484d1c126b75c8989dA40489c7B38592FD
 */
contract DeployPage {
    address public owner;

    struct Page {
        address contractAddress;
        string  title;
        string  description;
        string  symbol;
        string  pageType;   // "ERC-20", "ERC-721", "ERC-1155", "CUSTOM"
        string  ctaLabel;
        string  ctaUrl;
        bool    active;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(address => Page)   public pages;
    mapping(address => address[]) private ownerPages;
    address[] public allPages;

    uint256 public pageFee = 0 ether; // free during testnet

    event PageCreated(
        address indexed contractAddress,
        address indexed creator,
        string  title,
        string  pageType,
        uint256 timestamp
    );
    event PageUpdated(address indexed contractAddress, uint256 timestamp);
    event PageDeactivated(address indexed contractAddress, uint256 timestamp);
    event FeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier pageExists(address _addr) {
        require(pages[_addr].createdAt != 0, "Page not found");
        _;
    }

    constructor() {
        owner = 0x715C44484d1c126b75c8989dA40489c7B38592FD;
    }

    /**
     * @notice Register a new landing page for a smart contract
     */
    function createPage(
        address _contractAddress,
        string  calldata _title,
        string  calldata _description,
        string  calldata _symbol,
        string  calldata _pageType,
        string  calldata _ctaLabel,
        string  calldata _ctaUrl
    ) external payable {
        require(msg.value >= pageFee, "Insufficient fee");
        require(_contractAddress != address(0), "Invalid address");
        require(pages[_contractAddress].createdAt == 0, "Page already exists");
        require(bytes(_title).length > 0, "Title required");

        pages[_contractAddress] = Page({
            contractAddress: _contractAddress,
            title:           _title,
            description:     _description,
            symbol:          _symbol,
            pageType:        _pageType,
            ctaLabel:        _ctaLabel,
            ctaUrl:          _ctaUrl,
            active:          true,
            createdAt:       block.timestamp,
            updatedAt:       block.timestamp
        });

        ownerPages[msg.sender].push(_contractAddress);
        allPages.push(_contractAddress);

        emit PageCreated(_contractAddress, msg.sender, _title, _pageType, block.timestamp);
    }

    /**
     * @notice Update an existing page (only original creator or contract owner)
     */
    function updatePage(
        address _contractAddress,
        string  calldata _title,
        string  calldata _description,
        string  calldata _ctaLabel,
        string  calldata _ctaUrl
    ) external pageExists(_contractAddress) {
        bool isCreator = _isCreator(msg.sender, _contractAddress);
        require(isCreator || msg.sender == owner, "Not authorized");

        Page storage p = pages[_contractAddress];
        p.title       = _title;
        p.description = _description;
        p.ctaLabel    = _ctaLabel;
        p.ctaUrl      = _ctaUrl;
        p.updatedAt   = block.timestamp;

        emit PageUpdated(_contractAddress, block.timestamp);
    }

    /**
     * @notice Deactivate a page
     */
    function deactivatePage(address _contractAddress) external pageExists(_contractAddress) {
        bool isCreator = _isCreator(msg.sender, _contractAddress);
        require(isCreator || msg.sender == owner, "Not authorized");
        pages[_contractAddress].active = false;
        emit PageDeactivated(_contractAddress, block.timestamp);
    }

    /**
     * @notice Get page data
     */
    function getPage(address _contractAddress)
        external
        view
        pageExists(_contractAddress)
        returns (Page memory)
    {
        return pages[_contractAddress];
    }

    /**
     * @notice Get all pages created by an address
     */
    function getPagesBy(address _creator) external view returns (address[] memory) {
        return ownerPages[_creator];
    }

    /**
     * @notice Total number of registered pages
     */
    function totalPages() external view returns (uint256) {
        return allPages.length;
    }

    /**
     * @notice Get paginated list of all pages
     */
    function getPagesPaginated(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory result)
    {
        uint256 total = allPages.length;
        if (offset >= total) return new address[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allPages[i];
        }
    }

    // ── Owner functions ──────────────────────────────────────────────────────

    function setFee(uint256 _fee) external onlyOwner {
        pageFee = _fee;
        emit FeeUpdated(_fee);
    }

    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "Nothing to withdraw");
        (bool ok,) = owner.call{value: bal}("");
        require(ok, "Transfer failed");
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    function _isCreator(address _caller, address _contractAddress) internal view returns (bool) {
        address[] memory created = ownerPages[_caller];
        for (uint256 i = 0; i < created.length; i++) {
            if (created[i] == _contractAddress) return true;
        }
        return false;
    }
}
