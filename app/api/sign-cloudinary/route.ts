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
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }


    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
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
    console.error('Error signing Cloudinary upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
