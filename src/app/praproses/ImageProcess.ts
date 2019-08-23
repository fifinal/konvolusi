import ContrastStretching from './ContrastStretching';

export default class ImageProses {
    pixels: any;
    constructor(pixels) {
        this.pixels = pixels;
        // console.log(this.pixels)
    }
    threshold(t) {
        let d = this.pixels.data;
        let total = 0;
        for (let i = 0; i < d.length; i += 4) {
            total += d[i + 1];
        }
        let threshold = Math.floor(total / (d.length / 4));
        console.log(total, t);
        // d[Math.ceil(d.length/4/2)];
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 1] > parseInt(t)) {
                d[i] = 0;
                d[i + 1] = 0;
                d[i + 2] = 0;
                d[i + 3] = 0;
            }
        }
    }

    sharpen(opaque, ctx) {
        let weights=[0, -1, 0, -1, 5, -1, 0, -1, 0];
        let side = Math.round(Math.sqrt(weights.length));
        let halfSide = Math.floor(side / 2);
        let src = this.pixels.data;
        let w = this.pixels.width;
        let h = this.pixels.height;

        let output = ctx.createImageData(w, h);
        let alphaFac = opaque ? 1 : 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sy = y;
                let sx = x;
                let dstOff = (y * w + x) * 4;
                // calculate the weighed sum of the source image this.pixels that
                // fall under the convolution matrix
                let r = 0,
                    g = 0,
                    b = 0,
                    a = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        let scy = sy + cy - halfSide;
                        let scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                            let srcOff = (scy * w + scx) * 4;
                            let wt = weights[cy * side + cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                output.data[dstOff] = r;
                output.data[dstOff + 1] = g;
                output.data[dstOff + 2] = b;
                output.data[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        this.pixels = output;
    };
    contrastStretching() {
        const cs=new ContrastStretching(this.pixels, 0.20, 0.45, 0.15, 0.55);
        this.pixels=cs.pixelData;
    }
}
