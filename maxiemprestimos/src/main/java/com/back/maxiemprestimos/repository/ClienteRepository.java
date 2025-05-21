package com.back.maxiemprestimos.repository;

import com.back.maxiemprestimos.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {}