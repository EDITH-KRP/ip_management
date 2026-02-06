// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IPRegistry {
    struct LicenseTerms {
        uint256 price;
        uint256 duration;
        uint256 createdAt;
    }

    struct TransferEvent {
        address from;
        address to;
        uint256 timestamp;
        string note;
    }

    struct IPRecord {
        address owner;
        uint256 timestamp;
        bytes32 ipHash;
        string metadataURI;
        LicenseTerms[] licenses;
        TransferEvent[] transfers;
    }

    uint256 public nextId = 1;
    mapping(uint256 => IPRecord) private records;
    mapping(bytes32 => uint256) public hashToId;

    event IPRegistered(uint256 indexed id, address indexed owner, bytes32 ipHash, string metadataURI);
    event IPTransferred(uint256 indexed id, address indexed from, address indexed to, string note);
    event LicenseConfigured(uint256 indexed id, uint256 price, uint256 duration);
    event LicensePurchased(uint256 indexed id, address indexed buyer, uint256 price, uint256 expiresAt);

    modifier onlyOwner(uint256 id) {
        require(records[id].owner == msg.sender, "Not owner");
        _;
    }

    function registerIP(bytes32 ipHash, string calldata metadataURI) external returns (uint256) {
        require(hashToId[ipHash] == 0, "IP already registered");
        uint256 id = nextId++;
        IPRecord storage record = records[id];
        record.owner = msg.sender;
        record.timestamp = block.timestamp;
        record.ipHash = ipHash;
        record.metadataURI = metadataURI;
        hashToId[ipHash] = id;
        emit IPRegistered(id, msg.sender, ipHash, metadataURI);
        return id;
    }

    function getRecord(uint256 id)
        external
        view
        returns (address owner, uint256 timestamp, bytes32 ipHash, string memory metadataURI)
    {
        IPRecord storage record = records[id];
        return (record.owner, record.timestamp, record.ipHash, record.metadataURI);
    }

    function transferIP(uint256 id, address newOwner, string calldata note) external onlyOwner(id) {
        require(newOwner != address(0), "Invalid new owner");
        IPRecord storage record = records[id];
        record.transfers.push(
            TransferEvent({
                from: record.owner,
                to: newOwner,
                timestamp: block.timestamp,
                note: note
            })
        );
        emit IPTransferred(id, record.owner, newOwner, note);
        record.owner = newOwner;
    }

    function setLicenseTerms(uint256 id, uint256 price, uint256 duration) external onlyOwner(id) {
        require(duration > 0, "Duration required");
        records[id].licenses.push(LicenseTerms({ price: price, duration: duration, createdAt: block.timestamp }));
        emit LicenseConfigured(id, price, duration);
    }

    function purchaseLatestLicense(uint256 id) external payable {
        IPRecord storage record = records[id];
        require(record.licenses.length > 0, "No license configured");
        LicenseTerms storage terms = record.licenses[record.licenses.length - 1];
        require(msg.value == terms.price, "Incorrect payment");
        uint256 expiresAt = block.timestamp + terms.duration;
        payable(record.owner).transfer(msg.value);
        emit LicensePurchased(id, msg.sender, terms.price, expiresAt);
    }

    function getLicenseCount(uint256 id) external view returns (uint256) {
        return records[id].licenses.length;
    }

    function getTransferCount(uint256 id) external view returns (uint256) {
        return records[id].transfers.length;
    }
}
