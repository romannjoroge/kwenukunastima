'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface LocationAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({ onPlaceSelect, placeholder = 'Weka location yako...', className = '' }: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Attempt to get user's current location to set as default input value text
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // Ideally use geocoding here to get a string name, but to keep it simple and limit API calls:
          setInputValue(`Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
          // We don't automatically trigger select here, we just pre-fill. A real geocoder could turn this into a place name.
          // To simplify, we'll let the user type if they want something specific.
        },
        (err) => console.log('Geolocation skipped', err),
        { timeout: 5000 }
      );
    }
  }, []);

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
