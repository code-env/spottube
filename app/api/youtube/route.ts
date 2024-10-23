import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { headers } from 'next/headers';
import { env } from '@/env';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get('playlistId'); // Get playlistId from query params

  console.log('Playlist ID:', playlistId); // Log the playlistId for demonstration

  if (!playlistId) {
    return NextResponse.json(
      { error: 'Playlist ID is required' },
      { status: 400 }
    );
  }

  try {
    // Await headers, as recommended
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get('user-agent') || 'Unknown user-agent';
    console.log('User-Agent:', userAgent); // Log the user-agent for demonstration

    // Set up YouTube API client with your API key
    const youtube = google.youtube({
      version: 'v3',
      auth: env.YOUTUBE_API_KEY,
    });

    // Fetch playlist items
    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults: 50,
    });

    return NextResponse.json(response.data.items);
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist items' },
      { status: 500 }
    );
  }
}
