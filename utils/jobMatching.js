const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

/**
 * Computes similarity between resume text and job descriptions using TF-IDF.
 */

const computeSimilarity = (resumeText, jobList) => {
  if (!resumeText || jobList.length === 0) return [];

  const tfidf = new natural.TfIdf();

  // Tokenize & Add job descriptions
  jobList.forEach((job) => tfidf.addDocument(tokenizer.tokenize(job.description)));

  // Tokenize & Transform resume text
  const resumeTokens = tokenizer.tokenize(resumeText);
  const scores = [];

  jobList.forEach((job, index) => {
    let score = tfidf.tfidf(resumeTokens.join(" "), index);
    scores.push({ job, score });
  });

  // Sort by highest relevance
  scores.sort((a, b) => b.score - a.score);

  return scores.map((s) => s.job).slice(0, 5); // Return top 5 matches
};

module.exports = { computeSimilarity };
