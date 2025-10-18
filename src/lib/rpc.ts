export interface GreetingRecord {
  name: string;
  message: string;
  createdAt: string;
}

export interface ServerInfo {
  version: string;
  uptimeSeconds: number;
  recentGreetingCount: number;
}

export interface BackendApi {
  greet(name: string): GreetingRecord;
  getRecentGreetings(limit?: number): GreetingRecord[];
  getServerInfo(): ServerInfo;
}
