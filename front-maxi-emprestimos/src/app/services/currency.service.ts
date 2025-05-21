// services/currency.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private baseUrl =
    'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$format=json';

  constructor(private http: HttpClient) {}

  getMoedas(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }
  getCotacaoAtual(moeda: string): Observable<number | null> {
    const hoje = new Date();
    const fim = `${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(
      hoje.getDate()
    ).padStart(2, '0')}-${hoje.getFullYear()}`;

    // Exemplo: buscar desde 10 dias atrás
    const inicioData = new Date(hoje);
    inicioData.setDate(inicioData.getDate() - 10);
    const inicio = `${String(inicioData.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(inicioData.getDate()).padStart(
      2,
      '0'
    )}-${inicioData.getFullYear()}`;

    const url =
      `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
      `CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
      `?@moeda='${moeda}'&@dataInicial='${inicio}'&@dataFinalCotacao='${fim}'` +
      `&$top=1&$orderby=dataHoraCotacao desc&$format=json`;

    return this.http
      .get<any>(url)
      .pipe(map((response) => response.value?.[0]?.cotacaoCompra ?? null));
  }
}
