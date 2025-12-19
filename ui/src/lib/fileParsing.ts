export const parseJSON = (content: string): { recipients: string[], amounts: string[] } => {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error("JSON must be an array");
    
    const r: string[] = [];
    const a: string[] = [];

    data.forEach((item: any) => {
      if (item.recipient && item.amount) {
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
