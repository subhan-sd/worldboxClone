export interface OverWorldNpcConfig {
    element: HTMLElement,
    canvas: string,
  };
  
export class OverWorld {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private static imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(config: OverWorldNpcConfig) {
    this.element = config.element;
    this.canvas = this.element.querySelector(`.${config.canvas}`) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
  }

  clearCanvas(){ 
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
  }

  private getImage(src: string): HTMLImageElement {
    let img = OverWorld.imageCache.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      OverWorld.imageCache.set(src, img);
    }
    return img;
  }

  renderNpc(
      clearCanvas : boolean = false,
      img : string = "../../assets/img/npcAdam.png",
      currentX : number = 0,
      currentY : number = 0,
      leftCut : number = 0,
      topCut : number = 0,
      widthOfCut : number = 64,  
      heightOfCut : number = 64,
      sizeToDraw1 : number = 64,
      sizeToDraw2 : number = 64
    ){ 
    if(clearCanvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 
    const hero = this.getImage(img);
    const draw = () => {
      this.ctx.imageSmoothingEnabled = false; 
      this.ctx.drawImage(
        hero,
        leftCut,
        topCut,
        widthOfCut,
        heightOfCut,
        currentX,
        currentY,
        sizeToDraw1,
        sizeToDraw2
      );
    };
    if (hero.complete && hero.naturalWidth > 0) {
      draw();
    } else {
      hero.onload = () => draw();
    }
  }

}
