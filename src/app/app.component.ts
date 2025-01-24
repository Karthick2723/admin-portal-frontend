import { Component } from '@angular/core';
import { ClearCacheService } from './services/clear-cache.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Solice Admin';

  constructor(private clearCache: ClearCacheService) {}


  ngOnInit() {
    this.clearComponentCache();
  }

  clearComponentCache(): void {
    // Or clear all cache  
    this.clearCache.clear();
  }
}
