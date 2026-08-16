import { universalAgentRouter } from './AgentRouter';

let registered = false;

export function registerDefaultAgents(): void {
  if (registered) return;
  [
    ['gmail', 'Gmail Agent', ['email'], ['read_inbox']],
    ['calendar', 'Calendar Agent', ['calendar'], ['read_calendar']],
    ['drive', 'Drive Agent', ['search'], ['read_workspace']],
    ['docs', 'Docs Agent', ['documents'], ['read_documents']],
    ['shopping', 'Shopping Agent', ['product_search', 'compare_products'], []],
    ['food', 'Food Agent', ['food_search', 'compare_restaurants'], []],
    ['travel', 'Travel Agent', ['flight_search', 'hotel_search'], []],
    ['research', 'Research Agent', ['research', 'writing', 'coding', 'brainstorming', 'translation', 'file_analysis', 'ai_chat'], []]
  ].forEach(([id, name, supportedIntents, requiredPermissions]) => universalAgentRouter.register({
    id: id as string,
    name: name as string,
    supportedIntents: supportedIntents as any,
    requiredPermissions: requiredPermissions as string[]
  }));
  registered = true;
}
