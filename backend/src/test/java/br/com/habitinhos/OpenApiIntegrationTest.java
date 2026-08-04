package br.com.habitinhos;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.shared.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.BuildProperties;
import org.springframework.test.web.servlet.MockMvc;

class OpenApiIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private BuildProperties buildProperties;

  @Test
  void apiDocsExposeBackendPhaseEndpoints() throws Exception {
    mockMvc.perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString(
            "\"version\":\"" + buildProperties.getVersion() + "\"")))
        .andExpect(content().string(containsString("\"/auth/register\"")))
        .andExpect(content().string(containsString("\"/auth/password-reset/request\"")))
        .andExpect(content().string(containsString("\"/auth/password-reset/confirm\"")))
        .andExpect(content().string(containsString("\"/auth/responsible-pin/reset/request\"")))
        .andExpect(content().string(containsString("\"/auth/responsible-pin/reset/confirm\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/request\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/confirm\"")))
        .andExpect(content().string(containsString("\"/children\"")))
        .andExpect(content().string(containsString("\"/missions\"")))
        .andExpect(content().string(containsString("\"/missions/{id}\"")))
        .andExpect(content().string(containsString("\"/missions/{id}/deactivate\"")))
        .andExpect(content().string(containsString("\"/missions/{id}/assign\"")))
        .andExpect(content().string(containsString("\"/children/{childId}/wallet\"")))
        .andExpect(content().string(containsString("\"/children/{childId}/missions\"")))
        .andExpect(content().string(containsString("\"/assigned-missions/{id}/complete\"")))
        .andExpect(content().string(containsString("\"/assigned-missions/pending-approval\"")))
        .andExpect(content().string(containsString("\"/assigned-missions/{id}/approve\"")))
        .andExpect(content().string(containsString("\"/assigned-missions/{id}/reject\"")))
        .andExpect(content().string(containsString("\"/rewards\"")))
        .andExpect(content().string(containsString("\"/rewards/{id}\"")))
        .andExpect(content().string(containsString("\"/rewards/{id}/deactivate\"")))
        .andExpect(content().string(containsString("\"/rewards/{id}/redeem\"")))
        .andExpect(content().string(containsString("\"/children/{childId}/wallet/transactions\"")));
  }

  @Test
  void actuatorInfoExposesBackendReleaseVersion() throws Exception {
    mockMvc.perform(get("/actuator/info"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString(
            "\"version\":\"" + buildProperties.getVersion() + "\"")));
  }
}
