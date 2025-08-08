// src/text/groupSentences.js

/**
 * Agrupa palabras en oraciones completas con base en puntuación y saltos de línea.
 * @param {Array} matrix - Matriz de páginas desde detectProtected.js
 * @returns {Array} Estructura por página con oraciones
 */
export function groupSentences(matrix) {
    return matrix.map(page => {
        const sentences = [];
        let currentSentence = {
            texto: "",
            palabras: []
        };

        page.contenido.forEach((wordObj, idx) => {
            const word = wordObj.texto;
            currentSentence.texto += (currentSentence.texto ? " " : "") + word;
            currentSentence.palabras.push(wordObj);

            // Si encontramos fin de oración o última palabra
            if (/[.!?]$/.test(word) || idx === page.contenido.length - 1) {
                sentences.push(currentSentence);
                currentSentence = { texto: "", palabras: [] };
            }
        });

        return {
            pagina: page.pagina,
            oraciones: sentences
        };
    });
}
