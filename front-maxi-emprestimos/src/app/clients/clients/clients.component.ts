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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationModalComponent,
    NgxMaskDirective,
  ],
  providers: [
    provideNgxMask({
      validation: false,
      dropSpecialCharacters: false,
    }),
  ],
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
      nome: [
        '',
        [Validators.required, Validators.minLength(3), this.naoComecaComNumero],
      ],
      cpf: [
        '',
        [
          Validators.required,
          // Validação mais flexível para CPF (com ou sem pontos e traços)
          Validators.minLength(11),
        ],
      ],
      telefone: [
        '',
        [
          Validators.required,
          // Validação mais flexível para telefone
          Validators.minLength(10),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, this.naoComecaComNumero],
      ],
    });
  }

  // Validador personalizado para garantir que o valor não comece com número
  naoComecaComNumero(control: {
    value: string;
  }): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const comecaComNumero = /^[0-9]/.test(control.value);
    return comecaComNumero ? { comecaComNumero: true } : null;
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

    // Obtenha os valores do formulário e garanta que os formatos estejam corretos
    const formValue = { ...this.clientForm.value };

    // Se o formato não estiver de acordo com a máscara, formate-o
    if (formValue.cpf) {
      const cpfNormalizado = this.normalizeCpf(formValue.cpf);
      if (cpfNormalizado.length === 11) {
        formValue.cpf = `${cpfNormalizado.substring(
          0,
          3
        )}.${cpfNormalizado.substring(3, 6)}.${cpfNormalizado.substring(
          6,
          9
        )}-${cpfNormalizado.substring(9, 11)}`;
      }
    }

    // Formatação do telefone se necessário
    if (formValue.telefone) {
      const telNormalizado = this.normalizeTelefone(formValue.telefone);
      if (telNormalizado.length >= 10) {
        formValue.telefone = `(${telNormalizado.substring(
          0,
          2
        )}) ${telNormalizado.substring(2, 7)}-${telNormalizado.substring(7)}`;
      }
    }

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

    // Garantir que os dados do cliente estejam no formato correto para a edição
    const cpfFormatado =
      client.cpf && !client.cpf.includes('.')
        ? `${client.cpf.substring(0, 3)}.${client.cpf.substring(
            3,
            6
          )}.${client.cpf.substring(6, 9)}-${client.cpf.substring(9, 11)}`
        : client.cpf;

    const telefoneFormatado =
      client.telefone && !client.telefone.includes('(')
        ? `(${client.telefone.substring(0, 2)}) ${client.telefone.substring(
            2,
            7
          )}-${client.telefone.substring(7)}`
        : client.telefone;

    this.clientForm.patchValue({
      nome: client.nome,
      cpf: cpfFormatado,
      telefone: telefoneFormatado,
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

  // Método para normalizar CPF (remover caracteres especiais)
  normalizeCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }

  // Método para normalizar telefone (remover caracteres especiais)
  normalizeTelefone(telefone: string): string {
    return telefone ? telefone.replace(/\D/g, '') : '';
  }

  cancelEdit(): void {
    this.editingClient = null;
    this.clientForm.reset();
    this.notificationService.info('Edição cancelada.');
  }
}
