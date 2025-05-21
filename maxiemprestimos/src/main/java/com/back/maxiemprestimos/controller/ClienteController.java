package com.back.maxiemprestimos.controller;


import com.back.maxiemprestimos.model.Cliente;
import com.back.maxiemprestimos.repository.ClienteRepository;
import com.back.maxiemprestimos.dto.ClienteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // libera acesso para seu front Angular
public class ClienteController {

    private final ClienteRepository repo;

    @GetMapping
    public List<ClienteDTO> listar() {
        return repo.findAll().stream()
                .map(ClienteDTO::fromCliente)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> buscarPorId(@PathVariable("id") Long id) {
        return repo.findById(id)
                .map(cliente -> ResponseEntity.ok(ClienteDTO.fromCliente(cliente)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ClienteDTO salvar(@RequestBody Cliente cliente) {
        Cliente savedCliente = repo.save(cliente);
        return ClienteDTO.fromCliente(savedCliente);
    }    @DeleteMapping("/{id}")
    public void deletar(@PathVariable("id") Long id) {
        System.out.println("Deletando cliente com ID: " + id);
        repo.deleteById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> atualizar(@PathVariable("id") Long id, @RequestBody Cliente cliente) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cliente.setIdCliente(id);
        Cliente updatedCliente = repo.save(cliente);
        return ResponseEntity.ok(ClienteDTO.fromCliente(updatedCliente));
    }
}