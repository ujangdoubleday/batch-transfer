import { type RefObject } from 'react';

interface FileUploadProps {
  fileName: string | null;
  parseError: string | null;
  recipients: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerUpload: () => void;
  onChangeFile: () => void;
}

export function FileUpload({
  fileName,
  parseError,
  recipients,
  fileInputRef,
  onFileUpload,
  onTriggerUpload,
  onChangeFile
}: FileUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-zinc-800 rounded-xl hover:border-white/30 transition-colors bg-zinc-900/20 animate-in fade-in zoom-in-95 duration-300">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept=".json,.csv"
        className="hidden"
      />

      {fileName ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl">✓</span>
          </div>
          <div>
            <h3 className="text-white font-medium text-lg">{fileName}</h3>
            <p className="text-zinc-500 text-sm mt-1">
              {recipients ? `${recipients.split(',').length} records loaded` : 'Processing...'}
            </p>
          </div>
          <button
            type="button"
            onClick={onChangeFile}
            className="text-xs text-zinc-400 hover:text-white underline decoration-zinc-700 underline-offset-4"
          >
            Change File
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4 cursor-pointer" onClick={onTriggerUpload}>
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <span className="text-zinc-500 text-2xl group-hover:text-white transition-colors">↑</span>
          </div>
          <h3 className="text-zinc-300 font-medium">Click to upload File</h3>
          <p className="text-zinc-600 text-sm max-w-xs mx-auto">
            Supports JSON and CSV formats
          </p>
        </div>
      )}

      {parseError && (
        <div className="mt-6 p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
          <p className="text-red-400 text-sm">{parseError}</p>
        </div>
      )}
    </div>
  );
}
