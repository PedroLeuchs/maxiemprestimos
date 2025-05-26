import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ClientService, Client } from '../../services/client.service';
import {
  EmprestimoService,
  Emprestimo,
} from '../../services/emprestimo.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { EmprestimoDetailsModalComponent } from '../emprestimo-details-modal/emprestimo-details-modal.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-emprestimos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ConfirmationModalComponent,
    EmprestimoDetailsModalComponent,
    NgxMaskDirective,
  ],
  providers: [
    provideNgxMask({
      validation: false,
      dropSpecialCharacters: false,
    }),
  ],
  templateUrl: './emprestimos.component.html',
  styleUrl: './emprestimos.component.css',
})
export class EmprestimosComponent implements OnInit {
  emprestimoForm!: FormGroup;
  emprestimos: Emprestimo[] = [];
  emprestimosFiltrados: Emprestimo[] = []; // Para armazenar os empréstimos filtrados

  // Filtros e ordenação
  filtroForm!: FormGroup;
  ordenarPor: string = 'dataVencimento';
  ordenarAsc: boolean = true;

  clients: Client[] = [];
  filteredClients: Client[] = [];
  moedasDisponiveis: any[] = [];
  searchTerm: string = '';
  selectedClient: Client | null = null;
  numeroMeses: number = 0;
  valorPagar: number = 0;
  valorPagarReais: number = 0; // Valor a pagar em reais
  valorObtido: number = 0;
  taxaConversao: number = 0;
  valorEmReais: number = 0;
  valorIOFReais: number = 0; // Valor do IOF em reais
  taxaJuros = 0.015;
  taxaIOF = 0.035; // Taxa fixa de IOF de 3,5%
  mostrarFiltros = true;
  isMouseOverClientList = false;
  dropdownAberto = false;
  // Propriedades para o modal de confirmação
  showDeleteModal = false;
  emprestimoToDelete: Emprestimo | null = null;
  modalTitle = 'Confirmar exclusão';
  modalMessage = 'Tem certeza que deseja excluir este empréstimo?';

  // Propriedades para o modal de detalhes
  showDetailsModal = false;
  emprestimoDetails: Emprestimo | null = null;

