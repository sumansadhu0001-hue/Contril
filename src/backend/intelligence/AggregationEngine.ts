import { BaseConnector, ConnectorContext } from '../connectors/BaseConnector';
import { AggregatedResult, ConnectorResult } from './types';

const CONNECTOR_TIMEOUT_MS = 5000;

export class AggregationEngine {
  public static async search(connectors: BaseConnector[], query: string, context: ConnectorContext): Promise<AggregatedResult> {
    const executions = await Promise.allSettled(
      connectors.map(connector => this.withRetry(() => this.withTimeout(() => connector.search(query, context), CONNECTOR_TIMEOUT_MS)))
    );
    return this.normalize(executions, connectors);
  }

  public static async compare(connectors: BaseConnector[], items: unknown[], context: ConnectorContext): Promise<AggregatedResult> {
    const executions = await Promise.allSettled(
      connectors.map(connector => this.withRetry(() => this.withTimeout(() => connector.compare(items, context), CONNECTOR_TIMEOUT_MS)))
    );
    return this.normalize(executions, connectors);
  }

  private static normalize(executions: PromiseSettledResult<ConnectorResult>[], connectors: BaseConnector[]): AggregatedResult {
    const failures: AggregatedResult['failures'] = [];
    const unavailableConnectorIds: string[] = [];
    const unique = new Map<string, Record<string, unknown>>();

    executions.forEach((execution, index) => {
      const connectorId = connectors[index].id;
      if (execution.status === 'rejected') {
        failures.push({ connectorId, error: execution.reason instanceof Error ? execution.reason.message : 'Connector request failed.' });
        return;
      }
      if (execution.value.status === 'failed') {
        failures.push({ connectorId, error: execution.value.error || 'Connector request failed.' });
        return;
      }
      if (execution.value.status === 'unavailable') {
        unavailableConnectorIds.push(connectorId);
        return;
      }
      execution.value.data.forEach(item => {
        const key = typeof item === 'object' && item !== null && 'id' in (item as any) ? String((item as any).id) : JSON.stringify(item);
        if (!unique.has(key)) unique.set(key, item);
      });
    });

    return { results: [...unique.values()], failures, unavailableConnectorIds };
  }

  private static async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Connector timed out after ${timeoutMs}ms`)), timeoutMs);
      operation().then(
        res => { clearTimeout(timer); resolve(res); },
        err => { clearTimeout(timer); reject(err); }
      );
    });
  }

  private static async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (firstError) {
      try {
        return await operation();
      } catch {
        throw firstError;
      }
    }
  }
}
