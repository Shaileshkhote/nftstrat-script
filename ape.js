import { ethers } from "ethers";
import fetch from "node-fetch";

const RPC_URL = "https://ethereum-rpc.publicnode.com";
const PRIVATE_KEY = "";
const NFT_STRATEGY_ADDRESS = "0x6BCba7Cd81a5F12c10Ca1BF9B36761CC382658E8";
const SLUG = "boredapeyachtclub";
const TOKEN_ID = "5077";
const OPENSEA_API_KEY = "";

const NFT_STRATEGY_ABI = [
    "function buyTargetNFT(uint256 value, bytes calldata data, uint256 expectedId, address target) external payable"
];

async function fetchOpenSeaListing(tokenId) {
    const url = `https://api.opensea.io/api/v2/listings/collection/${SLUG}/nfts/${tokenId}/best`;

    const headers = {
        "accept": "application/json",
        "x-api-key": OPENSEA_API_KEY
    };

    try {
        console.log(`Fetching best listing for Moonbirds #${tokenId}...`);
        const response = await fetch(url, { headers });


        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenSea API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data || !data.price) {
            throw new Error("No listings found for this NFT");
        }

        console.log("Found listing:", {
            price: `${data.price.current.value / 10 ** data.price.current.decimals} ${data.price.current.currency}`,
            protocol: data.protocol_address,
            orderHash: data.order_hash
        });

        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching listing from OpenSea:", error);
        throw error;
    }
}

async function fetchFulfillmentData(protocolAddress, orderHash, fulfillerAddress, recipientAddress = null) {
    const url = 'https://api.opensea.io/api/v2/listings/fulfillment_data';

    const requestBody = {
        listing: {
            hash: orderHash,
            chain: 'ethereum',
            protocol_address: protocolAddress
        },
        fulfiller: {
            address: fulfillerAddress
        }
    };

    if (recipientAddress && recipientAddress !== fulfillerAddress) {
        requestBody.fulfiller.recipient = recipientAddress;
    }

    const options = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': OPENSEA_API_KEY
        },
        body: JSON.stringify(requestBody)
    };

    try {
        console.log(`\nFetching fulfillment data...`);
        console.log(`Protocol: ${protocolAddress}`);
        console.log(`Order Hash: ${orderHash}`);
        console.log(`Fulfiller: ${fulfillerAddress}`);
        if (recipientAddress && recipientAddress !== fulfillerAddress) {
            console.log(`Recipient: ${recipientAddress} (NFT will go here)`);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenSea API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data) {
            throw new Error("No fulfillment data returned");
        }

        console.log("\nFetched fulfillment data successfully");

        return data;
    } catch (error) {
        console.error("Error fetching fulfillment data from OpenSea:", error);
        throw error;
    }
}

async function main() {
    console.log("Starting main function...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Fetching orders from OpenSea...");
    let listingData;
    let fulfillmentData;
    try {
        listingData = await fetchOpenSeaListing(TOKEN_ID);

        const protocolAddress = listingData.protocol_address;
        const orderHash = listingData.order_hash;
        const fulfillerAddress = wallet.address;
        const recipientAddress = NFT_STRATEGY_ADDRESS;

        fulfillmentData = await fetchFulfillmentData(protocolAddress, orderHash, fulfillerAddress, recipientAddress);

        console.log("\n=== FULFILLMENT DATA ===");
        console.log(JSON.stringify(fulfillmentData, null, 2));
        console.log("========================\n");

    } catch (error) {
        console.error("Failed to fetch order:", error.message);
        return;
    }

    console.log("Preparing fulfill transaction...");

    let target, encodedData, value, expectedId;

    try {
        if (fulfillmentData.fulfillment_data && fulfillmentData.fulfillment_data.transaction) {
            console.log("Using OpenSea fulfillment data...");

            const fulfillmentTx = fulfillmentData.fulfillment_data.transaction;
            target = fulfillmentTx.to;
            value = BigInt(fulfillmentTx.value);
            expectedId = TOKEN_ID;

            console.log("\nTransaction details from OpenSea:");
            console.log(" Target (contract):", target);
            console.log(" Function:", fulfillmentTx.function);
            console.log(" Value (ETH):", ethers.formatEther(value));
            console.log(" Value (wei):", value.toString());

            const iface = new ethers.Interface([
                "function fulfillBasicOrder_efficient_6GL6yc(tuple(address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, tuple(uint256 amount, address recipient)[] additionalRecipients, bytes signature) parameters)"
            ]);

            encodedData = iface.encodeFunctionData(
                "fulfillBasicOrder_efficient_6GL6yc",
                [fulfillmentTx.input_data.parameters]
            );
        } else {
            throw new Error("No fulfillment data found in response. Cannot proceed with transaction.");
        }

        console.log("\nFinal transaction parameters:");
        console.log(" Target (contract):", target);
        console.log(" Value (wei):", value.toString());
        console.log(" Expected Token ID:", expectedId);

        const nftStrategy = new ethers.Contract(
            NFT_STRATEGY_ADDRESS,
            NFT_STRATEGY_ABI,
            wallet
        );

        console.log("\nCalling buyTargetNFT...");
        const tx = await nftStrategy.buyTargetNFT(
            value,
            encodedData,
            expectedId,
            target,
            {
                value: value,
                gasLimit: 800000n,
                gasPrice: ethers.parseUnits("3", "gwei")
            }
        );

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt.transactionHash);
        console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    } catch (error) {
        console.error("Error during fulfillment:", error);
        throw error;
    }
}

main()
    .then(() => {
        console.log("Done");
    })
    .catch((err) => {
        console.error("Error:", err);
        console.error(err.stack);
    });
