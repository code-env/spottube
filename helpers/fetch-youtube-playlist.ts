export const fetchYouTubePlaylistFn = async (playlistId: string) => {
  const response = await fetch(`/api/youtube?playlistId=${playlistId}`);
  const data = await response.json();
  return data; // Contains the playlist items
};
