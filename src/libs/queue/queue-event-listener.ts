import type PgBoss from 'pg-boss';

export interface OnQueueWipEventHandler {
  onWip(workers: PgBoss.Worker[]): Promise<void> | void;
}
export interface OnQueueErrorEventHandler {
  onError(error: Error): Promise<void>;
}
export interface OnQueueStopEventHandler {
  onStop(): Promise<void>;
}
export interface OnQueueMonitorStatesEventHandler {
  onMonitorStates(states: PgBoss.MonitorState[]): Promise<void>;
}

export type QueueEvent =
  | 'error'
  | 'wip'
  | 'stopped'
  | 'monitor-states'
  | 'maintenance';