  // Propriedades para edição de empréstimos
  isEditMode = false;
  emprestimoToEdit: Emprestimo | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private emprestimoService: EmprestimoService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initFiltroForm();
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

    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  // Validador customizado para data futura
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Se não há valor, não valida (deixa para o required)
    }

    const inputDate = new Date(control.value);
    const today = new Date();

    // Zera as horas para comparar apenas as datas
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate <= today) {
      return {
        futureDate: {
          message: 'A data de vencimento deve ser futura',
          actualDate: control.value,
          minDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // Amanhã
        },
      };
    }

    return null;
  }

  alternarFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  // Inicializar o formulário de filtro
  initFiltroForm(): void {
    this.filtroForm = this.fb.group({
      clienteNome: [''],
      moeda: [''],
      dataInicial: [''],
      dataFinal: [''],
      valorMinimo: [''],
      valorMaximo: [''],
    });
  }

  // Aplicar filtros à lista de empréstimos
  aplicarFiltros(): void {
    let emprestimosTemp = [...this.emprestimos];
    const filtros = this.filtroForm.value;

    // Filtrar por nome do cliente
    if (filtros.clienteNome) {
      const termoBusca = filtros.clienteNome.toLowerCase();
      emprestimosTemp = emprestimosTemp.filter((emp) =>
        emp.cliente.nome?.toLowerCase().includes(termoBusca)
      );
    }

    // Filtrar por moeda
    if (filtros.moeda) {
      emprestimosTemp = emprestimosTemp.filter(
        (emp) => emp.moeda === filtros.moeda
      );
    }

    // Filtrar por data inicial
    if (filtros.dataInicial) {
      const dataInicial = new Date(filtros.dataInicial);
      emprestimosTemp = emprestimosTemp.filter(
        (emp) => new Date(emp.dataVencimento) >= dataInicial
      );
    }

    // Filtrar por data final
    if (filtros.dataFinal) {
      const dataFinal = new Date(filtros.dataFinal);
      emprestimosTemp = emprestimosTemp.filter(
        (emp) => new Date(emp.dataVencimento) <= dataFinal
      );
    }

    // Filtrar por valor mínimo
    if (filtros.valorMinimo) {
      emprestimosTemp = emprestimosTemp.filter(
        (emp) => emp.valorObtido >= filtros.valorMinimo
      );
    }

    // Filtrar por valor máximo
    if (filtros.valorMaximo) {
      emprestimosTemp = emprestimosTemp.filter(
        (emp) => emp.valorObtido <= filtros.valorMaximo
      );
    }

    // Aplicar ordenação
    this.ordenarEmprestimos(emprestimosTemp);
  }

  // Método para ordenar os empréstimos
  ordenarEmprestimos(emprestimos: Emprestimo[]): void {
    const ordenados = emprestimos.sort((a, b) => {
      let valA, valB;

      switch (this.ordenarPor) {
        case 'cliente':
          valA = a.cliente.nome?.toLowerCase() || '';
          valB = b.cliente.nome?.toLowerCase() || '';
          break;
        case 'valorObtido':
          valA = a.valorObtido;
          valB = b.valorObtido;
          break;
        case 'moeda':
          valA = a.moeda;
          valB = b.moeda;
          break;
        case 'dataVencimento':
        default:
          valA = new Date(a.dataVencimento).getTime();
          valB = new Date(b.dataVencimento).getTime();
          break;
      }

      if (valA < valB) return this.ordenarAsc ? -1 : 1;
      if (valA > valB) return this.ordenarAsc ? 1 : -1;
      return 0;
    });

    this.emprestimosFiltrados = ordenados;
  }

  // Mudar a ordem da lista
  alterarOrdenacao(campo: string): void {
    if (this.ordenarPor === campo) {
      this.ordenarAsc = !this.ordenarAsc;
    } else {
      this.ordenarPor = campo;
      this.ordenarAsc = true;
    }
    this.aplicarFiltros();
  }

  // Limpar todos os filtros
  limparFiltros(): void {
    this.filtroForm.reset();
    this.ordenarPor = 'dataVencimento';
    this.ordenarAsc = true;
    this.aplicarFiltros();
  }

  loadMoedas(): void {
    this.currencyService.getMoedas().subscribe((res) => {
      this.moedasDisponiveis = res.value;
    });
  }

  initForm(): void {
    this.emprestimoForm = this.fb.group({
      client: this.fb.control('', Validators.required),
      moeda: this.fb.control('', Validators.required),
      valorObtido: this.fb.control('', [
        Validators.required,
        Validators.min(0.01),
      ]),
      taxaConversao: this.fb.control('', Validators.required),
      dataVencimento: this.fb.control('', [
        Validators.required,
        this.futureDateValidator,
      ]),
    });
  }

  private parseDecimalBR(value: string | number): number {
    if (typeof value === 'string') {
      return parseFloat(value.replace('.', '').replace(',', '.')) || 0;
    }
    return value || 0;
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
      this.emprestimosFiltrados = [...data]; // Inicializa a lista filtrada com todos os empréstimos
      this.aplicarFiltros(); // Aplica os filtros se houver algum ativo
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

  onClientInputFocus(): void {
    // Mostra todos os clientes apenas se o campo estiver vazio
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
    }
  }

  onClientInputBlur(): void {
    // Delay para permitir clique no item da lista
    setTimeout(() => {
      if (!this.isMouseOverClientList) {
        this.filteredClients = [];
      }
    }, 200);
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.emprestimoForm.patchValue({
      client: `${client.nome} - ${client.cpf}`,
    });
    this.filteredClients = [];
    this.searchTerm = '';
    this.notificationService.info(`Cliente selecionado: ${client.nome}`);
  }

  // Novo método para limpar a seleção do cliente
  clearClientSelection(): void {
    this.selectedClient = null;
    this.emprestimoForm.patchValue({
      client: '',
    });
    this.filteredClients = [];
    this.searchTerm = '';
    this.notificationService.info('Seleção de cliente removida');
  }
  calcularValores(): void {
    let valorFormulario = this.emprestimoForm.get('valorObtido')?.value;
    const dataVencimento = this.emprestimoForm.get('dataVencimento')?.value;
    let taxaConversaoAtual = this.emprestimoForm.get('taxaConversao')?.value;

    // Converter valores com vírgula para formato com ponto (para cálculos)
    if (typeof valorFormulario === 'string' && valorFormulario.includes(',')) {
      valorFormulario = parseFloat(valorFormulario.replace(',', '.'));
    }

    if (
      typeof taxaConversaoAtual === 'string' &&
      taxaConversaoAtual.includes(',')
    ) {
      taxaConversaoAtual = parseFloat(taxaConversaoAtual.replace(',', '.'));
    }

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

    // Cálculo do valor a pagar no vencimento (considerando juros)
    this.valorPagar =
      this.valorObtido * Math.pow(1 + this.taxaJuros, this.numeroMeses);

    // Cálculo do valor a pagar em reais
    this.valorPagarReais = this.valorPagar * this.taxaConversao;

    // Valor base em reais (sem IOF)
    const valorBaseReais = this.valorObtido * this.taxaConversao;

    // Calcula o valor do IOF em reais
    this.valorIOFReais = valorBaseReais * this.taxaIOF;

    // Valor total em reais (com IOF)
    this.valorEmReais = valorBaseReais - this.valorIOFReais;
  }
  onSubmit(): void {
    if (this.emprestimoForm.invalid || !this.selectedClient) {
      const errorMessages: string[] = [];
      const controls = this.emprestimoForm.controls;

      if (controls['client'].invalid) {
        errorMessages.push('Cliente é obrigatório');
      }
      if (controls['moeda'].invalid) {
        errorMessages.push('Moeda é obrigatória');
      }
      if (controls['valorObtido'].invalid) {
        if (controls['valorObtido'].errors?.['required']) {
          errorMessages.push('Valor obtido é obrigatório');
        } else if (controls['valorObtido'].errors?.['min']) {
          errorMessages.push('Valor obtido deve ser maior que zero');
        }
      }
      if (controls['dataVencimento'].invalid) {
        const dataVencimentoErrors = controls['dataVencimento'].errors;
        if (dataVencimentoErrors?.['required']) {
          errorMessages.push('Data de vencimento é obrigatória');
        } else if (dataVencimentoErrors?.['futureDate']) {
          errorMessages.push('A data de vencimento deve ser futura');
        }
      }
      if (controls['taxaConversao'].invalid) {
        errorMessages.push('Taxa de conversão é obrigatória');
      }
      if (!this.selectedClient) {
        errorMessages.push('É necessário selecionar um cliente');
      }

      this.notificationService.error(
        `Não foi possível ${
          this.isEditMode ? 'atualizar' : 'cadastrar'
        } o empréstimo:\n${errorMessages.join('\n• ')}`
      );
      return;
    }

    const formValue = this.emprestimoForm.value;
    const dataFormatada = new Date(formValue.dataVencimento)
      .toISOString()
      .split('T')[0];

    const valorObtidoFormatado = this.parseDecimalBR(formValue.valorObtido);
    const taxaConversaoAtual = this.parseDecimalBR(formValue.taxaConversao);

    if (this.isEditMode && this.emprestimoToEdit) {
      // Modo de edição
      const emprestimoAtualizado: Emprestimo = {
        idEmprestimo: this.emprestimoToEdit.idEmprestimo,
        cliente: {
          idCliente: this.selectedClient.idCliente!,
          nome: this.selectedClient.nome,
          cpf: this.selectedClient.cpf,
        },
        moeda: formValue.moeda,
        valorObtido: valorObtidoFormatado,
        taxaConversao: taxaConversaoAtual,
        dataVencimento: dataFormatada,
        valorPagar: this.valorPagar,
        numeroMeses: this.numeroMeses,
        taxaIOF: this.taxaIOF,
      };

      this.emprestimoService.updateEmprestimo(emprestimoAtualizado).subscribe(
        () => {
          this.loadEmprestimos();
          this.resetForm();
          this.notificationService.success(
            `Empréstimo para ${emprestimoAtualizado.cliente.nome} atualizado com sucesso!`
          );
        },
        (error) => {
          this.notificationService.error(
            `Erro ao atualizar empréstimo: ${error.message}`
          );
        }
      );
    } else {
      // Modo de criação
      const novoEmprestimo: Emprestimo = {
        cliente: {
          idCliente: this.selectedClient.idCliente!,
          nome: this.selectedClient.nome,
          cpf: this.selectedClient.cpf,
        },
        moeda: formValue.moeda,
        valorObtido: valorObtidoFormatado,
        taxaConversao: taxaConversaoAtual,
        dataVencimento: dataFormatada,
        valorPagar: this.valorPagar,
        numeroMeses: this.numeroMeses,
        taxaIOF: this.taxaIOF,
      };

      this.emprestimoService.addEmprestimo(novoEmprestimo).subscribe(
        () => {
          this.loadEmprestimos();
          this.resetForm();
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
  }

  // Método para resetar o formulário e os valores relacionados
  resetForm(): void {
    this.emprestimoForm.reset();
    this.selectedClient = null;
    this.isEditMode = false;
    this.emprestimoToEdit = null;
    this.numeroMeses = 0;
    this.valorPagar = 0;
    this.valorPagarReais = 0;
    this.valorObtido = 0;
    this.taxaConversao = 0;
    this.valorEmReais = 0;
    this.valorIOFReais = 0;
  }

  openDeleteModal(emprestimo: Emprestimo): void {
    this.emprestimoToDelete = emprestimo;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.emprestimoToDelete = null;
  }

  confirmDelete(): void {
    if (this.emprestimoToDelete) {
      this.deleteEmprestimo(this.emprestimoToDelete);
    }
    this.closeDeleteModal();
  }

  deleteEmprestimo(emprestimo: Emprestimo): void {
    this.emprestimoToDelete = emprestimo;
    this.modalMessage = `Tem certeza que deseja excluir o empréstimo para "${emprestimo.cliente.nome}"?`;
    this.showDeleteModal = true;
  }

  confirmDeleteEmprestimo(): void {
    if (this.emprestimoToDelete && this.emprestimoToDelete.idEmprestimo) {
      this.emprestimoService
        .deleteEmprestimo(this.emprestimoToDelete.idEmprestimo)
        .subscribe(
          () => {
            this.loadEmprestimos();
            this.notificationService.success(
              `Empréstimo para ${
                this.emprestimoToDelete!.cliente.nome
              } deletado com sucesso!`
            );
            this.showDeleteModal = false;
            this.emprestimoToDelete = null;
          },
          (error) => {
            this.notificationService.error(
              `Erro ao deletar empréstimo: ${error.message}`
            );
            this.showDeleteModal = false;
            this.emprestimoToDelete = null;
          }
        );
    }
  }

  cancelDeleteEmprestimo(): void {
    this.showDeleteModal = false;
    this.emprestimoToDelete = null;
  }

  // Métodos para o modal de detalhes
  viewEmprestimoDetails(emprestimo: Emprestimo): void {
    this.emprestimoDetails = emprestimo;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.emprestimoDetails = null;
  }

  // Método para exportar empréstimos para CSV
  exportarCSV(): void {
    if (this.emprestimosFiltrados.length === 0) {
      this.notificationService.warning('Não há empréstimos para exportar.');
      return;
    }

    // Cabeçalhos do CSV
    const cabecalhos = [
      'ID',
      'Cliente',
      'CPF',
      'Moeda',
      'Valor Obtido',
      'Cotação',
      'Data de Vencimento',
      'Valor a Pagar',
      'Valor em Reais',
      'Meses',
      'Taxa IOF',
    ];

    // Montar linhas de dados
    const linhas = this.emprestimosFiltrados.map((emp) => {
      const dataFormatada = new Date(emp.dataVencimento).toLocaleDateString(
        'pt-BR'
      );
      const valorEmReais = (
        emp.valorObtido *
        emp.taxaConversao *
        (1 - (emp.taxaIOF || 0.035))
      ).toFixed(2);
      const valorPagarReais = (emp.valorPagar * emp.taxaConversao).toFixed(2);

      return [
        emp.idEmprestimo || '',
        emp.cliente.nome || '',
        emp.cliente.cpf || '',
        emp.moeda,
        emp.valorObtido.toFixed(2),
        emp.taxaConversao.toFixed(4),
        dataFormatada,
        emp.valorPagar.toFixed(2),
        valorEmReais,
        emp.numeroMeses,
        ((emp.taxaIOF || 0.035) * 100).toFixed(2) + '%',
      ];
    });

    // Montar conteúdo CSV
    let conteudoCSV = cabecalhos.join(',') + '\n';
    linhas.forEach((linha) => {
      // Garantir que campos com vírgulas estejam entre aspas
      const linhaCsv = linha
        .map((campo) => {
          // Se o campo for string e contiver vírgula ou aspas, colocar entre aspas
          if (
            typeof campo === 'string' &&
            (campo.includes(',') || campo.includes('"'))
          ) {
            // Substituir aspas duplas por dois conjuntos de aspas duplas (padrão CSV)
            return `"${campo.replace(/"/g, '""')}"`;
          }
          return campo;
        })
        .join(',');
      conteudoCSV += linhaCsv + '\n';
    });

    // Criar e baixar o arquivo
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Criar link para download
    const link = document.createElement('a');
    const dataAtual = new Date()
      .toLocaleDateString('pt-BR')
      .replace(/\//g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `emprestimos-maxi-${dataAtual}.csv`);
    document.body.appendChild(link);

    // Clicar e remover o link
    link.click();
    document.body.removeChild(link);

    this.notificationService.success('Arquivo CSV exportado com sucesso!');
  }

  onClientListMouseEnter(): void {
    this.isMouseOverClientList = true;
  }

  onClientListMouseLeave(): void {
    this.isMouseOverClientList = false;
  }
  // Métodos para edição de empréstimos
  editEmprestimo(emprestimo: Emprestimo): void {
    this.isEditMode = true;
    this.emprestimoToEdit = { ...emprestimo };

    // Buscar o cliente completo
    this.clientService.getClientById(emprestimo.cliente.idCliente).subscribe(
      (client) => {
        this.selectedClient = client;

        // Preencher o formulário com os dados do empréstimo
        this.emprestimoForm.patchValue({
          client: `${client.nome} - ${client.cpf}`,
          moeda: emprestimo.moeda,
          valorObtido: emprestimo.valorObtido.toString().replace('.', ','),
          taxaConversao: emprestimo.taxaConversao.toString().replace('.', ','),
          dataVencimento: emprestimo.dataVencimento,
        });

        // Calcular valores para exibição
        this.calcularValores();

        this.notificationService.info(
          `Editando empréstimo para ${client.nome}`
        );
      },
      (error) => {
        this.notificationService.error(
          `Erro ao carregar dados do cliente: ${error.message}`
        );
      }
    );
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.emprestimoToEdit = null;
    this.emprestimoForm.reset();
    this.selectedClient = null;
    this.notificationService.info('Edição cancelada');
  }
}
