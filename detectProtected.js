// src/text/detectProtected.js
import nlp from "compromise"; // Librería de NLP rápida para Node

/**
 * Detecta palabras que no deben traducirse en la matriz.
 * @param {Array} matrix - Matriz de páginas desde createMatrix.js
 * @param {Array} customList - Lista opcional de términos a proteger
 * @returns {Array} Matriz con campo extra `protected: true/false`
 */
export function detectProtected(matrix, customList = []) {
    const protectedWords = customList.map(w => w.toLowerCase());

    return matrix.map(page => {
        const newContent = page.contenido.map(wordObj => {
            const textLower = wordObj.texto.toLowerCase();
            let isProtected = false;

            // 1. Revisar lista personalizada
            if (protectedWords.includes(textLower)) {
                isProtected = true;
            }

            // 2. Detectar nombres propios usando NLP
            const doc = nlp(wordObj.texto);
            if (doc.has("#ProperNoun")) {
                isProtected = true;
            }

            // 3. Detectar abreviaturas, números, símbolos
            if (/^[A-Z]{2,}$/.test(wordObj.texto)) {
                isProtected = true; // Siglas como "NASA"
            }
            if (/^\d+$/.test(wordObj.texto)) {
                isProtected = true; // Números
            }
            if (/[^a-zA-ZÀ-ÿ0-9]/.test(wordObj.texto) && wordObj.texto.length <= 3) {
                isProtected = true; // Símbolos o unidades como "%"
            }

            return {
                ...wordObj,
                protected: isProtected
            };
        });

        return {
            ...page,
            contenido: newContent
        };
    });
}
