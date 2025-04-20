"use client"
import { useState } from 'react';

interface DamageDetectionProps {
  claimId: string;
  imageUrl: string;
  onDetectionComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

async function detectDamage(claimId: string, imageUrl: string) {
  try {
    const response = await fetch(`/api/claims/${claimId}/detect-damage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Damage detection failed: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in damage detection:', error);
    throw error;
  }
}

export function DamageDetection({ claimId, imageUrl, onDetectionComplete, onError }: DamageDetectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await detectDamage(claimId, imageUrl);
      onDetectionComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze damage';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}
      <button
        onClick={handleDetection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Damage'}
      </button>
    </div>
  );
}