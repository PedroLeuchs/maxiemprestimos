import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-currency-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-trend.component.html',
  styleUrl: './currency-trend.component.css',
})
export class CurrencyTrendComponent implements OnInit, OnChanges {
  @Input() moeda: string = '';

  cotacoes: { data: string; valor: number }[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  tendencia: 'alta' | 'baixa' | 'estavel' | 'desconhecida' = 'desconhecida';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    if (this.moeda) {
      this.carregarCotacoes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moeda'] && this.moeda) {
      this.carregarCotacoes();
    }
  }
  carregarCotacoes(): void {
    if (!this.moeda) {
      this.error = 'Moeda não especificada';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.tendencia = 'desconhecida';
  }
  analisarTendencia(): void {
    if (this.cotacoes.length < 2) {
      this.tendencia = 'desconhecida';
      return;
    }

    try {
      // Para uma análise mais precisa, vamos usar os últimos 5 dias (ou menos se não tivermos tantos dados)
      const numDiasAnalise = Math.min(5, this.cotacoes.length);
      const cotacoesRecentes = this.cotacoes.slice(-numDiasAnalise);

      // Calcular a tendência com base nas cotações recentes
      const ultimaCotacao = cotacoesRecentes[cotacoesRecentes.length - 1].valor;
      const primeiraCotacao = cotacoesRecentes[0].valor;

      const variacao =
        ((ultimaCotacao - primeiraCotacao) / primeiraCotacao) * 100;

      if (variacao > 1.5) {
        this.tendencia = 'alta';
      } else if (variacao < -1.5) {
        this.tendencia = 'baixa';
      } else {
        this.tendencia = 'estavel';
      }

      console.log(
        `Tendência: ${this.tendencia} (variação: ${variacao.toFixed(2)}%)`
      );
    } catch (error) {
      console.error('Erro ao analisar tendência:', error);
      this.tendencia = 'desconhecida';
    }
  }
  // Método para calcular a posição Y no gráfico
  calcularPosicaoY(valor: number): number {
    if (this.cotacoes.length === 0) return 0;

    const valores = this.cotacoes.map((c) => c.valor);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const range = max - min;

    // Se não houver variação, centralizar
    if (range === 0) return 50;

    // Calcular posição em porcentagem (0-100)
    return 100 - ((valor - min) / range) * 100;
  }
  // Método para gerar os pontos da polyline de forma segura
  gerarPontosPolyline(): string {
    if (!this.cotacoes || this.cotacoes.length < 2) {
      return '';
    }

    try {
      return this.cotacoes
        .map((c, i) => {
          const x = (i / (this.cotacoes.length - 1)) * 100;
          const y = this.calcularPosicaoY(c.valor);
          return `${x},${y}`;
        })
        .join(' ');
    } catch (error) {
      console.error('Erro ao gerar pontos do gráfico:', error);
      return '';
    }
  }

  // Método para obter a última cotação de forma segura
  obterUltimaCotacao(): string {
    if (!this.cotacoes || this.cotacoes.length === 0) {
      return '0,0000';
    }
    try {
      const ultimaCotacao = this.cotacoes[this.cotacoes.length - 1];
      return ultimaCotacao.valor.toFixed(4);
    } catch (error) {
      console.error('Erro ao obter última cotação:', error);
      return '0,0000';
    }
  }
}
