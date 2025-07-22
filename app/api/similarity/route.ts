import { NextRequest, NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers to allow downloading models
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.cacheDir = './.cache/transformers'; // Specify cache directory

// Cache the pipeline to avoid reloading the model on each request
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    try {
      embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { 
          quantized: true,
          revision: 'main'
        }
      );
    } catch (error) {
      console.error('Error loading embedding model:', error);
      throw new Error('Failed to load embedding model');
    }
  }
  return embedder;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Get the embedder
    const embedder = await getEmbedder();

    // Generate embedding
    const output = await embedder(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding array
    const embedding = Array.from(output.data);

    return NextResponse.json({
      embedding,
      text: text.slice(0, 100) + (text.length > 100 ? '...' : ''), // Return truncated text for verification
      model: 'all-MiniLM-L6-v2',
      dimensions: embedding.length
    });

  } catch (error) {
    console.error('Error in similarity API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate embedding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Similarity API is running',
    model: 'all-MiniLM-L6-v2',
    methods: ['POST'],
    usage: {
      endpoint: '/api/similarity',
      method: 'POST',
      body: { text: 'Your text to embed' },
      response: { embedding: 'number[]', dimensions: 'number' }
    }
  });
}

// Health check for the embedding model
export async function HEAD() {
  try {
    await getEmbedder();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}