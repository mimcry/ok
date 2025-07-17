
export async function translateText(text: string, targetLang: string): Promise<string | null> {
  try {
    const response = await fetch('http://<your-ip>:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });

    const data = await response.json();
    return data.translatedText || null;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}
