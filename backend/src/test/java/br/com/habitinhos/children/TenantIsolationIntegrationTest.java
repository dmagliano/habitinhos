package br.com.habitinhos.children;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class TenantIsolationIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void secondFamilyCannotSeeReadUpdateOrDeactivateFirstFamilyChild() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID familyAChildId = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));

    mockMvc.perform(get("/children")
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());

    mockMvc.perform(get("/children/{id}", familyAChildId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));

    mockMvc.perform(put("/children/{id}", familyAChildId)
            .header("Authorization", "Bearer " + familyBToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new ChildRequest(
                "Nome Indevido",
                10,
                "moon",
                null))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));

    mockMvc.perform(patch("/children/{id}/deactivate", familyAChildId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));

    mockMvc.perform(get("/children/{id}", familyAChildId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Lia"))
        .andExpect(jsonPath("$.active").value(true));
  }

  private String registerToken(String email, String familyName) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RegisterRequest(
                "Responsavel Demo",
                email,
                "senha123",
                familyName,
                "1234"))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return objectMapper.readTree(response).get("token").asText();
  }

  private UUID createChild(String token, ChildRequest request) throws Exception {
    String response = mockMvc.perform(post("/children")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    JsonNode json = objectMapper.readTree(response);
    return UUID.fromString(json.get("id").asText());
  }
}
