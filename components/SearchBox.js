// components/SearchBar.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import RatingWidget from './RatingWidget.js';

export default function SearchBar() {
  const [q, setQ] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestRated, setBestRated] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [listening, setListening] = useState(false);

  const router = useRouter();
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = (e) => {
    if (e) e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQ(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setBestRated([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value.trim());
    }, 250);
  };

  const fetchSuggestions = async (query) => {
    try {
      setIsSearching(true);
      const res = await fetch(
        `/api/search-autocomplete?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      setSuggestions((data.autocomplete || []).slice(0, 3)); // top 3
      setBestRated((data.bestRated || []).slice(0, 3)); // top 3
      if (data.trending) setTrending(data.trending);

      setShowDropdown(
        (data.autocomplete?.length ?? 0) > 0 ||
          (data.bestRated?.length ?? 0) > 0 ||
          (data.trending?.length ?? 0) > 0
      );
    } catch (err) {
      console.error('Autocomplete error', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Load trending once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/search-autocomplete');
        const data = await res.json();
        if (data.trending) setTrending(data.trending);
      } catch (err) {
        console.error('Trending fetch error', err);
      }
    })();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (slug) => {
    setShowDropdown(false);
    router.push(`/recipes/${slug}`);
  };

  // 🎤 Voice search
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQ(transcript);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  const hasDropdownContent =
    suggestions.length > 0 || bestRated.length > 0 || trending.length > 0;

  return (
    <div
      className='vr-search-wrapper'
      ref={wrapperRef}
    >
      <form
        onSubmit={doSearch}
        className='vr-search'
        role='search'
        aria-label='Search recipes'
      >
        <input
          ref={inputRef}
          className='vr-search__input'
          placeholder='Search recipes or ingredients (e.g., chicken, vegan, 30 min)'
          value={q}
          onChange={handleChange}
          onFocus={() => {
            if (hasDropdownContent) setShowDropdown(true);
          }}
        />

        {/* <button
          type='button'
          className={`vr-search__voice ${listening ? 'is-listening' : ''}`}
          aria-label='Voice search'
          onClick={handleVoiceSearch}
        >
          🎤
        </button> */}

        <button
          className='vr-search__button'
          type='submit'
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {showDropdown && hasDropdownContent && (
        <div className='vr-search__dropdown'>
          {/* Top matches */}
          {suggestions.length > 0 && (
            <div className='vr-search__group'>
              <div className='vr-search__group-title'>Top matches</div>
              <ul>
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className='vr-search__item'
                    onClick={() => handleSuggestionClick(item.slug)}
                  >
                    <span className='vr-search__item-title'>{item.title}</span>
                    <span className='vr-search__item-meta'>
                      {item.cuisine}{' '}
                      {item.total_time ? `· ${item.total_time} min` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best rated */}
          {bestRated.length > 0 && (
            <div className='vr-search__group'>
              <div className='vr-search__group-title'>Best rated</div>
              <ul>
                {bestRated.map((item) => (
                  <li
                    key={item.id}
                    className='vr-search__item'
                    onClick={() => handleSuggestionClick(item.slug)}
                  >
                    <span className='vr-search__item-title'>{item.title}</span>
                    <span className='vr-search__item-meta'>
                      <RatingWidget
                        recipeId={item.id}
                        initialRating={item.rating}
                        initialCount={item.rating_count}
                        disableSubmit={true}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trending now */}
          {trending.length > 0 && (
            <div className='vr-search__group'>
              <div className='vr-search__group-title'>Trending now</div>
              <ul>
                {trending.map((item) => (
                  <li
                    key={item.id}
                    className='vr-search__item'
                    onClick={() => handleSuggestionClick(item.slug)}
                  >
                    <span className='vr-search__item-title'>{item.title}</span>
                    <span className='vr-search__item-meta'>{item.cuisine}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
