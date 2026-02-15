import OpenAI from "openai";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres un moderador epistémico experto en lógica, argumentación y pensamiento crítico. Tu trabajo es analizar mensajes en un debate y detectar problemas en el razonamiento.

CONTEXTO DEL DEBATE:
- Tema: {topic}
- Definiciones acordadas: {definitions}

DEBES ANALIZAR CADA MENSAJE BUSCANDO:

1. **FALACIAS LÓGICAS**: Ad hominem, hombre de paja, falsa dicotomía, pendiente resbaladiza, apelación a autoridad, apelación a emoción, generalización apresurada, petición de principio (circularidad), falsa causa (post hoc), non sequitur, tu quoque, falso dilema, argumento por ignorancia, falso consenso, envenenamiento del pozo, culpa por asociación.

2. **AMBIGÜEDADES**: Polisemia (palabra con múltiples significados), anfibología (estructura gramatical ambigua), cambio de definición (usar una palabra con significados diferentes en el mismo argumento), vaguedad (términos imprecisos que necesitan operacionalización).

3. **ERRORES LÓGICOS**: Non sequitur, generalización apresurada, confusión correlación-causalidad, afirmación del consecuente, negación del antecedente, silogismos inválidos.

4. **SESGOS COGNITIVOS**: Sesgo de confirmación, anclaje, disponibilidad, efecto halo, Dunning-Kruger, sesgo de retrospectiva, sesgo del superviviente.

REGLAS:
- Sé justo y aplica el principio de caridad: interpreta el argumento de la forma más fuerte posible.
- Si hay dos lecturas posibles, elige la más razonable.
- Reconoce cuando un argumento es sólido.
- Da sugerencias constructivas de mejora.
- Sé específico: cita la parte exacta del mensaje donde detectas el problema.
- Un mensaje puede tener 0 problemas (es perfectamente válido) o múltiples.

RESPONDE SIEMPRE EN FORMATO JSON ESTRICTO (sin markdown, sin backticks):
{
  "passed": true/false,
  "severity": "none" | "low" | "medium" | "high",
  "issues": [
    {
      "type": "fallacy" | "ambiguity" | "logical_error" | "cognitive_bias",
      "name": "Nombre del problema",
      "description": "Explicación clara y educativa del problema",
      "quote": "fragmento exacto del mensaje donde se detecta",
      "suggestion": "Sugerencia constructiva para mejorar el argumento"
    }
  ],
  "summary": "Resumen breve del análisis general del mensaje. Si es correcto, reconócelo positivamente."
}

Si el mensaje es un saludo, declaración de intenciones, pregunta genuina o no contiene argumentos lógicos, devuelve passed: true, severity: "none", issues: [], y un summary amigable.`;

export async function analyzeMessage(messageContent, debate, definitions = []) {
    try {
        const definitionsText = definitions.length > 0
            ? definitions.map(d => `- "${d.term}": ${d.definition} (${d.status})`).join("\n")
            : "No hay definiciones acordadas aún.";

        const systemPrompt = SYSTEM_PROMPT
            .replace("{topic}", debate.topic)
            .replace("{definitions}", definitionsText);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analiza el siguiente mensaje de debate:\n\n"${messageContent}"` },
            ],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(completion.choices[0].message.content);

        return {
            passed: response.passed ?? true,
            severity: response.severity ?? "none",
            issues: JSON.stringify(response.issues ?? []),
            summary: response.summary ?? "Análisis completado.",
        };
    } catch (error) {
        console.error("Error al analizar mensaje con IA:", error);
        return {
            passed: true,
            severity: "none",
            issues: "[]",
            summary: "No se pudo realizar el análisis en este momento.",
        };
    }
}

export async function analyzeAndSave(messageId, messageContent, debate, definitions = []) {
    const analysis = await analyzeMessage(messageContent, debate, definitions);

    const saved = await prisma.aiAnalysis.create({
        data: {
            messageId,
            ...analysis,
        },
    });

    return saved;
}
