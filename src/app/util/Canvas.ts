// class Canvas{
// 	public canvas: any;
// 	public height: any;
// 	public width: any;
// 	public ctx: any;
// 	public pixelData: any;
// 	public nilaiGrayscale: any;

//         constructor(idCanvas){
//           this.canvas=document.getElementById(idCanvas);
//           this.height=this.canvas.height;
//           this.width=this.canvas.width;
//           this.ctx=this.canvas.getContext('2d');          
//          }
//         grayscale(){
//           let j=0,grey=0,panjang=[];
//           for(let y = 0; y < this.height; y++){
//             let lebar=[];
//             for(let x = 0; x < this.width; x++){
//               grey=parseInt(
//                     0.2*this.pixelData.data[j]+
//                     0.72*this.pixelData.data[j+1]+
//                     0.07*this.pixelData.data[j+2]);
//               this.pixelData.data[j]=this.pixelData.data[j+1]=this.pixelData.data[j+2]=grey;
//               lebar.push(grey);
//               j+=4;
//             }
//             panjang.push(lebar);
//             this.nilaiGrayscale=panjang;
//           }
//         }
//         draw(image) {
//           this.ctx.drawImage(image,0,0,this.width,this.height);
//           this.pixelData=this.ctx.getImageData(0,0,this.width,this.height);
//          }
//         update(canvasTujuan){
//           // alert(this.pixelData);
//           let canvas=document.getElementById(canvasTujuan);
//           let ctx=canvas.getContext('2d');
//           ctx.putImageData(this.pixelData,0,0);
//           // setTimeout(()=>{
//           //   this.update(canvasTujuan);
//           // },1);
//           return canvas.toDataURL();
//          }
//          up(canvasTujuan){
//           let canvas=document.getElementById('canvas');
//           let ctx=canvas.getContext('2d');
//           ctx.putImageData(this.pixelData,0,0);
//          }

//      }