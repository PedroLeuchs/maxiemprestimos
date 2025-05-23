import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../services/client.service';
import {
  NotificationService,
  NotificationType,
} from '../../services/notification.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
})
export class ClientsComponent implements OnInit {
  clientForm!: FormGroup;
  clients: Client[] = [];
  editingClient: Client | null = null;

  // Modal de confirmação
  showDeleteModal = false;
  clientToDelete: Client | null = null;
  modalTitle = 'Confirmar exclusão';
  modalMessage = 'Tem certeza que deseja excluir este cliente?';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data.map((client) => ({
        idCliente: client.idCliente,
        nome: client.nome,
        cpf: client.cpf,
        telefone: client.telefone,
        email: client.email,
      }));
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      const missingFields: string[] = [];

      const controls = this.clientForm.controls;

      if (controls['nome'].invalid) {
        missingFields.push('nome');
      }

      if (controls['cpf'].invalid) {
        missingFields.push('CPF');
      }

      if (controls['telefone'].invalid) {
        missingFields.push('telefone');
      }

      if (controls['email'].invalid) {
        missingFields.push('e-mail');
      }

      this.notificationService.error(
        `Não foi possível ${
          this.editingClient ? 'atualizar' : 'cadastrar'
        } o cliente: ${missingFields.join(', ')} ${
          missingFields.length === 1 ? 'é' : 'são'
        } obrigatório${missingFields.length === 1 ? '' : 's'}`
      );

      return;
    }

    const formValue = this.clientForm.value;

    if (this.editingClient) {
      const updatedClient: Client = {
        idCliente: this.editingClient.idCliente,
        ...formValue,
      };

      this.clientService.updateClient(updatedClient).subscribe(
        () => {
          this.loadClients();
          this.clientForm.reset();
          this.notificationService.success(
            `Cliente ${updatedClient.nome} atualizado com sucesso!`
          );
          this.editingClient = null;
        },
        (error) => {
          this.notificationService.error(
            `Erro ao atualizar cliente: ${error.message}`
          );
        }
      );
    } else {
      this.clientService.addClient(formValue).subscribe(
        () => {
          this.loadClients();
          this.clientForm.reset();
          this.notificationService.success(
            `Cliente ${formValue.nome} cadastrado com sucesso!`
          );
        },
        (error) => {
          this.notificationService.error(
            `Erro ao cadastrar cliente: ${error.message}`
          );
        }
      );
    }
  }

  editClient(client: Client): void {
    this.editingClient = client;
    this.clientForm.patchValue({
      nome: client.nome,
      cpf: client.cpf,
      telefone: client.telefone,
      email: client.email,
    });
    this.notificationService.info(`Editando cliente: ${client.nome}`);
  }
  deleteClient(client: Client): void {
    this.clientToDelete = client;
    this.modalMessage = `Tem certeza que deseja excluir o cliente "${client.nome}"?`;
    this.showDeleteModal = true;
  }

  confirmDeleteClient(): void {
    if (this.clientToDelete) {
      this.clientService.deleteClient(this.clientToDelete.idCliente!).subscribe(
        () => {
          this.loadClients();
          this.notificationService.success(
            `Cliente ${this.clientToDelete!.nome} deletado com sucesso!`
          );
          this.showDeleteModal = false;
          this.clientToDelete = null;
        },
        (error) => {
          this.notificationService.error(
            `Erro ao deletar cliente: ${error.message}`
          );
          this.showDeleteModal = false;
          this.clientToDelete = null;
        }
      );
    }
  }

  cancelDeleteClient(): void {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  cancelEdit(): void {
    this.editingClient = null;
    this.clientForm.reset();
    this.notificationService.info('Edição cancelada.');
  }
}
