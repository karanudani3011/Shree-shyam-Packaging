/**
 * Cloudinary Image Upload Utility
 * Uploads images to Cloudinary using unsigned upload preset
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image URL and public ID
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Get a Cloudinary optimized URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getOptimizedUrl = (url, { width = 400, height = 400, quality = 'auto' } = {}) => {
  if (!url || !url.includes('cloudinary')) return url;
  // Insert transformations before /upload/
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_${quality}/`);
};
