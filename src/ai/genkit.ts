import { GoogleGenAI, Type } from '@google/genai';

let _aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!_aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined in your environment variables. Please configure it in your Settings > Secrets panel.'
      );
    }
    _aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return _aiClient;
}

function getValueByPath(obj: any, path: string): any {
  if (obj === null || obj === undefined) return undefined;
  if (path === 'this') return obj;
  let cleanPath = path;
  if (cleanPath.startsWith('this.')) {
    cleanPath = cleanPath.slice(5);
  }
  const parts = cleanPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function renderTemplate(template: string, data: any): string {
  let result = template;

  // Handle loops: {{#each key}} ... {{/each}}
  const loopRegex = /\{\{#each\s+([\w\.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  result = result.replace(loopRegex, (match, key, body) => {
    const list = key === 'this' ? data : getValueByPath(data, key);
    if (!Array.isArray(list)) return '';
    return list.map(item => {
      return renderTemplate(body, item);
    }).join('');
  });

  // Handle conditional blocks: {{#if key}} ... {{/if}}
  const ifRegex = /\{\{#if\s+([\w\.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, key, body) => {
    const val = getValueByPath(data, key);
    if (val && (!Array.isArray(val) || val.length > 0)) {
      return renderTemplate(body, data);
    }
    return '';
  });

  // Handle join helper: {{join this.options ", "}}
  const joinRegex = /\{\{join\s+([\w\.\s]+)\s+["'](.*?)["']\}\}/g;
  result = result.replace(joinRegex, (match, path, separator) => {
    const arr = getValueByPath(data, path.trim());
    if (Array.isArray(arr)) {
      return arr.join(separator);
    }
    return '';
  });

  // Handle simple interpolation: {{variable}} or {{{variable}}}
  const varRegex = /\{\{\{?([\w\.\-]+)\}\}\}?/g;
  result = result.replace(varRegex, (match, path) => {
    const val = getValueByPath(data, path);
    return val !== undefined ? String(val) : '';
  });

  return result;
}

function zodToGeminiSchema(schema: any): any {
  if (!schema || !schema._def) {
    return { type: Type.STRING };
  }
  const typeName = schema._def.typeName;
  const description = schema._def.description;

  const addDesc = (obj: any) => {
    if (description) {
      obj.description = description;
    }
    return obj;
  };

  if (typeName === 'ZodObject') {
    const shape = schema.shape || {};
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const key in shape) {
      properties[key] = zodToGeminiSchema(shape[key]);
      if (shape[key]._def.typeName !== 'ZodOptional') {
        required.push(key);
      }
    }
    return addDesc({
      type: Type.OBJECT,
      properties,
      required: required.length > 0 ? required : undefined,
    });
  }

  if (typeName === 'ZodArray') {
    const inner = schema._def.type;
    return addDesc({
      type: Type.ARRAY,
      items: zodToGeminiSchema(inner),
    });
  }

  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
    const innerSchema = zodToGeminiSchema(schema._def.innerType);
    if (description && !innerSchema.description) {
      innerSchema.description = description;
    }
    return innerSchema;
  }

  if (typeName === 'ZodEffects') {
    const innerSchema = zodToGeminiSchema(schema._def.schema);
    if (description && !innerSchema.description) {
      innerSchema.description = description;
    }
    return innerSchema;
  }

  if (typeName === 'ZodEnum') {
    return addDesc({
      type: Type.STRING,
      enum: schema._def.values || [],
    });
  }

  if (typeName === 'ZodUnion') {
    const options = schema._def.options || [];
    if (options.length > 0) {
      const innerSchema = zodToGeminiSchema(options[0]);
      if (description && !innerSchema.description) {
        innerSchema.description = description;
      }
      return innerSchema;
    }
    return addDesc({ type: Type.STRING });
  }

  if (typeName === 'ZodString') {
    return addDesc({ type: Type.STRING });
  }

  if (typeName === 'ZodNumber') {
    return addDesc({ type: Type.NUMBER });
  }

  if (typeName === 'ZodBoolean') {
    return addDesc({ type: Type.BOOLEAN });
  }

  return addDesc({ type: Type.STRING });
}

export const ai = {
  definePrompt(config: {
    name: string;
    input?: { schema: any };
    output?: { schema: any };
    prompt: string;
  }) {
    const outputSchema = config.output?.schema;

    return async function promptCallable(inputData: any) {
      const compiledPrompt = renderTemplate(config.prompt, inputData || {});
      const aiClient = getAIClient();

      const hasFileDataUri =
        inputData &&
        typeof inputData === 'object' &&
        'fileDataUri' in inputData &&
        typeof inputData.fileDataUri === 'string' &&
        inputData.fileDataUri.startsWith('data:');

      const parts: any[] = [];
      let cleanPrompt = compiledPrompt;

      if (hasFileDataUri) {
        const matches = inputData.fileDataUri.match(/^data:([^;]+);base64,(.*)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
        // Remove media helper syntax from standard text to prevent confusing the model
        cleanPrompt = cleanPrompt.replace(/\{\{media\s+url=fileDataUri\}\}/g, '').trim();
      }

      parts.push({ text: cleanPrompt });

      const geminiConfig: any = {
        temperature: 0.1,
      };

      if (outputSchema) {
        geminiConfig.responseMimeType = 'application/json';
        geminiConfig.responseSchema = zodToGeminiSchema(outputSchema);
      }

      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: parts,
          config: geminiConfig,
        });

        const textContent = response.text || '{}';

        let parsedOutput: any;
        if (outputSchema) {
          try {
            parsedOutput = JSON.parse(textContent);
          } catch (e) {
            const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedOutput = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } else {
              throw new Error(`Failed to parse JSON response: ${textContent}`);
            }
          }

          if (typeof outputSchema.safeParse === 'function') {
            const result = outputSchema.safeParse(parsedOutput);
            if (result.success) {
              parsedOutput = result.data;
            } else {
              console.warn('Zod validation warning (retaining parsed JSON):', result.error);
            }
          }
        } else {
          parsedOutput = textContent;
        }

        return { output: parsedOutput };
      } catch (error) {
        console.error('Gemini API Call Error:', error);
        throw error;
      }
    };
  },
};

