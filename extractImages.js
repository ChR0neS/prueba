// src/extract/extractImages.js
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

/**
 * Extrae imágenes del PDF y las guarda en la carpeta indicada.
 * @param {string} pdfPath - Ruta del PDF de origen.
 * @param {string} outputDir - Carpeta donde guardar las imágenes.
 * @returns {Promise<Array>} Lista de imágenes extraídas con metadatos.
 */
export async function extractImages(pdfPath, outputDir = "./output/images") {
    try {
        const absolutePDF = path.resolve(pdfPath);
        if (!fs.existsSync(absolutePDF)) {
            throw new Error(`El archivo no existe: ${absolutePDF}`);
        }

        // Crear carpeta de salida si no existe
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Cargar PDF
        const pdfBytes = fs.readFileSync(absolutePDF);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        let imagesData = [];

        // Recorrer páginas
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPage(i);
            const { xobjects } = page.node.Resources() || {};

            if (xobjects) {
                for (const key in xobjects) {
                    const img = xobjects[key];
                    const subtype = img.dict.get("Subtype").name;

                    if (subtype === "Image") {
                        const imgBytes = img.getContent();
                        const imgFormat = img.dict.get("Filter")?.name || "Unknown";

                        // Guardar imagen en archivo
                        const imgName = `page-${i + 1}-${key}.${imgFormat === "DCTDecode" ? "jpg" : "png"}`;
                        const imgPath = path.join(outputDir, imgName);
                        fs.writeFileSync(imgPath, imgBytes);

                        imagesData.push({
                            page: i + 1,
                            name: imgName,
                            path: imgPath,
                            format: imgFormat
                        });
                    }
                }
            }
        }

        console.log(`✅ ${imagesData.length} imágenes extraídas.`);
        return imagesData;

    } catch (error) {
        console.error("❌ Error extrayendo imágenes:", error.message);
        throw error;
    }
}
