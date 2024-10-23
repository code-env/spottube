'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchYouTubePlaylistFn } from '@/helpers/fetch-youtube-playlist';
import axios from 'axios';
import { useState } from 'react';

const HomePage = () => {
  const [playlistId, setPlaylistId] = useState('');
  const [playlistItems, setPlaylistItems] = useState<any[]>([]);
  const [spotifyPlaylistName, setSpotifyPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [isSpotifyPlaylistPromptVisible, setSpotifyPlaylistPromptVisible] =
    useState(false);

  const fetchYouTubePlaylist = async () => {
    if (!playlistId) {
      setError('Please enter a valid YouTube playlist ID.');
      return;
    }

    try {
      const response = await fetchYouTubePlaylistFn(playlistId);

      if (response) {
        setPlaylistItems(response);
        setError('');
        setSpotifyPlaylistPromptVisible(true); // Show Spotify playlist name input
      } else {
        setError(response.data.error || 'Failed to fetch playlist items.');
      }
    } catch (err) {
      setError('An error occurred while fetching the playlist.');
    }
  };

  const createSpotifyPlaylist = async () => {
    if (!spotifyPlaylistName) {
      setError('Please enter a Spotify playlist name.');
      return;
    }

    // Send title and channel name (which could be the artist) to the backend
    const trackDetails = playlistItems.map((item: any) => ({
      title: item.snippet.title,
      artist: item.snippet.videoOwnerChannelTitle, // Use this as the artist
    }));

    try {
      const response = await axios.post('/api/spotify', {
        playlistName: spotifyPlaylistName,
        tracks: trackDetails, // Send titles and artists
      });

      if (
        response.data &&
        response.data.message === 'Playlist created successfully!'
      ) {
        alert(
          `Spotify Playlist "${spotifyPlaylistName}" created successfully!`
        );
      } else {
        setError(response.data.error || 'Failed to create Spotify playlist.');
      }
    } catch (err) {
      setError('An error occurred while creating the Spotify playlist.');
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full">
      <h1>Welcome to SpotTube</h1>

      {/* YouTube Playlist ID Input */}
      <div className="flex items-center gap-5">
        <Input
          type="text"
          value={playlistId}
          onChange={e => setPlaylistId(e.target.value)}
          placeholder="Enter YouTube Playlist ID"
        />
        <Button onClick={fetchYouTubePlaylist}>Fetch playlist</Button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display Playlist Items */}
      {playlistItems.length > 0 && (
        <div>
          <h2>Playlist Items:</h2>
          <ul>
            {playlistItems.map(item => (
              <li key={item.id}>{item.snippet.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Spotify Playlist Name Input (Visible After Fetching YouTube Playlist) */}
      {isSpotifyPlaylistPromptVisible && (
        <div className="mt-5 flex items-center gap-5">
          <Input
            type="text"
            value={spotifyPlaylistName}
            onChange={e => setSpotifyPlaylistName(e.target.value)}
            placeholder="Enter Spotify Playlist Name"
          />
          <Button onClick={createSpotifyPlaylist} className="ml-2">
            Create Spotify Playlist
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
