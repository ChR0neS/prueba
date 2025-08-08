// src/translate/translateSentences.js
import OpenAI from "openai"; // Ejemplo usando OpenAI GPT para traducción
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Traduce las oraciones respetando palabras protegidas.
 * @param {Array} groupedData - Resultado de groupSentences.js
 * @param {string} targetLang - Idioma destino, ej: "en", "fr", "es"
 * @returns {Array} Estructura con traducciones
 */
export async function translateSentences(groupedData, targetLang = "en") {
    const translatedPages = [];

    for (const page of groupedData) {
        const translatedSentences = [];

        for (const sentence of page.oraciones) {
            // 1. Sustituir palabras protegidas por marcadores únicos
            let tempText = sentence.texto;
            const markers = [];

            sentence.palabras.forEach((wordObj, idx) => {
                if (wordObj.protected) {
                    const marker = `[[PROT_${idx}]]`;
                    tempText = tempText.replace(wordObj.texto, marker);
                    markers.push({ marker, original: wordObj.texto });
                }
            });

            // 2. Llamada a la API de traducción
            const translatedText = await callTranslationAPI(tempText, targetLang);

            // 3. Reemplazar marcadores por palabras originales protegidas
            let finalText = translatedText;
            markers.forEach(({ marker, original }) => {
                finalText = finalText.replace(marker, original);
            });

            translatedSentences.push({
                original: sentence.texto,
                traducido: finalText,
                palabras: sentence.palabras
            });
        }

        translatedPages.push({
            pagina: page.pagina,
            oraciones: translatedSentences
        });
    }

    return translatedPages;
}

/**
 * Función auxiliar para traducir usando OpenAI
 */
async function callTranslationAPI(text, targetLang) {
    const prompt = `Traduce el siguiente texto al ${targetLang}, manteniendo los marcadores intactos: ${text}`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content.trim();
}
