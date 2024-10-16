## Reimannspace - Anonymity and Compliance in CBDC.

Traditional blockchain systems lack user anonymity revealing public keys, amount, timestamps. Riemannspace protocol solves this issue by a pipeline of Anomaly model, 
zkSNARK proof generation, ring signatures randomization, and Node validation based on proofs.

### Workflow

Sender iniates transaction -> Isolation Forest Model ( Checks Anomaly) -> zk SNARK proof generation ( Circum files, zkey, verifier contract ) -> Public key randomization ( Ring signatures) -> proof verification (Node validation) -> Transaction completes ( reciever gets CBDCs).
