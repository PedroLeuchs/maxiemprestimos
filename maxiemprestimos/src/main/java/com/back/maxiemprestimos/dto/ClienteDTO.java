package com.back.maxiemprestimos.dto;

import com.back.maxiemprestimos.model.Cliente;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ClienteDTO {
    private Long idCliente;
    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private List<EmprestimoResumoDTO> emprestimos;
    
    @Data
    public static class EmprestimoResumoDTO {
        private Long idEmprestimo;
        private String moeda;
        private Double valorObtido;
        private Double valorPagar;
        private String dataVencimento;
    }
    
    public static ClienteDTO fromCliente(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setIdCliente(cliente.getIdCliente());
        dto.setNome(cliente.getNome());
        dto.setCpf(cliente.getCpf());
        dto.setTelefone(cliente.getTelefone());
        dto.setEmail(cliente.getEmail());
        
        if (cliente.getEmprestimos() != null) {
            dto.setEmprestimos(cliente.getEmprestimos().stream()
                .map(emprestimo -> {
                    EmprestimoResumoDTO emp = new EmprestimoResumoDTO();
                    emp.setIdEmprestimo(emprestimo.getIdEmprestimo());
                    emp.setMoeda(emprestimo.getMoeda());
                    emp.setValorObtido(emprestimo.getValorObtido());
                    emp.setValorPagar(emprestimo.getValorPagar());
                    emp.setDataVencimento(emprestimo.getDataVencimento() != null ? 
                        emprestimo.getDataVencimento().toString() : null);
                    return emp;
                })
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}
