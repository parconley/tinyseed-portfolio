/**
 * Calculates the cosine similarity between two vectors
 * @param vecA First vector
 * @param vecB Second vector
 * @returns Cosine similarity score between 0 and 1
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  if (vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Normalizes a vector to unit length
 * @param vector Input vector
 * @returns Normalized vector
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude === 0) {
    return vector;
  }
  
  return vector.map(val => val / magnitude);
}

/**
 * Calculates similarities between a query vector and an array of document vectors
 * @param queryEmbedding Query vector
 * @param documentEmbeddings Array of document vectors
 * @returns Array of similarity scores
 */
export function calculateSimilarities(
  queryEmbedding: number[], 
  documentEmbeddings: number[][]
): number[] {
  return documentEmbeddings.map(docEmbedding => 
    cosineSimilarity(queryEmbedding, docEmbedding)
  );
}