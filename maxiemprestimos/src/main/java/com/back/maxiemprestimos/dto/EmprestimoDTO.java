package com.back.maxiemprestimos.dto;

import com.back.maxiemprestimos.model.Emprestimo;
import lombok.Data;

@Data
public class EmprestimoDTO {
    private Long idEmprestimo;
    
    private ClienteDTO cliente;
    
    private String moeda;
    private Double valorObtido;
    private Double taxaConversao;
    private String dataVencimento;
    private Double valorPagar;
    private Integer numeroMeses;
    
    @Data
    public static class ClienteDTO {
        private Long idCliente;
        private String nome;
        private String cpf;
    }
    
    public static EmprestimoDTO fromEmprestimo(Emprestimo emprestimo) {
        EmprestimoDTO dto = new EmprestimoDTO();
        dto.setIdEmprestimo(emprestimo.getIdEmprestimo());
        
        if (emprestimo.getCliente() != null) {
            ClienteDTO clienteDTO = new ClienteDTO();
            clienteDTO.setIdCliente(emprestimo.getCliente().getIdCliente());
            clienteDTO.setNome(emprestimo.getCliente().getNome());
            clienteDTO.setCpf(emprestimo.getCliente().getCpf());
            dto.setCliente(clienteDTO);
        }
        
        dto.setMoeda(emprestimo.getMoeda());
        dto.setValorObtido(emprestimo.getValorObtido());
        dto.setTaxaConversao(emprestimo.getTaxaConversao());
        dto.setDataVencimento(emprestimo.getDataVencimento() != null ? emprestimo.getDataVencimento().toString() : null);
        dto.setValorPagar(emprestimo.getValorPagar());
        dto.setNumeroMeses(emprestimo.getNumeroMeses());
        
        return dto;
    }
}
