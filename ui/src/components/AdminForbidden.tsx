import { useParams, Link } from 'react-router-dom';

export function AdminForbidden() {
  const { address } = useParams<{ address: string }>();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Access Denied</h2>
      <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
        This area is restricted to the contract owner only.
      </p>
      <Link 
        to={`/sync/${address}`} 
        className="inline-block px-6 py-3 bg-white !text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        style={{ color: 'black' }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
