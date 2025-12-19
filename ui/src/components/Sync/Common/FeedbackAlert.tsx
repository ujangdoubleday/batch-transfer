import { cn } from '../../../lib/utils';

interface FeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
  hash?: string;
}

interface FeedbackAlertProps {
  feedback: FeedbackState;
  explorerUrl?: string;
  onDismiss: () => void;
}

export function FeedbackAlert({ feedback, explorerUrl, onDismiss }: FeedbackAlertProps) {
  return (
    <div className={cn(
        "mx-8 mt-8 p-4 rounded-xl border flex items-start gap-4 animate-in slide-in-from-top-2",
        feedback.type === 'success' ? "bg-green-900/20 border-green-900/50 text-green-400" :
        feedback.type === 'error' ? "bg-red-900/20 border-red-900/50 text-red-400" :
        "bg-blue-900/20 border-blue-900/50 text-blue-400"
    )}>
        <div className="mt-1">
            {feedback.type === 'success' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )}
            {feedback.type === 'error' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            {feedback.type === 'info' && (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium">{feedback.message}</p>
            {feedback.hash && explorerUrl && (
                <a 
                    href={`${explorerUrl}/tx/${feedback.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline underline-offset-4 opacity-80 hover:opacity-100 mt-1 block truncate"
                >
                    View on Explorer: {feedback.hash}
                </a>
            )}
        </div>
        <button 
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
  );
}
