'use client';

import { useState, useEffect } from 'react';

export default function ProcessImagesPage() {
  const [status, setStatus] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const checkStatus = async () => {
    const res = await fetch('/api/admin/process-images');
    const data = await res.json();
    setStatus(data);
    return data;
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const processBatch = async (offset: number): Promise<boolean> => {
    const res = await fetch('/api/admin/process-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchSize: 50, offset })
    });
    
    const data = await res.json();
    
    if (data.error) {
      addLog(`Error: ${data.error}`);
      return false;
    }
    
    addLog(`Batch complete: ${data.uploaded} uploaded, ${data.skipped} skipped, ${data.failed} failed`);
    setProgress(prev => ({ 
      ...prev, 
      processed: prev.processed + data.processed 
    }));
    
    return data.hasMore;
  };

  const startProcessing = async () => {
    setProcessing(true);
    setLog([]);
    
    const initialStatus = await checkStatus();
    setProgress({ processed: 0, total: initialStatus.totalSpirits });
    
    addLog(`Starting processing of ${initialStatus.totalSpirits} spirits...`);
    
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      addLog(`Processing batch starting at offset ${offset}...`);
      hasMore = await processBatch(offset);
      offset += 50;
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
    
    addLog('✅ Processing complete!');
    await checkStatus();
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-8">
          🥃 Spirit Image Processor
        </h1>
        
        {status && (
          <div className="bg-stone-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-stone-400">Total Spirits</p>
                <p className="text-2xl font-bold">{status.totalSpirits?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-stone-400">Images in Storage</p>
                <p className="text-2xl font-bold text-green-400">{status.imagesUploaded?.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              Storage URL: {status.bucketUrl}
            </p>
          </div>
        )}
        
        <div className="bg-stone-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Process Images</h2>
          <p className="text-stone-400 mb-4">
            This will download all spirit images from external sources and upload them to Supabase Storage.
            Everything runs in the cloud - no local downloads needed.
          </p>
          
          {processing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress.processed} / {progress.total}</span>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <button
            onClick={startProcessing}
            disabled={processing}
            className={`px-6 py-3 rounded-lg font-medium ${
              processing 
                ? 'bg-stone-700 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {processing ? 'Processing...' : 'Start Processing'}
          </button>
        </div>
        
        {log.length > 0 && (
          <div className="bg-stone-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Log</h2>
            <div className="bg-black rounded p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {log.map((entry, i) => (
                <div key={i} className="text-green-400">{entry}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
