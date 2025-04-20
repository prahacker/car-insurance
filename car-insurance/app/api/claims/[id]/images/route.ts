import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { uploadImageToS3, getSignedImageUrl } from '@/lib/utils/s3-utils';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);
  const formData = await req.formData();
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const [claims] = await dbPool.execute('SELECT claim_id FROM claims WHERE claim_id = ?', [id]);
    const claimExists = (claims as any[]).length > 0;
    
    if (!claimExists) {
      const formFields = {
        customerName: formData.get('customerName') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phone') as string,
        policyNumber: formData.get('policyNumber') as string,
        incidentDate: formData.get('incidentDate') as string,
        incidentType: formData.get('incidentType') as string,
        description: formData.get('description') as string,  
        vehicleBrand: formData.get('vehicleBrand') as string,
        vehicleType: formData.get('vehicleType') as string
      };

      const missingFields = Object.entries(formFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.log(formFields.customerName, formFields.email, formFields.phoneNumber, formFields.policyNumber, formFields.incidentDate, formFields.description, formFields.vehicleType)
        return NextResponse.json({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          fields: formFields
        }, { status: 400 });
      }

      const [statusRows] = await dbPool.execute(
        'SELECT status_id FROM claim_status WHERE status_name = "pending"'
      );
      const statusId = (statusRows as any[])[0].status_id;
      const [vehicleTypes] = await dbPool.execute('SELECT type_id FROM vehicle_types WHERE type_name = ?', [formFields.vehicleType]);
      const [incidentTypes] = await dbPool.execute('SELECT type_id FROM incident_types WHERE type_name = ?', [formFields.incidentType]);

      console.log(vehicleTypes, incidentTypes)
      if ((vehicleTypes as any[]).length === 0 || (incidentTypes as any[]).length === 0) {
        return NextResponse.json({ 
          error: 'Invalid vehicle type or incident type ID. Please select valid options.',
          fields: formFields
        }, { status: 400 });
      }
      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const [result] = await dbPool.execute(
        `INSERT INTO claims (
          claim_id, 
          uuid, 
          customer_name, 
          policy_number, 
          email, 
          phone_number, 
          vehicle_type_id, 
          vehicle_brand, 
          vehicle_description,
          incident_type_id, 
          incident_date, 
          status_id,  
          damage_photo_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
        [
          id,
          id,
          formFields.customerName,
          formFields.policyNumber,
          formFields.email,
          formFields.phoneNumber,
          (vehicleTypes as any[])[0].type_id,
          formFields.vehicleBrand,
          formFields.description || '',
          (incidentTypes as any[])[0].type_id,
          formFields.incidentDate,
          statusId,
          `https://${process.env.S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/claims/${id}/image.png`,
          currentTimestamp,
          currentTimestamp
        ]
      );
      
      if (!result) {
        return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFileName = file.name;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = `image.${fileExtension}`;
    const s3Url = await uploadImageToS3(buffer, fileName, id);

    const [result] = await dbPool.execute(
      'INSERT INTO claim_images (claim_id, s3_url, s3_folder_path, file_name) VALUES (?, ?, ?, ?)',
      [id, s3Url, `claims/${id}`, fileName]
    );

    try {
      const { detectDamage } = await import('@/lib/utils/damage-detection');
      await detectDamage(id, s3Url);
    } catch (error) {
      console.error('Error in damage detection:', error);
    }

    return NextResponse.json({ success: true, url: s3Url })
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [rows] = await dbPool.execute(
      'SELECT * FROM claim_images WHERE claim_id = ?',
      [id]
    );

    const images = await Promise.all(
      (rows as any[]).map(async (image) => {
        const signedUrl = await getSignedImageUrl(image.s3_folder_path + '/' + image.file_name);
        return {
          id: image.id,
          url: signedUrl,
          fileName: image.file_name,
          uploadedAt: image.uploaded_at
        };
      })
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}