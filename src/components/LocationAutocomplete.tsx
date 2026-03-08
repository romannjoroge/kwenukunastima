'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface LocationAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
  initialPlace?: google.maps.places.PlaceResult | null;
}

export function LocationAutocomplete({ onPlaceSelect, placeholder = 'Weka location yako...', className = '', initialPlace }: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialPlace?.name || initialPlace?.formatted_address || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const geocoding = useMapsLibrary('geocoding');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (initialPlace) return; // Skip getting user geolocation if an initial place was passed
    if (!geocoding) return;

    // Attempt to get user's current location to set as default input value text
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          try {
            const geocoder = new geocoding.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });
            
            if (response.results && response.results.length > 0) {
              const result = response.results[0];
              const address = result.formatted_address;
              setInputValue(address);
              
              const simulatedPlace = {
                ...result,
                name: address,
              } as unknown as google.maps.places.PlaceResult;
              
              onPlaceSelect(simulatedPlace);
            } else {
              const fallbackStr = `Current location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
              setInputValue(fallbackStr);
              onPlaceSelect({
                formatted_address: fallbackStr,
                name: fallbackStr,
                geometry: { location: { lat: () => lat, lng: () => lng } as any }
              } as google.maps.places.PlaceResult);
            }
          } catch (e) {
            console.error('Geocoding failed', e);
            const fallbackStr = `Current location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
            setInputValue(fallbackStr);
            onPlaceSelect({
              formatted_address: fallbackStr,
              name: fallbackStr,
              geometry: { location: { lat: () => lat, lng: () => lng } as any }
            } as google.maps.places.PlaceResult);
          }
        },
        (err) => console.log('Geolocation skipped', err),
        { timeout: 5000 }
      );
    }
  }, [geocoding, onPlaceSelect, initialPlace]);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      componentRestrictions: { country: 'ke' }, // Restrict to Kenya
    };

    const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place.geometry && place.geometry.location) {
        onPlaceSelect(place);
        setInputValue(place.name || place.formatted_address || '');
      } else {
        onPlaceSelect(null);
      }
    });

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [places, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 transition-all font-medium text-slate-700 outline-none ${className}`}
    />
  );
}
