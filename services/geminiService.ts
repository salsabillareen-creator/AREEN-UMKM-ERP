
// services/geminiService.ts

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ChartData, CashFlowEntry, CashFlowForecast, ProactiveInsight } from '../types';

// Per guidelines, initialize with API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

// --- Deliverable 1: Document Ingestion Schema Implementation ---
const parseInvoiceImage = async (base64Image: string): Promise<any> => {
    const prompt = `
        Analyze this invoice image and extract the following information into a strict JSON format.
        Identify the vendor, date, total amount, and line items.
        Crucially, recommend a GL Account for each line item (e.g., '5100-Office Supplies', '5200-Cost of Goods Sold', '5300-Utilities').
        If the currency is not explicit, infer it from context (default to IDR).
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    document_type: { type: Type.STRING, enum: ['INVOICE'] },
                    vendor_name: { type: Type.STRING },
                    invoice_id: { type: Type.STRING },
                    invoice_date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
                    currency: { type: Type.STRING, enum: ['IDR', 'USD'] },
                    total_amount: { type: Type.NUMBER },
                    due_date: { type: Type.STRING, description: "Format YYYY-MM-DD" },
                    line_items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                amount: { type: Type.NUMBER },
                                recommended_gl_account: { type: Type.STRING }
                            },
                            required: ['description', 'amount', 'recommended_gl_account']
                        }
                    }
                },
                required: ['document_type', 'vendor_name', 'invoice_id', 'invoice_date', 'total_amount', 'line_items']
            }
        }
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('`')) {
        jsonStr = jsonStr.substring(1, jsonStr.length - 1).trim();
    }
    return JSON.parse(jsonStr);
};

// --- Deliverable 2: Critical ERP Function Declaration ---
const postValidatedJournalEntryTool: FunctionDeclaration = {
    name: "post_validated_journal_entry",
    description: "Posts a validated journal entry to the ERP backend. Use this when transaction data is verified and ready for the General Ledger.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            gl_entries: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        account_id: { type: Type.STRING, description: "Unique GL Account ID (e.g., 1100-Kas)" },
                        debit_amount: { type: Type.NUMBER, description: "Amount to Debit. 0 if Credit." },
                        credit_amount: { type: Type.NUMBER, description: "Amount to Credit. 0 if Debit." }
                    },
                    required: ["account_id", "debit_amount", "credit_amount"]
                }
            },
            transaction_source_id: { type: Type.STRING, description: "Source Document ID (e.g., INV-2025001)" },
            ai_rationale: { type: Type.STRING, description: "AI explanation for the account classification for audit trail." }
        },
        required: ["gl_entries", "transaction_source_id", "ai_rationale"]
    }
};

const createJournalEntryFromInvoice = async (invoiceData: any): Promise<any> => {
     const prompt = `
        Based on this invoice data, generate a balanced journal entry structure.
        Invoice: ${JSON.stringify(invoiceData)}
        
        Rules:
        1. Debit the appropriate Expense or Asset accounts based on line items.
        2. Credit '2000-Accounts Payable' for the total amount.
        3. Ensure Total Debit equals Total Credit.
        4. Provide a clear rationale.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            tools: [{ functionDeclarations: [postValidatedJournalEntryTool] }],
            toolConfig: { functionCallingConfig: { mode: "ANY" } } 
        }
    });
    
    // Extract arguments from the function call
    return response.functionCalls?.[0]?.args;
};

const generateFinancialSummary = async (data: ChartData[]): Promise<string> => {
  const prompt = `
    Analyze the following financial data which represents monthly income and expense in IDR.
    Provide a concise summary of the financial performance.
    Highlight key trends, highest/lowest points, and potential areas for concern or opportunity.
    The output should be in simple markdown format. Use ** for headings and * for list items.

    Data:
    ${JSON.stringify(data)}
    `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });

  return response.text;
};

const getChatbotResponse = async (userInput: string): Promise<string> => {
  // This is a simplified chatbot. For a real app, we'd use ai.chats.create for conversation history.
  // Given the current implementation in Chatbot.tsx, a one-off response is what's expected.
  const prompt = `
    You are an AI assistant for an ERP system.
    Answer the user's question concisely based on general business knowledge.
    Do not mention that you are an AI.
    User's question: "${userInput}"
    `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });
  
  return response.text;
};


const getLeadScoreAndNextAction = async (dealName: string, dealValue: number): Promise<{ score: number; action: string; }> => {
    const prompt = `
      Analyze the following sales deal and provide a lead score (0-100) and a concise next action suggestion.
      - Deal Name: "${dealName}"
      - Deal Value: IDR ${dealValue}
      
      Consider factors like deal value and keywords in the name (e.g., 'upgrade', 'maintenance', 'contract' are positive).
      Return a JSON object with two keys: "score" (a number) and "action" (a string).
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER, description: "Lead score from 0 to 100" },
                    action: { type: Type.STRING, description: "Suggested next action for the sales team" }
                },
                required: ['score', 'action']
            }
        }
    });
    
    // As per docs, response.text is a JSON string.
    let jsonStr = response.text.trim();
    // It might be wrapped in markdown
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('`')) {
        jsonStr = jsonStr.substring(1, jsonStr.length - 1).trim();
    }
    const parsed = JSON.parse(jsonStr);
    return {
        score: parsed.score,
        action: parsed.action
    };
};

