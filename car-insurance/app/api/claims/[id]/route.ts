import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { ClaimData } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const [rows] = await dbPool.execute(
      `SELECT 
        c.id,
        c.customer_name as customerName,
        c.email,
        c.phone,
        c.policy_number as policyNumber,
        c.incident_date as incidentDate,
        c.incident_type as incidentType,
        c.description,
        c.vehicle_brand as vehicleBrand,
        c.status,
        c.created_at as createdAt,
        c.damage_severity as 'damageAssessment.severity',
        c.damage_estimated_cost as 'damageAssessment.estimatedCost',
        c.damage_repair_time as 'damageAssessment.repairTime',
        c.damage_notes as 'damageAssessment.notes',
        GROUP_CONCAT(ci.s3_url) as image_urls
      FROM claims c 
      LEFT JOIN claim_images ci ON c.id = ci.claim_id 
      WHERE c.id = ? 
      GROUP BY c.id`,
      [params.id]
    );

    if (!(rows as any[]).length) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const rawClaim = (rows as any[])[0];
    const imageUrls = rawClaim.image_urls ? rawClaim.image_urls.split(',') : [];

    const claim: ClaimData = {
      id: rawClaim.id,
      customerName: rawClaim.customerName,
      email: rawClaim.email,
      phone: rawClaim.phone,
      policyNumber: rawClaim.policyNumber,
      incidentDate: rawClaim.incidentDate,
      incidentType: rawClaim.incidentType,
      description: rawClaim.description,
      vehicleBrand: rawClaim.vehicleBrand || undefined,
      image: imageUrls[0] || null,
      status: rawClaim.status,
      createdAt: rawClaim.createdAt,
      damageAssessment: rawClaim['damageAssessment.severity'] ? {
        severity: rawClaim['damageAssessment.severity'],
        estimatedCost: rawClaim['damageAssessment.estimatedCost'],
        repairTime: rawClaim['damageAssessment.repairTime'],
        notes: rawClaim['damageAssessment.notes']
      } : undefined
    };

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 });
  }
}