import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from './client.service';
import { environment } from '../../environments/environment';

export interface Emprestimo {
  idEmprestimo?: number;
  cliente: {
    idCliente: number;
    nome?: string;
    cpf?: string;
  };
  moeda: string;
  valorObtido: number;
  taxaConversao: number;
  dataVencimento: string;
  valorPagar: number;
  numeroMeses: number;
  taxaIOF?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmprestimoService {
  private apiUrl = environment.apiUrl + '/api/emprestimos';

  constructor(private http: HttpClient) {}

  getEmprestimos(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(this.apiUrl);
  }

  addEmprestimo(emprestimo: Emprestimo): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(this.apiUrl, emprestimo);
  }
  deleteEmprestimo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
