
export interface MainProgramRequest {
  model: string;
  systemPrompt?: string;
  prompt: string;
  schema: string;
  maxTokens?: number;
  providerOptions?: any;
  userUuid?: string;
  gameId?: number;
  promptTemplate?: string;
}

export interface MainProgramResponse {
  success: boolean;
  result?: any;
  errorMessage?: string;
  duration?: number;
  attemptCount?: number;
  usedRepair?: boolean;
  usedLlmRepair?: boolean;
}

export class MainProgramService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.MAIN_PROGRAM_URL || '';
    this.apiKey = process.env.MAIN_PROGRAM_API_KEY;
    
    if (!this.baseUrl) {
      console.warn('MAIN_PROGRAM_URL 未配置，主程序通信功能将不可用');
    }
  }

  /**
   * 检查主程序连接状态
   */
  async checkConnection(): Promise<boolean> {
    if (!this.baseUrl) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000) // 5秒超时
      });
      return response.ok;
    } catch (error) {
      console.error('主程序连接检查失败:', error);
      return false;
    }
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * 调用主程序的LLM接口
   */
  async callLlm(request: MainProgramRequest): Promise<MainProgramResponse> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/llm/call`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('调用主程序LLM接口失败:', error);
      throw error;
    }
  }

  /**
   * 获取主程序状态
   */
  async getStatus(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取主程序状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取主程序配置
   */
  async getConfig(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/config`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取主程序配置失败:', error);
      throw error;
    }
  }

  /**
   * 同步主程序配置
   */
  async syncConfig(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/config/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('同步主程序配置失败:', error);
      throw error;
    }
  }

  /**
   * 从主程序同步LLM日志
   */
  async syncLlmLogs(): Promise<{ synced: number; errors: number }> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    let synced = 0;
    let errors = 0;

    try {
      // 从主程序获取日志数据
      const response = await fetch(`${this.baseUrl}/api/llm-logs`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // 检查响应格式
      if (!responseData.success) {
        throw new Error(`主程序返回错误: ${responseData.message || '未知错误'}`);
      }

      // 获取日志数据
      const logs = responseData.data?.logs || [];
      console.log(`从主程序获取到 ${logs.length} 条日志记录`);

      // 日志数据已从主程序获取，无需同步到本地数据库
      synced = logs.length;

      console.log(`同步完成：成功 ${synced} 条，失败 ${errors} 条`);
      return { synced, errors };

    } catch (error) {
      console.error('从主程序同步日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取主程序LLM日志列表
   */
  async getLlmLogs(queryParams: string = ''): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const url = queryParams 
        ? `${this.baseUrl}/api/llm-logs?${queryParams}`
        : `${this.baseUrl}/api/llm-logs`;

        console.log(url)
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`主程序返回错误: ${result.message || '未知错误'}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取主程序LLM日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取主程序日志统计
   */
  async getLlmLogStats(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/llm-logs/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`主程序返回错误: ${result.message || '未知错误'}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取主程序日志统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取主程序模型列表
   */
  async getModels(): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/models`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`主程序返回错误: ${result.message || '未知错误'}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取主程序模型列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取单个LLM日志详情
   */
  async getLlmLogDetail(logId: number): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('主程序URL未配置');
    }

    try {
      const url = `${this.baseUrl}/api/llm-logs/${logId}`
      console.log(url)
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10秒超时
      });


      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`主程序返回错误: ${result.message || '未知错误'}`);
      }

      return result.data;
    } catch (error) {
      console.error('获取LLM日志详情失败:', error);
      throw error;
    }
  }
}

export const mainProgramService = new MainProgramService();
