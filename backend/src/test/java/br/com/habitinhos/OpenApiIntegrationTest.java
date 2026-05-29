package br.com.habitinhos;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.shared.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

class OpenApiIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void apiDocsExposePhaseOneAndPhaseTwoMissionEndpoints() throws Exception {
    mockMvc.perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("\"/auth/register\"")))
        .andExpect(content().string(containsString("\"/children\"")))
        .andExpect(content().string(containsString("\"/missions\"")))
        .andExpect(content().string(containsString("\"/missions/{id}\"")))
        .andExpect(content().string(containsString("\"/missions/{id}/deactivate\"")))
        .andExpect(content().string(containsString("\"/missions/{id}/assign\"")));
  }
}
