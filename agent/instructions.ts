import { defineInstructions } from 'eve/instructions';
import { CHAT_INSTRUCTIONS } from '../lib/prompt';

export default defineInstructions({ content: CHAT_INSTRUCTIONS });
