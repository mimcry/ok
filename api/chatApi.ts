

import { BASE_URL } from "@/utils/config";
import { getAuthToken } from "./userdetails";

export interface ChatMessage {
  id: number;
  sender_profile_picture: string | null;
  message: string | null;
  images: string[]; // Array of image URLs
  timestamp: string;
  is_sent: boolean;
  message_type: 'sent' | 'received';
  is_read: boolean;
  cleaner_online: boolean;
  cleaner_last_seen: string | null;
  host_online: boolean;
  host_last_seen: string | null;
  notifications: any[];
}

export interface ChatConnection {
  id: number;
  cleaner_full_name: string;
  cleaner_email: string;
  cleaner_phone: string;
  cleaner_city: string;
  cleaner_state: string;
  cleaner_zip_code: string;
  cleaner_country: string;
  cleaner_profile_picture: string | null;
  cleaner_average_rating: number | null;
  cleaner_speciality: string | null;
  cleaner_experience: string | null;
  cleaner_online?: boolean;
  cleaner_last_seen?: string | null;
  host_full_name?: string;
  host_email?: string;
  host_phone?: string;
  host_city?: string;
  host_state?: string;
  host_zip_code?: string;
  host_country?: string;
  host_profile_picture?: string | null;
  host_online?: boolean;
  host_last_seen?: string | null;
  initiator_id: string;
  initiator_full_name: string;
  status: string;
  created_at: string;
}

export interface ChatResponse {
  connection: ChatConnection;
  messages: ChatMessage[];
}

/** Request payload for sending a message */
export interface SendMessageRequest {
  message?: string;  // optional; for image-only, can be omitted or empty
  // No sender_id here
}

