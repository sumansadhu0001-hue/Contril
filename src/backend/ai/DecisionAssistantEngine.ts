export interface DecisionOption {
  name: string;
  score: number;
  pros: string[];
  cons: string[];
  price?: string;
}

export interface DecisionMatrix {
  title: string;
  category: 'laptop' | 'hotel' | 'flight' | 'candidate' | 'software' | 'general';
  options: DecisionOption[];
  recommendation: string;
  confidenceScore: number;
}

export class DecisionAssistantEngine {

  public static generateDecisionMatrix(topic: string): DecisionMatrix {
    const clean = topic.toLowerCase();

    if (clean.includes('laptop') || clean.includes('macbook') || clean.includes('hardware')) {
      return {
        title: 'Hardware Decision Matrix: Developer Laptop Comparison',
        category: 'laptop',
        options: [
          { name: 'MacBook Pro 16" (M3 Max, 64GB RAM)', score: 94, price: '₹3,49,900', pros: ['Peak single/multi-threaded AI compile performance', '18-hour battery life', 'Zero thermal throttling'], cons: ['High upfront cost'] },
          { name: 'Dell XPS 16 (Intel Core Ultra 9, 32GB RAM)', score: 82, price: '₹2,89,900', pros: ['Gorgeous OLED 4K display', 'NVIDIA RTX 4070 GPU'], cons: ['Higher thermal fan noise under heavy RAG load'] }
        ],
        recommendation: 'Recommend MacBook Pro 16" (M3 Max) for long-duration local AI RAG indexing and developer workflows.',
        confidenceScore: 95
      };
    }

    if (clean.includes('hotel') || clean.includes('stay') || clean.includes('resort')) {
      return {
        title: 'Executive Stay Matrix: Mumbai Business Travel',
        category: 'hotel',
        options: [
          { name: 'The Taj Mahal Palace, Colaba', score: 96, price: '₹22,500/night', pros: ['Iconic sea view & executive lounge', '15 mins from financial district'], cons: ['Higher peak rate'] },
          { name: 'St. Regis, Lower Parel', score: 90, price: '₹18,000/night', pros: ['Directly connected to Palladium Mall & tech hubs'], cons: ['City traffic during evening hours'] }
        ],
        recommendation: 'Recommend The Taj Mahal Palace for proximity to executive meetings.',
        confidenceScore: 92
      };
    }

    // Default Software/Tool Matrix
    return {
      title: `Executive Comparison: ${topic}`,
      category: 'software',
      options: [
        { name: 'Option A (Enterprise Enclave)', score: 90, pros: ['High security', 'Full API integration'], cons: ['Slightly higher cost'] },
        { name: 'Option B (Standard SaaS)', score: 78, pros: ['Faster initial setup'], cons: ['Less customizability'] }
      ],
      recommendation: 'Recommend Option A based on enterprise security standards.',
      confidenceScore: 88
    };
  }
}
