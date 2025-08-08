package com.appunture.backend.controller;

import com.appunture.backend.dto.request.RegisterRequest;
import com.appunture.backend.dto.point.PointRequest;
import com.appunture.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class PointIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;

    private String adminToken;

    @BeforeEach
    void init() throws Exception {
        userRepository.deleteAll();
        // register admin (later could be seed) then manually update role via repo
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("admin@test.com");
        reg.setPassword("password123");
        reg.setName("Admin");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());
        userRepository.findByEmail("admin@test.com").ifPresent(u -> {u.setRole("ROLE_ADMIN");});
        // login
        String loginJson = "{\"email\":\"admin@test.com\",\"password\":\"password123\"}";
        String body = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        adminToken = objectMapper.readTree(body).get("token").asText();
    }

    @Test
    void create_and_get_point() throws Exception {
        PointRequest req = new PointRequest();
        req.setCode("P1"); req.setName("Point 1"); req.setMeridian("LU"); req.setLocation("Loc");
        mockMvc.perform(post("/api/points")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("P1"));

        mockMvc.perform(get("/api/points/code/P1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("P1"));
    }
}
