import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Camera } from '@ionic-native/camera/ngx';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule, StorageBucket } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { IonicStorageModule } from '@ionic/storage';
// import { FileTransfer } from '@ionic-native/file-transfer';
// import { File } from '@ionic-native/file';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularCropperjsModule,
    AngularFireModule.initializeApp(environment.firebase, "conv-toga"),
    AngularFirestoreModule,
    AngularFireStorageModule,
    HttpClientModule],
  providers: [
    { provide: StorageBucket, useValue:environment.firebase.storageBucket },
    StatusBar,
    SplashScreen, Camera,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
