import { getGeminiClient, getModelName, isGeminiConfigured } from '../config/gemini.js';
import { formatDocumentForGemini } from './fileService.js';

/**
 * Clean and parse JSON response from Gemini
 */
const parseCleanJson = (rawText) => {
  let cleaned = (rawText || '').trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned.trim());
};

/**
 * Clean up text output to ensure no markdown hashes (#, ##, ###) appear,
 * transforming sections into clear, point-wise, arrow-ordered structures (➤ and ➔).
 */
export const formatCleanPoints = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    // Convert markdown headers (###, ##, #) into clean arrow points (➤ **Title**)
    .replace(/^#{1,6}\s*(.+)$/gm, (match, title) => {
      let cleanTitle = title.trim();
      if (cleanTitle.startsWith('**') && cleanTitle.endsWith('**')) {
        cleanTitle = cleanTitle.slice(2, -2).trim();
      }
      return `\n➤ **${cleanTitle}**\n`;
    })
    // Convert bullet points (- or *) to clean arrows (➔ )
    .replace(/^[\*\-]\s+/gm, '➔ ')
    // Normalize excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Ask a question about an uploaded document / image
 */
export const askQuestionAboutDocument = async ({ document, question, chatHistory = [] }) => {
  if (!isGeminiConfigured()) {
    return {
      answer: `➤ **🎓 StudyMate AI Tutor Note**\n\nNo Google Gemini API key was detected in \`backend/.env\`.\n\nTo enable live AI answers using **Gemini 2.5 Flash**:\n1. Get your free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).\n2. Open \`backend/.env\` and set \`GEMINI_API_KEY=your_key_here\`.\n3. Restart the backend server.\n\n➔ *StudyMate can analyze diagrams, answer complex questions, clarify formulas, and cite relevant sections from your PDFs and images!*`,
      suggestedQuestions: [
        'What are the core concepts covered in this document?',
        'Can you explain the main formulas or equations?',
        'Summarize the key takeaways for an upcoming exam.'
      ]
    };
  }

  const ai = getGeminiClient();
  const model = getModelName();
  const docPart = formatDocumentForGemini(document);

  const systemPrompt = `You are "StudyMate AI", an intelligent, encouraging, and academically rigorous study assistant and tutor for students.
Your task is to answer the student's question based on the provided document (PDF, diagram, handwritten note, or image).

CRITICAL FORMATTING GUIDELINES (User Experience Rules):
- NEVER use markdown hash symbols (#, ##, ###, ####) for headings or formatting.
- Present your answer point-wise, ordered, and clearly structured using arrows:
  • Main Topic / Section headers: Use '➤ **[Section Title]**'
  • Ordered steps or processes: Use '1. **[Step Name]** ➔ [Explanation]'
  • Bulleted key concepts / facts: Use '➔ **[Concept]**: [Details]'
  • Formulas / Equations: Format clearly on their own line: '➤ **Formula**: [equation] ➔ where [variable descriptions]'
  • Important takeaways / conclusions: Use '➔ **Key Point**: [Summary]'
- Explain clearly, step-by-step, using bold keywords for key terms.
- If the question cannot be answered from the document, politely state what is missing and offer related academic context.
- Keep the tone encouraging, patient, and educational.
- At the very end of your response, provide exactly 3 relevant follow-up questions formatted as:
SUGGESTED_QUESTIONS:
- [Question 1]
- [Question 2]
- [Question 3]`;

  let prompt = `${systemPrompt}\n\nStudent's Question: "${question}"`;

  // Append recent context if available
  if (chatHistory && chatHistory.length > 0) {
    const recentContext = chatHistory
      .slice(-4)
      .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n');
    prompt += `\n\nRecent Conversation Context:\n${recentContext}`;
  }

  const response = await ai.models.generateContent({
    model,
    contents: [docPart, prompt],
    config: {
      temperature: 0.7,
      topP: 0.95
    }
  });

  const textResponse = response.text || '';

  // Extract suggested follow-up questions if present
  let answer = textResponse;
  let suggestedQuestions = [
    'Can you give a real-world example of this?',
    'What are common exam mistakes related to this?',
    'Summarize this into 3 high-yield bullet points.'
  ];

  if (textResponse.includes('SUGGESTED_QUESTIONS:')) {
    const parts = textResponse.split('SUGGESTED_QUESTIONS:');
    answer = parts[0].trim();
    const suggestionsRaw = parts[1].trim();
    const extracted = suggestionsRaw
      .split('\n')
      .map((line) => line.replace(/^[-*•\d.]\s*/, '').trim())
      .filter((line) => line.length > 5);

    if (extracted.length > 0) {
      suggestedQuestions = extracted.slice(0, 3);
    }
  }

  // Ensure output is free of hash headers and formatted cleanly with arrows
  const cleanAnswer = formatCleanPoints(answer);

  return {
    answer: cleanAnswer,
    suggestedQuestions
  };
};

/**
 * Summarize an uploaded document
 */
