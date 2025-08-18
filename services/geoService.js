const axios = require('axios');

class GeoService {
  constructor() {
    // You can use Google Maps API, OpenStreetMap Nominatim, or other geocoding services
    this.nominatimBaseURL = 'https://nominatim.openstreetmap.org';
    this.googleMapsAPIKey = process.env.GOOGLE_MAPS_API_KEY || null;
  }

  // Get coordinates from address using Nominatim (free alternative to Google)
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${this.nominatimBaseURL}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'in', // Restrict to India
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'Rajasthan-Seva-Portal/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          success: true,
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)], // [longitude, latitude]
          formattedAddress: result.display_name,
          address: {
            city: result.address?.city || result.address?.town || result.address?.village,
            state: result.address?.state,
            country: result.address?.country,
            postcode: result.address?.postcode
          }
        };
      } else {
        return {
          success: false,
          error: 'Address not found'
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return {
        success: false,
        error: 'Geocoding service unavailable'
      };
    }
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(longitude, latitude) {
    try {
      const response = await axios.get(`${this.nominatimBaseURL}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'Rajasthan-Seva-Portal/1.0'
        }
      });

      if (response.data) {
        const result = response.data;
        return {
          success: true,
          formattedAddress: result.display_name,
          address: {
            city: result.address?.city || result.address?.town || result.address?.village,
            state: result.address?.state,
            country: result.address?.country,
            postcode: result.address?.postcode,
            road: result.address?.road,
            suburb: result.address?.suburb
          }
        };
      } else {
        return {
          success: false,
          error: 'Location not found'
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return {
        success: false,
        error: 'Reverse geocoding service unavailable'
      };
    }
  }

  // Get nearby complaints based on coordinates
  async getNearbyComplaints(longitude, latitude, radiusKm = 5, Complaint) {
    try {
      // MongoDB geospatial query to find nearby complaints
      const nearbyComplaints = await Complaint.find({
        'geolocation.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      }).populate('createdBy', 'name').limit(20);

      return {
        success: true,
        complaints: nearbyComplaints,
        count: nearbyComplaints.length
      };
    } catch (error) {
      console.error('Nearby complaints query error:', error.message);
      return {
        success: false,
        error: 'Unable to fetch nearby complaints',
        complaints: []
      };
    }
  }

  // Validate coordinates
  isValidCoordinates(longitude, latitude) {
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 && longitude <= 180 &&
      latitude >= -90 && latitude <= 90
    );
  }

  // Check if coordinates are within Rajasthan boundaries (approximate)
  isWithinRajasthan(longitude, latitude) {
    // Approximate bounding box for Rajasthan
    const rajasthanBounds = {
      minLat: 23.03,
      maxLat: 30.12,
      minLon: 69.30,
      maxLon: 78.17
    };

    return (
      latitude >= rajasthanBounds.minLat &&
      latitude <= rajasthanBounds.maxLat &&
      longitude >= rajasthanBounds.minLon &&
      longitude <= rajasthanBounds.maxLon
    );
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lon1, lat1, lon2, lat2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  toRadians(degree) {
    return degree * (Math.PI / 180);
  }

  // Generate a map embed URL for display
  generateMapEmbedURL(longitude, latitude, zoom = 15) {
    // Using OpenStreetMap with Leaflet
    return {
      staticMapURL: `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`,
      interactiveURL: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`,
      coordinates: {
        latitude: latitude,
        longitude: longitude
      }
    };
  }

  // Get district information based on coordinates
  async getDistrictInfo(longitude, latitude) {
    try {
      const reverseGeocodeResult = await this.reverseGeocode(longitude, latitude);
      
      if (reverseGeocodeResult.success) {
        // Extract district/city information
        const address = reverseGeocodeResult.address;
        const district = address.city || address.suburb || 'Unknown District';
        const state = address.state || 'Unknown State';
        
        return {
          success: true,
          district: district,
          state: state,
          fullAddress: reverseGeocodeResult.formattedAddress
        };
      } else {
        return {
          success: false,
          error: 'Unable to determine district'
        };
      }
    } catch (error) {
      console.error('District info error:', error.message);
      return {
        success: false,
        error: 'Service unavailable'
      };
    }
  }
}

module.exports = new GeoService();
