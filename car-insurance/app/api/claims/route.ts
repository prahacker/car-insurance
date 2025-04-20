import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { uploadImageToS3, generateUniqueId, getClaimFolderPath } from '@/lib/utils/s3-utils';

export async function GET(req: NextRequest) {
  try {
    const [rows] = await dbPool.execute(
      `SELECT 
        c.claim_id as id,
        c.customer_name as customerName,
        c.email,
        c.phone_number as phone,
        c.policy_number as policyNumber,
        c.incident_date as incidentDate,
        it.type_name as incidentType,
        c.vehicle_brand as vehicleBrand,
        cs.status_name as status,
        c.created_at as createdAt,
        c.damage_estimated_cost as estimatedCost,
        c.damage_photo_url as damagePhotoUrl
      FROM claims c
      LEFT JOIN incident_types it ON c.incident_type_id = it.type_id
      LEFT JOIN claim_status cs ON c.status_id = cs.status_id
      ORDER BY c.created_at DESC`
    );

    return NextResponse.json({ claims: rows });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const policyNumber = formData.get('policyNumber') as string;

    const [existingClaims] = await dbPool.execute(
      'SELECT claim_id FROM claims WHERE policy_number = ?',
      [policyNumber]
    );

    if ((existingClaims as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'A claim already exists for this policy number' },
        { status: 409 }
      );
    }
    const customerName = formData.get('customerName') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const vehicleTypeId = parseInt(formData.get('vehicleTypeId') as string);
    const vehicleBrand = formData.get('vehicleBrand') as string;
    const vehicleDescription = formData.get('vehicleDescription') as string;
    const incidentTypeId = parseInt(formData.get('incidentTypeId') as string);
    const incidentDate = formData.get('incidentDate') as string;
    const estimatedCost = parseFloat(formData.get('estimatedCost') as string);
    const images = formData.getAll('images') as File[];

    const claimId = generateUniqueId();

    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      const [statusRows] = await connection.execute(
        'SELECT status_id FROM claim_status WHERE status_name = "new"'
      );
      const statusId = (statusRows as any[])[0].status_id;

      await connection.execute(
        'INSERT INTO claims (claim_id, uuid, customer_name, policy_number, email, phone_number, vehicle_type_id, vehicle_brand, vehicle_description, incident_type_id, incident_date, status_id, estimated_cost) VALUES (?, UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [claimId, customerName, policyNumber, email, phoneNumber, vehicleTypeId, vehicleBrand, vehicleDescription, incidentTypeId, incidentDate, statusId, estimatedCost]
      );

      if (images.length > 0) {
        const damagePhoto = images[0];
        const buffer = Buffer.from(await damagePhoto.arrayBuffer());
        const fileName = `${Date.now()}-${damagePhoto.name}`;
        
        const damagePhotoUrl = await uploadImageToS3(buffer, fileName, claimId);
        
        await connection.execute(
          'UPDATE claims SET damage_photo_url = ? WHERE claim_id = ?',
          [damagePhotoUrl, claimId]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        message: 'Claim submitted successfully',
        claimId 
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process claim' },
      { status: 500 }
    );
  }
}