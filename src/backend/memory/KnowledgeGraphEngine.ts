import { supabase } from '../../lib/auth';

export type EntityType = 
  | 'person' 
  | 'project' 
  | 'company' 
  | 'meeting' 
  | 'document' 
  | 'task' 
  | 'product' 
  | 'trip' 
  | 'preference';

export interface KnowledgeGraphEdge {
  id: string;
  userId: string;
  sourceType: EntityType;
  sourceId: string;
  relationship: string;
  targetType: EntityType;
  targetId: string;
  weight: number;
  createdAt: string;
}

export class KnowledgeGraphEngine {
  /**
   * Adds or updates a relationship edge between two entities in the knowledge graph.
   */
  public static async addEdge(
    userId: string,
    sourceType: EntityType,
    sourceId: string,
    relationship: string,
    targetType: EntityType,
    targetId: string,
    weight: number = 1.0
  ): Promise<void> {
    try {
      await supabase.from('knowledge_graph_edges').insert([{
        user_id: userId,
        source_type: sourceType,
        source_id: sourceId,
        relationship,
        target_type: targetType,
        target_id: targetId,
        weight,
        created_at: new Date().toISOString()
      }]);
    } catch {
      // Ignore
    }
  }

  /**
   * Discovers all connected entity relationships for a given search query or entity ID.
   */
  public static async findRelatedEdges(userId: string, entityId: string): Promise<KnowledgeGraphEdge[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_graph_edges')
        .select('*')
        .eq('user_id', userId)
        .or(`source_id.ilike.%${entityId}%,target_id.ilike.%${entityId}%`);

      if (data && !error) {
        return data.map(row => ({
          id: row.id,
          userId: row.user_id,
          sourceType: row.source_type,
          sourceId: row.source_id,
          relationship: row.relationship,
          targetType: row.target_type,
          targetId: row.target_id,
          weight: Number(row.weight || 1.0),
          createdAt: row.created_at
        }));
      }
    } catch {
      // Fallback
    }

    return [];
  }
}
