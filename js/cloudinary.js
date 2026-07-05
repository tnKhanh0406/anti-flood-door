export const CLOUDINARY_CLOUD_NAME = 'dlm5gmhxs';
export const CLOUDINARY_UPLOAD_PRESET = 'juau6dmj';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export async function uploadImage(file, options = {}) {
  if (!file) {
    return '';
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
    signal: options.signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upload ảnh thất bại');
  }

  const data = await response.json();
  return data.secure_url || '';
}
