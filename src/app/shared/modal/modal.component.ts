import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {

  @Input() modalID = ''

  constructor(public modal: ModalService, public el: ElementRef) {
  }

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);//* This will prevent the modal CSS of being effected by the parent element.
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement)
  }

  closeModal() {
    this.modal.toggleModal(this.modalID)
  }
}