export const summarizeDocument = async ({ document, style = 'detailed', focusTopic = '' }) => {
  if (!isGeminiConfigured()) {
    return {
      summary: `➤ **Document Summary (Demo Preview)**\n\n*Note: Configure \`GEMINI_API_KEY\` in \`backend/.env\` to enable live summaries.*\n\n➤ **Key Document Info**\n➔ **Filename:** ${document.filename}\n➔ **Format:** ${document.mimetype}\n➔ **Length:** ~${document.pageCount || 1} page(s)\n\n➤ **What Gemini Flash Generates**\n1. **Executive Overview** ➔ 2-3 sentence high-level summary.\n2. **Core Principles & Theorems** ➔ Key definitions, laws, and formulas.\n3. **Structured Breakdown** ➔ Step-by-step breakdown using arrows.\n4. **Exam Cram Points** ➔ Common pitfalls and essential definitions.`,
      keyTakeaways: [
        'Set your Gemini API key in backend/.env',
        'Upload any lecture slides, textbook PDF, or handwritten notes',
        'Select summary styles: Quick TL;DR, Detailed Notes, or Exam Cheat Sheet'
      ]
    };
  }

  const ai = getGeminiClient();
  const model = getModelName();
  const docPart = formatDocumentForGemini(document);

  const styleInstructions = {
    quick: 'Create a rapid, point-wise executive summary using arrows (➔) and bold keywords highlighting the absolute essentials.',
    detailed: 'Create a comprehensive study guide broken down into numbered points (1., 2., 3.) and arrow bullets (➔), with definitions, formulas, and real-world analogies.',
    bullet_points: 'Create an organized breakdown using arrow points (➔) for key facts, core definitions, and high-yield exam takeaways.',
    cheat_sheet: 'Create an ultra-concise Exam Revision Cheat Sheet using arrow formulas (➤ Formula ➔ Variables), definitions, and test-day cram points.'
  };

  const instruction = styleInstructions[style] || styleInstructions.detailed;
  const topicFilter = focusTopic ? `Special Focus: Prioritize information related to "${focusTopic}".` : '';

  const prompt = `You are an expert academic tutor. Summarize the provided document for a student preparing for exams.
${instruction}
${topicFilter}

CRITICAL FORMATTING GUIDELINES:
- NEVER use markdown hash symbols (#, ##, ###, ####) anywhere in the response.
- Format all sections point-wise and ordered using arrows:
  • Section headers: Use '➤ **[Section Title]**'
  • Numbered key points: Use '1. **[Key Point]** ➔ [Explanation]'
  • Bullet points: Use '➔ **[Concept]**: [Details]'
  • Formulas: Use '➤ **Formula**: [equation] ➔ where [variable descriptions]'
- At the very end, include a section '➤ **🎯 Key Takeaways**' with 4-6 concise high-yield bullet points using '➔ '.`;

  const response = await ai.models.generateContent({
    model,
    contents: [docPart, prompt],
    config: {
      temperature: 0.7,
      topP: 0.95
    }
  });

  const textResponse = response.text || '';

  // Extract key takeaways if available
  let keyTakeaways = [];
  if (textResponse.includes('Key Takeaways')) {
    const takeawaysSection = textResponse.split(/Key Takeaways/i)[1];
    if (takeawaysSection) {
      keyTakeaways = takeawaysSection
        .split('\n')
        .map((line) => line.replace(/^[-*•➔➤\d.]\s*/, '').replace(/^[#]+\s*/, '').trim())
        .filter((line) => line.length > 5 && !line.startsWith('#') && !line.startsWith('➤'))
        .slice(0, 5);
    }
  }

  // Clean formatting to ensure zero hash headers
  const cleanSummary = formatCleanPoints(textResponse);

  return {
    summary: cleanSummary,
    keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [
      'Master the foundational concepts and definitions',
      'Review formulas and application examples',
      'Test your knowledge with practice questions'
    ]
  };
};

/**
 * Generate interactive Multiple-Choice Quiz from document
 */
export const generateQuizFromDocument = async ({ document, count = 5, difficulty = 'medium', focusTopic = '' }) => {
  if (!isGeminiConfigured()) {
    return [
      {
        id: 1,
        question: 'What is the primary role of an activation function in an Artificial Neural Network?',
        options: [
          'To initialize weights randomly',
          'To introduce non-linearity into the network',
          'To calculate the learning rate',
          'To prevent the dataset from shuffling'
        ],
        correctIndex: 1,
        explanation: 'Activation functions introduce non-linear properties to neural networks, enabling them to learn complex patterns and decision boundaries that linear functions cannot represent.',
        concept: 'Activation Functions'
      },
      {
        id: 2,
        question: 'Which problem does the Rectified Linear Unit (ReLU) mitigate compared to the Sigmoid function?',
        options: [
          'Overfitting on small datasets',
          'Vanishing gradient problem for positive values',
          'High memory consumption in GPU cache',
          'Data imbalance in multi-class targets'
        ],
        correctIndex: 1,
        explanation: 'For positive values, ReLU has a constant derivative of 1, effectively mitigating the vanishing gradient problem encountered in saturated regions of Sigmoid.',
        concept: 'ReLU vs Sigmoid'
      },
      {
        id: 3,
        question: 'What does Backpropagation compute in neural network training?',
        options: [
          'The accuracy score on test validation data',
          'The gradient of the loss function with respect to weights using the chain rule',
          'The random seed for weight initialization',
          'The learning rate schedule for optimizer decays'
        ],
        correctIndex: 1,
        explanation: 'Backpropagation applies the calculus chain rule backwards from output to input layers to compute partial derivatives (gradients) of the loss function with respect to every weight.',
        concept: 'Backpropagation'
      }
    ];
  }

  const ai = getGeminiClient();
  const model = getModelName();
  const docPart = formatDocumentForGemini(document);

  const num = Math.min(Math.max(parseInt(count, 10) || 5, 1), 15);
  const topicFilter = focusTopic ? `Focus specifically on: "${focusTopic}".` : '';

  const prompt = `You are an expert exam question creator. Generate a high-quality ${num}-question multiple-choice quiz based on the provided document.
Difficulty Level: ${difficulty.toUpperCase()} (Ensure the questions test conceptual understanding and application, not just rote memorization).
${topicFilter}

You MUST return ONLY a valid JSON array matching this exact schema:
[
  {
    "id": 1,
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this option is correct and why other options are incorrect.",
    "concept": "Specific concept or topic tested"
  }
]
Important:
- Provide exactly 4 options per question.
- "correctIndex" must be an integer from 0 to 3 corresponding to the correct option.
- Ensure the question is directly answerable from the document material.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [docPart, prompt],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const parsed = parseCleanJson(response.text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q, idx) => ({
        ...q,
        id: q.id || idx + 1,
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
      }));
    }
  } catch (err) {
    console.warn('JSON quiz generation retry or fallback:', err.message);
  }

  // Fallback if parsing failed
  return [
    {
      id: 1,
      question: `What is the central concept discussed in "${document.filename}"?`,
      options: [
        'Core theoretical foundation and definitions',
        'Secondary historical anecdotes',
        'Hardware configuration guidelines',
        'Unrelated external literature'
      ],
      correctIndex: 0,
      explanation: 'The provided document focuses on core theoretical foundations and key applications.',
      concept: 'General Overview'
    }
  ];
};

/**
 * Generate interactive Flashcards from document
 */
export const generateFlashcardsFromDocument = async ({ document, count = 6, focusTopic = '' }) => {
  if (!isGeminiConfigured()) {
    return [
      {
        id: 1,
        front: 'What is an Artificial Neuron (Perceptron)?',
        back: 'The basic computational unit of an ANN that computes a weighted sum of inputs plus bias and applies an activation function: y = f(∑(w_i * x_i) + b).',
        tag: 'Foundations'
      },
      {
        id: 2,
        front: 'What is the Vanishing Gradient Problem?',
        back: 'A problem during backpropagation when gradients become exponentially small as they propagate back through layers, preventing early layers from updating their weights effectively.',
        tag: 'Training Issues'
      },
      {
        id: 3,
        front: 'How does Dropout mitigate overfitting?',
        back: 'Dropout randomly deactivates a fraction of neurons during each training step, preventing neurons from co-adapting and forcing the network to learn redundant, robust features.',
        tag: 'Regularization'
      },
      {
        id: 4,
        front: 'What is the role of the Softmax function?',
        back: 'Converts raw unnormalized logit scores from the output layer into a normalized probability distribution where all values sum to 1.',
        tag: 'Classification'
      }
    ];
  }

  const ai = getGeminiClient();
  const model = getModelName();
  const docPart = formatDocumentForGemini(document);
  const num = Math.min(Math.max(parseInt(count, 10) || 6, 2), 20);

  const prompt = `You are a spaced-repetition flashcard creator. Generate ${num} high-yield study flashcards based on the provided document.
${focusTopic ? `Focus on: "${focusTopic}".` : ''}

You MUST return ONLY a valid JSON array in this schema:
[
  {
    "id": 1,
    "front": "Term, core concept, or high-yield prompt",
    "back": "Concise, memorable definition, formula, or key takeaway",
    "tag": "Subject/Category tag"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [docPart, prompt],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

    const parsed = parseCleanJson(response.text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((card, idx) => ({
        ...card,
        id: card.id || idx + 1
      }));
    }
  } catch (err) {
    console.warn('Flashcard generation fallback:', err.message);
  }

  return [
    {
      id: 1,
      front: 'Key Concept',
      back: `Review the foundational definitions in ${document.filename}`,
      tag: 'Overview'
    }
  ];
};

export default {
  askQuestionAboutDocument,
  summarizeDocument,
  generateQuizFromDocument,
  generateFlashcardsFromDocument,
  formatCleanPoints
};
