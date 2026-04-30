/**
 * Shortens a URL using the TinyURL API.
 * @param url The URL to shorten.
 * @returns The shortened URL or the original URL if shortening fails.
 */
export async function shortenUrl(url: string): Promise<string> {
  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
    );
    if (!response.ok) {
      throw new Error("Failed to shorten URL");
    }
    const shortUrl = await response.text();
    return shortUrl;
  } catch (error) {
    console.error("Error shortening URL:", error);
    return url; // Fallback to original URL
  }
}
