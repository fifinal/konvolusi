export default class Shape {
	public width: any;
	public height: any;
	public depth: any;

    constructor(width, height, depth) {
        this.width = Math.floor(width);
        this.height = Math.floor(height);
        this.depth = Math.floor(depth);
    }

    get_size() {
        return this.width * this.height * this.depth;
    }
}