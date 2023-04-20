import { Injectable } from '@angular/core';

interface IModal {
  id: String;
  visible: Boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];
  constructor() { }

  register(id: String) {
    this.modals.push({
      id,
      visible: false,
    });
  }

  unregister(id: string) {
    this.modals = this.modals.filter(element => element.id !== id)
  }


  isModalOpen(id: string): boolean {
    //* 2 Line return di bawah bisa di gunakan
    return Boolean(this.modals.find(element => element.id === id)?.visible)
    // return !!this.modals.find(element => element.id === id)?.visible
  }

  toggleModal(id: string) {
    const modal = this.modals.find(element => element.id === id)

    if (modal) modal.visible = !modal.visible;
  }
}
