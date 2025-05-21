package com.back.maxiemprestimos.repository;

import com.back.maxiemprestimos.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {}