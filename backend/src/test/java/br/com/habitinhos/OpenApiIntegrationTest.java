package br.com.habitinhos;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.shared.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

class OpenApiIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void apiDocsExposeBackendPhaseEndpoints() throws Exception {
    mockMvc.perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("\"/auth/register\"")))
        .andExpect(content().string(containsString("\"/auth/password-reset/request\"")))
        .andExpect(content().string(containsString("\"/auth/password-reset/confirm\"")))
        .andExpect(content().string(containsString("\"/auth/responsible-pin/reset/request\"")))
        .andExpect(content().string(containsString("\"/auth/responsible-pin/reset/confirm\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/request\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/confirm\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/permanent/request\"")))
        .andExpect(content().string(containsString("\"/auth/account-deletion/permanent/confirm\"")))
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
  void apiDocsExposePublicPermanentDeletionContractAndRetainSoftDeletion() throws Exception {
    mockMvc.perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/request'].post").exists())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/request'].post.security").isEmpty())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/request'].post.requestBody.content['application/json'].schema['$ref']")
            .value("#/components/schemas/PermanentDeletionRequest"))
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/request'].post.responses['202']").exists())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/confirm'].post").exists())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/confirm'].post.security").isEmpty())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/confirm'].post.requestBody.content['application/json'].schema['$ref']")
            .value("#/components/schemas/PermanentDeletionConfirmRequest"))
        .andExpect(jsonPath("$.paths['/auth/account-deletion/permanent/confirm'].post.responses['204']").exists())
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionRequest.required", hasItems("email")))
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionRequest.properties.email.format").value("email"))
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionRequest.properties.password").doesNotExist())
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionConfirmRequest.required", hasItems("email", "token")))
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionConfirmRequest.properties.email.format").value("email"))
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionConfirmRequest.properties.token.pattern").value("[A-Za-z0-9]{6}"))
        .andExpect(jsonPath("$.components.schemas.PermanentDeletionConfirmRequest.properties.password").doesNotExist())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/request'].post").exists())
        .andExpect(jsonPath("$.paths['/auth/account-deletion/confirm'].post").exists());
  }
}
