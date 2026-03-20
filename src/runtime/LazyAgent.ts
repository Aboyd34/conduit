import { LazyConfig } from '../lazy/LazyConfig';

type LazyEvent =
  | { type: 'IMAGE_VISIBLE'; id: string }
  | { type: 'IMAGE_ERROR'; id: string; error: string }
  | { type: 'OBSERVER_ERROR'; error: string };

class LazyAgent {
  private static instance: LazyAgent | null = null;
  private failures = new Map<string, number>();
  private readonly maxRetries = 3;

  static getInstance(): LazyAgent {
    if (!this.instance) this.instance = new LazyAgent();
    return this.instance;
  }

  log(event: LazyEvent) {
    if (!LazyConfig.enabled) return;
    if (LazyConfig.debug) console.debug('[LazyAgent]', event);

    switch (event.type) {
      case 'IMAGE_ERROR':    this.handleImageError(event.id, event.error); break;
      case 'OBSERVER_ERROR': this.handleObserverError(event.error); break;
      default: break;
    }
  }

  private handleImageError(id: string, error: string) {
    const count = (this.failures.get(id) ?? 0) + 1;
    this.failures.set(id, count);

    if (count >= this.maxRetries) {
      // After max retries, load full image directly and stop lazy tracking
      const el = document.querySelector<HTMLImageElement>(`img[data-lazy-id="${id}"]`);
      if (el?.dataset.fullSrc) {
        el.src = el.dataset.fullSrc;
        el.removeAttribute('data-lazy-id');
      }
    }
  }

  private handleObserverError(error: string) {
    console.warn('[LazyAgent] Observer failed, disabling lazy loading:', error);
    LazyConfig.enabled = false;
  }

  getFailureCount(id: string): number {
    return this.failures.get(id) ?? 0;
  }

  reset() {
    this.failures.clear();
    LazyConfig.enabled = true;
  }
}

export const lazyAgent = LazyAgent.getInstance();
