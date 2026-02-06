
import { Subject, AuthorizedUser } from '../types';

const API_BASE = '/api';

class DatabaseService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${response.statusText}`);
      }

      // Para DELETE o POST de usuarios que no devuelven body
      if (response.status === 204 || response.status === 201 && endpoint.includes('users')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en la petición a ${endpoint}:`, error);
      throw error;
    }
  }

  async getAuthorizedUsers(): Promise<AuthorizedUser[]> {
    return this.request<AuthorizedUser[]>('/users');
  }

  async saveAuthorizedUsers(users: AuthorizedUser[]): Promise<void> {
    await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(users)
    });
  }

  async getSubjects(userId: string): Promise<Subject[]> {
    const all = await this.request<Subject[]>('/subjects');
    return all.filter(s => s.ownerId === userId);
  }

  async createSubject(subject: Subject): Promise<void> {
    await this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject)
    });
  }

  async updateSubject(updatedSubject: Subject): Promise<void> {
    await this.request(`/subjects/${updatedSubject.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedSubject)
    });
  }

  async deleteSubject(id: string): Promise<void> {
    await this.request(`/subjects/${id}`, { method: 'DELETE' });
  }
}

export const db = new DatabaseService();
