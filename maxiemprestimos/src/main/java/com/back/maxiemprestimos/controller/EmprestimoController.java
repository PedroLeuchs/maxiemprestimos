package com.back.maxiemprestimos.controller;

import com.back.maxiemprestimos.model.Emprestimo;	
import com.back.maxiemprestimos.model.Cliente;
import com.back.maxiemprestimos.repository.ClienteRepository;
import com.back.maxiemprestimos.repository.EmprestimoRepository;
import com.back.maxiemprestimos.dto.EmprestimoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emprestimos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmprestimoController {

    private final EmprestimoRepository emprestimoRepo;
    private final ClienteRepository clienteRepo;

    @GetMapping
    public List<EmprestimoDTO> listar() {
        return emprestimoRepo.findAll().stream()
                .map(EmprestimoDTO::fromEmprestimo)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Emprestimo emprestimo) {
        Cliente cliente = clienteRepo.findById(emprestimo.getCliente().getIdCliente()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente não encontrado");
        }
        emprestimo.setCliente(cliente);
        Emprestimo savedEmprestimo = emprestimoRepo.save(emprestimo);
        return ResponseEntity.ok(EmprestimoDTO.fromEmprestimo(savedEmprestimo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable("id") Long id) {
        return emprestimoRepo.findById(id)
                .map(emprestimo -> ResponseEntity.ok(EmprestimoDTO.fromEmprestimo(emprestimo)))
                .orElse(ResponseEntity.notFound().build());
    }    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable("id") Long id, @RequestBody Emprestimo emprestimo) {
        if (!emprestimoRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        Cliente cliente = clienteRepo.findById(emprestimo.getCliente().getIdCliente()).orElse(null);
        if (cliente == null) {
            return ResponseEntity.badRequest().body("Cliente não encontrado");
        }
        
        emprestimo.setIdEmprestimo(id);
        emprestimo.setCliente(cliente);
        Emprestimo updatedEmprestimo = emprestimoRepo.save(emprestimo);
        return ResponseEntity.ok(EmprestimoDTO.fromEmprestimo(updatedEmprestimo));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable("id") Long id) {
        emprestimoRepo.deleteById(id);
    }
}