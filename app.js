// ================= BACKGROUND ANIMATION =================
console.log("JS Loaded");
window.onload = function() {
    const canvas = document.getElementById("bgCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for(let i = 0; i < 80; i++){
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5),
            dy: (Math.random() - 0.5),
            radius: 2
        });
    }

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(let p of particles){
            p.x += p.dx;
            p.y += p.dy;

            if(p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
};


// ================= WEB3 SETUP =================

let provider, signer, contract;

// 🔥 PASTE YOUR CONTRACT ADDRESS HERE
const contractAddress = "PASTE_YOUR_CONTRACT_ADDRESS";

// ABI
const abi = [
    {
        "inputs": [],
        "name": "registerNode",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType":"address","name":"user","type":"address"}],
        "name": "authenticate",
        "outputs": [{"internalType":"bool","name":"","type":"bool"}],
        "stateMutability": "view",
        "type": "function"
    }
];


// ================= CONNECT WALLET =================

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            contract = new ethers.Contract(
                contractAddress,
                abi,
                signer
            );

            console.log("Contract loaded:", contract);

            document.getElementById("walletAddress").innerText =
                "Connected: " + accounts[0];
                provider = new ethers.providers.Web3Provider(window.ethereum);
signer = provider.getSigner();

contract = new ethers.Contract(contractAddress, abi, signer);

        } catch (error) {
            console.error(error);
        }
    } else {
        alert("MetaMask not detected ❌");
    }
}
// ADD THIS
const balance = await provider.getBalance(accounts[0]);
document.getElementById("walletBalance").innerText =
    "💰 Balance: " + ethers.utils.formatEther(balance) + " ETH";

const net = await provider.getNetwork();
document.getElementById("network").innerText =
    "🌐 Network: " + net.name;

// ================= REGISTER ON BLOCKCHAIN =================

async function registerOnBlockchain() {
    console.log("Register clicked");

    try {
        if (!contract) {
            alert("Connect wallet first ❌");
            return;
        }

        document.getElementById("web3Result").innerHTML =
    "⏳ Waiting for MetaMask confirmation...";

const tx = await contract.registerNode();

document.getElementById("web3Result").innerHTML =
    "⛏ Transaction sent... processing...";

const receipt = await tx.wait();

document.getElementById("web3Result").innerHTML = `
    <div style="color:#4ade80;">
        ✅ Private Blockchain<br>
        ✔ Block Mined Successfully<br>
        🔗 Hash Stored
    </div>

    <hr>

    <div style="color:#38bdf8;">
        🌐 Public Blockchain (Ethereum)<br>
        ✔ Transaction Confirmed<br>
        🔗 Tx Hash: ${tx.hash}<br>
        ⛽ Gas Used: ${receipt.gasUsed}<br>
        <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank">
            🔍 View on Etherscan
        </a>
    </div>
`;

    } catch (error) {
        console.error(error);
        alert("Transaction failed ❌");
    }
    console.log("Register button clicked");
}


// ================= AUTHENTICATE ON BLOCKCHAIN =================

async function authenticateOnBlockchain() {
    console.log("Auth clicked");

    try {
        if (!contract) {
            alert("Connect wallet first ❌");
            return;
        }

        const user = await signer.getAddress();

        const result = await contract.authenticate(user);

        document.getElementById("web3Result").innerHTML =
    result
    ? "✔ Node Verified on Blockchain"
    : "❌ Unauthorized Node";

    } catch (error) {
        console.error(error);
    }
}

async function viewBlockchain() {
    try {
        const response = await fetch('/get_chain');
        const data = await response.json();

        const blockList = document.getElementById("blockList");
        blockList.innerHTML = "";

        data.forEach((block, index) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <div style="
                    background: rgba(255,255,255,0.05);
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                ">
                    <strong>Block ${index}</strong><br>
                    🔢 Nonce: ${block.nonce}<br>
                    🔗 Hash: ${block.hash}<br>
                    📦 Data: ${JSON.stringify(block.data)}<br>
                </div>
            `;

            blockList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert("Error fetching blockchain");
    }
}


document.getElementById("totalNodes").innerText = 5;
document.getElementById("blocksMined").innerText = 12;
document.getElementById("txCount").innerText = 8;
function addTransaction(hash) {
    const li = document.createElement("li");
    li.innerHTML = `🔗 ${hash}`;
    document.getElementById("txList").appendChild(li);
}

async function viewBlockchain() {
    try {
        const response = await fetch('/get_chain');
        const data = await response.json();

        const blockList = document.getElementById("blockList");
        blockList.innerHTML = "";

        data.forEach((block, index) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <div style="
                    background: rgba(255,255,255,0.05);
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                ">
                    <strong>Block ${index}</strong><br>
                    🔢 Nonce: ${block.nonce}<br>
                    🔗 Hash: ${block.hash}<br>
                    📦 Data: ${JSON.stringify(block.data)}<br>
                </div>
            `;

            blockList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert("Error fetching blockchain");
    }
}