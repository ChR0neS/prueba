// src/matrix/createMatrix.js

/**
 * Combina datos de texto nativo y OCR en una sola matriz ordenada.
 * @param {Array} textData - Resultado de extractText.js
 * @param {Array} ocrData - Resultado de ocr.js
 * @returns {Array} Matriz de páginas, cada una con lista de palabras ordenadas por coordenadas.
 */
export function createMatrix(textData, ocrData) {
    // Unir ambos resultados
    const combined = [...textData, ...ocrData];

    // Agrupar por página
    const pagesMap = {};
    combined.forEach(item => {
        if (!pagesMap[item.pagina]) {
            pagesMap[item.pagina] = [];
        }
        pagesMap[item.pagina].push(item);
    });

    // Ordenar palabras por Y descendente, luego X ascendente
    const sortedPages = Object.keys(pagesMap).map(pageNum => {
        const sortedWords = pagesMap[pageNum].sort((a, b) => {
            // Primero por coordenada Y (de arriba hacia abajo)
            if (Math.abs(b.pos.y - a.pos.y) > 2) {
                return b.pos.y - a.pos.y;
            }
            // Luego por coordenada X (de izquierda a derecha)
            return a.pos.x - b.pos.x;
        });
        return {
            pagina: parseInt(pageNum),
            contenido: sortedWords
        };
    });

    console.log(`✅ Matriz creada con ${sortedPages.length} páginas.`);
    return sortedPages;
}
