import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClearCacheService {

  
  private cache = new Map<string, any>();

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  get(key: string): any | null {
    return this.cache.get(key) || null;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
