const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

if (!cloudName || !uploadPreset) {
  throw new Error('Missing Cloudinary environment variables')
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('cloud_name', cloudName)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Error uploading image')
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number): string => {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
  const transformations = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  transformations.push('f_auto', 'q_auto')
  
  const transformString = transformations.join(',')
  return `${baseUrl}/${transformString}/${publicId}`
}


