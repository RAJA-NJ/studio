'use server';
/**
 * @fileOverview A Genkit flow for doctors to get AI-powered preliminary suggestions or informational guidance.
 *
 * - doctorAidSuggestions - A function that generates preliminary suggestions for a doctor.
 * - DoctorAidSuggestionsInput - The input type for the doctorAidSuggestions function.
 * - DoctorAidSuggestionsOutput - The return type for the doctorAidSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DoctorAidSuggestionsInputSchema = z.object({
  patientSymptoms: z
    .string()
    .describe('Patient-provided symptoms or medical history.'),
  medicalDataUri: z
    .string()
    .optional()
    .describe(
      "Optional: A data URI for uploaded medical data (e.g., scan report or image). Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DoctorAidSuggestionsInput = z.infer<
  typeof DoctorAidSuggestionsInputSchema
>;

const DoctorAidSuggestionsOutputSchema = z.object({
  preliminarySuggestions: z
    .string()
    .describe(
      'Preliminary suggestions or informational guidance based on the provided data. This is not a definitive diagnosis.'
    ),
  disclaimer: z
    .string()
    .describe(
      'A clear disclaimer stating that the suggestions are not a definitive diagnosis and should not replace professional medical advice.'
    ),
});
export type DoctorAidSuggestionsOutput = z.infer<
  typeof DoctorAidSuggestionsOutputSchema
>;

export async function doctorAidSuggestions(
  input: DoctorAidSuggestionsInput
): Promise<DoctorAidSuggestionsOutput> {
  return doctorAidSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'doctorAidSuggestionsPrompt',
  input: { schema: DoctorAidSuggestionsInputSchema },
  output: { schema: DoctorAidSuggestionsOutputSchema },
  prompt: `You are an AI assistant designed to provide preliminary suggestions and informational guidance to a doctor based on patient-provided symptoms and medical data. Your goal is to offer additional resources and perspectives, not to make definitive diagnoses or replace professional medical judgment.

Carefully review the following patient information:

Patient Symptoms: {{{patientSymptoms}}}

{{#if medicalDataUri}}
Medical Data: {{media url=medicalDataUri}}
{{/if}}

Based on this information, provide preliminary suggestions or informational guidance that a doctor might consider. Always include a disclaimer at the end stating that this is not a definitive diagnosis and should not replace professional medical advice.

Suggestions:`,
});

const doctorAidSuggestionsFlow = ai.defineFlow(
  {
    name: 'doctorAidSuggestionsFlow',
    inputSchema: DoctorAidSuggestionsInputSchema,
    outputSchema: DoctorAidSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
