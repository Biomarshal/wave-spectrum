import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/firebaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    
    if ('error' in adminResult) {
      console.error('[API sign-cloudinary] Forbidden:', adminResult.error);
      return NextResponse.json({ error: adminResult.error }, { status: 403 });
    }

    const adminUser = adminResult;
    console.log('[API sign-cloudinary] Admin verified:', adminUser.uid);

    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      console.error('[API sign-cloudinary] Missing upload preset');
      return NextResponse.json({ error: 'Cloudinary upload preset is missing' }, { status: 500 });
    }

    // Generate Cloudinary signature
    // The params must be sorted alphabetically for the signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        upload_preset: uploadPreset,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: uploadPreset,
    });
  } catch (error: any) {
    console.error('[API sign-cloudinary] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

