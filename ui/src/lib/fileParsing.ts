export const parseJSON = (content: string): { recipients: string[], amounts: string[] } => {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error("JSON must be an array");
    
    const r: string[] = [];
    const a: string[] = [];

    data.forEach((item: { recipient?: unknown; amount?: unknown }) => {
      if (typeof item.recipient === 'string' && (typeof item.amount === 'string' || typeof item.amount === 'number')) {
        r.push(item.recipient);
        a.push(item.amount.toString());
      }
    });

    return { recipients: r, amounts: a };
};

export const parseCSV = (content: string): { recipients: string[], amounts: string[] } => {
    const lines = content.split('\n');
    const r: string[] = [];
    const a: string[] = [];

    lines.forEach(line => {
      const parts = line.split(',');
      // Handle potential extra whitespace or empty lines
      if (parts.length >= 2) {
          const recipient = parts[0].trim();
          const amount = parts[1].trim();
          
          if (recipient && amount) {
            r.push(recipient);
            a.push(amount);
          }
      }
    });

    return { recipients: r, amounts: a };
};

export interface CombinedTransferData {
    tokens: { token: string; recipient: string; amount: string }[];
    eth: { recipient: string; amount: string }[];
}

export const parseCombinedJSON = (content: string): CombinedTransferData => {
    const data = JSON.parse(content);
    
    // Expecting structure: { tokens: [...], eth: [...] }
    const tokens: { token: string; recipient: string; amount: string }[] = [];
    const eth: { recipient: string; amount: string }[] = [];

    if (Array.isArray(data.tokens)) {
        data.tokens.forEach((item: { token?: unknown; recipient?: unknown; amount?: unknown }) => {
            if (typeof item.token === 'string' && typeof item.recipient === 'string' && (typeof item.amount === 'string' || typeof item.amount === 'number')) {
                tokens.push({
                    token: item.token.trim(),
                    recipient: item.recipient.trim(),
                    amount: item.amount.toString().trim()
                });
            }
        });
    }

    if (Array.isArray(data.eth)) {
        data.eth.forEach((item: { recipient?: unknown; amount?: unknown }) => {
            if (typeof item.recipient === 'string' && (typeof item.amount === 'string' || typeof item.amount === 'number')) {
                eth.push({
                    recipient: item.recipient.trim(),
                    amount: item.amount.toString().trim()
                });
            }
        });
    }

    if (tokens.length === 0 && eth.length === 0) {
        throw new Error("No valid 'tokens' or 'eth' data found in JSON");
    }

    return { tokens, eth };
};

export const parseCombinedCSV = (content: string): CombinedTransferData => {
    const lines = content.split('\n');
    const tokens: { token: string; recipient: string; amount: string }[] = [];
    const eth: { recipient: string; amount: string }[] = [];

    // Header check (optional, but good to skip if present)
    const startIndex = lines[0].toLowerCase().includes('type') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // format: type, token(optional), recipient, amount
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length < 3) continue; // minimal: type, recipient, amount (for ETH)

        const type = parts[0].toLowerCase();
        
        if (type === 'eth') {
            // expected: eth, recipient, amount
            // Or: eth, (empty), recipient, amount -> handle loose columns
            let recipient, amount;
            if (parts.length === 3) {
                 recipient = parts[1];
                 amount = parts[2];
            } else if (parts.length >= 4) {
                 // assume: eth, token(ignored), recipient, amount
                 recipient = parts[2];
                 amount = parts[3];
            }
            
            if (recipient && amount) {
                eth.push({ recipient, amount });
            }

        } else if (type === 'token') {
            // expected: token, tokenAddress, recipient, amount
            if (parts.length >= 4) {
                const tokenAddr = parts[1];
                const recipient = parts[2];
                const amount = parts[3];
                if (tokenAddr && recipient && amount) {
                    tokens.push({ token: tokenAddr, recipient, amount });
                }
            }
        }
    }

    if (tokens.length === 0 && eth.length === 0) {
        throw new Error("No valid data found in CSV. Use format: type, token(opt), recipient, amount");
    }

    return { tokens, eth };
};

export interface MultiTokenTransferData {
    token: string;
    recipient: string;
    amount: string;
}

export const parseMultiTokenJSON = (content: string): MultiTokenTransferData[] => {
    let data;
    try {
        data = JSON.parse(content);
    } catch {
        throw new Error("Invalid JSON format");
    }

    if (!Array.isArray(data)) throw new Error("JSON must be an array");
    
    const results: MultiTokenTransferData[] = [];
    data.forEach((item: { token?: unknown; recipient?: unknown; amount?: unknown }) => {
        if (typeof item.token === 'string' && typeof item.recipient === 'string' && (typeof item.amount === 'string' || typeof item.amount === 'number')) {
            results.push({
                token: item.token.trim(),
                recipient: item.recipient.trim(),
                amount: item.amount.toString().trim()
            });
        } else {
             // Optional: Log which item failed?
             // console.warn(`Item at index ${index} missing keys:`, item);
        }
    });
    
    if (results.length === 0) {
        // Check first item to give hint
        if (data.length > 0) {
            const keys = Object.keys(data[0]).join(', ');
            throw new Error(`No valid data found. Expected keys: "token", "recipient", "amount". Found: ${keys}`);
        }
        throw new Error("No valid data found. JSON array is empty or objects are missing required keys (token, recipient, amount).");
    }
    return results;
};

export const parseMultiTokenCSV = (content: string): MultiTokenTransferData[] => {
    const lines = content.split('\n');
    const results: MultiTokenTransferData[] = [];
    
    // Header check
    const startIndex = lines[0].toLowerCase().includes('token') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            const token = parts[0];
            const recipient = parts[1];
            const amount = parts[2];
            
            if (token && recipient && amount) {
                results.push({ token, recipient, amount });
            }
        }
    }
    
    if (results.length === 0) throw new Error("No valid data found in CSV");
    return results;
};
