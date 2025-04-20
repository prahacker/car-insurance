import { NextRequest, NextResponse } from 'next/server';
import { detectDamage } from '@/lib/utils/damage-detection';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: claimId } = await Promise.resolve(params);
    const { image_url } = await request.json();

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const result = await detectDamage(claimId, image_url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in damage detection API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}