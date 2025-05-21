import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Notification {
  type: NotificationType;
  message: string;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private counter = 0;

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  // Adiciona uma nova notificação
  addNotification(type: NotificationType, message: string): number {
    const id = this.counter++;
    const notification: Notification = { type, message, id };

    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, notification]);

    // Remove a notificação após 5 segundos
    setTimeout(() => this.removeNotification(id), 5000);

    return id;
  }

  // Exibe uma notificação de sucesso
  success(message: string): number {
    return this.addNotification(NotificationType.SUCCESS, message);
  }

  // Exibe uma notificação de erro
  error(message: string): number {
    return this.addNotification(NotificationType.ERROR, message);
  }

  // Exibe uma notificação informativa
  info(message: string): number {
    return this.addNotification(NotificationType.INFO, message);
  }

  // Exibe uma notificação de aviso
  warning(message: string): number {
    return this.addNotification(NotificationType.WARNING, message);
  }

  // Remove uma notificação específica
  removeNotification(id: number): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(
      currentNotifications.filter((notification) => notification.id !== id)
    );
  }

  // Remove todas as notificações
  clearNotifications(): void {
    this.notifications.next([]);
  }
}
