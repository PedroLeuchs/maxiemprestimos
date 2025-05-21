import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  idCliente?: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = environment.apiUrl + '/api/clientes';

  constructor(private http: HttpClient) {}

  // GET /api/clientes
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }
  // POST /api/clientes
  addClient(client: Omit<Client, 'idCliente'>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  // PUT /api/clientes/:id
  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${client.idCliente}`, client);
  }

  // DELETE /api/clientes/:id
  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
