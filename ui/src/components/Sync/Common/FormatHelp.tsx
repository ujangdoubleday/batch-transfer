import { cn } from '../../../lib/utils';
import { useState } from 'react';

type TabType = 'manual' | 'upload';

interface FormatHelpProps {
  activeTab: TabType;
  showHelp: boolean;
  onToggleHelp: () => void;
  isCombined?: boolean;
}

const JSON_EXAMPLE = `[
  {
    "recipient": "0x101010171D3E2d1f3DcAa07b7C1B89C7d5D63Fb2",
    "amount": "1.5"
  },
  {
    "recipient": "0x...",
    "amount": "0.5"
  }
]`;

const CSV_EXAMPLE = `recipient,amount
0x101010171D3E2d1f3DcAa07b7C1B89C7d5D63Fb2,1.5
0x...,0.5`;

const COMBINED_JSON_EXAMPLE = `{
  "tokens": [
    {
      "token": "0xTokenAddress...",
      "recipient": "0xRecipient...",
      "amount": "100"
    }
  ],
  "eth": [
    {
      "recipient": "0xRecipient...",
      "amount": "0.5"
    }
  ]
}`;

const COMBINED_CSV_EXAMPLE = `type, token_address, recipient, amount
token, 0xToken..., 0xUser1..., 100
eth, , 0xUser2..., 0.5`;


const MULTI_TOKEN_JSON_EXAMPLE = `[
  {
    "token": "0xTokenAddress...",
    "recipient": "0xRecipient...",
    "amount": "100.5"
  },
  {
    "token": "0xAnotherToken...",
    "recipient": "0xAnotherRecipient...",
    "amount": "50"
  }
]`;

const MULTI_TOKEN_CSV_EXAMPLE = `token,recipient,amount
0xTokenAddress...,0xRecipient...,100.5
0xAnotherToken...,0xAnotherRecipient...,50`;

export function FormatHelp({ activeTab, showHelp, onToggleHelp, isCombined, isMultiToken }: FormatHelpProps & { isMultiToken?: boolean }) {
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  if (activeTab === 'manual') return null;

  const handleCopy = (type: 'json' | 'csv') => {
    let text = '';
    if (isCombined) {
        text = type === 'json' ? COMBINED_JSON_EXAMPLE : COMBINED_CSV_EXAMPLE;
    } else if (isMultiToken) {
        text = type === 'json' ? MULTI_TOKEN_JSON_EXAMPLE : MULTI_TOKEN_CSV_EXAMPLE;
    } else {
        text = type === 'json' ? JSON_EXAMPLE : CSV_EXAMPLE;
    }
    
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } else {
      setCopiedCSV(true);
      setTimeout(() => setCopiedCSV(false), 2000);
    }
  };

  const renderCopyButton = (type: 'json' | 'csv', copied: boolean) => (
    <button
      type="button"
      onClick={() => handleCopy(type)}
      className="absolute top-4 right-4 p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all border border-zinc-700 hover:border-zinc-500 z-10"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  let jsonContent = JSON_EXAMPLE;
  let csvContent = CSV_EXAMPLE;
  let labelPrefix = '';

  if (isCombined) {
      jsonContent = COMBINED_JSON_EXAMPLE;
      csvContent = COMBINED_CSV_EXAMPLE;
      labelPrefix = 'Combined ';
  } else if (isMultiToken) {
      jsonContent = MULTI_TOKEN_JSON_EXAMPLE;
      csvContent = MULTI_TOKEN_CSV_EXAMPLE;
      labelPrefix = 'Multi-Token ';
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggleHelp}
          className="text-xs font-medium text-zinc-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-wider"
        >
          {showHelp ? 'Hide Formats' : 'View Formats'}
          <svg
            className={cn("w-4 h-4 transition-transform", showHelp ? "rotate-180" : "")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showHelp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="relative group bg-zinc-900/50 border border-white/5 rounded-xl p-6 overflow-hidden">
             <div className="absolute top-4 left-4 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                {labelPrefix}JSON Format
             </div>
             {renderCopyButton('json', copiedJSON)}
             <pre className="text-xs font-mono text-zinc-400 overflow-x-auto mt-6">{jsonContent}</pre>
          </div>

          <div className="relative group bg-zinc-900/50 border border-white/5 rounded-xl p-6 overflow-hidden">
             <div className="absolute top-4 left-4 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                {labelPrefix}CSV Format
             </div>
             {renderCopyButton('csv', copiedCSV)}
             <pre className="text-xs font-mono text-zinc-400 overflow-x-auto mt-6">{csvContent}</pre>
          </div>
        </div>
      )}
    </>
  );
}
