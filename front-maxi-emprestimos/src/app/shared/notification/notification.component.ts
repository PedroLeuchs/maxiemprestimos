import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Notification,
  NotificationService,
  NotificationType,
} from '../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  getIconClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'material-icons text-green-500';
      case NotificationType.ERROR:
        return 'material-icons text-red-500';
      case NotificationType.WARNING:
        return 'material-icons text-amber-500';
      case NotificationType.INFO:
        return 'material-icons text-blue-500';
      default:
        return 'material-icons';
    }
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'check_circle';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.INFO:
        return 'info';
      default:
        return 'notifications';
    }
  }

  getBackgroundClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 border border-green-300';
      case NotificationType.ERROR:
        return 'bg-red-50 border border-red-300';
      case NotificationType.WARNING:
        return 'bg-yellow-50 border border-yellow-300';
      case NotificationType.INFO:
        return 'bg-blue-50 border border-blue-300';
      default:
        return 'bg-gray-50 border border-gray-300';
    }
  }

  close(id: number): void {
    this.notificationService.removeNotification(id);
  }
}
