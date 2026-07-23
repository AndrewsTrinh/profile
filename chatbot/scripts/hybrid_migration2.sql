ALTER TABLE corpus_chunks DROP COLUMN embedding;
ALTER TABLE corpus_chunks ADD COLUMN embedding vector(3072);
