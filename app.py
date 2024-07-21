from flask import Flask, request, jsonify
from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Connect to Ethereum node
w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_NODE_URL')))

# Contract addresses and ABIs
PRESALE_CONTRACT_ADDRESS = os.getenv('PRESALE_CONTRACT_ADDRESS')
PRESALE_ABI = json.loads(os.getenv('PRESALE_ABI'))
USDT_CONTRACT_ADDRESS = os.getenv('USDT_CONTRACT_ADDRESS')
USDT_ABI = json.loads(os.getenv('USDT_ABI'))

# Load presale contract
presale_contract = w3.eth.contract(address=PRESALE_CONTRACT_ADDRESS, abi=PRESALE_ABI)

@app.route('/buy', methods=['POST'])
def buy_tokens():
    data = request.json
    amount = data['amount']
    payment_method = data['paymentMethod']
    wallet_address = data['walletAddress']

    try:
        if payment_method == 'ETH':
            tx_hash = presale_contract.functions.purchaseTokensWithEth().transact({
                'from': wallet_address,
                'value': w3.to_wei(amount, 'ether')
            })
        elif payment_method == 'USDT':
            usdt_contract = w3.eth.contract(address=USDT_CONTRACT_ADDRESS, abi=USDT_ABI)
            usdt_amount = int(float(amount) * 10**6)  # USDT has 6 decimal places
            
            # Approve USDT transfer
            approve_tx = usdt_contract.functions.approve(PRESALE_CONTRACT_ADDRESS, usdt_amount).transact({
                'from': wallet_address
            })
            w3.eth.wait_for_transaction_receipt(approve_tx)

            # Purchase tokens with USDT
            tx_hash = presale_contract.functions.purchaseTokensWithUsdt(usdt_amount).transact({
                'from': wallet_address
            })
        
        # Wait for the transaction to be mined
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({'success': True, 'txHash': tx_hash.hex()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/presale-info', methods=['GET'])
def get_presale_info():
    try:
        token_price = presale_contract.functions.tokenPrice().call()
        hard_cap = presale_contract.functions.hardCap().call()
        raised_amount = presale_contract.functions.raisedAmount().call()
        
        return jsonify({
            'tokenPrice': token_price,
            'hardCap': hard_cap,
            'raisedAmount': raised_amount
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)

