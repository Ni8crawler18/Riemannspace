import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import secrets

np.random.seed(42)

def generate_address():
    return '0x' + secrets.token_hex(20)

def generate_transaction(is_anomaly=False):
    amount = np.random.lognormal(mean=4, sigma=1)
    if is_anomaly:
        amount *= np.random.uniform(5, 10)
    
    timestamp = datetime.now() - timedelta(days=np.random.randint(0, 365))
    
    sender = generate_address()
    receiver = generate_address()
    
    transaction_type = np.random.choice(['transfer', 'payment', 'exchange'])
    
    return {
        'timestamp': timestamp,
        'amount': amount,
        'sender': sender,
        'receiver': receiver,
        'transaction_type': transaction_type,
        'is_anomaly': is_anomaly
    }

# Generate 10000 normal transactions and 100 anomalous transactions
normal_transactions = [generate_transaction() for _ in range(10000)]
anomalous_transactions = [generate_transaction(is_anomaly=True) for _ in range(100)]

all_transactions = normal_transactions + anomalous_transactions
df = pd.DataFrame(all_transactions)

# Save to CSV
df.to_csv('cbdc_transactions.csv', index=False)

print(df.head())
print(f"\nDataset shape: {df.shape}")
print(f"\nAnomaly distribution:\n{df['is_anomaly'].value_counts(normalize=True)}")