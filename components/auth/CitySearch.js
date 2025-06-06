import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://api.geonames.org/search';
const API_USERNAME ='mafsykt';

const CityAutocomplete = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { 
    const fetchSuggestions = async () => {
      if (searchQuery.length > 2 && searchTrigger ==='search') {
        const response = await axios.get(`${API_URL}?q=${searchQuery}&maxRows=10&type=json&lang=ru&username=${API_USERNAME}`);
        setSuggestions(response.data.geonames);
      } else if (searchTrigger ==='select') {
        inputRef.current.value = searchQuery; // обновить значение поля ввода
        setSuggestions([]);
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [searchQuery, searchTrigger]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setSearchTrigger('search');
  };

  const handleSelect = (city) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setSearchTrigger('select');
    setSuggestions([]);
    inputRef.current.value = city.name;
  };

  const handleBlur = () => {
    if (!selectedCity) {
      setSuggestions([]);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={handleSearch}
        onBlur={handleBlur}
        ref={inputRef}
        placeholder="Введите название города"
        defaultValue={searchQuery}
        />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((city) => (
            <li key={city.geonameId}>
              <a href={`#${city.id}`} onClick={() => handleSelect(city)}>{city.name}</a> 
            </li>
          ))}
        </ul>
      )}
      
    </div>
  );
};

export default CityAutocomplete;