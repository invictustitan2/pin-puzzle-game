export class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;
  private toLoad: { key: string; src: string }[] = [];

  constructor() {
    this.toLoad = [
      { key: 'background', src: '/assets/bg_stone_wall.png' },
      { key: 'pins', src: '/assets/pin_assets.png' },
      { key: 'characters', src: '/assets/game_characters.png' },
      { key: 'liquids', src: '/assets/liquid_particles.png' },
      { key: 'items', src: '/assets/game_items.png' },
    ];
  }

  public async loadAll(): Promise<void> {
    const promises = this.toLoad.map((asset) =>
      this.loadImage(asset.key, asset.src)
    );
    await Promise.all(promises);
    this.loaded = true;
    console.log('[AssetManager] All assets loaded');
  }

  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = async () => {
        if (key === 'items') {
          try {
            const cleaned = await this.cleanImage(img);
            this.images.set(key, cleaned);
          } catch (e) {
            console.error(`[AssetManager] Failed to clean ${key}`, e);
            this.images.set(key, img); // Fallback
          }
        } else {
          this.images.set(key, img);
        }
        resolve();
      };
      img.onerror = (e) => {
        console.error(`[AssetManager] Failed to load ${src}`, e);
        // Resolve anyway to prevent game block, but log error
        resolve();
      };
    });
  }

  private cleanImage(img: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Chroma key: Remove near-black
        if (r < 30 && g < 30 && b < 30) {
          data[i + 3] = 0; // Alpha 0
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const newImg = new Image();
      newImg.onload = () => resolve(newImg);
      newImg.src = canvas.toDataURL('image/png');
    });
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  public isLoaded(): boolean {
    return this.loaded;
  }
}