export class ChatApiService {
  private authToken: string | null = null;
  private csrfToken: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Optionally initialize tokens here
  }

  /**
   * Set authentication token (e.g., after login).
   */
  setAuthToken(token: string) {
    this.authToken = token;
    this.csrfToken = token; // if same token used for CSRF
    this.isInitialized = true;
    console.log('Auth token set');
  }

  /**
   * Clear tokens (e.g., on logout).
   */
  clearTokens() {
    this.authToken = null;
    this.csrfToken = null;
    this.isInitialized = false;
    console.log('All tokens cleared');
  }

   async initializeTokens(): Promise<void> {
    try {
      const token = getAuthToken();
      if (token) {
        this.authToken = token;
        this.csrfToken = token;
        this.isInitialized = true;
        console.log('Tokens initialized from Storage');
      } else {
        console.warn('No auth token found in Storage');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error loading tokens from Storage:', error);
      this.isInitialized = false;
      throw new Error('Failed to initialize authentication tokens');
    }
  }

  /**
   * Prepare headers for JSON requests.
   */
  private async getAuthHeadersAsync(): Promise<Record<string, string>> {
    if (!this.isInitialized || !this.authToken) {
      await this.initializeTokens();
    }
    if (!this.authToken) {
      throw new Error('Authentication token not available. Please log in again.');
    }
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
    };
    if (this.csrfToken) {
      headers['X-CSRFToken'] = this.csrfToken;
    }
    console.log('Request headers prepared:', {
      hasAuth: !!headers['Authorization'],
      hasCSRF: !!headers['X-CSRFToken'],
      contentType: headers['Content-Type']
    });
    return headers;
  }

  /**
   * Prepare headers for multipart/form-data requests.
   * Do NOT set 'Content-Type'; fetch will set boundary automatically.
   */
  private async getMultipartAuthHeadersAsync(): Promise<Record<string, string>> {
    if (!this.isInitialized || !this.authToken) {
      await this.initializeTokens();
    }
    if (!this.authToken) {
      throw new Error('Authentication token not available. Please log in again.');
    }
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      // No 'Content-Type'
    };
    if (this.csrfToken) {
      headers['X-CSRFToken'] = this.csrfToken;
    }
    console.log('Multipart headers prepared:', {
      hasAuth: !!headers['Authorization'],
      hasCSRF: !!headers['X-CSRFToken']
    });
    return headers;
  }

  /**
   * Enhanced error handling for API responses.
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      switch (response.status) {
        case 400:
          // keep errorMessage
          break;
        case 401:
          errorMessage = 'Authentication failed. Please log in again.';
          break;
        case 403:
          if (errorMessage.toLowerCase().includes('csrf')) {
            errorMessage = 'CSRF token validation failed. Please try logging out and logging back in.';
          } else {
            errorMessage = 'Access denied. You do not have permission to perform this action.';
          }
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    } catch (parseError) {
      console.error('Error parsing API error response:', parseError);
    }
    console.error(`API Error ${response.status}:`, errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Fetch messages for a specific connection.
   */
  async fetchMessages(connectionId: number | null): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const url = `${BASE_URL}/api/chats/connections/${connectionId}/messages/`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        await this.handleApiError(response);
      }
      const data: ChatResponse = await response.json();
      if (!data.connection || !Array.isArray(data.messages)) {
        throw new Error('Invalid response format from server');
      }
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a text-only message. Backend infers sender from auth token.
   */
  async sendMessage(connectionId: number, messageData: SendMessageRequest): Promise<ChatMessage> {
    try {
      const text = messageData.message?.trim() ?? "";
      if (!text) {
        throw new Error('Message text cannot be empty');
      }
      const headers = await this.getMultipartAuthHeadersAsync();
      const formData = new FormData();
      formData.append('message', text);

      console.log('Sending text message:', { connectionId, message: text });
      const url = `${BASE_URL}/api/chats/connections/${connectionId}/messages/`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        await this.handleApiError(response);
      }
      const data: ChatMessage = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  /**
   * Send a message with optional text and multiple images.
   * imageUris: array of local URIs (e.g. from expo-image-picker).
   */
  async sendMessageWithMultipleImages(
    connectionId: number,
    messageData: SendMessageRequest,
    imageUris: string[]
  ): Promise<ChatMessage> {
    try {
      const text = messageData.message?.trim() ?? "";
      const hasText = text.length > 0;
      const hasImages = Array.isArray(imageUris) && imageUris.length > 0;
      if (!hasText && !hasImages) {
        throw new Error('Either message text or at least one image is required');
      }

      const headers = await this.getMultipartAuthHeadersAsync();
      const formData = new FormData();

      if (hasText) {
        formData.append('message', text);
      }

      if (hasImages) {
        imageUris.forEach((uri, index) => {
          // Derive filename
          const uriParts = uri.split('/');
          const filename = uriParts[uriParts.length - 1] || `image_${Date.now()}_${index}.jpg`;
          // Infer MIME type
          let type = 'image/jpeg';
          const match = /\.(\w+)$/.exec(filename);
          if (match) {
            const ext = match[1].toLowerCase();
            if (ext === 'png') type = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
          }
          console.log(`Appending image [${index}]: uri=${uri}, name=${filename}, type=${type}`);
          formData.append('images', { uri, name: filename, type } as any);
        });
      }

      // Debug: inspect FormData parts in React Native
      try {
        if ((formData as any)._parts) {
          console.log('FormData parts:');
          (formData as any)._parts.forEach((part: any[]) => {
            console.log(' ', part[0], part[1]);
          });
        }
      } catch (e) {
        console.log('Could not inspect FormData parts:', e);
      }

      const url = `${BASE_URL}/api/chats/connections/${connectionId}/messages/`;
      console.log('Sending POST to:', url, '| images count:', imageUris.length);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!response.ok) {
        await this.handleApiError(response);
      }
      const data: ChatMessage = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message with multiple images:', error);
      throw error;
    }
  }

  /**
   * Unified send: if images array provided, send with images; otherwise text-only.
   */
  async sendMessageUnified(
    connectionId: number,
    messageData: SendMessageRequest,
    imageUris: string[] = []
  ): Promise<ChatMessage> {
    const text = messageData.message?.trim() ?? "";
    const hasText = text.length > 0;
    const hasImages = Array.isArray(imageUris) && imageUris.length > 0;
    if (hasImages) {
      return this.sendMessageWithMultipleImages(connectionId, messageData, imageUris);
    } else if (hasText) {
      return this.sendMessage(connectionId, messageData);
    } else {
      throw new Error('Either message text or at least one image is required');
    }
  }

  /**
   * Poll for new messages periodically.
   */
  pollMessages(
    connectionId: number,
    lastMessageId: number ,
    onNewMessages: (messages: ChatMessage[]) => void,
   
  ): () => void {
    let isPolling = true;
    let lastId = lastMessageId;

    const poll = async () => {
      if (!isPolling) return;
      try {
        const response = await this.fetchMessages(connectionId);
        const allMessages = response.messages || [];
        let newMessages: ChatMessage[] = [];
        if (lastId !== null) {
          newMessages = allMessages.filter(msg => msg.id > lastId);
        }
        if (newMessages.length > 0) {
          onNewMessages(newMessages);
          lastId = Math.max(...newMessages.map(m => m.id));
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    poll();
    

    return () => {
      isPolling = false;
      
    };
  }

  /**
   * Mark messages as read.
   */
  async markMessagesAsRead(connectionId: number, messageIds: number[]): Promise<any> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const url = `${BASE_URL}/api/chats/connections/${connectionId}/messages/mark-read/`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message_ids: messageIds }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error('Mark read error:', response.status, text);
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get connection info.
   */
  async getConnection(connectionId: number): Promise<ChatConnection> {
    try {
      const headers = await this.getAuthHeadersAsync();
      const url = `${BASE_URL}/api/chats/connections/${connectionId}/`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error('Get connection error:', response.status, text);
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      const data: ChatConnection = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw error;
    }
  }
}

export const chatApiService = new ChatApiService(); 