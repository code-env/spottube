export const createSpotifyPlaylist = async (
  playlistName: string,
  trackUris: string[]
) => {
  const response = await fetch('/api/spotify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlistName, trackUris }),
  });

  const data = await response.json();
  return data; // Contains the response from Spotify
};
