import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';
import {
  EmprestimoService,
  Emprestimo,
} from '../../services/emprestimo.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-emprestimos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './emprestimos.component.html',
  styleUrl: './emprestimos.component.css',
})
export class EmprestimosComponent implements OnInit {
  emprestimoForm!: FormGroup;
  emprestimos: Emprestimo[] = [];

  clients: Client[] = [];
  filteredClients: Client[] = [];
  moedasDisponiveis: any[] = [];
  searchTerm: string = '';
  selectedClient: Client | null = null;
  numeroMeses: number = 0;
  valorPagar: number = 0;
  valorObtido: number = 0;
  taxaConversao: number = 0;
  valorEmReais: number = 0;
  taxaJuros = 0.015;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private emprestimoService: EmprestimoService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadEmprestimos();
    this.loadMoedas();

    this.emprestimoForm.valueChanges.subscribe(() => {
      this.calcularValores();
    });

    this.emprestimoForm.get('moeda')?.valueChanges.subscribe((moeda) => {
      if (moeda) {
        this.currencyService.getCotacaoAtual(moeda).subscribe((cotacao) => {
          if (cotacao !== null) {
            this.emprestimoForm.patchValue({ taxaConversao: cotacao });
          } else {
            this.emprestimoForm.patchValue({ taxaConversao: null });
          }
        });
      }
    });
  }

  loadMoedas(): void {
    this.currencyService.getMoedas().subscribe((res) => {
      this.moedasDisponiveis = res.value;
    });
  }

  initForm(): void {
    this.emprestimoForm = this.fb.group({
      client: ['', Validators.required],
      moeda: ['', Validators.required],
      valorObtido: [null, [Validators.required, Validators.min(1)]],
      taxaConversao: [{ value: 5.0, disabled: true }],
      dataVencimento: ['', Validators.required],
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
      this.filteredClients = [];
    });
  }

  loadEmprestimos(): void {
    this.emprestimoService.getEmprestimos().subscribe((data) => {
      this.emprestimos = data;
    });
  }

  filterClients(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();

    if (!this.searchTerm) {
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.clients.filter(
      (client) =>
        client.nome.toLowerCase().includes(this.searchTerm) ||
        client.cpf.includes(this.searchTerm)
    );
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.emprestimoForm.patchValue({
      client: `${client.nome} - ${client.cpf}`,
    });
    this.filteredClients = [];
    this.notificationService.info(`Cliente selecionado: ${client.nome}`);
  }

  calcularValores(): void {
    const valorFormulario = this.emprestimoForm.get('valorObtido')?.value;
    const dataVencimento = this.emprestimoForm.get('dataVencimento')?.value;
    const taxaConversaoAtual = this.emprestimoForm.get('taxaConversao')?.value;

    this.valorObtido = valorFormulario || 0;
    this.taxaConversao = taxaConversaoAtual || 0;

    if (!valorFormulario || !dataVencimento || !taxaConversaoAtual) {
      this.numeroMeses = 0;
      this.valorPagar = 0;
      this.valorEmReais = 0;
      return;
    }

    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffMeses =
      (vencimento.getFullYear() - hoje.getFullYear()) * 12 +
      (vencimento.getMonth() - hoje.getMonth());

    this.numeroMeses = Math.max(0, diffMeses);

    const taxaJuros = 0.015;
    this.valorPagar =
      this.valorObtido * Math.pow(1 + taxaJuros, this.numeroMeses);

    this.valorEmReais = this.valorPagar * this.taxaConversao;
  }

  onSubmit(): void {
    if (this.emprestimoForm.invalid || !this.selectedClient) {
      const missingFields: string[] = [];

      const controls = this.emprestimoForm.controls;

      if (controls['client'].invalid) {
        missingFields.push('cliente');
      }
      if (controls['moeda'].invalid) {
        missingFields.push('moeda');
      }
      if (controls['valorObtido'].invalid) {
        missingFields.push('valorObtido');
      }
      if (controls['dataVencimento'].invalid) {
        missingFields.push('dataVencimento');
      }
      if (!this.selectedClient) {
        missingFields.push('seleção do cliente');
      }

      this.notificationService.error(
        `Não foi possível cadastrar o empréstimo: ${missingFields.join(', ')} ${
          missingFields.length === 1 ? 'é' : 'são'
        } obrigatório${missingFields.length === 1 ? '' : 's'}.`
      );
      return;
    }

    const formValue = this.emprestimoForm.value;
    const dataFormatada = new Date(formValue.dataVencimento)
      .toISOString()
      .split('T')[0];

    const taxaConversaoAtual =
      this.emprestimoForm.get('taxaConversao')?.value || 5.0;
    const novoEmprestimo: Emprestimo = {
      cliente: {
        idCliente: this.selectedClient.idCliente!,
        nome: this.selectedClient.nome,
        cpf: this.selectedClient.cpf,
      },
      moeda: formValue.moeda,
      valorObtido: formValue.valorObtido,
      taxaConversao: taxaConversaoAtual,
      dataVencimento: dataFormatada,
      valorPagar: this.valorPagar,
      numeroMeses: this.numeroMeses,
    };

    this.emprestimoService.addEmprestimo(novoEmprestimo).subscribe(
      () => {
        this.loadEmprestimos();
        this.emprestimoForm.reset();
        this.selectedClient = null;
        this.numeroMeses = 0;
        this.valorPagar = 0;
        this.valorObtido = 0;
        this.taxaConversao = 0;
        this.valorEmReais = 0;
        this.notificationService.success(
          `Empréstimo para ${novoEmprestimo.cliente.nome} cadastrado com sucesso!`
        );
      },
      (error) => {
        this.notificationService.error(
          `Erro ao cadastrar empréstimo: ${error.message}`
        );
      }
    );
  }

  deleteEmprestimo(emprestimo: Emprestimo): void {
    if (emprestimo.idEmprestimo) {
      this.emprestimoService
        .deleteEmprestimo(emprestimo.idEmprestimo)
        .subscribe(
          () => {
            this.loadEmprestimos();
            this.notificationService.success(
              `Empréstimo para ${emprestimo.cliente.nome} deletado com sucesso!`
            );
          },
          (error) => {
            this.notificationService.error(
              `Erro ao deletar empréstimo: ${error.message}`
            );
          }
        );
    }
  }
}
