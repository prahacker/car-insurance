import { dbPool } from '@/lib/db/config';

interface DamageAssessment {
  severity: string;
  estimatedCost: number;
  repairTime: string;
  notes: string;
  damagedPartsCount: number;
}

export async function detectDamage(claimId: string, imageUrl: string): Promise<DamageAssessment> {
  try {
    if (!process.env.DAMAGE_DETECTION_API_URL) {
      throw new Error('Damage detection API URL is not configured');
    }
    const detectionResponse = await fetch(`${process.env.DAMAGE_DETECTION_API_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claim_id: claimId,
        image_url: imageUrl
      })
    });
    
    if (!detectionResponse.ok) {
      const errorText = await detectionResponse.text();
      throw new Error(`Damage detection API error: ${errorText}`);
    }
    
    let detectionResult;
    const responseText = await detectionResponse.text();
    try {
      detectionResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response format from damage detection API');
    }

    if (!detectionResult || typeof detectionResult !== 'object') {
      throw new Error('Invalid response structure from damage detection API');
    }

    const assessment: DamageAssessment = {
      severity: ['low', 'medium', 'high'].includes(detectionResult.severity) ? detectionResult.severity : 'unknown',
      estimatedCost: typeof detectionResult.total_estimated_cost === 'number' ? detectionResult.total_estimated_cost : 0,
      repairTime: detectionResult.repair_time_range || '5-7 days',
      notes: `Detected ${detectionResult.damaged_parts_count || 0} damaged parts`,
      damagedPartsCount: typeof detectionResult.damaged_parts_count === 'number' ? detectionResult.damaged_parts_count : 0
    };

    await dbPool.execute(
      `UPDATE claims SET 
        damage_severity = ?,
        damage_estimated_cost = ?,
        damage_repair_time = ?,
        damage_notes = ?,
        damage_assessment = ?,
        result_photo_url = ?
      WHERE claim_id = ?`,
      [assessment.severity, assessment.estimatedCost, assessment.repairTime, assessment.notes, JSON.stringify(assessment), `https://${process.env.S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/claims/${claimId}/result.jpg`, claimId]
    );

    return assessment;
  } catch (error) {
    console.error('Error in damage detection:', error);
    throw error;
  }
}