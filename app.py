from flask import Flask, request, jsonify, render_template
import hashlib
import time
import secrets

app = Flask(__name__)

# ---------------- DIGITAL SIGNATURE ----------------
def generate_keys():
    private_key = secrets.token_hex(16)
    public_key = hashlib.sha256(private_key.encode()).hexdigest()
    return private_key, public_key

def sign_data(private_key, data):
    return hashlib.sha256((private_key + data).encode()).hexdigest()

# ---------------- BLOCK ----------------
class Block:
    def __init__(self, index, data, prev_hash, difficulty):
        self.index = index
        self.timestamp = time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.nonce = 0
        self.difficulty = difficulty
        self.hash = self.mine()

    def calculate_hash(self):
        value = f"{self.index}{self.timestamp}{self.data}{self.prev_hash}{self.nonce}"
        return hashlib.sha256(value.encode()).hexdigest()

    def mine(self):
        prefix = "0" * self.difficulty
        start = time.time()

        while True:
            hash_value = self.calculate_hash()
            if hash_value.startswith(prefix):
                self.mining_time = round(time.time() - start, 4)
                return hash_value
            self.nonce += 1

# ---------------- BLOCKCHAIN ----------------
class Blockchain:
    def __init__(self):
        self.chain = []
        self.create_genesis()

    def create_genesis(self):
        self.chain.append(Block(0, "GENESIS", "0", 2))

    def add_block(self, data, difficulty):
        prev = self.chain[-1]
        block = Block(len(self.chain), data, prev.hash, difficulty)
        self.chain.append(block)
        return block

    def verify(self, data):
        for block in self.chain:
            if block.data == data:
                return block.hash
        return None

    def get_chain(self):
        return [{
            "index": b.index,
            "data": b.data,
            "hash": b.hash,
            "prev": b.prev_hash,
            "nonce": b.nonce
        } for b in self.chain]

# -------- MULTI WSN --------
wsn1 = Blockchain()
wsn2 = Blockchain()
public_chain = Blockchain()

chains = {"1": wsn1, "2": wsn2}
node_keys = {}

@app.route("/")
def home():
    return render_template("index.html")

# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    node_id = data["node_id"]
    wsn_id = data["wsn"]
    difficulty = int(data["difficulty"])

    private_key, public_key = generate_keys()
    signature = sign_data(private_key, node_id)

    node_keys[node_id] = {
        "public_key": public_key,
        "signature": signature
    }

    private_chain = chains[wsn_id]
    block = private_chain.add_block(node_id, difficulty)

    public_chain.add_block(block.hash, difficulty)

    return jsonify({
        "message": "Node mined successfully!",
        "nonce": block.nonce,
        "hash": block.hash,
        "mining_time": block.mining_time
    })

# ---------------- AUTH ----------------
@app.route("/authenticate", methods=["POST"])
def authenticate():
    data = request.json
    node_id = data["node_id"]
    wsn_id = data["wsn"]

    if node_id not in node_keys:
        return jsonify({"message": "Fake Node ❌"})

    private_chain = chains[wsn_id]
    private_hash = private_chain.verify(node_id)

    if not private_hash:
        return jsonify({"message": "Not Found in Private Chain ❌"})

    public_hash = public_chain.verify(private_hash)

    if not public_hash:
        return jsonify({"message": "Public Chain Verification Failed ❌"})

    return jsonify({"message": "Authentication SUCCESS ✅"})

# ---------------- TAMPER ----------------
@app.route("/tamper", methods=["POST"])
def tamper():
    data = request.json
    wsn_id = data["wsn"]
    chain = chains[wsn_id]

    if len(chain.chain) > 1:
        chain.chain[1].data = "TAMPERED_DATA"

    return jsonify({"message": "Chain Tampered"})

# ---------------- BLOCKCHAIN VIEW ----------------
@app.route("/blockchain")
def blockchain():
    return jsonify({
        "public": public_chain.get_chain(),
        "wsn1": wsn1.get_chain(),
        "wsn2": wsn2.get_chain()
    })

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)