import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Emprestimo } from '../../services/emprestimo.service';

@Component({
  selector: 'app-emprestimo-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emprestimo-details-modal.component.html',
  styleUrl: './emprestimo-details-modal.component.css',
})
export class EmprestimoDetailsModalComponent {
  @Input() isVisible: boolean = false;
  @Input() emprestimo: Emprestimo | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  // Calcula a porcentagem de juros total
  calcularPorcentagemJurosTotais(): number {
    if (!this.emprestimo) return 0;
    const jurosTotal =
      (this.emprestimo.valorPagar / this.emprestimo.valorObtido - 1) * 100;
    return jurosTotal;
  }

  // Calcula o valor do IOF
  calcularValorIOF(): number {
    if (!this.emprestimo) return 0;
    return (
      this.emprestimo.valorObtido *
      this.emprestimo.taxaConversao *
      (this.emprestimo.taxaIOF || 0.035)
    );
  }

  // Calcula o valor em reais no vencimento
  calcularValorPagarReais(): number {
    if (!this.emprestimo) return 0;
    return this.emprestimo.valorPagar * this.emprestimo.taxaConversao;
  }

  // Calcula o valor em reais (descontado o IOF)
  calcularValorLiquidoReais(): number {
    if (!this.emprestimo) return 0;
    const valorBaseReais =
      this.emprestimo.valorObtido * this.emprestimo.taxaConversao;
    const valorIOF = valorBaseReais * (this.emprestimo.taxaIOF || 0.035);
    return valorBaseReais - valorIOF;
  }
}
