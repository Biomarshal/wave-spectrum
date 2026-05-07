import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdmin(req);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access only' }, { status: 403 });
    }

    const { publicId } = await req.json();


    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary configuration is missing' }, { status: 500 });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    
    // Create signature: SHA-1 of "public_id={publicId}&timestamp={timestamp}{apiSecret}"
    const crypto = await import('crypto');
    const signature = crypto.createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.result !== 'ok' && data.result !== 'not found') {
      throw new Error(data.error?.message || 'Failed to delete from Cloudinary');
    }

    return NextResponse.json({ success: true, result: data.result });
  } catch (error: any) {
    console.error('Delete song error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
