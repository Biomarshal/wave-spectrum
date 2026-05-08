import { auth } from './firebase';

export const uploadToCloudinary = async (file: File | Blob) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 1. Get Firebase ID token
  const token = await user.getIdToken(true);

  // 2. Call backend to get Cloudinary signature
  const signResponse = await fetch('/api/sign-cloudinary', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!signResponse.ok) {
    const errorData = await signResponse.json();
    throw new Error(errorData.error || 'Failed to get upload signature');
  }

  const { timestamp, signature, apiKey, cloudName, uploadPreset } = await signResponse.json();

  // 3. Upload to Cloudinary using the signature
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  };
};
