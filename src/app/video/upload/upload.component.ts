import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { last, switchMap, combineLatest, forkJoin } from 'rxjs';
import { v4 as uuid } from 'uuid'; //* to create an unique id;
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';//* untuk buat screenshot clip yang telah di upload user

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  isDragover = false;
  file: File | null = null;
  nextStep = false;

  showAlert = false;
  alertColor = 'blue';
  alertMsg ='Please wait, your vidio is being uploaded.';
  inSubmission = false;

  percentage = 0;
  showPercentage = false;

  user: firebase.User | null = null;

  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;

  task?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  });

  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage: AngularFireStorage, 
    private auth: AngularFireAuth, 
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService

    ) {
    auth.user.subscribe(user => this.user = user);
    this.ffmpegService.init();
   }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning) return;

    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer ?
    ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
    ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if(!this.file || this.file.type !== 'video/mp4') return;
    // if(!this.file || this.file.type !== 'audio/mp3') return;

    this. screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.selectedScreenshot = this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )

    this.nextStep = true;
    
  }

  async uploadFile() {

    this.uploadForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait, your vidio is being uploaded.';
    this.inSubmission = true;

    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    const screenshotRef = this.storage.ref(screenshotPath);

    // this.task.percentageChanges().subscribe(progress => {
    //   this.percentage = progress as number / 100;
    // });
    combineLatest([this.task.percentageChanges(), this.screenshotTask.percentageChanges()]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if(!clipProgress || !screenshotProgress) return;

      const total = clipProgress + screenshotProgress;

      this.percentage = total as number / 200;
    });

    // this.task.snapshotChanges().pipe(
    forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()]).pipe(
      // last(),//waiting the last observable to finish
      switchMap(() => forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()]))
    ).subscribe({
      next: async (urls) => {
        const [clipURL, screenshotURL] = urls;

        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url: clipURL,
          screenshotURL,
          screenshotFileName: `${clipFileName}.png`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipsService.createClip(clip)

        // console.log(clip);
        

        this.alertColor = 'green'
        this.alertMsg = 'Your video is shared'
        this.showPercentage = false;

        setTimeout(() => {
          this.router.navigate([
            'clip', clipDocRef.id
          ])
        }, 1000);
      },
      error: (error) => {
        this.uploadForm.enable();

        this.alertColor = 'red'
        this.alertMsg = 'Upload failed.'
        this.inSubmission = true;
        this.showPercentage = false;
        console.error(error);
        
      }
    })
  }

}
