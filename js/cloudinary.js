const CLOUDINARY_CLOUD_NAME = 'xxx';
const CLOUDINARY_UPLOAD_PRESET = 'anti-flood';

export async function uploadImage(file) {
  if (!file) {
    return '';
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upload ảnh thất bại');
  }

  const data = await response.json();
  return data.secure_url || '';
}