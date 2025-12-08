/**
 * Suno Music Provider via GoAPI
 *
 * Integracja z Suno AI przez GoAPI.ai
 * Dokumentacja: https://github.com/Goapiai/Suno-API
 */

export interface SunoGenerationInput {
  prompt: string;           // Song description (for simple mode) or lyrics (for custom mode)
  stylePrompt?: string;     // Style tags and description
  title?: string;           // Song title
  instrumental?: boolean;   // Generate without vocals
  mode?: 'simple' | 'custom';
}

export interface SunoGenerationResult {
  success: boolean;
  taskId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrls?: string[];     // Suno generates 2 clips per request
  error?: string;
  estimatedTime?: number;
}

export interface SunoStatusResult {
  success: boolean;
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audioUrls?: string[];
  clips?: SunoClip[];
  error?: string;
}

export interface SunoClip {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
  status: string;
}

const GOAPI_BASE_URL = 'https://api.goapi.ai/api/suno/v1';

/**
 * Generate music via GoAPI Suno
 */
export async function generateMusicSuno(
  input: SunoGenerationInput
): Promise<SunoGenerationResult> {
  const apiKey = process.env.GOAPI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      status: 'failed',
      error: 'GOAPI_API_KEY is not configured',
    };
  }

  try {
    // Build request body based on mode
    // GoAPI Suno supports custom_mode for full control
    const isCustomMode = input.mode === 'custom' && input.prompt && input.stylePrompt;

    // Prepare request body
    let requestBody: Record<string, unknown>;

    if (isCustomMode) {
      // Custom mode: user provides lyrics and style separately
      requestBody = {
        custom_mode: true,
        input: {
          title: input.title || 'Untitled',
          prompt: input.prompt,           // Lyrics
          tags: input.stylePrompt || '',  // Style tags
          make_instrumental: input.instrumental || false,
        },
      };
    } else {
      // Simple mode: AI generates everything from description
      requestBody = {
        custom_mode: false,
        input: {
          gpt_description_prompt: input.prompt,
          make_instrumental: input.instrumental || false,
        },
      };
    }

    console.log('Suno GoAPI request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${GOAPI_BASE_URL}/music`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Suno GoAPI error response:', errorText);
      let errorMessage = 'Suno generation failed';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Suno GoAPI response:', JSON.stringify(data, null, 2));

    // GoAPI returns: { code: 200, data: { task_id: "..." }, message: "success" }
    if (data.code !== 200 || !data.data?.task_id) {
      throw new Error(data.message || 'Failed to create task');
    }

    return {
      success: true,
      taskId: data.data.task_id,
      status: 'processing',
      estimatedTime: 120, // Suno typically takes 1-3 minutes
    };
  } catch (error) {
    console.error('Suno GoAPI generation error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Suno generation status
 */
export async function checkSunoStatus(
  taskId: string
): Promise<SunoStatusResult> {
  const apiKey = process.env.GOAPI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      taskId,
      status: 'failed',
      error: 'GOAPI_API_KEY is not configured',
    };
  }

  try {
    const response = await fetch(`${GOAPI_BASE_URL}/music/${taskId}`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Suno status check failed:', response.status, errorText);
      throw new Error(`Failed to check status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Suno status response:', JSON.stringify(data, null, 2));

    // Parse response - GoAPI returns different structures
    // Success: { code: 200, data: { status: "completed", clips: [...] } }
    if (data.code !== 200) {
      throw new Error(data.message || 'Status check failed');
    }

    const taskData = data.data;
    const status = parseGoAPIStatus(taskData.status);

    if (status === 'completed' && taskData.clips) {
      const clips: SunoClip[] = taskData.clips.map((clip: any) => ({
        id: clip.id,
        title: clip.title || 'Untitled',
        audioUrl: clip.audio_url,
        imageUrl: clip.image_url,
        duration: clip.duration,
        status: clip.status,
      }));

      return {
        success: true,
        taskId,
        status: 'completed',
        audioUrls: clips.map(c => c.audioUrl).filter(Boolean),
        clips,
      };
    }

    if (status === 'failed') {
      return {
        success: false,
        taskId,
        status: 'failed',
        error: taskData.error || 'Generation failed',
      };
    }

    // Still processing
    return {
      success: true,
      taskId,
      status,
    };
  } catch (error) {
    return {
      success: false,
      taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse GoAPI status to our internal status
 */
function parseGoAPIStatus(
  status: string
): 'pending' | 'processing' | 'completed' | 'failed' {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'completed' || statusLower === 'complete') {
    return 'completed';
  }
  if (statusLower === 'failed' || statusLower === 'error') {
    return 'failed';
  }
  if (statusLower === 'pending' || statusLower === 'queued') {
    return 'pending';
  }
  // processing, running, in_progress, etc.
  return 'processing';
}

/**
 * Cancel Suno generation (if supported)
 */
export async function cancelSunoGeneration(taskId: string): Promise<boolean> {
  // GoAPI may not support cancellation - just return true
  // The task will complete but we won't use the result
  console.log('Suno cancellation requested for:', taskId);
  return true;
}
