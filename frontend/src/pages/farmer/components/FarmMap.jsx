import React from 'react'
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { useState } from 'react'

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

const FarmMap = ({formData,setFormData}) => {

  const mapContainerStyle = {
  width: "100%",
  height: "300px"
}

const center = {
  lat: 6.9214, 
  lng: 122.0790
}

const [marker, setMarker] = useState(null)

const handleMapClick = (e) => {
  const lat = e.latLng.lat()
  const lng = e.latLng.lng()

  setMarker({ lat, lng })

  setFormData({
    ...formData,
    gps_coordinates: `${lat}, ${lng}`
  })
}

  return (
    <div>

        <div>
  <label className="block text-sm font-medium mb-2">
    Pinpoint Farm Location
  </label>

  <LoadScript googleMapsApiKey={GOOGLE_API_KEY}>
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={10}
      onClick={handleMapClick}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  </LoadScript>

  <input
    type="text"
    value={formData.gps_coordinates}
    className="w-full p-2 border rounded mt-2"
    readOnly
  />
    </div>
      
    </div>
  )
}

export default FarmMap
