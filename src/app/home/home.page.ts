import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { NavController, LoadingController } from '@ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { CropperComponent } from 'angular-cropperjs';
import PureCnn from '../model/model';
import { LAYER_CONV, LAYER_FULLY_CONNECTED } from '../util/constant';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
export interface Item { nama: string;url:string; }
// import { FileTransfer } from '@ionic-native/file-transfer';
// import { File } from '@ionic-native/file';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('angularCropper') public angularCropper: CropperComponent
  bobotSelected:string;
  cropperOptions: any;
  myphoto: any = null;
  croppedImage: string;
  scaleValX = 1;
  scaleValY = 1;
  model: any;
  model_test: any;
  confidence: string;
  klas:string;
  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  labels: any[];
  constructor(private afs: AngularFirestore,
    public http:HttpClient,
    public actionSheet: ActionSheetController,
    private camera: Camera,
  ) {
    this.itemsCollection = afs.collection<Item>('items');
    this.items = this.itemsCollection.valueChanges();

    // this.myphoto="assets/jambu.jpg";
    this.myphoto="";
    this.confidence = "";
    this.model_test = 'assets/model.json';
    this.model = undefined;
    this.cropperOptions = {
      dragMode: 'crop',
      aspectRatio: 1,
      autoCrop: false,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8
    };
  }
  async sheet() {
    const actionSheet = await this.actionSheet.create({
      header: 'Ambil Gambar',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {

          }
        },
        {
          text: 'Kamera',
          role: 'destructive',
          icon: 'camera',
          handler: () => this.takePhoto()
        },
        {
          text: 'Gallery',
          icon: 'image',
          handler: () => this.getImageInGalery()
        }]
    });
    await actionSheet.present();
  }
  takePhoto() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.myphoto = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      // Handle error
    });
  }
  save() {
    let croppedImgB64Str: any = this.angularCropper.cropper.getCroppedCanvas({ width: 226, height: 226 }).toDataURL('image/jpeg', (100 / 100));
    console.log(this.angularCropper.cropper.getImageData());
    this.croppedImage = croppedImgB64Str;
    this.reset();
  }
  reset() {
    this.angularCropper.cropper.reset();
  }
  clear() {
    this.angularCropper.cropper.clear();
  }
  rotate(deg) {
    this.angularCropper.cropper.rotate(deg);
  }
  zoom(zoomIn: boolean) {
    let factor = zoomIn ? 0.1 : -0.1;
    this.angularCropper.cropper.zoom(factor);
  }
  scaleX() {
    this.scaleValX = this.scaleValX * -1;
    this.angularCropper.cropper.scaleX(this.scaleValX);
  }
  enable() {
    this.angularCropper.cropper.enable();
  }
  disable() {
    this.angularCropper.cropper.disable();
  }
  scaleY() {
    this.scaleValY = this.scaleValY * -1;
    this.angularCropper.cropper.scaleY(this.scaleValY);
  }
  move(x, y) {
    this.angularCropper.cropper.move(x, y);
  }

  getImageInGalery() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.myphoto = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      // Handle error
    });
  }

  cropImage() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      allowEdit: true,
      targetWidth: 300,
      targetHeight: 300
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.croppedImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    });
  }
  imagePredict() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      let ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, 64, 64);
      let pixelData = ctx.getImageData(0, 0, 64, 64);
      console.log(pixelData);
      console.log(this.model);
      this.predict(pixelData);
    };
    img.src = this.croppedImage;
  }
  predict(inputImageData) {
    // const inputImageData = this.getImage();

    if (this.model === undefined) return;

    const result = this.model.predict([inputImageData]);
    console.log(result);
    let guess = 0;
    let max = 0;
    for (let i = 0; i < 10; ++i) {
      if (result[0].get_value_by_coordinate(0, 0, i) > max) {
        max = result[0].get_value_by_coordinate(0, 0, i);
        guess = i;
      }
    }
    // this.klas = ( max > 0.866667 ) ? String(guess) : String(max);
    this.confidence = String(Math.min(100, Math.floor(1000 * (max + 0.1)) / 10.0)) + "% adalah " + String(this.labels[guess]);
  }

  loadModelFromJson(model_json) {
    this.model = new PureCnn();

    if (model_json.momentum !== undefined) this.model.set_momentum(model_json.momentum);
    this.labels=model_json.labels 
    if (model_json.l2 !== undefined) this.model.set_l2(model_json.l2);
    if (model_json.learning_rate !== undefined) this.model.set_learning_rate(model_json.learning_rate);

    for (let layer_index = 0; layer_index < model_json.layers.length; ++layer_index) {
      let layerDesc = model_json.layers[layer_index];
      this.model.add_layer(layerDesc);
    }
    for (let layerIndex = 0; layerIndex < model_json.layers.length; ++layerIndex) {
      let layerDesc = model_json.layers[layerIndex];

      switch (model_json.layers[layerIndex].type) {
        case LAYER_CONV:
            this.model.layers[layerIndex].set_params(layerDesc.weight, layerDesc.biases);
          break;
        case LAYER_FULLY_CONNECTED:
            this.model.layers[layerIndex].set_params(layerDesc.weight, layerDesc.biases);
          break;
        default:
          break;
      }
    }
  }

  async readJson(model) {
    // const res = await fetch(model,{mode: 'no-cors'});
    this.http.get(model).subscribe((data)=>{

      console.log(data);
      this.loadModelFromJson(data);
    });
    // const data = await res.json();
  }

  onChange(event){
    console.log(event);
      try {
        
    this.readJson(this.bobotSelected);
    
  
    //   const url = 'https://api.example.com';
    //   const params = {};
    //   const headers = {};

    //   const response = await this.http.get(url, params, headers);

    //   console.log(response.status);
    //   console.log(JSON.parse(response.data)); // JSON data returned by server
    //   console.log(response.headers);

    } catch (error) {
      console.log(error);
    }

  }

  ngOnInit() {
    this.readJson(this.model_test);
  }
  // uploadImage(){
  //    //Show loading
  //    let loader = this.loadingCtrl.create({
  //      content: "Uploading..."
  //    });
  //    loader.present();

  //    //create file transfer object
  //    const fileTransfer: FileTransferObject = this.transfer.create();

  //    //random int
  //    var random = Math.floor(Math.random() * 100);

  //    //option transfer
  //    let options: FileUploadOptions = {
  //      fileKey: 'photo',
  //      fileName: "myImage_" + random + ".jpg",
  //      chunkedMode: false,
  //      httpMethod: 'post',
  //      mimeType: "image/jpeg",
  //      headers: {}
  //    }

  //    //file transfer action
  //      .then((data) => {
  //        alert("Success");
  //        loader.dismiss();
  //      }, (err) => {
  //        console.log(err);
  //        alert("Error");
  //        loader.dismiss();
  //      });
  //  }
}
