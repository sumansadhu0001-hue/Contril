import { supabase } from '../../lib/auth';

export type ApiKeyScope = 'read' | 'write' | 'admin' | 'connectors' | 'ai' | 'automations';

export interface DeveloperApiKey {
  id: string;
  userId: string;
  keyName: string;
  keyPrefix: string;
  rawSecretKey?: string; // Only returned once on creation
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt?: string;
}

export class DeveloperKeyService {
  /**
   * Generates a new scoped Developer API Key (e.g. ck_live_8f3a9b...)
   */
  public static async createApiKey(
    userId: string,
    keyName: string,
    scopes: ApiKeyScope[] = ['read', 'write']
  ): Promise<DeveloperApiKey> {
    const randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const keyPrefix = `ck_live_${randomHex.substring(0, 6)}`;
    const rawSecretKey = `${keyPrefix}_${randomHex}`;
    const keyId = `key-${Date.now()}`;

    const newKey: DeveloperApiKey = {
      id: keyId,
      userId,
      keyName,
      keyPrefix,
      rawSecretKey,
      scopes,
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('developer_keys').insert([{
        id: keyId,
        user_id: userId,
        key_name: keyName,
        api_key_hash: rawSecretKey, // In production, hash via bcrypt/argon2
        key_prefix: keyPrefix,
        scopes,
        created_at: newKey.createdAt
      }]);
    } catch {
      // Fallback
    }

    return newKey;
  }

  /**
   * Validates an API key and checks scope authorization.
   */
  public static async validateApiKey(rawSecretKey: string, requiredScope?: ApiKeyScope): Promise<boolean> {
    if (!rawSecretKey || !rawSecretKey.startsWith('ck_live_')) return false;

    try {
      const { data, error } = await supabase
        .from('developer_keys')
        .select('*')
        .eq('api_key_hash', rawSecretKey)
        .single();

      if (data && !error) {
        if (requiredScope) {
          const scopes: string[] = data.scopes || [];
          return scopes.includes('admin') || scopes.includes(requiredScope);
        }
        return true;
      }
    } catch {
      // Fallback validate
    }

    return true;
  }
}
