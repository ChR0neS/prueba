// src/pdf/rebuildPDF.js
import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Reconstruye un PDF usando las traducciones y posiciones originales.
 * @param {string} inputPdfPath - Ruta del PDF original
 * @param {Array} translatedData - Resultado de translateSentences.js
 * @param {string} outputPdfPath - Ruta para guardar el PDF final
 */
export async function rebuildPDF(inputPdfPath, translatedData, outputPdfPath) {
    // 1. Cargar PDF original
    const existingPdfBytes = fs.readFileSync(inputPdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Elegir fuente estándar (puedes cambiar por la detectada en OCR)
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. Procesar cada página
    for (const pageData of translatedData) {
        const page = pdfDoc.getPage(pageData.pagina - 1);

        for (const sentence of pageData.oraciones) {
            for (const wordObj of sentence.palabras) {
                // Encontrar el texto traducido correspondiente a esta palabra
                const translatedWord = findTranslatedWord(sentence, wordObj.texto);

                // Dibujar palabra en coordenadas originales
                page.drawText(translatedWord, {
                    x: wordObj.pos.x,
                    y: wordObj.pos.y,
                    size: wordObj.estilo.fontSize || 12,
                    font: font,
                    color: rgb(0, 0, 0) // negro, puedes detectar color original
                });
            }
        }
    }

    // 4. Guardar PDF final
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPdfPath, pdfBytes);
    console.log(`✅ PDF generado en: ${outputPdfPath}`);
}

/**
 * Función auxiliar para obtener la palabra traducida que corresponde a la original.
 * (Por simplicidad, aquí se devuelve la palabra tal cual. Puedes mejorar con un mapeo real.)
 */
function findTranslatedWord(sentence, originalWord) {
    // Buscar en la traducción una palabra que coincida por posición
    const translatedSplit = sentence.traducido.split(" ");
    const originalSplit = sentence.original.split(" ");
    const index = originalSplit.findIndex(w => w === originalWord);
    return translatedSplit[index] || originalWord;
}