const getCashFlowForecast = async (data: CashFlowEntry[]): Promise<CashFlowForecast> => {
    const prompt = `
        Based on the following historical cash flow data (in IDR) for the last 6 months, generate a forecast for the next 30, 60, and 90 days.
        Also, provide a brief "warning" string if you detect a potential negative cash flow or a significant downturn. If there are no warnings, return an empty string for the warning.
        
        Historical Data:
        ${JSON.stringify(data)}

        Return a JSON object with keys: "forecast30", "forecast60", "forecast90" (all numbers), and "warning" (a string).
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    forecast30: { type: Type.NUMBER },
                    forecast60: { type: Type.NUMBER },
                    forecast90: { type: Type.NUMBER },
                    warning: { type: Type.STRING }
                },
                required: ['forecast30', 'forecast60', 'forecast90', 'warning']
            }
        }
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('`')) {
        jsonStr = jsonStr.substring(1, jsonStr.length - 1).trim();
    }
    const parsed = JSON.parse(jsonStr);
    
    return {
        ...parsed,
        warning: parsed.warning || null,
    };
};

const getProactiveInsights = async (erpData: object): Promise<ProactiveInsight[]> => {
    const prompt = `
        You are an expert AI business analyst for an ERP system.
        Analyze the provided JSON data which includes invoices, products, deals, and bills.
        Identify the top 3-5 most critical or valuable insights. Categorize each insight as one of the following: 'Anomaly', 'Opportunity', or 'Efficiency'.
        
        - 'Anomaly': Unexpected negative trends, significant drops in sales for a product, overdue high-value invoices, etc.
        - 'Opportunity': Potential for cross-selling based on customer behavior, deals with high lead scores needing a push, products that could be bundled.
        - 'Efficiency': Suggestions for cost savings, vendors that are consistently expensive, etc.

        Provide a concise title and a short description for each insight.

        Business Data Context:
        ${JSON.stringify(erpData, null, 2).substring(0, 5000)}...
        (Data has been truncated for brevity)
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['Anomaly', 'Opportunity', 'Efficiency'] },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ['type', 'title', 'description']
                }
            }
        }
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('`')) {
        jsonStr = jsonStr.substring(1, jsonStr.length - 1).trim();
    }
    const parsed = JSON.parse(jsonStr);
    return parsed as ProactiveInsight[];
};

const analyzeDataWithQuestion = async (userQuestion: string, contextData: object): Promise<string> => {
    const prompt = `
        You are an AI business analyst for an ERP system. 
        Analyze the provided JSON business data to answer the user's question. 
        Provide a clear, concise, and helpful response. 
        If the data is insufficient to answer, state that and explain what information is missing. 
        Format your response using simple markdown (e.g., use ** for bold, * for list items).
        
        User Question: "${userQuestion}"

        Business Data Context (truncated): 
        ${JSON.stringify(contextData, null, 2).substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
};

const generateSyntheticData = async (module: string, columns: string[], rowCount: number, rules: string): Promise<Record<string, any>[]> => {
    const cleanedColumns = columns.map(col => ({
        original: col.trim(),
        key: col.trim().replace(/[^a-zA-Z0-9_]/g, '_').replace(/\s+/g, '_'),
    }));

    const columnProperties = cleanedColumns.reduce((acc, { key, original }) => {
        acc[key] = { type: Type.STRING, description: `Synthetic data for column: ${original}` };
        return acc;
    }, {} as Record<string, any>);

    const prompt = `
        You are an expert synthetic data generator for an ERP system. Your task is to create realistic fake data based on user specifications.
        The user wants to generate data for the "${module}" module.

        **Specifications:**
        - Number of rows to generate: ${rowCount}
        - Special rules and formatting instructions: "${rules || 'Generate realistic and varied data that would be found in a real business.'}"

        **Output Instructions:**
        1. The output MUST be a valid JSON array of objects.
        2. Each object in the array represents a single row of data.
        3. Each object MUST contain these exact keys: ${cleanedColumns.map(c => `"${c.key}"`).join(', ')}.
        4. The value for the key "${cleanedColumns[0].key}" should correspond to the column "${cleanedColumns[0].original}", and so on for all columns.
        5. Ensure the generated data strictly adheres to all the specified rules. Do not add any extra text or explanations outside of the JSON array.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: columnProperties,
                    required: cleanedColumns.map(c => c.key),
                },
            },
        },
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
    return JSON.parse(jsonStr);
};


export const geminiService = {
  generateFinancialSummary,
  getChatbotResponse,
  getLeadScoreAndNextAction,
  getCashFlowForecast,
  getProactiveInsights,
  analyzeDataWithQuestion,
  generateSyntheticData,
  parseInvoiceImage,
  createJournalEntryFromInvoice,
};
