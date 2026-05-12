const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

export const binaryToImageUrl = (binaryData) => {
  if (!binaryData) return null
  try {
    const bytes = new Uint8Array(binaryData.data || binaryData)
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

export const getImageSrc = (dataObj, fallbackUrl = null) => {
  if (!dataObj) return fallbackUrl
  if (dataObj.profile_picture_data) {
    return binaryToImageUrl(dataObj.profile_picture_data)
  }
  if (dataObj.harvest_photo_data) {
    return binaryToImageUrl(dataObj.harvest_photo_data)
  }
  if (dataObj.buyer_profile_picture_data) {
    return binaryToImageUrl(dataObj.buyer_profile_picture_data)
  }
  if (dataObj.profile_picture) {
    return dataObj.profile_picture.startsWith('http') 
      ? dataObj.profile_picture 
      : `${BASE_URL}${dataObj.profile_picture}`
  }
  if (dataObj.harvest_photo) {
    return dataObj.harvest_photo.startsWith('http')
      ? dataObj.harvest_photo
      : `${BASE_URL}${dataObj.harvest_photo}`
  }
  return fallbackUrl
}

export const getUserImageSrc = (dataObj, userId) => {
  const url = getImageSrc(dataObj)
  if (url) return url
  if (userId) {
    return `${BASE_URL}/api/images/user/${userId}`
  }
  return null
}