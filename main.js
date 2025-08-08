// main.js
import path from "path";
import { extractImages } from "./src/pdf/extractImages.js";
import { extractText } from "./src/pdf/extractText.js";
import { runOCR } from "./src/ocr/ocr.js";
import { createMatrix } from "./src/matrix/createMatrix.js";
import { detectProtected } from "./src/text/detectProtected.js";
import { groupSentences } from "./src/text/groupSentences.js";
import { translateSentences } from "./src/translate/translateSentences.js";
import { rebuildPDF } from "./src/pdf/rebuildPDF.js";

const INPUT_PDF = "./input/original.pdf";
const OUTPUT_PDF = "./output/translated.pdf";
const TEMP_IMG_DIR = "./temp/images";
const TARGET_LANG = "en"; // Idioma destino

async function main() {
    console.log("📄 Iniciando proceso de traducción de PDF...");

    // 1. Extraer imágenes
    console.log("🖼  Extrayendo imágenes...");
    await extractImages(INPUT_PDF, TEMP_IMG_DIR);

    // 2. Extraer texto
    console.log("🔍 Extrayendo texto...");
    const textData = await extractText(INPUT_PDF);

    // 3. OCR sobre imágenes
    console.log("🧠 Ejecutando OCR sobre imágenes...");
    const ocrData = await runOCR(TEMP_IMG_DIR);

    // 4. Crear matriz combinada
    console.log("🗂  Creando matriz de coordenadas...");
    const matrixData = createMatrix(textData, ocrData);

    // 5. Detectar palabras protegidas
    console.log("🔒 Detectando palabras que no se traducen...");
    const protectedData = detectProtected(matrixData);

    // 6. Agrupar en oraciones
    console.log("✏️ Agrupando palabras en oraciones...");
    const groupedData = groupSentences(protectedData);

    // 7. Traducir oraciones
    console.log(`🌐 Traduciendo al idioma: ${TARGET_LANG}...`);
    const translatedData = await translateSentences(groupedData, TARGET_LANG);

    // 8. Reconstruir PDF final
    console.log("📦 Reconstruyendo PDF traducido...");
    await rebuildPDF(INPUT_PDF, translatedData, OUTPUT_PDF);

    console.log(`✅ Proceso completado. PDF final en: ${OUTPUT_PDF}`);
}

// Ejecutar
main().catch(err => {
    console.error("❌ Error en el proceso:", err);
});
