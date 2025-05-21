package com.back.maxiemprestimos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
public class Emprestimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmprestimo;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonBackReference
    private Cliente cliente;
    
    private String moeda;
    private Double valorObtido;
    private Double taxaConversao;
    private LocalDate dataVencimento;
    private Double valorPagar;
    private Integer numeroMeses;
}
