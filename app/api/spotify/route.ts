import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import axios from 'axios';
import type { OAuthStrategy } from '@clerk/types';

interface YouTubeTrack {
  title: string;
  artist: string;
}

export async function POST(req: Request) {
  try {
    const requestHeaders = await headers();

    const { userId } = auth();

    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ message: 'User not found' });
    }

    const externalUserId = user.externalAccounts[0].externalId;

    // Get the OAuth access token for the user
    const provider: OAuthStrategy = 'oauth_spotify';
    const clerkResponse = await clerkClient().users.getUserOauthAccessToken(
      userId,
      provider
    );

    const accessToken = clerkResponse.data[0]?.token || '';

    // console.log(accessToken);

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Access token not found' },
        { status: 401 }
      );
    }

    // Extract playlistName and tracks (title, artist) from the frontend request
    const { playlistName, tracks } = await req.json();

    if (!playlistName || !tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: 'Playlist name and track details are required' },
        { status: 400 }
      );
    }

    // Step 1: Create a Spotify playlist
    const createPlaylistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${externalUserId}/playlists`, // Ensure externalUserId is correct
      {
        name: playlistName, // Playlist name from frontend
        public: false, // Playlist visibility
        description: 'A custom playlist created via API', // Optional description
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // OAuth token for Spotify API
          'Content-Type': 'application/json', // JSON content type
        },
      }
    );

    const playlistId = createPlaylistResponse.data.id;

    const otherTracks = [
      { title: 'Fleurs', artist: 'Gazo' },
      { title: 'Real Life', artist: 'AJ BAHBOY' },
      { title: 'CARTIER', artist: 'Gazo' },
      { title: 'Holy Father', artist: 'Mayorkun' },
      { title: 'Ngozi', artist: 'Crayon' },
      { title: 'Soza', artist: 'Tiakola' },
      { title: 'MAMI WATA', artist: 'Gazo' },
      { title: 'Blue story', artist: 'Ninho' },
      { title: 'Bad', artist: 'Ninho' },
      { title: 'No love', artist: 'Ninho' },
      { title: 'Cash App', artist: 'Bella Shmurda' },
      { title: 'Jongleur', artist: 'Cleo Grae' },
      { title: 'City of Gods', artist: 'Fivio Foreign' },
      { title: 'Red Bull Symphonic', artist: 'Metro Boomin' },
      { title: 'Hobbies to Learn in 2024', artist: 'Collin The Chad' },
    ];

    const otherTracksFormatted = convertYouTubeTracks(tracks);

    console.log(otherTracksFormatted);

    // Step 2: Search Spotify for each song based on title and artist, and get track URIs
    const trackUris: string[] = [];
    for (const track of otherTracks) {
      const trackUri = await searchSpotifyForTrack(
        track.title,
        track.artist,
        accessToken
      );
      if (trackUri) {
        console.log(
          `Found track "${track.title}" by "${track.artist}":`,
          trackUri
        );
        trackUris.push(trackUri);
      }
    }

    if (trackUris.length === 0) {
      return NextResponse.json(
        { error: 'No matching songs found on Spotify.' },
        { status: 404 }
      );
    }

    // Step 3: Add tracks to the Spotify playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: trackUris },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return NextResponse.json({
      message: 'Playlist created successfully!',
      playlistId,
    });
  } catch (error: any) {
    console.error(
      'Error creating Spotify playlist or adding tracks:',
      error.message
    );
    return NextResponse.json(
      { error: 'Failed to create Spotify playlist or add tracks' },
      { status: 500 }
    );
  }
}

function convertYouTubeTracks(youTubeTracks: YouTubeTrack[]): YouTubeTrack[] {
  return youTubeTracks.map(track => {
    // Extract the title and artist, removing extra text
    const formattedTitle = track.title.split('-')[0].trim(); // Get title before the hyphen
    const formattedArtist = track.artist.split('(')[0].trim(); // Get artist before any parenthesis

    return {
      title: formattedTitle,
      artist: formattedArtist,
    };
  });
}
// Helper function to search for a song on Spotify by title and artist
async function searchSpotifyForTrack(
  trackTitle: string,
  artist: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Modify the search query to include both track title and artist
    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search`,
      {
        params: {
          q: `track:${trackTitle} artist:${artist}`,
          type: 'track',
          limit: 1, // Limit to one result for simplicity
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const tracks = searchResponse.data.tracks.items;
    if (tracks.length > 0) {
      return tracks[0].uri; // Return the URI of the first matching track
    }

    return null; // Return null if no track found
  } catch (error: any) {
    console.error(
      `Error searching for track "${trackTitle}" by artist "${artist}" on Spotify:`,
      error.message
    );
    return null;
  }
}
