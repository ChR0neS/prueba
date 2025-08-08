// src/extract/extractText.js
import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

/**
 * Extrae texto con coordenadas y estilos del PDF.
 * @param {string} pdfPath - Ruta del archivo PDF.
 * @returns {Promise<Array>} Lista de fragmentos con texto, posición y estilos.
 */
export async function extractText(pdfPath) {
    try {
        const absolutePath = path.resolve(pdfPath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`El archivo no existe: ${absolutePath}`);
        }

        // Cargar PDF
        const loadingTask = pdfjsLib.getDocument(absolutePath);
        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;

        let extractedData = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();

            textContent.items.forEach(item => {
                const transform = item.transform;
                const x = transform[4];
                const y = transform[5];
                const fontSize = Math.abs(transform[0]);

                extractedData.push({
                    texto: item.str.trim(),
                    pos: { x, y },
                    estilo: {
                        fontSize,
                        fontName: item.fontName || "Unknown"
                    },
                    pagina: pageNum
                });
            });
        }

        console.log(`✅ Extracción de texto completada: ${extractedData.length} elementos.`);
        return extractedData;

    } catch (error) {
        console.error("❌ Error al extraer texto:", error.message);
        throw error;
    }
}
