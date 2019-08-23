export default class ContrastStretching {
    pixelData: any;
    r1: any;
    r2: any;
    s1: any;
    s2: any;
    constructor(pixelData, r1, r2, s1, s2) {
        this.pixelData = pixelData;
        this.r1 = r1;
        this.r2 = r2;
        this.s1 = s1;
        this.s2 = s2;
        this.runRgb();
    }
    rule(r) {
        if (r >= 0 && r <= this.r1) return this.S1(r);
        if (r >= this.r1 && r <= this.r2) return this.S2(r);
        if (r >= this.r2 && r <= 1) return this.S3(r);
    }
    S1(r) {
        return r * (this.s1 / this.r1);
    }
    S2(r) {
        return this.s1 + ((r - this.r1) * (this.s2 - this.s1)) / (this.r2 - this.r1);

    }
    S3(r) {
        return this.s2 + ((r - this.r2) * (1 - this.s2)) / (1 - this.r2);
    }
    runRgb() {
        let pixelBaru = 0;

        for (let j = 0; j < this.pixelData.data.length; j++) {
            let r = this.pixelData.data[j] / 255;
            pixelBaru = this.rule(r) * 255;
            this.pixelData.data[j] = Math.abs(Math.floor(pixelBaru));
        }
    }
}